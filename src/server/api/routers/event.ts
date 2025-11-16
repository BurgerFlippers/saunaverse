import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

export const eventRouter = createTRPCRouter({
  getEvents: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.event.findMany({
      include: {
        sauna: true,
        createdBy: true,
        participants: true,
      },
      orderBy: {
        date: "asc",
      },
    });
  }),
  createEvent: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string(),
        date: z.date(),
        location: z.string(),
        saunaId: z.string(),
        maxAttendees: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.event.create({
        data: {
          ...input,
          createdById: ctx.session.user.id,
        },
      });
    }),
  participate: protectedProcedure
    .input(z.object({ eventId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.event.update({
        where: { id: input.eventId },
        data: {
          participants: {
            connect: { id: ctx.session.user.id },
          },
        },
      });
    }),
  cancelParticipation: protectedProcedure
    .input(z.object({ eventId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.event.update({
        where: { id: input.eventId },
        data: {
          participants: {
            disconnect: { id: ctx.session.user.id },
          },
        },
      });
    }),
});