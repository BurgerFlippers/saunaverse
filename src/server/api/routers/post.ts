import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import type { SaunaMeasurement } from "@/../generated/prisma/client";

export const postRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        saunaSessionId: z.string().optional(),
        images: z.array(z.string()).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const postCount = await ctx.db.post.count({
        where: {
          createdById: userId,
        },
      });

      let achievementId: string | undefined;
      if (input.saunaSessionId) {
        const userSessions = await ctx.db.saunaSession.findMany({
          where: {
            participants: { some: { id: userId } },
            id: { not: input.saunaSessionId },
          },
          orderBy: { startTimestamp: "desc" },
        });

        const currentSession = await ctx.db.saunaSession.findUnique({
          where: { id: input.saunaSessionId },
        });

        if (postCount === 0) {
          const achievement = await ctx.db.achievement.findUnique({
            where: { name: "First Sauna Session" },
          });
          achievementId = achievement?.id;
        } else if (currentSession) {
          const longestSession = userSessions.every(
            (s) => (s.durationMs ?? 0) < (currentSession.durationMs ?? 0),
          );
          if (longestSession) {
            const achievement = await ctx.db.achievement.findUnique({
              where: { name: "Longest Sauna" },
            });
            achievementId = achievement?.id;
          }

          const hottestSauna = userSessions.every(
            (s) =>
              (s.maxTemperature ?? 0) < (currentSession.maxTemperature ?? 0),
          );
          if (hottestSauna) {
            const achievement = await ctx.db.achievement.findUnique({
              where: { name: "Hottest Sauna" },
            });
            achievementId = achievement?.id;
          }
        }
        if (achievementId === undefined) {
          const achievements = await ctx.db.achievement.findMany({
            where: {
              name: {
                notIn: [
                  "First Sauna Session",
                  "Hottest Sauna",
                  "Longest Sauna",
                ],
              },
            },
          });
          const randomIndex = Math.floor(Math.random() * achievements.length);
          achievementId = achievements[randomIndex]?.id;
        }
      }

      return ctx.db.post.create({
        data: {
          name: input.name,
          ...(achievementId && {
            achievement: { connect: { id: achievementId } },
          }),
          description: input.description,
          createdBy: { connect: { id: ctx.session.user.id } },
          saunaSession: { connect: { id: input.saunaSessionId } },
          images: {
            create: input.images?.map((url) => ({ url })),
          },
        },
      });
    }),

  getAll: protectedProcedure.query(async ({ ctx }) => {
    const posts = await ctx.db.post.findMany({
      orderBy: { createdAt: "desc" },
      where: { createdBy: { id: ctx.session.user.id } },
      include: {
        saunaSession: {
          include: {
            sauna: true,
            participants: true,
          },
        },
        achievement: true,
        createdBy: true,
        likes: true,
        images: true,
        comments: true,
      },
    });

    const postsWithMeasurements = await Promise.all(
      posts.map(async (post) => {
        if (!post.saunaSession) {
          return { ...post, saunaSession: null };
        }

        const measurements = await ctx.db.saunaMeasurement.findMany({
          where: {
            saunaId: post.saunaSession.saunaId,
            timestamp: {
              gte: post.saunaSession.startTimestamp,
              lte: post.saunaSession.endTimestamp ?? new Date(),
            },
          },
          orderBy: {
            timestamp: "asc",
          },
        });

        return {
          ...post,
          saunaSession: {
            ...post.saunaSession,
            measurements,
          },
        };
      }),
    );

    return postsWithMeasurements;
  }),

  getFeed: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(10),
        cursor: z.number().nullish(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const limit = input.limit ?? 10;
      const { cursor } = input;

      const items = await ctx.db.post.findMany({
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { createdAt: "desc" },
        include: {
          saunaSession: {
            include: {
              sauna: true,
              participants: true,
            },
          },
          achievement: true,
          createdBy: true,
          likes: {
            where: { userId: ctx.session.user.id },
            select: { userId: true },
          },
          _count: {
            select: {
              likes: true,
              comments: true,
            },
          },
          // Exclude the actual URL (base64 data) from the feed query
          images: {
            select: {
              id: true,
              postId: true,
              createdAt: true,
              // We intentionally do NOT select 'url' here to keep payload small
            },
          },
        },
      });

      let nextCursor: typeof cursor | undefined = undefined;
      if (items.length > limit) {
        const nextItem = items.pop();
        nextCursor = nextItem!.id;
      }

      return {
        items,
        nextCursor,
      };
    }),

  getComments: protectedProcedure
    .input(z.object({ postId: z.number() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.comment.findMany({
        where: { postId: input.postId },
        include: { createdBy: true },
        orderBy: { createdAt: "asc" },
      });
    }),

  getImage: protectedProcedure
    .input(z.object({ imageId: z.string() }))
    .query(async ({ ctx, input }) => {
      const image = await ctx.db.postImage.findUnique({
        where: { id: input.imageId },
        select: { url: true },
      });
      return image;
    }),

  getLatest: protectedProcedure.query(async ({ ctx }) => {
    const post = await ctx.db.post.findFirst({
      orderBy: { createdAt: "desc" },
      where: { createdBy: { id: ctx.session.user.id } },
      include: {
        saunaSession: {
          include: {
            sauna: {
              include: {
                saunaMeasurements: true,
              },
            },
            participants: true,
          },
        },
        achievement: true,
        createdBy: true,
        likes: true,
        images: true,
      },
    });

    return post ?? null;
  }),

  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const post = await ctx.db.post.findUnique({
        where: { id: input.id },
        include: {
          saunaSession: {
            include: {
              sauna: true,
              participants: true,
            },
          },
          achievement: true,
          createdBy: true,
          likes: true,
          images: true,
          comments: {
            include: { createdBy: true },
          },
        },
      });

      if (!post) return null;

      // Manually attach measurements because they aren't directly related in schema
      if (post.saunaSession) {
        const measurements = await ctx.db.saunaMeasurement.findMany({
          where: {
            saunaId: post.saunaSession.saunaId,
            timestamp: {
              gte: post.saunaSession.startTimestamp,
              lte: post.saunaSession.endTimestamp ?? new Date(),
            },
          },
          orderBy: {
            timestamp: "asc",
          },
        });

        return {
          ...post,
          saunaSession: {
            ...post.saunaSession,
            measurements,
          },
        };
      }

      return {
        ...post,
        saunaSession: post.saunaSession
          ? { ...post.saunaSession, measurements: [] as SaunaMeasurement[] }
          : null,
      };
    }),

  getSecretMessage: protectedProcedure.query(() => {
    return "you can now see this secret message!";
  }),

  likePost: protectedProcedure
    .input(z.object({ postId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      return ctx.db.like.create({
        data: {
          postId: input.postId,
          userId,
        },
      });
    }),

  unlikePost: protectedProcedure
    .input(z.object({ postId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      return ctx.db.like.delete({
        where: {
          userId_postId: {
            userId,
            postId: input.postId,
          },
        },
      });
    }),
  createComment: protectedProcedure
    .input(
      z.object({
        postId: z.number(),
        content: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.comment.create({
        data: {
          content: input.content,
          post: { connect: { id: input.postId } },
          createdBy: { connect: { id: ctx.session.user.id } },
        },
      });
    }),
});
