"use client";
import { Card } from "./ui/card";
import { Flame, Droplets, Wind, Sparkles, Edit2, Check, X } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { useState, useEffect, useRef } from "react";

interface Program {
  id: number;
  name: string;
  savedFrom: string;
  originalSession: string;
  duration: string;
  chartData: { time: string; temperature: number; humidity: number }[];
}

interface ProgramsProps {
  programs: Program[];
  setPrograms: React.Dispatch<React.SetStateAction<Program[]>>;
  removeProgram: (id: number) => void;
}

export function Programs({ removeProgram }: ProgramsProps) {
  // Saved programs state
  const [programs, setPrograms] = useState([
    {
      id: 1,
      name: "Ultimate Recovery Sauna",
      savedFrom: "Lauri Markkanen",
      originalSession: "After game sauna",
      duration: "45",
      chartData: [
        { time: "0", temperature: 70, humidity: 12 },
        { time: "5", temperature: 72, humidity: 14 },
        { time: "10", temperature: 75, humidity: 16 },
        { time: "15", temperature: 80, humidity: 18 },
        { time: "20", temperature: 82, humidity: 20 },
        { time: "25", temperature: 85, humidity: 22 },
        { time: "30", temperature: 87, humidity: 24 },
        { time: "35", temperature: 88, humidity: 25 },
        { time: "40", temperature: 90, humidity: 26 },
        { time: "45", temperature: 88, humidity: 24 },
      ],
    },
    {
      id: 4,
      name: "Rising Löyly",
      savedFrom: "Matti Virtanen",
      originalSession: "Friday Sauna",
      duration: "60",
      chartData: [
        { time: "0", temperature: 70, humidity: 12 },
        { time: "10", temperature: 73, humidity: 14 },
        { time: "20", temperature: 80, humidity: 18 },
        { time: "30", temperature: 88, humidity: 22 },
        { time: "40", temperature: 90, humidity: 25 },
        { time: "50", temperature: 92, humidity: 28 },
        { time: "60", temperature: 95, humidity: 30 },
      ],
    },
  ]);

  const [steamStates, setSteamStates] = useState<Record<number, boolean>>(
    {},
  );
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editedName, setEditedName] = useState("");
  const [activeSession, setActiveSession] = useState<{
    programId: number;
    programName: string;
  } | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const cardRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const inputRef = useRef<HTMLInputElement>(null);

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

  const handleEdit = (id: number) => {
    const program = programs.find((p) => p.id === id);
    if (program) {
      setEditingId(id);
      setEditedName(program.name);
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 0);
    }
  };

  const handleSave = (id: number) => {
    setPrograms((prev) =>
      prev.map((p) => (p.id === id ? { ...p, name: editedName } : p)),
    );
    setEditingId(null);
  };

  const handleCancel = () => {
    setEditingId(null);
  };

  const handleStartSession = (programId: number, programName: string) => {
    setActiveSession({ programId, programName });
    setIsConnecting(true);
    // Simulate a connection delay of 1.5 seconds
    setTimeout(() => {
      setIsConnecting(false);
    }, 1500);
  };

  return (
    <div className="space-y-3 pt-5 pb-2">
      {/* Active Session Status */}
      {activeSession && (
        <Card className="heat-wave mx-3 overflow-hidden rounded-2xl border-[#2C2B36] bg-[#1F1F23]">
          <div className="p-5">
            {isConnecting ? (
              <div className="text-center">
                <div className="mb-3 inline-block h-8 w-8 animate-spin rounded-full border-b-2 border-[#D01400]"></div>
                <p
                  className="font-bold text-white"
                  style={{ fontSize: "16px" }}
                >
                  Connecting to your smart sauna system...
                </p>
              </div>
            ) : (
              <>
                <p
                  className="mb-4 font-bold text-white"
                  style={{ fontSize: "16px" }}
                >
                  Your smart sauna is heating up. {activeSession.programName}{" "}
                  program starts in 45 minutes.
                </p>
                <button
                  onClick={() => setActiveSession(null)}
                  className="w-full rounded-xl border-2 border-gray-600 bg-transparent py-3 font-bold text-gray-300 transition-opacity hover:opacity-80"
                  style={{ fontSize: "14px" }}
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </Card>
      )}

      <div className="flex items-center justify-between px-3">
        <h1 className="font-bold text-white" style={{ fontSize: "28px" }}>
          Saved Programs
        </h1>
      </div>

      <p
        className="px-3 font-normal text-gray-400"
        style={{ fontSize: "13px" }}
      >
        Sauna programs you've saved
      </p>

      <div className="space-y-3">
        {programs.map((program, index) => {
          // Calculate max temperature for dynamic Y-axis
          const maxTemp = Math.max(
            ...program.chartData.map((d) => d.temperature),
          );
          const yAxisDomain = maxTemp > 100 ? [0, 119] : [0, 100];
          const isSessionActive = activeSession !== null;

          return (
            <div
              key={program.id}
              ref={(el) => (cardRefs.current[program.id] = el)}
              data-card-id={program.id}
              className={`steam-fade ${steamStates[program.id] ? "active" : ""}`}
            >
              <Card className="heat-wave overflow-hidden rounded-2xl border-[#2C2B36] bg-[#1F1F23]">
                <div className="p-5 pb-0">
                  {/* Title and Edit Button Row */}
                  <div className="mb-1 flex items-start justify-between gap-3">
                    <h3
                      className="flex-1 leading-tight font-bold text-white"
                      style={{ fontSize: "22px" }}
                    >
                      {editingId === program.id ? (
                        <input
                          ref={inputRef}
                          type="text"
                          value={editedName}
                          onChange={(e) => setEditedName(e.target.value)}
                          className="w-full rounded-lg bg-[#2C2B36] px-2 py-1 text-white focus:ring-2 focus:ring-[#D01400] focus:outline-none"
                          style={{ fontSize: "22px" }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSave(program.id);
                            if (e.key === "Escape") handleCancel();
                          }}
                        />
                      ) : (
                        program.name
                      )}
                    </h3>

                    {/* Edit Button */}
                    <div className="flex-shrink-0">
                      {editingId === program.id ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSave(program.id)}
                            className="rounded-lg bg-[#D01400] p-1.5 transition-opacity hover:opacity-80"
                          >
                            <Check className="h-4 w-4 text-white" />
                          </button>
                          <button
                            onClick={handleCancel}
                            className="rounded-lg bg-[#2C2B36] p-1.5 transition-opacity hover:opacity-80"
                          >
                            <X className="h-4 w-4 text-white" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleEdit(program.id)}
                          className="rounded-lg bg-[#2C2B36] p-1.5 transition-opacity hover:opacity-80"
                        >
                          <Edit2 className="h-4 w-4 text-white" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Saved From */}
                  <p
                    className="mb-0 font-normal text-gray-200"
                    style={{ fontSize: "13px" }}
                  >
                    Saved from: {program.savedFrom}'s "{program.originalSession}
                    "
                  </p>
                </div>

                {/* Chart */}
                <div className="mt-2 px-5">
                  <ResponsiveContainer width="100%" height={240}>
                    <LineChart
                      data={program.chartData}
                      margin={{ top: 10, right: 10, left: 45, bottom: 10 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#2C2B36"
                        vertical={false}
                      />

                      {/* Temperature Y-axis (left) - hidden */}
                      <YAxis
                        yAxisId="temp"
                        orientation="left"
                        domain={[0, 100]}
                        hide={true}
                      />

                      {/* Temperature Y-axis (right) - visible */}
                      <YAxis
                        yAxisId="temp"
                        orientation="right"
                        tick={{ fontSize: 11, fill: "#BFC5CA" }}
                        stroke="transparent"
                        domain={yAxisDomain}
                        ticks={[0, 20, 40, 60, 80, 100]}
                        width={35}
                      />

                      {/* X-axis */}
                      <XAxis
                        dataKey="time"
                        tick={{ fontSize: 11, fill: "#BFC5CA" }}
                        stroke="transparent"
                        tickLine={false}
                        tickFormatter={(value) => `${value}min`}
                      />

                      <Tooltip
                        contentStyle={{
                          background: "#1F1F23",
                          border: "1px solid #2C2B36",
                          borderRadius: "8px",
                          fontSize: "12px",
                          color: "#F5E6D0",
                        }}
                        formatter={(value: any, name: string) => {
                          return [
                            `${value}${name === "temperature" ? "°" : "%"}`,
                            name === "temperature" ? "Temperature" : "Humidity",
                          ];
                        }}
                      />

                      <Legend
                        wrapperStyle={{ fontSize: "12px", color: "#BFC5CA" }}
                        iconType="line"
                        formatter={(value) => {
                          if (value === "temperature") return "Temp (°C)";
                          if (value === "humidity") return "Humidity (%)";
                          return null;
                        }}
                      />

                      <Line
                        yAxisId="temp"
                        type="monotone"
                        dataKey="temperature"
                        stroke="#D01400"
                        strokeWidth={3}
                        dot={false}
                        name="temperature"
                      />
                      <Line
                        yAxisId="temp"
                        type="monotone"
                        dataKey="humidity"
                        stroke="#BFC5CA"
                        strokeWidth={3}
                        dot={false}
                        name="humidity"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Send Button */}
                <div className="p-5 pt-3">
                  <button
                    className={`w-full rounded-xl py-3 font-bold text-white transition-opacity ${
                      isSessionActive
                        ? "cursor-not-allowed bg-gray-600"
                        : "bg-[#D01400] hover:opacity-90"
                    }`}
                    style={{ fontSize: "14px" }}
                    onClick={() =>
                      !isSessionActive &&
                      handleStartSession(program.id, program.name)
                    }
                    disabled={isSessionActive}
                  >
                    {isSessionActive ? "In Progress" : "Start Session"}
                  </button>
                </div>
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
}
