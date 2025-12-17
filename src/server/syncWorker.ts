import { db } from "@/server/db";
import { $Enums, SaunaSessionStatus } from "../../generated/prisma/client"; // Import the new enum
import {
  getHarviaIdToken,
  refreshHarviaIdToken,
  harviaGraphQLRequest,
  GET_DEVICE_MEASUREMENTS_QUERY,
  GET_USER_DEVICES_QUERY,
} from "@/server/api/harvia";
import { getContinuousHeartRate, refreshPolarToken } from "@/server/api/polar";

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

    const demoDevicesResponse = await harviaGraphQLRequest<{
      usersDevicesList: {
        devices: {
          id: string;
          type: string;
          attr: { key: string; value: string }[];
        }[];
      };
    }>(
      "device",
      GET_USER_DEVICES_QUERY,
      {},
      demoHarviaTokens.idToken,
      "usersDevicesList",
    );

    const demoDeviceIds = demoDevicesResponse.usersDevicesList.devices.map(
      (d) => d.id,
    );

    const demoSaunas = await db.sauna.findMany({
      where: { harviaDeviceId: { in: demoDeviceIds } },
    });
    for (const sauna of demoSaunas) {
      await syncSaunaMeasurements(sauna, demoHarviaTokens.idToken);
    }
  } catch (err) {
    console.error("failed to sync demo saunas", err);
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
    console.log("syncing sauna: ", sauna.name, sauna.id, sauna.harviaDeviceId);
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

    try {
      await syncSaunaMeasurements(sauna, harviaIdToken);
    } catch (error) {
      console.error("Failed to sync sauna", sauna.id, error);
    }
  }

  console.log("Harvia data synchronization complete.");

  // After syncing Harvia data, also detect and manage sessions based on all measurements
  await detectAndManageSaunaSessions();
}

export async function syncPolarData() {
  console.log("Starting Polar data synchronization...");
  try {
    const usersWithPolar = await db.user.findMany({
      where: {
        accounts: {
          some: { provider: "polar" },
        },
      },
      select: { id: true },
    });

    for (const user of usersWithPolar) {
      await syncPolarDataForUser(user.id);
    }
    console.log("Polar data synchronization complete.");
  } catch (error) {
    console.error("Polar data synchronization failed:", error);
  }
}

export async function syncPolarDataForUser(
  userId: string,
  targetDates?: Date[],
) {
  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        accounts: {
          where: { provider: "polar" },
        },
      },
    });

    const polarAccount = user?.accounts[0];
    if (!polarAccount?.access_token || !polarAccount.refresh_token) return;

    let accessToken = polarAccount.access_token;

    // Refresh token logic
    if (
      polarAccount.expires_at &&
      Date.now() / 1000 > polarAccount.expires_at - 300
    ) {
      try {
        const tokens = await refreshPolarToken(polarAccount.refresh_token);
        accessToken = tokens.access_token;
        await db.account.update({
          where: { id: polarAccount.id },
          data: {
            access_token: tokens.access_token,
            expires_at: Math.floor(Date.now() / 1000 + tokens.expires_in),
          },
        });
      } catch (e) {
        console.error(`Failed to refresh Polar token for user ${userId}`, e);
        return;
      }
    }

    const sessionDates = new Set<string>();

    if (targetDates && targetDates.length > 0) {
      for (const d of targetDates) {
        sessionDates.add(d.toISOString().split("T")[0]!);
      }
    } else {
      // Default: recent sessions
      const userSessions = await db.saunaSession.findMany({
        where: {
          participants: { some: { id: userId } },
          startTimestamp: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
          },
        },
        orderBy: { startTimestamp: "desc" },
      });

      for (const session of userSessions) {
        const dateString = session.startTimestamp.toISOString().split("T")[0]!;
        sessionDates.add(dateString);
      }
      // Always sync today in default mode
      sessionDates.add(new Date().toISOString().split("T")[0]!);
    }

    for (const date of sessionDates) {
      // Skip check if explicitly requested (targetDates provided), otherwise check if data exists
      const isToday = date === new Date().toISOString().split("T")[0];
      const checkExisting = !targetDates && !isToday;

      if (checkExisting) {
        const startOfDay = new Date(`${date}T00:00:00Z`);
        const endOfDay = new Date(`${date}T23:59:59Z`);
        const existingCount = await db.userBiometrics.count({
          where: {
            userId: userId,
            timestamp: {
              gte: startOfDay,
              lte: endOfDay,
            },
          },
        });

        if (existingCount > 10) continue;
      }

      console.log(`Fetching Polar HR data for user ${userId} on ${date}`);
      const data = await getContinuousHeartRate(accessToken, date);

      if (data && data.heart_rate_samples) {
        console.log("got data", data.heart_rate_samples.length);
        const bucketedSamples = new Map<
          number,
          { sum: number; count: number; timestamp: Date }
        >();

        for (const sample of data.heart_rate_samples) {
          const timestamp = new Date(`${data.date}T${sample.sample_time}`);
          if (isNaN(timestamp.getTime())) continue;

          // Round down to nearest 30 seconds
          const bucketTime = Math.floor(timestamp.getTime() / 30000) * 30000;

          if (!bucketedSamples.has(bucketTime)) {
            bucketedSamples.set(bucketTime, {
              sum: 0,
              count: 0,
              timestamp: new Date(bucketTime),
            });
          }

          const bucket = bucketedSamples.get(bucketTime)!;
          bucket.sum += sample.heart_rate;
          bucket.count++;
        }

        const biometricsToCreate = Array.from(bucketedSamples.values()).map(
          (bucket) => ({
            userId: userId,
            timestamp: bucket.timestamp,
            heartRate: Math.round(bucket.sum / bucket.count),
          }),
        );

        if (biometricsToCreate.length > 0) {
          await db.userBiometrics.createMany({
            data: biometricsToCreate,
            skipDuplicates: true,
          });
        }
      }
    }
  } catch (error) {
    console.error(`Polar sync failed for user ${userId}`, error);
  }
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