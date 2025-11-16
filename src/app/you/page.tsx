"use client";

import { Card } from "@/app/_components/ui/card";
import {
  Flame,
  Trophy,
  Clock,
  TrendingUp,
  CheckCircle2,
  Circle,
  Calendar,
} from "lucide-react";
import { mockUserStats } from "@/data/mockData";
import { PostCard } from "@/app/_components/PostCard";
import { api } from "@/trpc/react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState } from "react";
import { YearSummary } from "../_components/YearSummary";

export default function YouPage() {
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      redirect("/login");
    },
  });
  const { data: myPosts } = api.post.getAll.useQuery();
  const [showYearSummary, setShowYearSummary] = useState(false);

  const weekDays = ["M", "T", "W", "T", "F", "S", "S"];
  const weeklyProgress = [true, true, false, true, true, false, false];

  if (!session) {
    return null;
  }

  return (
    <>
      <YearSummary
        isOpen={showYearSummary}
        onClose={() => setShowYearSummary(false)}
      />
      <div className="space-y-2 pb-16">
        <Card className="heat-wave relative rounded-2xl border-[#2C2B36] bg-[#1F1F23] p-6">
          <div className="mb-6 flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-2xl font-bold text-black">
              {session.user.name?.charAt(0)}
            </div>
            <div>
              <h2 className="mb-1 text-2xl font-bold text-white">
                {session.user.name}
              </h2>
              <p className="text-sm font-normal text-gray-300">
                Joined 3 months ago
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowYearSummary(true)}
            className="flex w-full cursor-pointer items-center justify-center rounded-lg bg-[#D01400] p-4 font-bold text-white transition-colors hover:bg-[#FF7A28]"
          >
            <Calendar className="mr-2" />
            View Your 2024 Sauna Wrapped
          </button>

          <div className="mb-6">
            <div className="mb-3 flex items-center gap-2">
              <Flame className="h-5 w-5 text-[#D01400]" />
              <h3 className="font-bold text-white" style={{ fontSize: "16px" }}>
                Weekly Streak
              </h3>
            </div>
            <div className="flex justify-between gap-2">
              {weekDays.map((day, index) => (
                <div
                  key={index}
                  className="flex flex-1 flex-col items-center gap-2"
                >
                  <div
                    className={`flex aspect-square w-full items-center justify-center rounded-xl ${
                      weeklyProgress[index]
                        ? "bg-[#D01400]"
                        : "border-2 border-[#2C2B36] bg-[#1F1F23]"
                    }`}
                  >
                    {weeklyProgress[index] ? (
                      <CheckCircle2 className="h-5 w-5 text-white" />
                    ) : (
                      <Circle className="h-5 w-5 text-gray-600" />
                    )}
                  </div>
                  <span className="text-xs font-normal text-gray-400">
                    {day}
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-3 text-center text-xs font-normal text-gray-400">
              {weeklyProgress.filter((d) => d).length} of 7 days completed this
              week
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl bg-[#2C2B36] p-4">
              <div className="mb-2 flex items-center gap-2">
                <Flame className="h-4 w-4 text-[#D01400]" />
                <p className="text-xs font-normal text-gray-300">
                  Current Streak
                </p>
              </div>
              <p className="text-3xl font-bold text-white">
                {mockUserStats.currentStreak}
              </p>
              <p className="text-xs font-normal text-gray-400">days</p>
            </div>

            <div className="rounded-xl bg-[#2C2B36] p-4">
              <div className="mb-2 flex items-center gap-2">
                <Trophy className="h-4 w-4 text-[#FFC533]" />
                <p className="text-xs font-normal text-gray-300">
                  Total Sessions
                </p>
              </div>
              <p className="text-3xl font-bold text-white">
                {mockUserStats.totalSessions}
              </p>
              <p className="text-xs font-normal text-gray-400">sessions</p>
            </div>

            <div className="rounded-xl bg-[#2C2B36] p-4">
              <div className="mb-2 flex items-center gap-2">
                <Clock className="h-4 w-4 text-[#FF7A28]" />
                <p className="text-xs font-normal text-gray-300">Total Time</p>
              </div>
              <p className="text-3xl font-bold text-white">
                {Math.floor(mockUserStats.totalMinutes / 60)}
              </p>
              <p className="text-xs font-normal text-gray-400">hours</p>
            </div>

            <div className="rounded-xl bg-[#2C2B36] p-4">
              <div className="mb-2 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-[#D01400]" />
                <p className="text-xs font-normal text-gray-300">Max Temp</p>
              </div>
              <p className="text-3xl font-bold text-white">
                {mockUserStats.maxTemp}
              </p>
              <p className="text-xs font-normal text-gray-400">°C</p>
            </div>
          </div>
        </Card>

        <Card className="heat-wave rounded-2xl border-[#2C2B36] bg-[#1F1F23] p-5">
          <h3 className="mb-4 text-xl font-bold text-white">My Posts</h3>
          <div className="space-y-3">
            {myPosts?.map((post) => (
              <PostCard key={post.id} post={post as any} />
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}
