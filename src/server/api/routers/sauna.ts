import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

export const saunaRouter = createTRPCRouter({
  getSaunas: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    // Query local database for saunas linked to the current user
    const saunas = await ctx.db.sauna.findMany({
      where: { userId: userId },
    });

    return saunas;
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
            userId: userId,
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
          measurements: {
            orderBy: {
              timestamp: "asc",
            },
          },
        },
      });

      return sessions;
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
      // Query local database for sessions within the time range
      const sessions = await ctx.db.saunaSession.findMany({
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

      return sessions;
    }),

  getSaunaSessionMeasurements: protectedProcedure
    .input(
      z.object({
        saunaSessionId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      // Query local database for measurements belonging to the session
      const measurements = await ctx.db.saunaMeasurement.findMany({
        where: {
          saunaSessionId: input.saunaSessionId,
        },
        orderBy: {
          timestamp: "asc",
        },
      });

      return measurements;
    }),
});
