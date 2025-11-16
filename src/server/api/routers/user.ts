import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { getHarviaIdToken } from "../harvia";

export const userRouter = createTRPCRouter({
  linkHarviaAccount: protectedProcedure
    .input(
      z.object({
        username: z.string(),
        password: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const harviaTokens = await getHarviaIdToken(
        input.username,
        input.password,
      );
      const userId = ctx.session.user.id;

      const existingAccount = await ctx.db.account.findFirst({
        where: {
          provider: "harvia",
          userId,
        },
      });

      if (existingAccount) {
        return ctx.db.account.update({
          where: { id: existingAccount.id },
          data: {
            id_token: harviaTokens.idToken,
            access_token: harviaTokens.accessToken,
            refresh_token: harviaTokens.refreshToken,
            expires_at: harviaTokens.expiresIn,
            email: input.username,
          },
        });
      } else {
        return ctx.db.account.create({
          data: {
            userId,
            type: "credentials",
            provider: "harvia",
            providerAccountId: userId,
            id_token: harviaTokens.idToken,
            access_token: harviaTokens.accessToken,
            refresh_token: harviaTokens.refreshToken,
            expires_at: harviaTokens.expiresIn,
            email: input.username,
          },
        });
      }
    }),
  getUnpostedSessions: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    const sessions = await ctx.db.saunaSession.findMany({
      where: {
        participants: {
          some: {
            id: userId,
          },
        },
        posts: { none: { createdById: userId } },
        OR: [{ endTimestamp: { not: null } }, { status: "ONGOING" }],
      },
      include: {
        sauna: true,
      },
      orderBy: {
        startTimestamp: "desc",
      },
    });
    return sessions;
  }),
  getLatestSession: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    const session = await ctx.db.saunaSession.findFirst({
      where: {
        participants: {
          some: {
            id: userId,
          },
        },
      },
      include: {
        sauna: true,
        posts: true,
      },
      orderBy: {
        startTimestamp: "desc",
      },
    });
    if (!session) {
      return null;
    }
    const postedByCurrentUser = session.posts.some(
      (p) => p.createdById === userId,
    );
    return { ...session, postedByCurrentUser };
  }),
  getYearSummary: protectedProcedure
    .input(z.object({ year: z.number() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const sessions = await ctx.db.saunaSession.findMany({
        where: {
          participants: { some: { id: userId } },
          startTimestamp: {
            gte: new Date(input.year, 0, 1),
            lt: new Date(input.year + 1, 0, 1),
          },
        },
      });

      const totalSessions = sessions.length;
      const totalMinutes = sessions.reduce(
        (sum, s) => sum + (s.durationMs ?? 0) / 60000,
        0,
      );
      const maxTemperature = Math.max(
        ...sessions.map((s) => s.maxTemperature ?? 0),
      );

      return {
        totalSessions,
        totalMinutes,
        maxTemperature,
      };
    }),
});
