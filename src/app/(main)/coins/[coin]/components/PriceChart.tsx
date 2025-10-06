"use client";

import { useMemo, useState, useCallback, useEffect, useRef } from "react";

interface ChartDataPoint {
  timestamp: number;
  price: number;
}

interface PriceChartProps {
  data: ChartDataPoint[];
  isPositive: boolean;
}

interface TooltipData {
  x: number;
  y: number;
  chartX?: number;
  chartY?: number;
  price: number;
  timestamp: number;
  visible: boolean;
}

const PriceChart = ({ data, isPositive }: PriceChartProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState<{ width: number; height: number }>({ width: 800, height: 300 });

  // Observe container size to keep SVG responsive without distortion
  useEffect(() => {
    if (!containerRef.current) return;
    const element = containerRef.current;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const width = Math.max(300, Math.floor(entry.contentRect.width));
      const height = Math.max(200, Math.floor(entry.contentRect.height));
      setSize({ width, height });
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  const [tooltip, setTooltip] = useState<TooltipData>({
    x: 0,
    y: 0,
    chartX: 0,
    chartY: 0,
    price: 0,
    timestamp: 0,
    visible: false,
  });

  // Normalize to chronological ascending order (oldest -> newest)
  const sortedData = useMemo(() => {
    if (!data || data.length === 0) return [] as ChartDataPoint[];
    // Defensive copy and numeric sort by timestamp
    const ordered = [...data].sort((a, b) => a.timestamp - b.timestamp);
    // If timestamps are equal or sort failed due to identical values, fallback by index order
    // and ensure newest ends up at the end (left-to-right oldest -> newest)
    if (ordered.length > 1 && ordered[0].timestamp > ordered[ordered.length - 1].timestamp) {
      ordered.reverse();
    }
    return ordered;
  }, [data]);

  const chartConfig = useMemo(() => {
    if (!sortedData.length) return null;

    const prices = sortedData.map((d) => d.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice;

    // Add padding to the chart
    const padding = priceRange * 0.1;
    const chartMin = minPrice - padding;
    const chartMax = maxPrice + padding;
    const chartRange = chartMax - chartMin;

    return {
      minPrice,
      maxPrice,
      chartMin,
      chartMax,
      chartRange,
      priceRange,
    };
  }, [sortedData]);

  const pathData = useMemo(() => {
    if (!sortedData.length || !chartConfig) return "";
    const { width, height } = size;

    const points = sortedData.map((point, index) => {
      const x = (index / (sortedData.length - 1)) * width;
      const y = height - ((point.price - chartConfig.chartMin) / chartConfig.chartRange) * height;
      return `${x},${y}`;
    });

    return `M ${points.join(" L ")}`;
  }, [sortedData, chartConfig, size]);

  const gradientId = `gradient-${isPositive ? "positive" : "negative"}`;

  // Handle mouse move for tooltip
  const handleMouseMove = useCallback(
    (event: React.MouseEvent<SVGSVGElement>) => {
      if (!sortedData.length || !chartConfig) return;

      const rect = event.currentTarget.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;

      // Convert mouse position to SVG coordinates
      const svgX = (mouseX / rect.width) * size.width;

      // Find the closest data point
      const dataIndex = Math.round((svgX / size.width) * (sortedData.length - 1));
      const clampedIndex = Math.max(0, Math.min(sortedData.length - 1, dataIndex));

      const dataPoint = sortedData[clampedIndex];
      if (dataPoint) {
        // Calculate exact chart coordinates for the data point
        const chartX = (clampedIndex / (sortedData.length - 1)) * size.width;
        const chartY =
          size.height -
          ((dataPoint.price - chartConfig.chartMin) / chartConfig.chartRange) * size.height;

        // Convert back to screen coordinates for tooltip positioning
        const screenX = (chartX / size.width) * rect.width;
        const screenY = (chartY / size.height) * rect.height;

        setTooltip({
          x: screenX,
          y: screenY,
          chartX: chartX, // Store SVG coordinates for indicator line
          chartY: chartY,
          price: dataPoint.price,
          timestamp: dataPoint.timestamp,
          visible: true,
        });
      }
    },
    [sortedData, chartConfig, size]
  );

  const handleMouseLeave = useCallback(() => {
    setTooltip((prev) => ({ ...prev, visible: false }));
  }, []);

  // Format date for display
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("fa-IR", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Format day for chart labels
  const formatDay = (timestamp: number) => {
    const date = new Date(timestamp);
    const today = new Date();
    const diffTime = today.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "امروز";
    if (diffDays === 1) return "دیروز";
    if (diffDays <= 7) return `${diffDays} روز پیش`;

    return date.toLocaleDateString("fa-IR", {
      weekday: "short",
      day: "numeric",
    });
  };

  // Format price for display
  const formatPrice = (price: number) => {
    return price.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: price < 1 ? 6 : 2,
      maximumFractionDigits: price < 1 ? 6 : 2,
    });
  };

  if (!sortedData.length) {
    return (
      <div className="flex h-80 items-center justify-center text-gray-400">
        <p>داده‌ای برای نمایش نمودار موجود نیست</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative h-80 w-full" dir="ltr">
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${size.width} ${size.height}`}
        className="cursor-crosshair overflow-visible"
        preserveAspectRatio="xMidYMid meet"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={isPositive ? "#10b981" : "#ef4444"} stopOpacity="0.3" />
            <stop offset="100%" stopColor={isPositive ? "#10b981" : "#ef4444"} stopOpacity="0.05" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        <defs>
          <pattern id="grid" width="80" height="60" patternUnits="userSpaceOnUse">
            <path
              d="M 80 0 L 0 0 0 60"
              fill="none"
              stroke="#374151"
              strokeWidth="0.5"
              opacity="0.3"
            />
          </pattern>
        </defs>
        <rect width={size.width} height={size.height} fill="url(#grid)" />

        {/* Area under the curve */}
        <path
          d={`${pathData} L ${size.width},${size.height} L 0,${size.height} Z`}
          fill={`url(#${gradientId})`}
        />

        {/* Price line */}
        <path
          d={pathData}
          fill="none"
          stroke={isPositive ? "#10b981" : "#ef4444"}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points */}
        {sortedData.map((point, index) => {
          const x = (index / (sortedData.length - 1)) * size.width;
          const y =
            size.height -
            ((point.price - chartConfig!.chartMin) / chartConfig!.chartRange) * size.height;

          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r="4"
              fill={isPositive ? "#10b981" : "#ef4444"}
              className="opacity-100"
              stroke="white"
              strokeWidth="2"
            />
          );
        })}

        {/* Tooltip indicator line */}
        {tooltip.visible && tooltip.chartX !== undefined && tooltip.chartY !== undefined && (
          <>
            <line
              x1={tooltip.chartX}
              y1="0"
              x2={tooltip.chartX}
              y2={size.height}
              stroke="#6b7280"
              strokeWidth="1"
              strokeDasharray="4,4"
              opacity="0.7"
            />
            <circle
              cx={tooltip.chartX}
              cy={tooltip.chartY}
              r="6"
              fill={isPositive ? "#10b981" : "#ef4444"}
              stroke="white"
              strokeWidth="2"
            />
          </>
        )}
      </svg>

      {/* Tooltip */}
      {tooltip.visible && (
        <div
          className="absolute z-10 rounded-lg border border-gray-600 bg-gray-800 p-3 shadow-lg"
          style={{
            left: tooltip.x + 10,
            top: tooltip.y - 10,
            transform: tooltip.x > 400 ? "translateX(-100%)" : "none",
          }}
        >
          <div className="text-sm font-semibold text-white">{formatPrice(tooltip.price)}</div>
          <div className="text-xs text-gray-400">{formatDate(tooltip.timestamp)}</div>
        </div>
      )}

      {/* Price labels */}
      <div className="mt-2 flex justify-between text-xs text-gray-400">
        <span>
          {chartConfig &&
            chartConfig.minPrice.toLocaleString("en-US", {
              style: "currency",
              currency: "USD",
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            })}
        </span>
        <span>
          {chartConfig &&
            chartConfig.maxPrice.toLocaleString("en-US", {
              style: "currency",
              currency: "USD",
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            })}
        </span>
      </div>

      {/* Time labels */}
      <div className="mt-1 flex justify-between text-xs text-gray-400" dir="ltr">
        {sortedData.length > 0 && (
          <>
            <span>{formatDay(sortedData[0].timestamp)}</span>
            {sortedData.length > 2 && (
              <span>{formatDay(sortedData[Math.floor(sortedData.length / 2)].timestamp)}</span>
            )}
            <span>{formatDay(sortedData[sortedData.length - 1].timestamp)}</span>
          </>
        )}
      </div>
    </div>
  );
};

export default PriceChart;
