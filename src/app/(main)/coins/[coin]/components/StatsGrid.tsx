"use client";

import { CoinDetails } from "@/app/services/types";

interface StatsGridProps {
  coin: CoinDetails;
}

interface StatItemProps {
  label: string;
  value: string | number;
  subValue?: string;
  isPrice?: boolean;
  isPercentage?: boolean;
  isPositive?: boolean;
}

const StatItem = ({ label, value, subValue, isPrice, isPercentage }: StatItemProps) => {
  const formatValue = () => {
    if (typeof value === "number") {
      if (isPrice) {
        return value.toLocaleString("en-US", {
          style: "currency",
          currency: "USD",
          minimumFractionDigits: 0,
          maximumFractionDigits: value < 1 ? 6 : 0,
        });
      }
      if (isPercentage) {
        return `${value.toFixed(2)}%`;
      }
      return value.toLocaleString("en-US");
    }
    return value || "N/A";
  };

  return (
    <div className="rounded-lg border border-gray-600 bg-gray-700 p-4">
      <div className="mb-1 text-sm text-gray-400">{label}</div>
      <div
        className={`text-lg font-semibold ${
          isPercentage && typeof value === "number"
            ? value >= 0
              ? "text-green-400"
              : "text-red-400"
            : "text-white"
        }`}
      >
        {formatValue()}
      </div>
      {subValue && <div className="mt-1 text-xs text-gray-500">{subValue}</div>}
    </div>
  );
};

const StatsGrid = ({ coin }: StatsGridProps) => {
  const marketCap = Number(coin.market_cap_usd || 0);
  const volume24h = Number(coin.volume_24h_usd || 0);
  const circulatingSupply = Number(coin.circulating_supply || 0);
  const totalSupply = Number(coin.total_supply || 0);
  const maxSupply = coin.max_supply ? Number(coin.max_supply) : null;
  const ath = Number(coin.ath || 0);
  const atl = Number(coin.atl || 0);
  const currentPrice = Number(coin.price_usd || 0);

  // Calculate percentages from ATH/ATL
  const athChangePercent = ath > 0 ? ((currentPrice - ath) / ath) * 100 : 0;
  const atlChangePercent = atl > 0 ? ((currentPrice - atl) / atl) * 100 : 0;

  const stats = [
    {
      label: "ارزش بازار",
      value: marketCap,
      isPrice: true,
      subValue: coin.market_cap_rank ? `رتبه #${coin.market_cap_rank}` : undefined,
    },
    {
      label: "حجم معاملات 24 ساعته",
      value: volume24h,
      isPrice: true,
    },
    {
      label: "عرضه در گردش",
      value: circulatingSupply,
      subValue: `${coin.symbol}`,
    },
    {
      label: "عرضه کل",
      value: totalSupply,
      subValue: `${coin.symbol}`,
    },
    {
      label: "حداکثر عرضه",
      value: maxSupply || "نامحدود",
      subValue: maxSupply ? `${coin.symbol}` : undefined,
    },
    {
      label: "بالاترین قیمت تاریخی",
      value: ath,
      isPrice: true,
      subValue: `${athChangePercent.toFixed(2)}% از ATH`,
    },
    {
      label: "پایین‌ترین قیمت تاریخی",
      value: atl,
      isPrice: true,
      subValue: `${atlChangePercent.toFixed(0)}% از ATL`,
    },
    {
      label: "تغییرات 24 ساعته",
      value: coin.change_24h_percent,
      isPercentage: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {stats.map((stat, index) => (
        <StatItem
          key={index}
          label={stat.label}
          value={stat.value}
          subValue={stat.subValue}
          isPrice={stat.isPrice}
          isPercentage={stat.isPercentage}
        />
      ))}
    </div>
  );
};

export default StatsGrid;
