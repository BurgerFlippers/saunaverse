"use client";

import { useState, useRef, useEffect } from "react";
import { Card } from "@/app/_components/ui/card";
import { Calendar, Clock, MapPin, Users } from "lucide-react";
import { api } from "@/trpc/react";

export default function EventsPage() {
  const { data: events, refetch } = api.event.getEvents.useQuery();
  const [acceptedStates, setAcceptedStates] = useState<{
    [key: string]: boolean;
  }>({});
  const [participantCounts, setParticipantCounts] = useState<{
    [key: string]: number;
  }>({});
  const [steamStates, setSteamStates] = useState<{ [key: string]: boolean }>(
    {},
  );
  const cardRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const participateMutation = api.event.participate.useMutation({
    onSuccess: () => {
      refetch();
    },
  });
  const cancelParticipationMutation = api.event.cancelParticipation.useMutation(
    {
      onSuccess: () => {
        refetch();
      },
    },
  );

  const handleAccept = (eventId: string, currentAttendees: number) => {
    setAcceptedStates((prev) => ({ ...prev, [eventId]: true }));
    setParticipantCounts((prev) => ({
      ...prev,
      [eventId]: currentAttendees + 1,
    }));
    setSteamStates((prev) => ({ ...prev, [eventId]: true }));
    participateMutation.mutate({ eventId });
  };

  const handleCancelParticipation = (
    eventId: string,
    currentAttendees: number,
  ) => {
    setAcceptedStates((prev) => ({ ...prev, [eventId]: false }));
    setParticipantCounts((prev) => ({
      ...prev,
      [eventId]: currentAttendees - 1,
    }));
    cancelParticipationMutation.mutate({ eventId });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "going":
        return {
          bg: "bg-[#10b981]/10",
          border: "border-[#10b981]",
          text: "text-[#10b981]",
        };
      case "maybe":
        return {
          bg: "bg-[#f59e0b]/10",
          border: "border-[#f59e0b]",
          text: "text-[#f59e0b]",
        };
      default:
        return {
          bg: "bg-[#D01400]/10",
          border: "border-[#D01400]",
          text: "text-[#D01400]",
        };
    }
  };

  return (
    <div className="space-y-2">
      <div className="px-4 pt-4 pb-2">
        <h2 className="mb-1 font-bold text-white" style={{ fontSize: "24px" }}>
          Sauna Events
        </h2>
        <p className="font-normal text-gray-400" style={{ fontSize: "13px" }}>
          Join sauna get-togethers with friends and community
        </p>
      </div>

      <div className="space-y-2">
        {events?.map((event) => {
          const statusColors = getStatusColor(event.status);
          const currentAttendees =
            participantCounts[event.id] !== undefined
              ? participantCounts[event.id]
              : event.participants.length;
          return (
            <div
              key={event.id}
              ref={(el) => {
                cardRefs.current[event.id] = el;
              }}
              data-card-id={event.id}
              className={`steam-fade ${steamStates[event.id] ? "active" : ""}`}
            >
              <Card className="heat-wave overflow-hidden rounded-2xl border-[#2C2B36] bg-[#1F1F23]">
                <div className="p-5">
                  <p
                    className="mb-3 font-normal text-gray-400"
                    style={{ fontSize: "12px" }}
                  >
                    {event.createdBy.name} invited you to:
                  </p>

                  <h3
                    className="mb-3 font-bold text-white"
                    style={{ fontSize: "20px" }}
                  >
                    {event.name}
                  </h3>

                  <div className="mb-3 space-y-2">
                    <div className="flex items-center gap-2 text-gray-300">
                      <Calendar className="h-4 w-4" />
                      <span
                        className="font-normal"
                        style={{ fontSize: "13px" }}
                      >
                        {event.date.toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-300">
                      <Clock className="h-4 w-4" />
                      <span
                        className="font-normal"
                        style={{ fontSize: "13px" }}
                      >
                        {event.date.toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-300">
                      <MapPin className="h-4 w-4" />
                      <span
                        className="font-normal"
                        style={{ fontSize: "13px" }}
                      >
                        {event.location}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-300">
                      <Users className="h-4 w-4" />
                      <span
                        className="font-normal"
                        style={{ fontSize: "13px" }}
                      >
                        {currentAttendees} / {event.maxAttendees} attending
                      </span>
                    </div>
                  </div>

                  <p
                    className="mb-4 font-normal text-gray-400"
                    style={{ fontSize: "12px" }}
                  >
                    {event.description}
                  </p>

                  {!acceptedStates[event.id] ? (
                    <button
                      className="w-full rounded-xl border-2 border-[#D01400] bg-[#D01400] py-2 font-bold text-white transition-opacity hover:opacity-80"
                      style={{ fontSize: "13px" }}
                      onClick={() =>
                        currentAttendees &&
                        handleAccept(event.id, currentAttendees)
                      }
                    >
                      Accept
                    </button>
                  ) : (
                    <div className="space-y-2">
                      <button
                        className="w-full cursor-default rounded-xl border-2 border-[#D01400] bg-[#2C2B36] py-2 font-bold text-[#D01400]"
                        style={{ fontSize: "13px" }}
                      >
                        Accepted
                      </button>
                      <button
                        className="w-full rounded-xl border-2 border-gray-600 bg-transparent py-2 font-bold text-gray-300 transition-opacity hover:opacity-80"
                        style={{ fontSize: "13px" }}
                        onClick={() =>
                          currentAttendees &&
                          handleCancelParticipation(event.id, currentAttendees)
                        }
                      >
                        Cancel Participation
                      </button>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
}
