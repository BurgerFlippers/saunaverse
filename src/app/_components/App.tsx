"use client";

import { useState } from "react";
import { Feed } from "./Feed";
import { Profile } from "./Profile";
import { Programs } from "./Programs";
import { Events } from "./Events";
import { Activity, Zap, Calendar, User, Plus, X } from "lucide-react";
import { MapPin } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Legend,
  ReferenceLine,
} from "recharts";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function App({ children }: { children: React.ReactNode }) {
  const [showCreateOverlay, setShowCreateOverlay] = useState(false);
  const pathname = usePathname();

  // Demo chart data for overlay - matches feed post format
  const demoChartData = [
    { time: "0", temperature: 70, humidity: 18, inSauna: null },
    { time: "10", temperature: 82, humidity: 32, inSauna: 0 },
    { time: "20", temperature: 88, humidity: 48, inSauna: 0 },
    { time: "30", temperature: 92, humidity: 58, inSauna: 0 },
    {
      time: "40",
      temperature: 85,
      humidity: 45,
      inSauna: null,
    },
  ];

  // Calculate max temperature for dynamic Y-axis
  const maxDemoTemp = Math.max(...demoChartData.map((d) => d.temperature));
  const demoYAxisDomain = maxDemoTemp > 100 ? [0, 119] : [0, 100];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Main Content */}
      <div className="mx-auto max-w-2xl px-2 py-2">{children}</div>

      {/* Floating Create Post Button */}
      <button
        onClick={() => setShowCreateOverlay(true)}
        className="fixed right-6 bottom-24 z-40 rounded-full bg-[#D01400] p-4 shadow-2xl transition-all duration-200 hover:scale-110 hover:bg-[#FF7A28]"
      >
        <Plus className="h-6 w-6 text-white" />
      </button>

      {/* Create Session Overlay */}
      {showCreateOverlay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
          <div className="relative w-full max-w-2xl rounded-2xl border border-[#2C2B36] bg-[#1F1F23]">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#2C2B36] px-5 py-4">
              <h2 className="font-bold text-white" style={{ fontSize: "22px" }}>
                Share Your Sauna Journey
              </h2>
              <button
                onClick={() => setShowCreateOverlay(false)}
                className="text-gray-400 transition-colors hover:text-white"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Content */}
            <div className="space-y-4 p-5">
              {/* Session Title */}
              <input
                type="text"
                placeholder="Perfect evening löyly session"
                className="w-full border-none bg-transparent px-0 py-0 font-bold text-white placeholder:text-gray-600 focus:outline-none"
                style={{ fontSize: "22px" }}
              />

              {/* Location */}
              <div className="relative">
                <MapPin className="absolute top-1/2 left-0 h-3 w-3 -translate-y-1/2 transform text-gray-400" />
                <input
                  type="text"
                  defaultValue="Lakeside Sauna, Helsinki"
                  className="w-full border-none bg-transparent py-0 pr-0 pl-5 font-normal text-gray-400 focus:outline-none"
                  style={{ fontSize: "11px" }}
                />
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
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
                    40m 12s
                  </p>
                </div>
                <div>
                  <p
                    className="mb-1.5 font-normal text-gray-300"
                    style={{ fontSize: "11px" }}
                  >
                    Average temp
                  </p>
                  <p
                    className="mb-0 leading-none font-bold text-white"
                    style={{ fontSize: "19px" }}
                  >
                    83°
                  </p>
                </div>
              </div>

              {/* Chart Preview */}
              <div className="scrollbar-hide mt-0 overflow-x-auto">
                <div className="flex gap-3 pb-0">
                  {/* Chart */}
                  <div className="w-full flex-shrink-0">
                    <ResponsiveContainer width="100%" height={240}>
                      <LineChart
                        data={demoChartData}
                        margin={{
                          top: 10,
                          right: 10,
                          left: 45,
                          bottom: 10,
                        }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#2C2B36"
                          vertical={false}
                        />

                        {/* Temperature Y-axis (left) */}
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
                          tick={{
                            fontSize: 11,
                            fill: "#BFC5CA",
                          }}
                          stroke="transparent"
                          domain={demoYAxisDomain}
                          ticks={[0, 20, 40, 60, 80, 100]}
                          width={35}
                        />

                        {/* Hidden Y-axis for in-sauna indicator (at bottom) */}
                        <YAxis yAxisId="inSauna" domain={[0, 1]} hide={true} />

                        {/* X-axis */}
                        <XAxis
                          dataKey="time"
                          tick={{
                            fontSize: 11,
                            fill: "#BFC5CA",
                          }}
                          stroke="transparent"
                          tickLine={false}
                          tickFormatter={(value: any) => `${value}min`}
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
                            if (name === "inSauna") return null;
                            return [
                              `${value}${name === "temperature" ? "°" : "%"}`,
                              name === "temperature"
                                ? "Temperature"
                                : "Humidity",
                            ];
                          }}
                        />

                        <Legend
                          wrapperStyle={{
                            fontSize: "12px",
                            color: "#BFC5CA",
                          }}
                          iconType="line"
                          formatter={(value: any, name: string) => {
                            if (name === "inSauna") return null;
                            return [
                              `${value}${name === "temperature" ? "°" : "%"}`,
                              name === "temperature"
                                ? "Temperature"
                                : "Humidity",
                            ];
                          }}
                        />

                        {/* In-Sauna indicator line */}
                        <Line
                          type="stepAfter"
                          dataKey="inSauna"
                          stroke="#D01400"
                          strokeWidth={4}
                          dot={false}
                          strokeLinecap="round"
                          isAnimationActive={false}
                          yAxisId="inSauna"
                          opacity={0.6}
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

                    {/* Legend for in-sauna indicator */}
                    <div className="mt-2 flex items-center justify-center gap-4 text-xs text-gray-300">
                      <div className="flex items-center gap-2">
                        <div className="h-1 w-8 rounded bg-[#D01400] opacity-60"></div>
                        <span className="font-normal">In sauna</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <textarea
                placeholder="The heat was intense but perfect. Started gentle, built up gradually..."
                rows={2}
                className="w-full resize-none border-none bg-transparent px-0 py-0 font-normal text-gray-400 placeholder:text-gray-600 focus:outline-none"
                style={{ fontSize: "11px" }}
              />

              {/* Action Buttons */}
              <div className="flex gap-3 border-t border-[#2C2B36] pt-2">
                <button
                  onClick={() => setShowCreateOverlay(false)}
                  className="flex-1 rounded-xl bg-[#2C2B36] px-6 py-3 font-bold text-white transition-colors hover:bg-[#3a3943]"
                  style={{ fontSize: "15px" }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowCreateOverlay(false)}
                  className="flex-1 rounded-xl bg-[#D01400] px-6 py-3 font-bold text-white transition-colors hover:bg-[#FF7A28]"
                  style={{ fontSize: "15px" }}
                >
                  Share Session
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation Bar */}
      <div className="fixed right-0 bottom-0 left-0 z-50 border-t border-[#2C2B36] bg-[#D01400] shadow-lg">
        <div className="mx-auto flex max-w-2xl justify-around">
          <Link
            href="/"
            className={`flex flex-col items-center px-6 py-3 transition-colors ${
              pathname === "/" ? "text-white" : "text-white/60"
            }`}
          >
            <Activity className="h-6 w-6" />
            <span className="mt-1 text-xs font-normal">Feed</span>
          </Link>
          <Link
            href="/programs"
            className={`flex flex-col items-center px-6 py-3 transition-colors ${
              pathname === "/programs" ? "text-white" : "text-white/60"
            }`}
          >
            <Zap className="h-6 w-6" />
            <span className="mt-1 text-xs font-normal">Programs</span>
          </Link>
          <Link
            href="/events"
            className={`flex flex-col items-center px-6 py-3 transition-colors ${
              pathname === "/events" ? "text-white" : "text-white/60"
            }`}
          >
            <Calendar className="h-6 w-6" />
            <span className="mt-1 text-xs font-normal">Events</span>
          </Link>
          <Link
            href="/you"
            className={`flex flex-col items-center px-6 py-3 transition-colors ${
              pathname === "/you" ? "text-white" : "text-white/60"
            }`}
          >
            <User className="h-6 w-6" />
            <span className="mt-1 text-xs font-normal">You</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
