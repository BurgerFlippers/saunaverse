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
import type { SaunaMeasurement } from "@/../generated/prisma/client";
import { memo, useMemo } from "react";
import { api } from "@/trpc/react";

interface SessionChartProps {
  measurements?: SaunaMeasurement[];
  sessionId?: string;
}

const CHART_MARGIN = { top: 10, right: 10, left: 10, bottom: 10 };
const AXIS_DOMAIN = [0, 100];
const AXIS_TICKS = [0, 20, 40, 60, 80, 100];
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
  return [
    `${value.toFixed(2)}${name === "temperature" ? "°" : "%"}`,
    name === "temperature" ? "Temperature" : "Humidity",
  ];
};

const formatLegend = (value: any) => {
  if (value === "temperature") return "Temp (°C)";
  if (value === "humidity") return "Humidity (%)";
  return "In sauna";
};

const EMPTY_ARRAY = [] as const;

export const SessionChart = memo(function SessionChart({
  measurements: initialMeasurements,
  sessionId,
}: SessionChartProps) {
  console.log("rendering sess start", sessionId);
  const { data: fetchedMeasurements, isLoading } =
    api.sauna.getSaunaSessionMeasurements.useQuery(
      {
        saunaSessionId: sessionId ?? "",
      },
      {
        enabled: !initialMeasurements && !!sessionId,
        staleTime: Infinity, // Keep data fresh essentially forever for history
      },
    );

  const measurements =
    initialMeasurements ?? fetchedMeasurements ?? (EMPTY_ARRAY as any);

  // Calculate max temperature for dynamic Y-axis
  const { chartData, yAxisDomain } = useMemo(() => {
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

        const sumTemp = windowData.reduce(
          (acc, val) => acc + val.temperature,
          0,
        );
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

    const maxTemp =
      smoothedMeasurements.length > 0
        ? Math.max(...smoothedMeasurements.map((d) => d.temperature))
        : 100;
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

    return { chartData, yAxisDomain };
  }, [measurements]);

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
        </div>
      </div>
    </div>
  );
});
