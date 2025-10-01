"use client";

import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Filler);

const SparklineChart = ({ values, isUp }: { values: number[]; isUp: boolean }) => {
  const lineColor = isUp ? "#22c55e" : "#ef4444";
  const bgColor = isUp ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)";
  const labels = values.map((_, i) => String(i));

  const data = {
    labels,
    datasets: [
      {
        data: values,
        borderColor: lineColor,
        backgroundColor: bgColor,
        borderWidth: 1.5,
        pointRadius: 0,
        tension: 0.3,
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { enabled: false } },
    scales: {
      x: { display: false, grid: { display: false }, ticks: { display: false } },
      y: { display: false, grid: { display: false }, ticks: { display: false } },
    },
    elements: {
      line: { borderJoinStyle: "round" },
    },
  } as const;

  return <Line data={data} options={options} />;
};

export default SparklineChart;
