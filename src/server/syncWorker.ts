import { db } from "@/server/db";
import {
  getHarviaIdToken,
  refreshHarviaIdToken,
  harviaGraphQLRequest,
  GET_USER_DEVICES_QUERY,
  GET_DEVICE_SESSIONS_QUERY,
  GET_DEVICE_MEASUREMENTS_QUERY,
} from "@/server/api/harvia";

export async function syncHarviaData() {
  try {
    const users = await db.user.findMany({
      include: {
        accounts: {
          where: { provider: "harvia" }, // Assuming a 'harvia' provider for NextAuth.js
        },
      },
    });

    for (const user of users) {
      const harviaAccount = user.accounts[0]; // Assuming one Harvia account per user

      if (!harviaAccount || !harviaAccount.refresh_token || !user.email) {
        console.warn(
          `Skipping sync for user ${user.id}: Harvia account or refresh token/email missing.`,
        );
        continue;
      }

      let harviaIdToken = harviaAccount.id_token;
      let harviaAccessToken = harviaAccount.access_token;
      let harviaRefreshToken = harviaAccount.refresh_token;
      let harviaExpiresAt = harviaAccount.expires_at
        ? harviaAccount.expires_at * 1000
        : 0;

      // Refresh token if expired
      if (!harviaIdToken || Date.now() >= harviaExpiresAt) {
        try {
          const newTokens = await refreshHarviaIdToken(
            harviaRefreshToken,
            user.email,
          );
          harviaIdToken = newTokens.idToken;
          harviaAccessToken = newTokens.accessToken;
          harviaExpiresAt = Date.now() + newTokens.expiresIn * 1000;

          // Update the account in the database
          await db.account.update({
            where: { id: harviaAccount.id },
            data: {
              access_token: harviaAccessToken,
              id_token: harviaIdToken,
              expires_at: newTokens.expiresIn, // NextAuth stores expiresIn, not expiresAt
            },
          });
        } catch (error) {
          console.error(
            `Failed to refresh Harvia token for user ${user.id}:`,
            error,
          );
          continue; // Skip this user if token refresh fails
        }
      }

      if (!harviaIdToken) {
        console.error(
          `No valid Harvia ID token for user ${user.id} after refresh attempt.`,
        );
        continue;
      }

      // 1. Fetch and sync user's devices (saunas)
      const harviaDevicesResponse = await harviaGraphQLRequest<{
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
        harviaIdToken,
        "usersDevicesList",
      );

      const harviaDevices = harviaDevicesResponse.usersDevicesList.devices;

      for (const device of harviaDevices) {
        const nameAttr = device.attr.find(
          (attr: { key: string; value: string }) => attr.key === "name",
        );
        const locationAttr = device.attr.find(
          (attr: { key: string; value: string }) => attr.key === "location",
        );

        const existingSauna = await db.sauna.findUnique({
          where: { harviaDeviceId: device.id },
        });

        let currentSaunaId: string;

        if (existingSauna) {
          await db.sauna.update({
            where: { id: existingSauna.id },
            data: {
              name: nameAttr?.value || `Sauna ${device.id}`,
              location: locationAttr?.value,
            },
          });
          currentSaunaId = existingSauna.id;
        } else {
          const newSauna = await db.sauna.create({
            data: {
              harviaDeviceId: device.id,
              name: nameAttr?.value || `Sauna ${device.id}`,
              location: locationAttr?.value,
              userId: user.id,
            },
          });
          currentSaunaId = newSauna.id;
        }

        // 2. Fetch and sync new sauna sessions for this device
        // Determine the last synced session timestamp to fetch only new sessions
        const latestLocalSession = await db.saunaSession.findFirst({
          where: { sauna: { harviaDeviceId: device.id } },
          orderBy: { endTimestamp: "desc" },
        });

        const startTimestamp = latestLocalSession
          ? latestLocalSession.endTimestamp
          : new Date(0); // Start from epoch if no sessions synced yet

        const endTimestamp = new Date(); // Sync up to now

        const harviaSessionsResponse = await harviaGraphQLRequest<{
          devicesSessionsList: {
            sessions: {
              deviceId: string;
              sessionId: string;
              organizationId: string;
              subId: string;
              timestamp: string;
              type: string;
              durationMs: number;
              stats: string;
            }[];
            nextToken: string;
          };
        }>(
          "data",
          GET_DEVICE_SESSIONS_QUERY,
          {
            deviceId: device.id,
            startTimestamp: startTimestamp.toISOString(),
            endTimestamp: endTimestamp.toISOString(),
          },
          harviaIdToken,
          "devicesSessionsList",
        );

        const harviaSessions =
          harviaSessionsResponse.devicesSessionsList.sessions;

        for (const session of harviaSessions) {
          const existingSession = await db.saunaSession.findUnique({
            where: { harviaSessionId: session.sessionId },
          });

          if (!existingSession) {
            const stats = JSON.parse(session.stats);
            const newSession = await db.saunaSession.create({
              data: {
                saunaId: currentSaunaId,
                harviaSessionId: session.sessionId,
                startTimestamp: new Date(session.timestamp),
                endTimestamp: new Date(
                  new Date(session.timestamp).getTime() + session.durationMs,
                ),
                durationMs: session.durationMs,
                maxTemperature: stats.maxTemperature,
                avgTemperature: stats.avgTemperature,
                maxHumidity: stats.maxHumidity,
                avgHumidity: stats.avgHumidity,
              },
            });

            // 3. Fetch and sync detailed measurements for the new session
            await syncMeasurementsForSession(
              device.id,
              newSession.id,
              session.sessionId,
              newSession.startTimestamp,
              newSession.endTimestamp,
              harviaIdToken,
            );
          }
        }

        // Check if the latest session might still be in progress or needs late measurements
        if (latestLocalSession) {
          const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
          const sessionEnd = latestLocalSession.endTimestamp;

          // If the session ended recently (within 24 hours), re-sync measurements up to now
          if (sessionEnd > twentyFourHoursAgo) {
            console.log(
              `Re-syncing measurements for recent session ${latestLocalSession.harviaSessionId}`,
            );
            await syncMeasurementsForSession(
              device.id,
              latestLocalSession.id,
              latestLocalSession.harviaSessionId,
              latestLocalSession.startTimestamp,
              new Date(), // Fetch up to current time
              harviaIdToken,
            );
          }
        }
      }
    }

    console.log("Harvia data synchronization complete.");
  } catch (error) {
    console.error("Harvia data synchronization failed:", error);
  }
}

async function syncMeasurementsForSession(
  deviceId: string,
  saunaSessionId: string,
  harviaSessionId: string,
  startTimestamp: Date,
  endTimestamp: Date,
  harviaIdToken: string,
) {
  // Fetch measurements from Harvia API
  const harviaMeasurementsResponse = await harviaGraphQLRequest<{
    devicesMeasurementsList: {
      measurementItems: {
        deviceId: string;
        subId: string;
        timestamp: string;
        sessionId: string;
        type: string;
        data: string;
      }[];
      nextToken: string;
    };
  }>(
    "data",
    GET_DEVICE_MEASUREMENTS_QUERY,
    {
      deviceId: deviceId,
      startTimestamp: startTimestamp.valueOf().toString(),
      endTimestamp: endTimestamp.valueOf().toString(),
      samplingMode: "SAMPLING",
      db: "influxdb",
    },
    harviaIdToken,
    "devicesMeasurementsList",
  );

  const harviaMeasurements =
    harviaMeasurementsResponse.devicesMeasurementsList.measurementItems.filter(
      (item: { sessionId: string }) => item.sessionId === harviaSessionId,
    );

  for (const measurement of harviaMeasurements) {
    const data = JSON.parse(measurement.data);

    console.log(measurement);

    // Check if measurement already exists (to handle re-syncing of in-progress sessions)
    const existingMeasurement = await db.saunaMeasurement.findFirst({
      where: {
        saunaSessionId: saunaSessionId,
        timestamp: new Date(parseInt(measurement.timestamp)),
      },
    });

    if (!existingMeasurement) {
      await db.saunaMeasurement.create({
        data: {
          saunaSessionId: saunaSessionId,
          timestamp: new Date(parseInt(measurement.timestamp)),
          temperature: data.temp,
          humidity: data.hum,
        },
      });
    }
  }
}

// To run this worker as a separate process, you would typically have a script like:
// node -r ts-node/register src/server/syncWorker.ts
// And then schedule this script to run periodically using a tool like `pm2` or a systemd timer.
