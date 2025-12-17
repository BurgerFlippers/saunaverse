import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { calculateCalorieUsage } from "@/server/util/health";
import { generateInsight } from "@/server/util/insights";
import type { Insight } from "@/server/util/insights";

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
      let insight: Insight | null = null;
      if (input.saunaSessionId) {
        const session = await ctx.db.saunaSession.findUnique({
          where: { id: input.saunaSessionId },
        });

        if (session) {
          const biometrics = await ctx.db.userBiometrics.aggregate({
            _avg: { heartRate: true },
            where: {
              userId: ctx.session.user.id,
              timestamp: {
                gte: session.startTimestamp,
                lte: session.endTimestamp ?? new Date(),
              },
            },
          });

          const calories =
            session.durationMs && biometrics._avg.heartRate
              ? calculateCalorieUsage(
                  biometrics._avg.heartRate,
                  session.durationMs,
                )
              : null;

          const enrichedPost = {
            duration: session.durationMs ? session.durationMs / 1000 : 0,
            temperature: session.avgTemperature,
            calories,
            userId: ctx.session.user.id,
            createdAt: new Date(),
            id: -1,
            name: input.name,
            description: input.description,
            createdById: ctx.session.user.id,
            saunaSessionId: input.saunaSessionId,
            achievementId: null,
            updatedAt: new Date(),
            insights: [],
          };

          insight = generateInsight(enrichedPost);
        }
      }

      return ctx.db.post.create({
        data: {
          name: input.name,
          description: input.description,
          createdBy: { connect: { id: ctx.session.user.id } },
          saunaSession: { connect: { id: input.saunaSessionId } },
          images: {
            create: input.images?.map((url) => ({ url })),
          },
          insights: insight ? [insight] : [],
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

    return posts;
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

      const enrichedItems = await Promise.all(
        items.map(async (item) => {
          const biometrics = await ctx.db.userBiometrics.aggregate({
            _avg: { heartRate: true },
            where: {
              userId: item.createdBy.id,
              timestamp: {
                gte: item.saunaSession.startTimestamp,
                lte: item.saunaSession.endTimestamp ?? new Date(),
              },
            },
          });

          return {
            ...item,
            saunaSession: {
              ...item.saunaSession,
              avgHeartRate: biometrics._avg.heartRate,
              kCalBurned:
                item.saunaSession.durationMs && biometrics._avg.heartRate
                  ? calculateCalorieUsage(
                      biometrics._avg.heartRate,
                      item.saunaSession.durationMs,
                    )
                  : null,
            },
          };
        }),
      );

      let nextCursor: typeof cursor | undefined = undefined;
      if (enrichedItems.length > limit) {
        const nextItem = enrichedItems.pop();
        nextCursor = nextItem!.id;
      }

      return {
        items: enrichedItems,
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

      return post;
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
