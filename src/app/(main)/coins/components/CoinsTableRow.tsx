"use client";

import Image from "next/image";
import Link from "next/link";

import SparklineChart from "./SparklineChart";

interface Props {
  item: any;
  historyMap: Record<string, number[]>;
}

const CoinsTableRow = ({ item, historyMap }: Props) => {
  const symbol = (item.symbol ?? "").toString();
  const price = Number(item.price_usd ?? item.price ?? 0);
  const change24 = Number(
    item.price_change_percentage_24h ?? item.change_24h ?? item.percent_change_24h ?? 0
  );
  const marketCap = Number(item.market_cap_usd ?? item.market_cap ?? 0);
  const name = item.name ?? symbol;
  const image = item.logo_url;
  const hist = historyMap[String(symbol).toUpperCase()] ?? [];
  // Determine trend strictly from history when available; fall back to 24h change
  const isUp = hist.length >= 2 ? hist[hist.length - 1] >= hist[0] : change24 >= 0;

  return (
    <tr className="cursor-pointer hover:bg-gray-700">
      <td className="whitespace-nowrap">
        <Link
          prefetch
          href={`/crypto/${symbol.toLowerCase()}`}
          className="flex items-center gap-x-3 px-8 py-3"
        >
          <Image
            width={100}
            height={100}
            quality={100}
            alt={name}
            src={image}
            className="h-10 w-10 rounded-full"
          />
          <div>
            <span className="block text-sm font-medium text-gray-100">{name}</span>
            <span className="block text-xs text-gray-400">{symbol}</span>
          </div>
        </Link>
      </td>
      <td className="whitespace-nowrap">
        <Link prefetch href={`/crypto/${symbol.toLowerCase()}`} className="block px-8 py-4">
          {price.toLocaleString("en-US", { style: "currency", currency: "USD" })}
        </Link>
      </td>
      <td className={`whitespace-nowrap ${change24 > 0 ? "text-green-400" : "text-red-400"}`}>
        <Link prefetch href={`/crypto/${symbol.toLowerCase()}`} className="block px-8 py-4">
          {`${change24} %`}
        </Link>
      </td>
      <td className="whitespace-nowrap">
        <Link prefetch href={`/crypto/${symbol.toLowerCase()}`} className="block px-8 py-4">
          {marketCap.toLocaleString("en-US", { style: "currency", currency: "USD" })}
        </Link>
      </td>
      <td className="whitespace-nowrap">
        <Link prefetch href={`/crypto/${symbol.toLowerCase()}`} className="block px-8 py-4">
          <div className="h-10 w-28">
            {hist.length > 1 ? (
              <SparklineChart values={hist} isUp={isUp} />
            ) : (
              <div className="h-full w-full rounded bg-gray-500" />
            )}
          </div>
        </Link>
      </td>
    </tr>
  );
};

export default CoinsTableRow;
