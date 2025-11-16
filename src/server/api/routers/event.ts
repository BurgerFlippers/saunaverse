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
});