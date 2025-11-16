import { db } from "@/server/db";
import { $Enums, SaunaSessionStatus } from "../../generated/prisma/client"; // Import the new enum
import {
  getHarviaIdToken,
  refreshHarviaIdToken,
  harviaGraphQLRequest,
  GET_DEVICE_MEASUREMENTS_QUERY,
} from "@/server/api/harvia";

// Constants for PIR-based session detection
const MIN_ACTIVITY_DURATION_MINUTES = 3; // Activity must be detected for at least this many minutes to start a session
const ACTIVITY_WINDOW_MINUTES = 30;
const INACTIVITY_SESSION_END_THRESHOLD_MINUTES = 30; // Session ends after this much inactivity
const SAUNA_WARM_TEMPERATURE_THRESHOLD = 40; // Celsius, example threshold for "sauna is warm"
const ACTIVITY_THRESHOLD = 20;

export async function syncHarviaData() {
  try {
    // Sync demo saunas
    const demoHarviaTokens = await getHarviaIdToken(
      process.env.HARVIA_USERNAME!,
      process.env.HARVIA_PASSWORD!,
    );
    const demoSaunas = await db.sauna.findMany({
      where: { harviaDeviceId: { not: "" } },
    });
    for (const sauna of demoSaunas) {
      await syncSaunaMeasurements(sauna, demoHarviaTokens.idToken);
    }

    const saunas = await db.sauna.findMany({
      include: {
        users: {
          include: {
            accounts: {
              where: { provider: "harvia" },
            },
          },
        },
      },
    });

    for (const sauna of saunas) {
      const userWithHarvia = sauna.users.find(
        (u) => u.accounts && u.accounts.length > 0,
      );

      if (!userWithHarvia) {
        console.warn(
          `Skipping sync for sauna ${sauna.name} ${sauna.id}: No user with a linked Harvia account.`,
        );
        continue;
      }

      const harviaAccount = userWithHarvia.accounts[0]!;

      if (!harviaAccount.refresh_token || !harviaAccount.email) {
        console.warn(
          `Skipping sync for sauna ${sauna.id} using user ${userWithHarvia.id}: Harvia account or refresh token/email missing.`,
        );
        continue;
      }

      let harviaIdToken = harviaAccount.id_token;
      const harviaExpiresAt = harviaAccount.expires_at
        ? harviaAccount.expires_at * 1000
        : 0;

      // Refresh token if expired
      if (!harviaIdToken || Date.now() >= harviaExpiresAt) {
        try {
          const newTokens = await refreshHarviaIdToken(
            harviaAccount.refresh_token,
            harviaAccount.email,
          );
          harviaIdToken = newTokens.idToken;

          // Update the account in the database
          await db.account.update({
            where: { id: harviaAccount.id },
            data: {
              access_token: newTokens.accessToken,
              id_token: newTokens.idToken,
              expires_at: newTokens.expiresIn,
            },
          });
        } catch (error) {
          console.error(
            `Failed to refresh Harvia token for user ${userWithHarvia.id}:`,
            error,
          );
          continue; // Skip this sauna if token refresh fails
        }
      }

      if (!harviaIdToken) {
        console.error(
          `No valid Harvia ID token for user ${userWithHarvia.id} after refresh attempt.`,
        );
        continue;
      }

      await syncSaunaMeasurements(sauna, harviaIdToken);
    }

    console.log("Harvia data synchronization complete.");
  } catch (error) {
    console.error("Harvia data synchronization failed:", error);
  }

  // After syncing Harvia data, also detect and manage sessions based on all measurements
  await detectAndManageSaunaSessions();
}

import type { Sauna } from "../../generated/prisma/client";

async function syncSaunaMeasurements(sauna: Sauna, harviaIdToken: string) {
  if (!sauna.harviaDeviceId) {
    return;
  }

  // 2. Fetch and sync all measurements for this device
  const latestMeasurement = await db.saunaMeasurement.findFirst({
    where: { saunaId: sauna.id },
    orderBy: { timestamp: "desc" },
  });

  const startTimestamp = latestMeasurement
    ? latestMeasurement.timestamp
    : new Date(0); // Start from epoch if no measurements synced yet

  const endTimestamp = new Date(); // Sync up to now

  const detailedMeasurements = await getMeasurementsFromHarvia(
    sauna.harviaDeviceId,
    startTimestamp,
    endTimestamp,
    harviaIdToken,
  );

  const existingMeasurements = await db.saunaMeasurement.findMany({
    where: {
      saunaId: sauna.id,
      timestamp: {
        in: detailedMeasurements.map((m) => m.timestamp),
      },
    },
    select: {
      timestamp: true,
    },
  });

  const existingTimestamps = new Set(
    existingMeasurements.map((m) => m.timestamp.getTime()),
  );

  const newMeasurements = detailedMeasurements.filter(
    (m) => !existingTimestamps.has(m.timestamp.getTime()),
  );

  if (newMeasurements.length > 0) {
    await db.saunaMeasurement.createMany({
      data: newMeasurements.map((m) => ({
        saunaId: sauna.id,
        timestamp: m.timestamp,
        temperature: m.temperature,
        humidity: m.humidity,
        precence: m.presence,
      })),
    });
  }
}

async function getMeasurementsFromHarvia(
  deviceId: string,
  startTimestamp: Date,
  endTimestamp: Date,
  harviaIdToken: string,
): Promise<
  { timestamp: Date; temperature: number; humidity: number; presence: number }[]
> {
  let allMeasurements: {
    timestamp: Date;
    temperature: number;
    humidity: number;
    presence: number;
  }[] = [];
  let nextToken: string | null = null;

  type HarviaMeasurementItem = {
    deviceId: string;
    subId: string;
    timestamp: string;
    sessionId: string;
    type: string;
    data: string;
  };

  do {
    const harviaMeasurementsResponse: {
      devicesMeasurementsList: {
        measurementItems: HarviaMeasurementItem[];
        nextToken: string;
      };
    } = await harviaGraphQLRequest(
      "data",
      GET_DEVICE_MEASUREMENTS_QUERY,
      {
        deviceId: deviceId,
        startTimestamp: startTimestamp.valueOf().toString(),
        endTimestamp: endTimestamp.valueOf().toString(),
        samplingMode: "NONE",
        db: "influxdb",
        nextToken,
      },
      harviaIdToken,
      "devicesMeasurementsList",
    );

    const measurements =
      harviaMeasurementsResponse.devicesMeasurementsList.measurementItems
        .map((item: HarviaMeasurementItem) => {
          const data = JSON.parse(item.data);
          return {
            timestamp: new Date(parseInt(item.timestamp)),
            temperature: data.temp ?? 0, // Default to 0 if missing
            humidity: data.hum ?? 0, // Default to 0 if humidity is missing
            presence: data.presence ?? 0, // Default to 0 if presence is missing
          };
        })
        .filter(
          (meas: {
            timestamp: Date;
            temperature: number;
            humidity: number;
            presence: number;
          }) => meas.temperature !== 0 && meas.humidity !== 0,
        );

    allMeasurements = [...allMeasurements, ...measurements];
    nextToken = harviaMeasurementsResponse.devicesMeasurementsList.nextToken;
  } while (nextToken);

  return allMeasurements;
}

async function detectAndManageSaunaSessions() {
  console.log("Starting sauna session detection and management.");
  try {
    const allSaunas = await db.sauna.findMany({
      include: {
        users: {
          include: {
            accounts: {
              where: { provider: "harvia" },
            },
          },
        },
      },
    });

    for (const sauna of allSaunas) {
      const userForSync = sauna.users.find(
        (u) => u.accounts && u.accounts.length > 0,
      );
      let harviaIdToken: string | null | undefined =
        userForSync?.accounts[0]?.id_token;

      if (!userForSync) {
        const demoHarviaTokens = await getHarviaIdToken(
          process.env.HARVIA_USERNAME!,
          process.env.HARVIA_PASSWORD!,
        );
        harviaIdToken = demoHarviaTokens.idToken;
      }

      if (!harviaIdToken) {
        console.warn(
          `Skipping session detection for sauna ${sauna.name}: No valid Harvia token found.`,
        );
        continue;
      }

      if (!sauna.harviaDeviceId) {
        console.warn(
          `Skipping session detection for sauna ${sauna.id}: No Harvia Device ID.`,
        );
        continue;
      }

      // Find the latest session
      const latestSession = await db.saunaSession.findFirst({
        where: {
          saunaId: sauna.id,
        },
        orderBy: { startTimestamp: "desc" },
      });

      // Fetch measurements since the last processed timestamp
      const measurements = await db.saunaMeasurement.findMany({
        where: {
          saunaId: sauna.id,
          timestamp: {
            gt:
              latestSession?.endTimestamp ??
              latestSession?.startTimestamp ??
              new Date(0),
          },
        },
        orderBy: { timestamp: "asc" },
      });

      console.log("got existing measures", measurements);

      let currentSession: {
        id: string;
        startTimestamp: Date;
        lastActivityTimestamp: Date;
      } | null = null;

      if (latestSession) {
        currentSession = {
          id: latestSession.id,
          startTimestamp: latestSession.startTimestamp,
          lastActivityTimestamp:
            latestSession.latestPIRTimestamp || latestSession.startTimestamp,
        };
      }

      let activityBuffer: { timestamp: Date }[] = [];

      for (const measurement of measurements) {
        const isSaunaWarm =
          measurement.temperature >= SAUNA_WARM_TEMPERATURE_THRESHOLD;
        const activityDetected = measurement.precence > ACTIVITY_THRESHOLD;

        if (activityDetected && isSaunaWarm) {
          activityBuffer.push({ timestamp: measurement.timestamp });

          // Prune buffer to only include last ACTIVITY_WINDOW_MINUTES minutes
          activityBuffer = activityBuffer.filter(
            (activity) =>
              measurement.timestamp.getTime() - activity.timestamp.getTime() <
              ACTIVITY_WINDOW_MINUTES * 60 * 1000,
          );

          if (
            !currentSession &&
            activityBuffer.length >= MIN_ACTIVITY_DURATION_MINUTES &&
            activityBuffer[activityBuffer.length - 1]!.timestamp.getTime() -
              activityBuffer[0]!.timestamp.getTime() >=
              5 * 60 * 1000
          ) {
            const existingSession = await db.saunaSession.findFirst({
              where: {
                saunaId: sauna.id,
                startTimestamp: {
                  gte: new Date(
                    activityBuffer[0]!.timestamp.getTime() -
                      ACTIVITY_WINDOW_MINUTES * 60 * 1000,
                  ),
                },
              },
              orderBy: { startTimestamp: "asc" },
            });

            if (!existingSession) {
              // Start a new session
              const newSession = await db.saunaSession.create({
                data: {
                  saunaId: sauna.id,
                  startTimestamp: activityBuffer[0]!.timestamp,
                  latestPIRTimestamp: measurement.timestamp,
                  status: SaunaSessionStatus.ONGOING,
                  participants: {
                    connect: sauna.users.map((u) => ({ id: u.id })),
                  },
                },
              });
              currentSession = {
                id: newSession.id,
                startTimestamp: newSession.startTimestamp,
                lastActivityTimestamp: newSession.latestPIRTimestamp!,
              };
            }
          } else if (currentSession) {
            // Update existing ongoing session with latest activity
            await db.saunaSession.update({
              where: { id: currentSession.id },
              data: {
                latestPIRTimestamp: measurement.timestamp,
              },
            });
            currentSession.lastActivityTimestamp = measurement.timestamp;
          }
        } else if (currentSession) {
          activityBuffer = []; // Reset buffer if no activity
          // Check for inactivity to end the session
          const inactivityDurationMs =
            measurement.timestamp.getTime() -
            currentSession.lastActivityTimestamp.getTime();

          if (
            !isSaunaWarm ||
            inactivityDurationMs >=
              INACTIVITY_SESSION_END_THRESHOLD_MINUTES * 60 * 1000
          ) {
            // End the session
            const sessionEndTimestamp = currentSession.lastActivityTimestamp;
            const durationMs =
              sessionEndTimestamp.getTime() -
              currentSession.startTimestamp.getTime();

            // Calculate stats for the session
            const sessionMeasurements = await db.saunaMeasurement.findMany({
              where: {
                saunaId: sauna.id,
                timestamp: {
                  gte: currentSession.startTimestamp,
                  lte: sessionEndTimestamp,
                },
              },
              orderBy: { timestamp: "asc" },
            });

            const temperatures = sessionMeasurements.map((m) => m.temperature);
            const humidities = sessionMeasurements.map((m) => m.humidity);
            const presences = sessionMeasurements.map((m) => m.precence);

            const maxTemperature = Math.max(...temperatures);
            const avgTemperature =
              temperatures.reduce((sum, t) => sum + t, 0) / temperatures.length;
            const minTemperature = Math.min(...temperatures);

            const maxHumidity = Math.max(...humidities);
            const avgHumidity =
              humidities.reduce((sum, h) => sum + h, 0) / humidities.length;
            const minHumidity = Math.min(...humidities);

            const maxPresence = Math.max(...presences);
            const avgPresence =
              presences.reduce((sum, p) => sum + p, 0) / presences.length;

            await db.saunaSession.update({
              where: { id: currentSession.id },
              data: {
                endTimestamp: sessionEndTimestamp,
                durationMs: durationMs,
                status: SaunaSessionStatus.ENDED,
                maxTemperature: maxTemperature,
                avgTemperature: avgTemperature,
                minTemperature: minTemperature,
                maxHumidity: maxHumidity,
                avgHumidity: avgHumidity,
                minHumidity: minHumidity,
                maxPresence: maxPresence,
                avgPresence: avgPresence,
              },
            });

            currentSession = null; // Reset for next session
          }
        }
      }

      // After processing all measurements, if there's an ongoing session that hasn't been ended
      // due to inactivity, it means it's still active. No action needed here, it will be handled in the next sync.
      console.log(
        `Sauna session detection for sauna ${sauna.name} (${sauna.id}) complete.`,
      );
    }

    console.log("Sauna session detection and management complete.");
  } catch (error) {
    console.error("Sauna session detection and management failed:", error);
  }
}
