"use client";

import { api } from "@/trpc/react";
import { Card } from "@/app/_components/ui/card";

export default function EventsPage() {
  const { data: events } = api.event.getEvents.useQuery();

  return (
    <div className="space-y-2">
      {events?.map((event) => (
        <Card
          key={event.id}
          className="heat-wave rounded-2xl border-[#2C2B36] bg-[#1F1F23] p-5"
        >
          <h3 className="mb-2 text-xl font-bold text-white">{event.name}</h3>
          <p className="text-sm text-gray-400">{event.description}</p>
          <div className="mt-4 flex justify-between text-sm text-gray-400">
            <span>{event.location}</span>
            <span>{event.date.toLocaleDateString()}</span>
          </div>
        </Card>
      ))}
    </div>
  );
}
