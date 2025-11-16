"use client";

import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import annotationPlugin from "chartjs-plugin-annotation";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  annotationPlugin,
);

interface SaunaMeasurement {
  id: string;
  saunaId: string;
  timestamp: Date;
  temperature: number;
  humidity: number;
  precence: number;
}

interface SaunaSession {
  id: string;
  startTimestamp: Date;
  endTimestamp: Date | null;
}

interface SaunaGraphProps {
  measurements: SaunaMeasurement[];
  sessions?: SaunaSession[];
}

export const SaunaGraph: React.FC<SaunaGraphProps> = ({
  measurements,
  sessions,
}) => {
  if (!measurements || measurements.length === 0) {
    return (
      <p className="text-white/70">
        No measurement data available for this session.
      </p>
    );
  }

  // Prepare data for Chart.js
  const labels = measurements.map((m) =>
    new Date(m.timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
  );
  const temperatures = measurements.map((m) => m.temperature);
  const humidities = measurements.map((m) => m.humidity);
  const presences = measurements.map((m) => m.precence);

  const data = {
    labels,
    datasets: [
      {
        label: "Temperature (°C)",
        data: temperatures,
        borderColor: "rgb(255, 99, 132)",
        backgroundColor: "rgba(255, 99, 132, 0.5)",
        yAxisID: "yTemp",
        tension: 0.4,
      },
      {
        label: "Humidity (%)",
        data: humidities,
        borderColor: "rgb(53, 162, 235)",
        backgroundColor: "rgba(53, 162, 235, 0.5)",
        yAxisID: "yHum",
        tension: 0.4,
      },
      {
        label: "Presence",
        data: presences,
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.5)",
        yAxisID: "yPresence",
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          color: "white",
        },
      },
      title: {
        display: true,
        text: "Temperature and Humidity Over Time",
        color: "white",
      },
      annotation: {
        annotations:
          sessions?.map((session) => {
            const startIndex = measurements.findIndex(
              (m) => m.timestamp >= session.startTimestamp,
            );
            const endIndex = measurements.findIndex(
              (m) => m.timestamp >= (session.endTimestamp ?? new Date()),
            );

            return {
              type: "box" as const,
              xMin: startIndex,
              xMax: endIndex === -1 ? measurements.length - 1 : endIndex,
              backgroundColor: "rgba(255, 99, 132, 0.25)",
              borderColor: "rgba(255, 99, 132, 1)",
              borderWidth: 1,
            };
          }) ?? [],
      },
    },
    scales: {
      x: {
        ticks: {
          color: "white",
        },
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
      },
      yTemp: {
        type: "linear" as const,
        position: "left" as const,
        title: {
          display: true,
          text: "Temperature (°C)",
          color: "rgb(255, 99, 132)",
        },
        ticks: {
          color: "rgb(255, 99, 132)",
        },
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
      },
      yHum: {
        type: "linear" as const,
        position: "right" as const,
        title: {
          display: true,
          text: "Humidity (%)",
          color: "rgb(53, 162, 235)",
        },
        ticks: {
          color: "rgb(53, 162, 235)",
        },
        grid: {
          drawOnChartArea: false, // Only draw grid lines for the left axis
        },
        min: 0,
        max: 100,
      },
    },
    yPresence: {
      type: "linear" as const,
      position: "right" as const,
      title: {
        display: true,
        text: "Presence",
        color: "rgb(75, 192, 192)",
      },
      ticks: {
        color: "rgb(75, 192, 192)",
      },
      grid: {
        drawOnChartArea: false,
      },
      min: 0,
    },
  };

  return (
    <div className="h-[400px] w-full">
      <Line options={options} data={data} />
    </div>
  );
};
