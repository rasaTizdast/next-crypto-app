"use client";

import { ArrowRight, BarChart3, DollarSign } from "lucide-react";

const LoadingSkeleton = () => {
  return (
    <div className="relative mx-auto mt-19 flex w-full max-w-11/12 flex-col gap-6 py-10 pt-5 sm:max-w-10/12 sm:pt-10">
      {/* Back Button Skeleton */}
      <div className="flex w-fit items-center gap-2">
        <ArrowRight className="h-4 w-4 text-gray-600" />
        <div className="h-4 w-32 animate-pulse rounded bg-gray-700" />
      </div>

      {/* Coin Header Skeleton */}
      <div className="rounded-lg border border-gray-700 bg-gray-800 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 animate-pulse rounded-full bg-gray-700" />
            <div className="space-y-2">
              <div className="h-6 w-32 animate-pulse rounded bg-gray-700" />
              <div className="h-4 w-16 animate-pulse rounded bg-gray-700" />
            </div>
          </div>

          <div className="space-y-2 text-right">
            <div className="h-8 w-40 animate-pulse rounded bg-gray-700" />
            <div className="ml-auto h-6 w-24 animate-pulse rounded bg-gray-700" />
          </div>
        </div>
      </div>

      {/* Price Chart Skeleton */}
      <div className="rounded-lg border border-gray-700 bg-gray-800 p-6">
        <div className="mb-4 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-blue-400" />
          <div className="h-6 w-24 animate-pulse rounded bg-gray-700" />
        </div>

        <div className="h-80 animate-pulse rounded bg-gray-700" />
      </div>

      {/* Stats Grid Skeleton */}
      <div className="rounded-lg border border-gray-700 bg-gray-800 p-6">
        <div className="mb-4 flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-green-400" />
          <div className="h-6 w-24 animate-pulse rounded bg-gray-700" />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="rounded-lg border border-gray-600 bg-gray-700 p-4">
              <div className="mb-2 h-4 w-20 animate-pulse rounded bg-gray-600" />
              <div className="mb-1 h-6 w-24 animate-pulse rounded bg-gray-600" />
              <div className="h-3 w-16 animate-pulse rounded bg-gray-600" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LoadingSkeleton;
