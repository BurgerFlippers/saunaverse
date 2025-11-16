import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { SaunaSessionStatus } from "@/../generated/prisma/client";
import {
  GET_USER_DEVICES_QUERY,
  harviaGraphQLRequest,
  GET_DEVICE_STATE_QUERY,
  getHarviaIdToken,
} from "@/server/api/harvia";
import { syncHarviaData } from "@/server/syncWorker";

export const saunaRouter = createTRPCRouter({
  getSaunas: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    const ownedSaunas = await ctx.db.sauna.findMany({
      where: { users: { some: { id: userId } } },
    });

    const participantSaunas = await ctx.db.sauna.findMany({
      where: {
        sessions: {
          some: {
            participants: {
              some: {
                id: userId,
              },
            },
          },
        },
        NOT: {
          users: {
            some: {
              id: userId,
            },
          },
        },
      },
    });

    const allSaunas = [...ownedSaunas, ...participantSaunas];
    // Remove duplicates
    const uniqueSaunas = allSaunas.filter(
      (sauna, index, self) =>
        index === self.findIndex((s) => s.id === sauna.id),
    );

    return uniqueSaunas;
  }),

  getAllSaunaSessions: protectedProcedure
    .input(
      z.object({
        startDate: z.coerce.date(),
        endDate: z.coerce.date(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      // Query local database for all sessions for the user within the time range
      const sessions = await ctx.db.saunaSession.findMany({
        where: {
          sauna: {
            users: { some: { id: userId } },
          },
          startTimestamp: {
            gte: input.startDate,
          },
          endTimestamp: {
            lte: input.endDate,
          },
        },
        orderBy: {
          startTimestamp: "desc",
        },
        include: {
          sauna: true, // Include sauna details
        },
      });

      return sessions;
    }),

  getSaunaSessionMeasurements: protectedProcedure
    .input(
      z.object({
        saunaSessionId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const saunaSession = await ctx.db.saunaSession.findFirst({
        where: { id: input.saunaSessionId },
      });
      if (!saunaSession) throw new Error("No sauna sessioon found");

      // Query local database for measurements belonging to the session
      const measurements = await ctx.db.saunaMeasurement.findMany({
        where: {
          sauna: {
            id: saunaSession.saunaId,
          },
          timestamp: {
            gt: saunaSession.startTimestamp,
            lt: saunaSession.endTimestamp ?? new Date(),
          },
        },
        orderBy: {
          timestamp: "asc",
        },
      });

      return measurements;
    }),

  endSessionManually: protectedProcedure
    .input(z.object({ sessionId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const session = await ctx.db.saunaSession.findUnique({
        where: { id: input.sessionId },
      });

      if (!session) {
        throw new Error("Session not found");
      }

      const latestMeasurement = await ctx.db.saunaMeasurement.findFirst({
        where: {
          saunaId: session.saunaId,
          timestamp: { lte: new Date() },
        },
        orderBy: { timestamp: "desc" },
      });

      const endTimestamp = latestMeasurement?.timestamp ?? new Date();
      const durationMs =
        endTimestamp.getTime() - session.startTimestamp.getTime();

      return ctx.db.saunaSession.update({
        where: { id: input.sessionId },
        data: {
          endTimestamp: endTimestamp,
          durationMs: durationMs,
          status: SaunaSessionStatus.ENDED,
          endedManually: true,
        },
      });
    }),

  addParticipant: protectedProcedure
    .input(z.object({ sessionId: z.string(), userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.saunaSession.update({
        where: { id: input.sessionId },
        data: {
          participants: {
            connect: { id: input.userId },
          },
        },
      });
    }),

  discoverDevices: protectedProcedure.query(async ({ ctx }) => {
    const harviaAccount = await ctx.db.account.findFirst({
      where: { userId: ctx.session.user.id, provider: "harvia" },
    });

    if (!harviaAccount?.id_token) {
      throw new Error("Harvia account not linked or token is missing.");
    }

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
      harviaAccount.id_token,
      "usersDevicesList",
    );

    // For each harvia Device add their displayName using the state query

    const devicesWithNames = await Promise.all(
      harviaDevicesResponse.usersDevicesList.devices.map(async (device) => {
        const deviceStateResponse = await harviaGraphQLRequest<{
          devicesStatesGet: {
            desired: string;
          };
        }>(
          "device",
          GET_DEVICE_STATE_QUERY,
          { deviceId: device.id, shadowName: "C1" },
          harviaAccount.id_token!, // Asserting non-null as it's checked above
          "devicesStatesGet",
        );
        const desiredState = JSON.parse(
          deviceStateResponse.devicesStatesGet.desired,
        );
        const name = desiredState?.displayName ?? "Unknown";
        return { ...device, name };
      }),
    );

    return devicesWithNames;
  }),

  createSauna: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        location: z.string(),
        harviaDeviceId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const existingSauna = await ctx.db.sauna.findUnique({
        where: { harviaDeviceId: input.harviaDeviceId },
      });

      if (existingSauna) {
        const sessions = await ctx.db.saunaSession.findMany({
          where: { saunaId: existingSauna.id },
        });
        for (const session of sessions) {
          await ctx.db.saunaSession.update({
            where: { id: session.id },
            data: {
              participants: {
                connect: { id: ctx.session.user.id },
              },
            },
          });
        }
        return ctx.db.sauna.update({
          where: { id: existingSauna.id },
          data: {
            users: {
              connect: { id: ctx.session.user.id },
            },
          },
        });
      }

      const sauna = await ctx.db.sauna.create({
        data: {
          name: input.name,
          location: input.location,
          harviaDeviceId: input.harviaDeviceId,
          users: {
            connect: { id: ctx.session.user.id },
          },
        },
      });

      await syncHarviaData();

      return sauna;
    }),

  updateSauna: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        harviaDeviceId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.sauna.update({
        where: { id: input.id },
        data: {
          harviaDeviceId: input.harviaDeviceId,
        },
      });
    }),

  createManualSession: protectedProcedure
    .input(
      z.object({
        saunaId: z.string(),
        startTimestamp: z.date(),
        endTimestamp: z.date(),
        durationMs: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.saunaSession.create({
        data: {
          ...input,
          status: "ENDED",
          manual: true,
          participants: {
            connect: { id: ctx.session.user.id },
          },
        },
      });
    }),

  getDeviceState: protectedProcedure
    .input(z.object({ deviceId: z.string() }))
    .query(async ({ ctx, input }) => {
      const harviaAccount = await ctx.db.account.findFirst({
        where: { userId: ctx.session.user.id, provider: "harvia" },
      });

      if (!harviaAccount?.id_token) {
        throw new Error("Harvia account not linked or token is missing.");
      }

      const deviceStateResponse = await harviaGraphQLRequest<{
        devicesStatesGet: {
          desired: string;
        };
      }>(
        "device",
        GET_DEVICE_STATE_QUERY,
        { deviceId: input.deviceId, shadowName: "C1" },
        harviaAccount.id_token,
        "devicesStatesGet",
      );

      return JSON.parse(deviceStateResponse.devicesStatesGet.desired);
    }),

  getSaunaMeasurements: protectedProcedure
    .input(
      z.object({
        saunaId: z.string(),
        startDate: z.date(),
        endDate: z.date(),
      }),
    )
    .query(async ({ ctx, input }) => {
      return ctx.db.saunaMeasurement.findMany({
        where: {
          saunaId: input.saunaId,
          timestamp: {
            gte: input.startDate,
            lte: input.endDate,
          },
        },
        orderBy: {
          timestamp: "asc",
        },
      });
    }),

  getSaunaSessions: protectedProcedure
    .input(
      z.object({
        saunaId: z.string(),
        startDate: z.date(),
        endDate: z.date(),
      }),
    )
    .query(async ({ ctx, input }) => {
      return ctx.db.saunaSession.findMany({
        where: {
          saunaId: input.saunaId,
          startTimestamp: {
            gte: input.startDate,
          },
          endTimestamp: {
            lte: input.endDate,
          },
        },
        orderBy: {
          startTimestamp: "desc",
        },
      });
    }),

  getDemoSaunas: protectedProcedure.query(async ({ ctx }) => {
    const harviaTokens = await getHarviaIdToken(
      process.env.HARVIA_USERNAME!,
      process.env.HARVIA_PASSWORD!,
    );

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
      harviaTokens.idToken,
      "usersDevicesList",
    );

    const devicesWithNames = await Promise.all(
      harviaDevicesResponse.usersDevicesList.devices.map(async (device) => {
        const deviceStateResponse = await harviaGraphQLRequest<{
          devicesStatesGet: {
            desired: string;
          };
        }>(
          "device",
          GET_DEVICE_STATE_QUERY,
          { deviceId: device.id, shadowName: "C1" },
          harviaTokens.idToken,
          "devicesStatesGet",
        );
        const desiredState = JSON.parse(
          deviceStateResponse.devicesStatesGet.desired,
        );
        const name: string = desiredState?.displayName ?? "Unknown";
        return { ...device, name };
      }),
    );

    return devicesWithNames;
  }),
});
