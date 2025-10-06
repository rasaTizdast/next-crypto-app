"use client";

import { ArrowRight, TrendingUp, TrendingDown, BarChart3, DollarSign } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { use, useEffect, useState } from "react";

import { useAuthCheck } from "@/app/services/authUtils";
import { CoinDetails } from "@/app/services/types";
import LoginRequired from "@/components/LoginRequired";
import { useCoinDetails, useCoinHistory } from "@/hooks/useCrypto";

import LoadingSkeleton from "./components/LoadingSkeleton";
import PriceChart from "./components/PriceChart";
import StatsGrid from "./components/StatsGrid";

interface CoinPageProps {
  params: Promise<{
    coin: string;
  }>;
}

const CoinPage = ({ params }: CoinPageProps) => {
  const { coin: coinParam } = use(params);
  const symbol = coinParam.toUpperCase();

  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const { checkAuth } = useAuthCheck();

  useEffect(() => {
    const checkAuthStatus = async () => {
      const isAuth = await checkAuth();
      setIsAuthenticated(isAuth);
    };

    checkAuthStatus();
  }, [checkAuth]);

  const { data: coinData, isLoading: coinLoading, error: coinError } = useCoinDetails(symbol);
  const { data: historyData, isLoading: historyLoading } = useCoinHistory(symbol, "7d", 30);

  // Show loading state while checking authentication
  if (isAuthenticated === null) {
    return <LoadingSkeleton />;
  }

  // Show login required message if not authenticated
  if (!isAuthenticated) {
    return (
      <LoginRequired
        title={`دسترسی به اطلاعات ${symbol}`}
        message="برای مشاهده اطلاعات تفصیلی این ارز دیجیتال، نمودارهای قیمت و آمار بازار، لطفاً وارد حساب کاربری خود شوید."
        showBackButton={true}
        backHref="/coins"
        backText="بازگشت به لیست ارزها"
      />
    );
  }

  // Show loading skeleton while data is being fetched
  if (coinLoading) {
    return <LoadingSkeleton />;
  }

  // Show 404 if coin not found
  if (coinError || !coinData?.data?.results?.length) {
    notFound();
  }

  const coin: CoinDetails = coinData.data.results[0];
  // Be resilient to different API shapes
  const historyPoints = (() => {
    const hd: any = historyData;
    if (!hd) return [] as any[];
    if (Array.isArray(hd?.data?.results)) return hd.data.results[0]?.points || [];
    if (Array.isArray(hd?.results)) return hd.results[0]?.points || [];
    if (Array.isArray(hd?.data)) return hd.data[0]?.points || [];
    if (Array.isArray(hd?.data?.points)) return hd.data.points || [];
    if (Array.isArray(hd?.points)) return hd.points || [];
    return [] as any[];
  })();

  // Process history data for chart
  const chartData = historyPoints
    .map(([timestamp, price]: [string, number]) => ({
      timestamp: new Date(timestamp).getTime(),
      price: Number(price),
    }))
    // Ensure chronological order in case backend returns unsorted
    .sort((a: { timestamp: number }, b: { timestamp: number }) => a.timestamp - b.timestamp);

  const price = Number(coin.price_usd);
  const change24h = Number(coin.change_24h_percent);
  const isPositive = change24h >= 0;

  return (
    <div className="relative mx-auto mt-19 flex w-full max-w-11/12 flex-col gap-6 py-10 pt-5 sm:max-w-10/12 sm:pt-10">
      {/* Back Button */}
      <Link
        href="/coins"
        className="flex w-fit items-center gap-2 text-gray-400 transition-colors hover:text-white"
      >
        <ArrowRight className="h-4 w-4" />
        <span>بازگشت به لیست ارزها</span>
      </Link>

      {/* Coin Header */}
      <div className="rounded-lg border border-gray-700 bg-gray-800 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Image
              src={coin.logo_url}
              alt={coin.name}
              width={64}
              height={64}
              className="h-16 w-16 rounded-full"
            />
            <div>
              <h1 className="text-2xl font-bold text-white">{coin.name}</h1>
              <p className="text-lg text-gray-400">{coin.symbol}</p>
            </div>
          </div>

          <div className="text-right">
            <div className="text-3xl font-bold text-white">
              {price.toLocaleString("en-US", { style: "currency", currency: "USD" })}
            </div>
            <div
              className={`flex items-center gap-1 text-lg ${isPositive ? "text-green-400" : "text-red-400"}`}
            >
              {isPositive ? (
                <TrendingUp className="h-5 w-5" />
              ) : (
                <TrendingDown className="h-5 w-5" />
              )}
              <span>{change24h.toFixed(2)}%</span>
              <span className="text-sm text-gray-400">24h</span>
            </div>
          </div>
        </div>
      </div>

      {/* Price Chart */}
      <div className="rounded-lg border border-gray-700 bg-gray-800 p-6">
        <div className="mb-4 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-blue-400" />
          <h2 className="text-xl font-semibold text-white">نمودار قیمت</h2>
        </div>

        {historyLoading ? (
          <div className="h-80 animate-pulse rounded bg-gray-700" />
        ) : (
          <PriceChart data={chartData} isPositive={isPositive} />
        )}
      </div>

      {/* Stats Grid */}
      <div className="rounded-lg border border-gray-700 bg-gray-800 p-6">
        <div className="mb-4 flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-green-400" />
          <h2 className="text-xl font-semibold text-white">آمار بازار</h2>
        </div>

        <StatsGrid coin={coin} />
      </div>
    </div>
  );
};

export default CoinPage;
