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
} from "recharts";
import type {
  SaunaMeasurement,
  UserBiometrics,
} from "@/../generated/prisma/client";
import { memo, useMemo } from "react";
import { api } from "@/trpc/react";
import { smoothData } from "./ui/utils";

interface SessionChartProps {
  measurements?: {
    measurements?: SaunaMeasurement[];
    biometrics?: Pick<UserBiometrics, "heartRate" | "timestamp">[];
  };
  sessionId?: string;
  postId?: number;
}

const CHART_MARGIN = { top: 10, right: 10, left: 10, bottom: 10 };
const AXIS_DOMAIN = [0, 100];
const AXIS_TICKS = [0, 20, 40, 60, 80, 100, 120, 140, 160];
const TICK_STYLE = { fontSize: 11, fill: "#BFC5CA" };
const TOOLTIP_STYLE = {
  background: "#1F1F23",
  border: "1px solid #2C2B36",
  borderRadius: "8px",
  fontSize: "12px",
  color: "#F5E6D0",
};
const LEGEND_STYLE = { fontSize: "12px", color: "#BFC5CA" };

const formatTooltip = (value: number, name: string) => {
  if (name === "inSauna") return null;
  if (name === "heartRate") return [`${value} bpm`, "Heart Rate"];
  return [
    `${value.toFixed(2)}${name === "temperature" ? "°" : "%"}`,
    name === "temperature" ? "Temperature" : "Humidity",
  ];
};

const formatLegend = (value: any) => {
  if (value === "temperature") return "Temp (°C)";
  if (value === "humidity") return "Humidity (%)";
  if (value === "heartRate") return "Heart Rate (bpm)";
  return "In sauna";
};

export const SessionChart = memo(function SessionChart({
  measurements: initialMeasurements,
  sessionId,
  postId,
}: SessionChartProps) {
  console.log("rendering sess start", sessionId);
  const { data: fetchedData, isLoading } =
    api.sauna.getSaunaSessionMeasurements.useQuery(
      {
        saunaSessionId: sessionId ?? "",
        postId,
      },
      {
        enabled: !initialMeasurements && !!sessionId,
        staleTime: Infinity, // Keep data fresh essentially forever for history
      },
    );

  const measurements = initialMeasurements ?? fetchedData ?? {};

  const yAxisDomain = [0, 160];

  // Calculate max temperature for dynamic Y-axis
  const { chartData } = useMemo(() => {
    const smoothedMeasurements = smoothData(
      measurements?.measurements ?? [],
      5,
    );
    const biometricsData = measurements?.biometrics ?? [];

    if (smoothedMeasurements.length === 0 && biometricsData.length === 0) {
      return { chartData: [], yAxisDomain: [0, 100] };
    }

    const mTimes = smoothedMeasurements.map((m) =>
      new Date(m.timestamp).getTime(),
    );
    const bTimes = biometricsData.map((b) => new Date(b.timestamp).getTime());
    const allTimes = [...mTimes, ...bTimes];
    const minTime = Math.min(...allTimes);
    const maxTime = Math.max(...allTimes);

    const startMinute = Math.floor(minTime / 60000) * 60000;
    const endMinute = Math.ceil(maxTime / 60000) * 60000;

    // Bucket data by minute
    const measurementsByMinute = new Map();
    smoothedMeasurements.forEach((m) => {
      const min = Math.floor(new Date(m.timestamp).getTime() / 60000) * 60000;
      // We overwrite if multiple fall in same minute, effectively taking the last one
      // Since data is smoothed, this is acceptable for minute-resolution graph
      measurementsByMinute.set(min, m);
    });

    const biometricsByMinute = new Map();
    biometricsData.forEach((b) => {
      const min = Math.floor(new Date(b.timestamp).getTime() / 60000) * 60000;
      biometricsByMinute.set(min, b);
    });

    const chartData = [];
    for (let t = startMinute; t <= endMinute; t += 60000) {
      const measurement = measurementsByMinute.get(t);
      const biometric = biometricsByMinute.get(t);

      chartData.push({
        time: new Date(t).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        temperature: measurement?.temperature ?? null,
        humidity: measurement?.humidity ?? null,
        inSauna: (measurement?.precence ?? 0) > 20 ? 0 : null,
        heartRate: biometric?.heartRate ?? null,
      });
    }

    // Interpolate missing values to ensure tooltip shows values everywhere
    const interpolate = (data: any[], key: string) => {
      let lastValidIndex = -1;
      for (let i = 0; i < data.length; i++) {
        if (data[i][key] !== null && data[i][key] !== undefined) {
          if (lastValidIndex !== -1 && i > lastValidIndex + 1) {
            // Fill gaps
            const startVal = data[lastValidIndex][key];
            const endVal = data[i][key];
            const steps = i - lastValidIndex;
            const stepVal = (endVal - startVal) / steps;
            for (let j = 1; j < steps; j++) {
              data[lastValidIndex + j][key] = startVal + stepVal * j;
              if (key === "heartRate") {
                data[lastValidIndex + j][key] = Math.round(
                  data[lastValidIndex + j][key],
                );
              }
            }
          }
          lastValidIndex = i;
        }
      }
    };

    interpolate(chartData, "temperature");
    interpolate(chartData, "humidity");
    interpolate(chartData, "heartRate");

    return { chartData, yAxisDomain };
  }, [measurements]);

  console.log(chartData);

  if (isLoading && !initialMeasurements) {
    return (
      <div className="flex h-[240px] w-full items-center justify-center text-gray-500">
        Loading chart data...
      </div>
    );
  }

  if (chartData.length === 0) {
    return null;
  }

  console.log("rendering sessionchart with data", sessionId);

  return (
    <div className="scrollbar-hide mt-0 overflow-x-auto">
      <div className="flex gap-3 pb-0">
        {/* Chart */}
        <div className="w-full flex-shrink-0">
          <LineChart
            data={chartData}
            margin={CHART_MARGIN}
            responsive
            style={{ width: "100%", height: "240px" }}
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
              domain={AXIS_DOMAIN}
              hide={true}
            />

            {/* Temperature Y-axis (right) - visible */}
            <YAxis
              yAxisId="temp"
              orientation="right"
              tick={TICK_STYLE}
              stroke="transparent"
              domain={yAxisDomain}
              ticks={AXIS_TICKS}
              width={35}
            />

            {/* Hidden Y-axis for in-sauna indicator (at bottom) */}
            <YAxis yAxisId="inSauna" domain={[0, 1]} hide={true} />

            {/* X-axis */}
            <XAxis
              dataKey="time"
              tick={TICK_STYLE}
              stroke="transparent"
              tickLine={false}
            />

            <Tooltip contentStyle={TOOLTIP_STYLE} formatter={formatTooltip} />

            <Legend wrapperStyle={LEGEND_STYLE} formatter={formatLegend} />
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
              connectNulls
            />

            <Line
              yAxisId="temp"
              type="monotone"
              dataKey="temperature"
              stroke="#D01400"
              strokeWidth={3}
              dot={false}
              name="temperature"
              connectNulls
            />
            <Line
              yAxisId="temp"
              type="monotone"
              dataKey="humidity"
              stroke="#BFC5CA"
              strokeWidth={3}
              dot={false}
              name="humidity"
              connectNulls
            />
            <Line
              yAxisId="temp"
              type="monotone"
              dataKey="heartRate"
              stroke="#E11D48" // Rose-600
              strokeWidth={2}
              dot={false}
              name="heartRate"
              connectNulls
              // Polar data might be sparse
            />
          </LineChart>
        </div>
      </div>
    </div>
  );
});
