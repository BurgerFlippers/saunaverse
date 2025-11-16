"use client";
import { Card } from "../_components/ui/card";
import { Calendar, MapPin, Users, Clock } from "lucide-react";
import { useState, useEffect, useRef } from "react";

export default function EventsPage() {
  const [steamStates, setSteamStates] = useState<{ [key: number]: boolean }>(
    {},
  );
  const [acceptedStates, setAcceptedStates] = useState<{
    [key: number]: boolean;
  }>({});
  const [participantCounts, setParticipantCounts] = useState<{
    [key: number]: number;
  }>({});
  const cardRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

  // Steam fade-in effect on card enter view
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const cardId = parseInt(
              entry.target.getAttribute("data-card-id") || "0",
            );
            setSteamStates((prev) => ({ ...prev, [cardId]: true }));
            setTimeout(() => {
              setSteamStates((prev) => ({ ...prev, [cardId]: false }));
            }, 800);
          }
        });
      },
      { threshold: 0.2 },
    );

    Object.values(cardRefs.current).forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  const handleAccept = (eventId: number, currentAttendees: number) => {
    setAcceptedStates((prev) => ({ ...prev, [eventId]: true }));
    setParticipantCounts((prev) => ({
      ...prev,
      [eventId]:
        prev[eventId] !== undefined ? prev[eventId] + 1 : currentAttendees + 1,
    }));
  };

  const handleCancelParticipation = (
    eventId: number,
    currentAttendees: number,
  ) => {
    setAcceptedStates((prev) => ({ ...prev, [eventId]: false }));
    setParticipantCounts((prev) => ({
      ...prev,
      [eventId]:
        prev[eventId] !== undefined ? prev[eventId] - 1 : currentAttendees - 1,
    }));
  };

  const events = [
    {
      id: 1,
      title: "Friday Night Sauna",
      host: "Mika Virtanen",
      date: "Friday, Nov 17",
      time: "19:00 - 22:00",
      location: "Löyly Helsinki",
      attendees: 8,
      maxAttendees: 12,
      description:
        "Join us for a relaxing Friday evening sauna session! We'll have some refreshments and good company.",
      status: "invited",
    },
    {
      id: 2,
      title: "Mökkisauna & Grill",
      host: "Anna Korhonen",
      date: "Saturday, Nov 18",
      time: "15:00 - 20:00",
      location: "Anna's summer cottage (Espoo)",
      attendees: 4,
      maxAttendees: 6,
      description:
        "Cozy afternoon at my family cottage! Wood-heated sauna followed by grilling. Bring your own drinks 🌲",
      status: "going",
    },
    {
      id: 3,
      title: "Sunday Sauna",
      host: "Janne Saunisto",
      date: "Sunday, Nov 19",
      time: "18:00 - 20:00",
      location: "Home sauna (Kallio)",
      attendees: 3,
      maxAttendees: 4,
      description:
        "Small group session at my place. Electric sauna, good löyly guaranteed!",
      status: "maybe",
    },
    {
      id: 4,
      title: "Sauna & Chill",
      host: "Emma Lahti",
      date: "Wednesday, Nov 22",
      time: "17:00 - 19:00",
      location: "Allas Sea Pool",
      attendees: 12,
      maxAttendees: 15,
      description:
        "Midweek sauna session to relax and unwind. Open to all levels!",
      status: "invited",
    },
    {
      id: 5,
      title: "Lakeside Sauna Evening",
      host: "Petri Mäkinen",
      date: "Saturday, Nov 25",
      time: "16:00 - 21:00",
      location: "Family mökkisauna (Järvenpää)",
      attendees: 5,
      maxAttendees: 8,
      description:
        "Traditional lakeside sauna with avanto swimming. Bring warm clothes and towels! 🏊‍♂️",
      status: "invited",
    },
    {
      id: 6,
      title: "Quick Evening Session",
      host: "Sari Lehto",
      date: "Thursday, Nov 23",
      time: "19:30 - 21:00",
      location: "Apartment building sauna (Töölö)",
      attendees: 2,
      maxAttendees: 3,
      description:
        "Just a casual sauna in our building. Low-key and relaxed ☺️",
      status: "invited",
    },
  ];

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
      {/* Header */}
      <div className="px-4 pt-4 pb-2">
        <h2 className="mb-1 font-bold text-white" style={{ fontSize: "24px" }}>
          Sauna Events
        </h2>
        <p className="font-normal text-gray-400" style={{ fontSize: "13px" }}>
          Join sauna get-togethers with friends and community
        </p>
      </div>

      {/* Events List */}
      <div className="space-y-2">
        {events.map((event) => {
          const statusColors = getStatusColor(event.status);
          const currentAttendees =
            participantCounts[event.id] !== undefined
              ? participantCounts[event.id]
              : event.attendees;
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
                  {/* Invitation Text */}
                  <p
                    className="mb-3 font-normal text-gray-400"
                    style={{ fontSize: "12px" }}
                  >
                    {event.host} invited you to:
                  </p>

                  {/* Event Title */}
                  <h3
                    className="mb-3 font-bold text-white"
                    style={{ fontSize: "20px" }}
                  >
                    {event.title}
                  </h3>

                  {/* Event Details */}
                  <div className="mb-3 space-y-2">
                    <div className="flex items-center gap-2 text-gray-300">
                      <Calendar className="h-4 w-4" />
                      <span
                        className="font-normal"
                        style={{ fontSize: "13px" }}
                      >
                        {event.date}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-300">
                      <Clock className="h-4 w-4" />
                      <span
                        className="font-normal"
                        style={{ fontSize: "13px" }}
                      >
                        {event.time}
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

                  {/* Description */}
                  <p
                    className="mb-4 font-normal text-gray-400"
                    style={{ fontSize: "12px" }}
                  >
                    {event.description}
                  </p>

                  {/* Action Buttons */}
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
