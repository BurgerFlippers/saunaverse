"use client";

import { useState } from "react";
import { api, type RouterOutputs } from "@/trpc/react";
import { formatDuration } from "./ui/utils";
import { AddPostModal } from "./AddPostModal";
import { Thermometer, Share, StopCircle } from "lucide-react";

type SaunaSession = RouterOutputs["user"]["getUnpostedSessions"][number];

interface UnsharedSessionCardProps {
  session: SaunaSession;
}

export function UnsharedSessionCard({ session }: UnsharedSessionCardProps) {
  const [showAddPostModal, setShowAddPostModal] = useState(false);
  const endSession = api.sauna.endSessionManually.useMutation();

  const handleEndSession = () => {
    endSession.mutate({ sessionId: session.id });
  };

  return (
    <>
      <div className="flex items-center justify-between rounded-lg bg-[#1F1F23] p-4">
        <div>
          <h3 className="text-lg font-bold">Your Recent Session</h3>
          <p className="text-sm text-gray-400">
            {session.sauna.name} -{" "}
            {new Date(session.startTimestamp).toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p
              className="mb-1.5 font-normal text-gray-300"
              style={{ fontSize: "11px" }}
            >
              Duration
            </p>
            <p
              className="mb-0 leading-none font-bold text-white"
              style={{ fontSize: "19px" }}
            >
              {session.endTimestamp
                ? formatDuration(
                    new Date(session.endTimestamp).getTime() -
                      new Date(session.startTimestamp).getTime(),
                  )
                : "Ongoing"}
            </p>
          </div>
          {session.avgTemperature && (
            <div className="text-right">
              <p
                className="mb-1.5 font-normal text-gray-300"
                style={{ fontSize: "11px" }}
              >
                Avg / Max Temp
              </p>
              <p
                className="mb-0 leading-none font-bold text-white"
                style={{ fontSize: "19px" }}
              >
                {session.avgTemperature.toFixed(0)}° /{" "}
                {session.maxTemperature?.toFixed(0)}°
              </p>
            </div>
          )}
          {session.endTimestamp ? (
            <button
              onClick={() => setShowAddPostModal(true)}
              className="rounded-lg bg-[#D01400] p-2 text-white"
            >
              <Share className="h-5 w-5" />
            </button>
          ) : (
            <button
              onClick={handleEndSession}
              className="rounded-lg bg-[#D01400] p-2 text-white"
              disabled={endSession.isPending}
            >
              {endSession.isPending ? (
                "..."
              ) : (
                <StopCircle className="h-5 w-5" />
              )}
            </button>
          )}
        </div>
      </div>
      {showAddPostModal && (
        <AddPostModal
          session={session}
          onClose={() => setShowAddPostModal(false)}
        />
      )}
    </>
  );
}
