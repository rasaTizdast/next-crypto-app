"use client";

import Image from "next/image";

interface StaticChartProps {
  isUp: boolean;
}

const StaticChart = ({ isUp }: StaticChartProps) => {
  const chartImage = isUp ? "/chart-up.svg" : "/chart-down.svg";

  return (
    <div className="flex h-10 w-28 items-center justify-center">
      <Image
        src={chartImage}
        alt={isUp ? "Price going up" : "Price going down"}
        width={100}
        height={40}
        className="h-full w-full object-contain"
      />
    </div>
  );
};

export default StaticChart;
