"use client";

import "./style.css";

import { Card } from "@/app/_components/ui/card";
import {
  Flame,
  Trophy,
  Clock,
  TrendingUp,
  CheckCircle2,
  Circle,
  Calendar,
  Plus,
  RotateCcw,
  Award,
} from "lucide-react";
import { mockUserStats } from "@/data/mockData";
import { api } from "@/trpc/react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { YearSummary } from "../_components/YearSummary";
import { AddPostModal } from "../_components/AddPostModal";
import { PostCard } from "../_components/PostCard";

export default function YouPage() {
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      redirect("/login");
    },
  });
  const { data: sessions, isLoading } =
    api.sauna.getMySessionsAndPosts.useQuery();
  const [showYearSummary, setShowYearSummary] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = (sessionCreated?: boolean) => {
    setIsModalOpen(false);
    if (sessionCreated) {
      setJustAddedSession(true);
    }
  };

  const [justAddedSession, setJustAddedSession] = useState(false);
  const prevSessionCountRef = useRef(0);

  // Watch for session updates to trigger level up
  // We need to disable the exhaustive-deps rule because we only want to run this when sessions changes
  // AND we just added a session.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!sessions) return;

    if (justAddedSession) {
      // Check if the session count has actually increased (data has been refreshed)
      if (sessions.length > prevSessionCountRef.current) {
        const { stonesInCurrentLevel: stones } = getLevelInfo(sessions.length);

        // If stonesInCurrentLevel is 0, it means we just completed a level
        if (stones === 0 && sessions.length > 0) {
          setShowLevelUp(true);
          // Hide after 4 seconds (matches CSS animation)
          setTimeout(() => setShowLevelUp(false), 4000);
        }
        setJustAddedSession(false);
        prevSessionCountRef.current = sessions.length;
      }
      // If sessions.length hasn't increased yet, we wait for the next render
    } else {
      // Keep ref in sync for normal updates
      prevSessionCountRef.current = sessions.length;
    }
  }, [sessions, justAddedSession]);
  const weekDays = ["M", "T", "W", "T", "F", "S", "S"];
  const weeklyProgress = [true, true, false, true, true, false, false];

  const [showLevelUp, setShowLevelUp] = useState(false);

  if (!session || !sessions) {
    return null;
  }

  // Kiuas evolution state (demo only)
  const kiuasStones = sessions?.length;
  const lifetimeStones = 57 + kiuasStones; // Total lifetime stones (permanent + current)
  const year2024Stones = 52; // 2024 stones

  // Calculate current level and stones based on progressive difficulty
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const getLevelInfo = (totalSessions: number) => {
    let level = 1;
    let sessionsNeeded = 5;
    let sessionsRemaining = totalSessions;

    // Level 1: 5 sessions
    if (sessionsRemaining < sessionsNeeded) {
      return {
        level,
        stonesInCurrentLevel: sessionsRemaining,
        maxStones: sessionsNeeded,
      };
    }
    sessionsRemaining -= sessionsNeeded;
    level++;

    // Level 2: 10 sessions
    sessionsNeeded = 10;
    if (sessionsRemaining < sessionsNeeded) {
      return {
        level,
        stonesInCurrentLevel: sessionsRemaining,
        maxStones: sessionsNeeded,
      };
    }
    sessionsRemaining -= sessionsNeeded;
    level++;

    // Level 3: 15 sessions
    sessionsNeeded = 15;
    if (sessionsRemaining < sessionsNeeded) {
      return {
        level,
        stonesInCurrentLevel: sessionsRemaining,
        maxStones: sessionsNeeded,
      };
    }
    sessionsRemaining -= sessionsNeeded;
    level++;

    // Level 4+: 15 sessions each
    sessionsNeeded = 15;
    const additionalLevels = Math.floor(sessionsRemaining / sessionsNeeded);
    level += additionalLevels;
    const stonesInLastLevel = sessionsRemaining % sessionsNeeded;

    return {
      level,
      stonesInCurrentLevel: stonesInLastLevel,
      maxStones: sessionsNeeded,
    };
  };

  const {
    level: currentLevel,
    stonesInCurrentLevel,
    maxStones: maxStonesPerLevel,
  } = getLevelInfo(kiuasStones);

  // Helper function to calculate level indicators (flames only - simplified)
  const getLevelIndicators = (totalStones: number) => {
    const { level } = getLevelInfo(totalStones);

    // Level 1-3: Yellow flames (1, 2, 3)
    if (level <= 3) {
      return { flameCount: level, flameColor: "#FFC533" }; // Yellow
    }
    // Level 4-6: Orange flames (1, 2, 3)
    else if (level <= 6) {
      return { flameCount: level - 3, flameColor: "#FF7A28" }; // Orange
    }
    // Level 7-9+: Red flames (1, 2, 3)
    else {
      return { flameCount: Math.min(level - 6, 3), flameColor: "#D01400" }; // Red (max 3)
    }
  };

  const currentIndicators = getLevelIndicators(kiuasStones);
  const lifetimeIndicators = getLevelIndicators(lifetimeStones);
  const year2024Indicators = getLevelIndicators(year2024Stones);

  // Calculate stone positions based on the current max stones for the level
  const getStonePositions = (maxStones: number) => {
    // Basic positions for 5 stones (Level 1)
    if (maxStones === 5) {
      return [
        { x: 30, y: 8 },
        { x: 80, y: 8 },
        { x: 130, y: 8 },
        { x: 55, y: 54 },
        { x: 105, y: 54 },
      ];
    }

    // Positions for 10 stones (Level 2)
    if (maxStones === 10) {
      return [
        // Bottom row (4)
        { x: 20, y: 8 },
        { x: 68, y: 8 },
        { x: 116, y: 8 },
        { x: 164, y: 8 },
        // Middle row (3)
        { x: 44, y: 54 },
        { x: 92, y: 54 },
        { x: 140, y: 54 },
        // Top row (3)
        { x: 44, y: 100 },
        { x: 92, y: 100 },
        { x: 140, y: 100 },
      ];
    }

    // Default positions for 15 stones (Level 3+)
    return [
      // Bottom row (5 stones) - y: 8px from bottom, centered
      { x: 12, y: 8 },
      { x: 46, y: 8 },
      { x: 80, y: 8 },
      { x: 114, y: 8 },
      { x: 148, y: 8 },
      // Second row (4 stones) - y: 54px from bottom
      { x: 29, y: 54 },
      { x: 63, y: 54 },
      { x: 97, y: 54 },
      { x: 131, y: 54 },
      // Third row (3 stones) - y: 100px from bottom
      { x: 46, y: 100 },
      { x: 80, y: 100 },
      { x: 114, y: 100 },
      // Fourth row (2 stones) - y: 146px from bottom
      { x: 63, y: 146 },
      { x: 97, y: 146 },
      // Fifth row (1 stone) - y: 192px from bottom
      { x: 80, y: 192 },
    ];
  };

  const stonePositions = getStonePositions(maxStonesPerLevel);

  return (
    <>
      {showLevelUp && (
        <div className="animate-levelup fixed inset-0 z-80 flex items-center justify-center bg-black/80">
          <div className="text-center">
            <h2 className="mb-4 text-4xl font-bold text-[#D01400]">
              LEVEL UP!
            </h2>
            <div className="flex justify-center gap-6">
              {Array.from({ length: currentIndicators.flameCount }).map(
                (_, i) => (
                  <div key={i} className="relative">
                    <Flame
                      className={
                        "animate-flame h-16 w-16 " +
                        `text-[${currentIndicators.flameColor}]`
                      }
                    />
                    {/* Sparks */}
                    {Array.from({ length: 4 }).map((_, sparkIdx) => {
                      const tx = (Math.random() - 0.5) * 100; // Random X spread
                      const duration = 0.5 + Math.random() * 0.5; // Random duration 0.5-1s
                      const delay = Math.random() * 0.5; // Random delay
                      return (
                        <div
                          key={sparkIdx}
                          className="spark"
                          style={{
                            // @ts-ignore
                            "--tx": `${tx}px`,
                            animation: `sparkFly ${duration}s ease-out infinite`,
                            animationDelay: `${delay}s`,
                          }}
                        />
                      );
                    })}
                  </div>
                ),
              )}
            </div>
            <p className="mt-4 text-2xl font-bold text-white">
              Your Kiuas evolved to Level {currentLevel}
            </p>
          </div>
        </div>
      )}
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
                This Week
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
              <p className="text-xs font-normal text-gray-400">weeks</p>
            </div>

            <div className="rounded-xl bg-[#2C2B36] p-4">
              <div className="mb-2 flex items-center gap-2">
                <Trophy className="h-4 w-4 text-[#FFC533]" />
                <p className="text-xs font-normal text-gray-300">
                  Record Streak
                </p>
              </div>
              <p className="text-3xl font-bold text-white">14</p>
              <p className="text-xs font-normal text-gray-400">weeks</p>
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

        <Card className="heat-wave relative justify-center overflow-hidden rounded-2xl border-[#2C2B36] bg-[#1F1F23] p-4">
          <h3 className="mb-3 text-xl font-bold text-white">Kiuas evolution</h3>

          {/* Lifetime and 2025 - Horizontally side by side with flames only */}
          <div className="mb-4 grid grid-cols-2 gap-3">
            {/* Lifetime */}
            <div className="flex flex-col items-center gap-1 rounded-xl bg-[#2C2B36] p-2">
              <p className="text-sm text-[#BFC5CA]">Lifetime</p>
              <div className="flex gap-1.5">
                {Array.from({ length: lifetimeIndicators.flameCount }).map(
                  (_, idx) => (
                    <Flame
                      key={idx}
                      className="h-6 w-6"
                      style={{ color: lifetimeIndicators.flameColor }}
                    />
                  ),
                )}
              </div>
              <p className="text-3xl font-bold text-white">{lifetimeStones}</p>
              <p className="text-xs text-[#BFC5CA]">sessions</p>
            </div>

            {/* 2025 */}
            <div className="flex flex-col items-center gap-1 rounded-xl bg-[#2C2B36] p-2">
              <p className="text-sm text-[#BFC5CA]">2024</p>
              <div className="flex gap-1.5">
                {Array.from({ length: year2024Indicators.flameCount }).map(
                  (_, idx) => (
                    <Flame
                      key={idx}
                      className="h-6 w-6"
                      style={{ color: year2024Indicators.flameColor }}
                    />
                  ),
                )}
              </div>
              <p className="text-3xl font-bold text-white">{year2024Stones}</p>
              <p className="text-xs text-[#BFC5CA]">sessions</p>
            </div>
          </div>

          {/* 2025 Title */}
          <h4
            className="mb-3 font-bold text-white"
            style={{ fontSize: "16px" }}
          >
            2025
          </h4>

          {/* Two-column layout */}
          <div className="flex justify-start">
            {/* Left side - Kiuas */}
            <div className="flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                {/* Level indicator with flames and text */}
                <div className="mb-1 flex items-center gap-2">
                  <div className="flex gap-2">
                    {Array.from({ length: currentIndicators.flameCount }).map(
                      (_, idx) => (
                        <Flame
                          key={idx}
                          className="h-7 w-7"
                          style={{ color: currentIndicators.flameColor }}
                        />
                      ),
                    )}
                  </div>
                  <span className="text-2xl font-bold text-white">
                    Level {currentLevel}
                  </span>
                </div>

                {/* Kiuas base structure - slightly smaller */}
                <div className="relative h-64 w-56 overflow-visible rounded-t-3xl border-4 border-[#BFC5CA] bg-gradient-to-t from-[#3a3943] to-[#2C2B36] md:ml-16">
                  {/* Inner glow effect */}
                  <div className="absolute inset-2 rounded-t-2xl bg-gradient-to-t from-[#D01400]/20 to-transparent"></div>

                  {/* Stones - each with fixed predetermined position - larger and more centered */}
                  {Array.from({ length: stonesInCurrentLevel }).map(
                    (_, index) => {
                      const position = stonePositions[index] || { x: 0, y: 0 };
                      // More realistic stone shapes - less round, more angular/irregular
                      const shapeVariants = [
                        "35% 65% 60% 40%",
                        "60% 40% 45% 55%",
                        "40% 60% 55% 45%",
                        "65% 35% 50% 50%",
                        "45% 55% 40% 60%",
                        "55% 45% 65% 35%",
                        "38% 62% 58% 42%",
                        "62% 38% 42% 58%",
                      ];
                      const shape = shapeVariants[index % shapeVariants.length];

                      return (
                        <div
                          key={index}
                          className="absolute bg-[#BFC5CA] shadow-lg"
                          style={{
                            width: "40px",
                            height: "44px",
                            borderRadius: shape,
                            left: `${position.x}px`,
                            bottom: `${position.y}px`,
                            animation: `dropIn 0.4s ease-out backwards`,
                          }}
                        ></div>
                      );
                    },
                  )}
                </div>

                {/* Current level stones indicator */}
                <div className="mt-1">
                  <p className="text-sm text-[#BFC5CA]">
                    {stonesInCurrentLevel}/{maxStonesPerLevel} stones in current
                    level
                  </p>
                </div>
              </div>
            </div>

            {/* Right side - Total Sessions */}
            <div className="ml-4 flex flex-1 items-center justify-center">
              <div className="text-center">
                <div className="mb-2">
                  <Award className="mx-auto h-12 w-12 text-[#FFC533]" />
                </div>
                <p className="mb-2 text-5xl font-bold text-white">
                  {kiuasStones}
                </p>
                <p className="text-sm text-[#BFC5CA]">Sessions</p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="heat-wave rounded-2xl border-[#2C2B36] bg-[#1F1F23] p-5">
          <h3 className="mb-4 text-xl font-bold text-white">My Sessions</h3>
          <div className="space-y-3">
            {sessions?.map((session) => (
              <PostCard
                key={session.id}
                session={session as any}
                post={(session.posts[0] as any) ?? undefined}
              />
            ))}
            {sessions?.length === 0 && !isLoading && (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <p className="mb-4 text-sm font-medium text-gray-300">
                  No sessions yet recorded.
                </p>
                <p className="mb-2 flex items-center justify-center gap-1.5 text-xs text-gray-400">
                  <span>Connect your</span>
                  <img
                    src="/harvia-logo.png"
                    alt="Harvia"
                    className="h-3 w-auto object-contain opacity-80"
                  />
                  <span>account to automatically record sessions.</span>
                </p>
                <p className="text-xs text-gray-500">
                  Or log your sessions manually using the + button below.
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>
      <button
        onClick={() => openModal()}
        className="fixed right-4 bottom-24 flex h-14 w-14 cursor-pointer items-center justify-center rounded-full bg-red-600 text-white shadow-lg hover:bg-red-700"
      >
        <Plus className="h-8 w-8" />
      </button>
      {isModalOpen && (
        <AddPostModal onClose={closeModal} initialState="createSession" />
      )}
    </>
  );
}
