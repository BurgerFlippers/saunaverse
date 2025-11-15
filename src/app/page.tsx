"use client";

import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";
import { api } from "@/trpc/react";
import { useState, useMemo } from "react";
import { SaunaGraph } from "@/app/_components/SaunaGraph";

export default function Home() {
  const { data: session } = useSession();

  const startDate = useMemo(
    () => new Date(new Date().setFullYear(new Date().getFullYear() - 1)),
    [],
  );

  const endDate = useMemo(() => new Date(), []);

  const { data: allSessions, isLoading: isLoadingAllSessions } =
    api.sauna.getAllSaunaSessions.useQuery(
      {
        startDate: startDate, // Last year
        endDate: endDate,
      },
      { enabled: !!session?.user },
    );

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
          Sauna <span className="text-[hsl(280,100%,70%)]">Strava</span>
        </h1>

        <div className="flex flex-col items-center gap-2">
          <p className="text-2xl text-white">
            {session && <span>Logged in as {session.user?.name}</span>}
          </p>
          <button
            className="rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20"
            onClick={() => (session ? signOut() : signIn())}
          >
            {session ? "Sign out" : "Sign in"}
          </button>
        </div>

        {session?.user && (
          <div className="w-full max-w-2xl">
            <h2 className="mb-4 text-3xl font-bold">All Sauna Sessions</h2>
            {isLoadingAllSessions ? (
              <p>Loading sessions...</p>
            ) : (
              <div className="space-y-8">
                {allSessions?.map((sessionItem) => (
                  <div
                    key={sessionItem.id}
                    className="rounded-xl bg-white/10 p-4"
                  >
                    <h3 className="mb-2 text-xl font-bold">
                      {sessionItem.sauna.name} - Session on{" "}
                      {new Date(
                        sessionItem.startTimestamp,
                      ).toLocaleDateString()}
                    </h3>
                    <p>
                      Duration: {(sessionItem.durationMs / 60000).toFixed(1)}{" "}
                      minutes
                    </p>
                    <p>Max Temp: {sessionItem.maxTemperature?.toFixed(1)} °C</p>
                    <p>Avg Humidity: {sessionItem.avgHumidity?.toFixed(1)} %</p>
                    <div className="mt-4">
                      <SaunaGraph
                        measurements={sessionItem.measurements || []}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
