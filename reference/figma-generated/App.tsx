import { useState } from "react";
import { Feed } from "./components/Feed";
import { LogSession } from "./components/LogSession";
import { Profile } from "./components/Profile";
import { Programs } from "./components/Programs";
import { Events } from "./components/Events";
import {
  Activity,
  Zap,
  Calendar,
  User,
  Plus,
  X,
} from "lucide-react";
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

export default function App() {
  const [currentTab, setCurrentTab] = useState<
    "feed" | "programs" | "events" | "you"
  >("feed");
  const [showCreateOverlay, setShowCreateOverlay] =
    useState(false);

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
  const maxDemoTemp = Math.max(
    ...demoChartData.map((d) => d.temperature),
  );
  const demoYAxisDomain =
    maxDemoTemp > 100 ? [0, 119] : [0, 100];

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-2 py-2">
        {currentTab === "feed" && <Feed />}
        {currentTab === "programs" && <Programs />}
        {currentTab === "events" && <Events />}
        {currentTab === "you" && <Profile />}
      </div>

      {/* Floating Create Post Button */}
      <button
        onClick={() => setShowCreateOverlay(true)}
        className="fixed bottom-24 right-6 z-40 bg-[#D01400] hover:bg-[#FF7A28] transition-all duration-200 p-4 rounded-full shadow-2xl hover:scale-110"
      >
        <Plus className="w-6 h-6 text-white" />
      </button>

      {/* Create Session Overlay */}
      {showCreateOverlay && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          <div className="bg-[#1F1F23] rounded-2xl w-full max-w-2xl relative border border-[#2C2B36]">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#2C2B36]">
              <h2
                className="font-bold text-white"
                style={{ fontSize: "22px" }}
              >
                Share Your Sauna Journey
              </h2>
              <button
                onClick={() => setShowCreateOverlay(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-5 space-y-4">
              {/* Session Title */}
              <input
                type="text"
                placeholder="Perfect evening löyly session"
                className="w-full bg-transparent border-none text-white font-bold px-0 py-0 focus:outline-none placeholder:text-gray-600"
                style={{ fontSize: "22px" }}
              />

              {/* Location */}
              <div className="relative">
                <MapPin className="absolute left-0 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400" />
                <input
                  type="text"
                  defaultValue="Lakeside Sauna, Helsinki"
                  className="w-full bg-transparent border-none text-gray-400 font-normal pl-5 pr-0 py-0 focus:outline-none"
                  style={{ fontSize: "11px" }}
                />
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <p
                    className="text-gray-300 font-normal mb-1.5"
                    style={{ fontSize: "11px" }}
                  >
                    Duration
                  </p>
                  <p
                    className="font-bold text-white mb-0 leading-none"
                    style={{ fontSize: "19px" }}
                  >
                    40m 12s
                  </p>
                </div>
                <div>
                  <p
                    className="text-gray-300 font-normal mb-1.5"
                    style={{ fontSize: "11px" }}
                  >
                    Average temp
                  </p>
                  <p
                    className="font-bold text-white mb-0 leading-none"
                    style={{ fontSize: "19px" }}
                  >
                    83°
                  </p>
                </div>
              </div>

              {/* Chart Preview */}
              <div className="overflow-x-auto scrollbar-hide mt-0">
                <div className="flex gap-3 pb-0">
                  {/* Chart */}
                  <div className="flex-shrink-0 w-full">
                    <ResponsiveContainer
                      width="100%"
                      height={240}
                    >
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
                        <YAxis
                          yAxisId="inSauna"
                          domain={[0, 1]}
                          hide={true}
                        />

                        {/* X-axis */}
                        <XAxis
                          dataKey="time"
                          tick={{
                            fontSize: 11,
                            fill: "#BFC5CA",
                          }}
                          stroke="transparent"
                          tickLine={false}
                          tickFormatter={(value) =>
                            `${value}min`
                          }
                        />

                        <Tooltip
                          contentStyle={{
                            background: "#1F1F23",
                            border: "1px solid #2C2B36",
                            borderRadius: "8px",
                            fontSize: "12px",
                            color: "#F5E6D0",
                          }}
                          formatter={(
                            value: any,
                            name: string,
                          ) => {
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
                          formatter={(value, entry) => {
                            // Only show temperature and humidity, skip 'inSauna'
                            if (value === "temperature")
                              return "Temp (°C)";
                            if (value === "humidity")
                              return "Humidity (%)";
                            return null; // skip all others
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
                    <div className="flex items-center justify-center gap-4 mt-2 text-xs text-gray-300">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-1 bg-[#D01400] opacity-60 rounded"></div>
                        <span className="font-normal">
                          In sauna
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <textarea
                placeholder="The heat was intense but perfect. Started gentle, built up gradually..."
                rows={2}
                className="w-full bg-transparent border-none text-gray-400 font-normal px-0 py-0 focus:outline-none resize-none placeholder:text-gray-600"
                style={{ fontSize: "11px" }}
              />

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2 border-t border-[#2C2B36]">
                <button
                  onClick={() => setShowCreateOverlay(false)}
                  className="flex-1 bg-[#2C2B36] hover:bg-[#3a3943] text-white font-bold py-3 px-6 rounded-xl transition-colors"
                  style={{ fontSize: "15px" }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowCreateOverlay(false)}
                  className="flex-1 bg-[#D01400] hover:bg-[#FF7A28] text-white font-bold py-3 px-6 rounded-xl transition-colors"
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
      <div className="fixed bottom-0 left-0 right-0 bg-[#D01400] border-t border-[#2C2B36] shadow-lg z-50">
        <div className="max-w-2xl mx-auto flex justify-around">
          <button
            onClick={() => setCurrentTab("feed")}
            className={`flex flex-col items-center py-3 px-6 transition-colors ${
              currentTab === "feed"
                ? "text-white"
                : "text-white/60"
            }`}
          >
            <Activity className="w-6 h-6" />
            <span className="text-xs mt-1 font-normal">
              Feed
            </span>
          </button>
          <button
            onClick={() => setCurrentTab("programs")}
            className={`flex flex-col items-center py-3 px-6 transition-colors ${
              currentTab === "programs"
                ? "text-white"
                : "text-white/60"
            }`}
          >
            <Zap className="w-6 h-6" />
            <span className="text-xs mt-1 font-normal">
              Programs
            </span>
          </button>
          <button
            onClick={() => setCurrentTab("events")}
            className={`flex flex-col items-center py-3 px-6 transition-colors ${
              currentTab === "events"
                ? "text-white"
                : "text-white/60"
            }`}
          >
            <Calendar className="w-6 h-6" />
            <span className="text-xs mt-1 font-normal">
              Events
            </span>
          </button>
          <button
            onClick={() => setCurrentTab("you")}
            className={`flex flex-col items-center py-3 px-6 transition-colors ${
              currentTab === "you"
                ? "text-white"
                : "text-white/60"
            }`}
          >
            <User className="w-6 h-6" />
            <span className="text-xs mt-1 font-normal">
              You
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}