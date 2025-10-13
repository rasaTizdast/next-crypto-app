"use client";

import Image from "next/image";
import Link from "next/link";

import StaticChart from "./StaticChart";

interface Props {
  item: any;
}

const CoinsTableRow = ({ item }: Props) => {
  const symbol = (item.symbol ?? "").toString();
  const price = Number(item.price_usd ?? item.price ?? 0);
  const change24 = Number(item.change_24h_percent);
  const marketCap = Number(item.market_cap_usd ?? item.market_cap ?? 0);
  const name = item.name ?? symbol;
  const image = item.logo_url;
  // Determine trend based on 24h change
  const isUp = change24 >= 0;

  return (
    <tr className="cursor-pointer hover:bg-gray-700">
      <td className="whitespace-nowrap">
        <Link
          prefetch
          href={`/coins/${symbol.toLowerCase()}`}
          className="flex items-center gap-x-3 px-8 py-3"
        >
          <Image
            width={40}
            height={40}
            quality={75}
            alt={name}
            src={image || "/placeholder-coin.svg"}
            className="h-10 w-10 rounded-full"
            unoptimized={true}
            onError={(e) => {
              e.currentTarget.src = "/placeholder-coin.svg";
            }}
          />
          <div>
            <span className="block text-sm font-medium text-gray-100">{name}</span>
            <span className="block text-xs text-gray-400">{symbol}</span>
          </div>
        </Link>
      </td>
      <td className="whitespace-nowrap">
        <Link prefetch href={`/coins/${symbol.toLowerCase()}`} className="block px-8 py-4">
          {price.toLocaleString("en-US", { style: "currency", currency: "USD" })}
        </Link>
      </td>
      <td className={`whitespace-nowrap ${change24 > 0 ? "text-green-400" : "text-red-400"}`}>
        <Link prefetch href={`/coins/${symbol.toLowerCase()}`} className="block px-8 py-4">
          {`${change24} %`}
        </Link>
      </td>
      <td className="whitespace-nowrap">
        <Link prefetch href={`/coins/${symbol.toLowerCase()}`} className="block px-8 py-4">
          {marketCap.toLocaleString("en-US", { style: "currency", currency: "USD" })}
        </Link>
      </td>
      <td className="whitespace-nowrap">
        <Link prefetch href={`/coins/${symbol.toLowerCase()}`} className="block px-8 py-4">
          <StaticChart isUp={isUp} />
        </Link>
      </td>
    </tr>
  );
};

export default CoinsTableRow;
