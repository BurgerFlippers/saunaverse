"use client";
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
import type { SaunaMeasurement } from "@/../generated/prisma/client";
import { memo } from "react";

interface SessionChartProps {
  measurements: SaunaMeasurement[];
}

export function SessionChart({ measurements }: SessionChartProps) {
  // Calculate max temperature for dynamic Y-axis
  const smoothData = (data: SaunaMeasurement[], windowMinutes: number) => {
    if (!data || data.length === 0) {
      return [];
    }

    return data.map((current, index) => {
      const windowStartTime =
        new Date(current.timestamp).getTime() - windowMinutes * 60 * 1000;
      const windowData = data.slice(0, index + 1).filter((d) => {
        return new Date(d.timestamp).getTime() >= windowStartTime;
      });

      const sumTemp = windowData.reduce((acc, val) => acc + val.temperature, 0);
      const sumHumidity = windowData.reduce(
        (acc, val) => acc + val.humidity,
        0,
      );
      const sumPrecence = windowData.reduce(
        (acc, val) => acc + val.precence,
        0,
      );

      return {
        ...current,
        temperature: sumTemp / windowData.length,
        humidity: sumHumidity / windowData.length,
        precence: sumPrecence / windowData.length,
      };
    });
  };

  const smoothedMeasurements = smoothData(measurements, 5);

  const maxTemp = Math.max(...smoothedMeasurements.map((d) => d.temperature));
  const yAxisDomain = maxTemp > 100 ? [0, 119] : [0, 100];

  const chartData = smoothedMeasurements.map((m) => ({
    time: new Date(m.timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
    temperature: m.temperature,
    humidity: m.humidity,
    inSauna: m.precence > 10 ? 0 : null,
  }));

  return (
    <div className="scrollbar-hide mt-0 overflow-x-auto">
      <div className="flex gap-3 pb-0">
        {/* Chart */}
        <div className="w-full flex-shrink-0">
          <ResponsiveContainer width="100%" height={240}>
            <LineChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
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
                tick={{ fontSize: 11, fill: "#BFC5CA" }}
                stroke="transparent"
                domain={yAxisDomain}
                ticks={[0, 20, 40, 60, 80, 100]}
                width={35}
              />

              {/* Hidden Y-axis for in-sauna indicator (at bottom) */}
              <YAxis yAxisId="inSauna" domain={[0, 1]} hide={true} />

              {/* X-axis */}
              <XAxis
                dataKey="time"
                tick={{ fontSize: 11, fill: "#BFC5CA" }}
                stroke="transparent"
                tickLine={false}
              />

              <Tooltip
                contentStyle={{
                  background: "#1F1F23",
                  border: "1px solid #2C2B36",
                  borderRadius: "8px",
                  fontSize: "12px",
                  color: "#F5E6D0",
                }}
                formatter={(value: number, name: string) => {
                  if (name === "inSauna") return null;
                  return [
                    `${value.toFixed(2)}${name === "temperature" ? "°" : "%"}`,
                    name === "temperature" ? "Temperature" : "Humidity",
                  ];
                }}
              />

              <Legend
                wrapperStyle={{ fontSize: "12px", color: "#BFC5CA" }}
                formatter={(value, entry) => {
                  // Only show temperature and humidity, skip 'inSauna'
                  if (value === "temperature") return "Temp (°C)";
                  if (value === "humidity") return "Humidity (%)";
                  return "In sauna";
                }}
              />

              {/* In-Sauna indicator line */}
              <Line
                type="stepAfter"
                dataKey="inSauna"
                stroke="#a7544bff"
                legendType="plainline"
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
        </div>
      </div>
    </div>
  );
}

export const MemoizedSessionChart = memo(SessionChart);
