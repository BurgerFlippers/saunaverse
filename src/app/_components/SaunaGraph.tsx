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

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

interface SaunaMeasurement {
  id: string;
  saunaSessionId: string;
  timestamp: Date;
  temperature: number;
  humidity: number;
}

interface SaunaGraphProps {
  measurements: SaunaMeasurement[];
}

export const SaunaGraph: React.FC<SaunaGraphProps> = ({ measurements }) => {
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
  };

  return (
    <div className="h-[400px] w-full">
      <Line options={options} data={data} />
    </div>
  );
};
