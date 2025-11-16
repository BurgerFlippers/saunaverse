"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import { SaunaGraph } from "@/app/_components/SaunaGraph";

export default function SaunaHistoryPage({
  params,
}: {
  params: { saunaId: string };
}) {
  const [startDate, setStartDate] = useState(
    new Date(new Date().setDate(new Date().getDate() - 7)),
  );
  const [endDate, setEndDate] = useState(new Date());

  const { data: measurements } = api.sauna.getSaunaMeasurements.useQuery(
    {
      saunaId: params.saunaId,
      startDate,
      endDate,
    },
    { refetchInterval: 30000 },
  );

  const { data: sessions } = api.sauna.getSaunaSessions.useQuery({
    saunaId: params.saunaId,
    startDate,
    endDate,
  });

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
          Sauna History
        </h1>
        <div className="flex gap-4">
          <div>
            <label htmlFor="startDate">Start Date</label>
            <input
              type="date"
              id="startDate"
              value={startDate.toISOString().split("T")[0]}
              onChange={(e) => setStartDate(new Date(e.target.value))}
              className="ml-2 rounded bg-white/10 p-2"
            />
            <input
              type="time"
              value={startDate.toTimeString().split(" ")[0]}
              onChange={(e) => {
                const newDate = new Date(startDate);
                const [hours, minutes] = e.target.value.split(":");
                if (hours && minutes) {
                  newDate.setHours(parseInt(hours), parseInt(minutes));
                  setStartDate(newDate);
                }
              }}
              className="ml-2 rounded bg-white/10 p-2"
            />
          </div>
          <div>
            <label htmlFor="endDate">End Date</label>
            <input
              type="date"
              id="endDate"
              value={endDate.toISOString().split("T")[0]}
              onChange={(e) => setEndDate(new Date(e.target.value))}
              className="ml-2 rounded bg-white/10 p-2"
            />
            <input
              type="time"
              value={endDate.toTimeString().split(" ")[0]}
              onChange={(e) => {
                const newDate = new Date(endDate);
                const [hours, minutes] = e.target.value.split(":");
                if (hours && minutes) {
                  newDate.setHours(parseInt(hours), parseInt(minutes));
                  setEndDate(newDate);
                }
              }}
              className="ml-2 rounded bg-white/10 p-2"
            />
          </div>
        </div>
        {measurements && (
          <SaunaGraph measurements={measurements} sessions={sessions} />
        )}

        {sessions && (
          <div className="w-full max-w-4xl">
            <h2 className="mb-4 text-2xl font-semibold">Sessions</h2>
            <div className="flex flex-col gap-4">
              {sessions.map((session) => (
                <div key={session.id} className="rounded-lg bg-white/10 p-4">
                  <p className="text-lg font-semibold">
                    {session.startTimestamp.toLocaleString()} -{" "}
                    {session.endTimestamp?.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-400">
                    Duration:{" "}
                    {session.durationMs
                      ? (session.durationMs / 60000).toFixed(1)
                      : "N/A"}{" "}
                    minutes
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
