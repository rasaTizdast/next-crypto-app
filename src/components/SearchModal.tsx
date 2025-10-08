"use client";

import { MagnifyingGlassIcon } from "@heroicons/react/16/solid";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";

import { useCoinSearch } from "@/hooks/useCrypto";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SearchModal = ({ isOpen, onClose }: SearchModalProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Close modal on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, onClose]);

  const { data: searchResults, isLoading, error } = useCoinSearch(debouncedQuery);

  const handleResultClick = () => {
    onClose();
    setSearchQuery("");
    setDebouncedQuery("");
  };

  const handleChange = (value: string) => {
    // Allow only English letters, numbers and remove others; uppercase for symbols
    const cleaned = value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    setSearchQuery(cleaned);
  };

  const handleEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchQuery.trim().length > 0) {
      // Navigate directly to the coin page using the entered symbol
      window.location.href = `/coins/${searchQuery.trim().toLowerCase()}`;
      handleResultClick();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20">
      {/* Blur background */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Search box */}
      <div className="relative z-10 w-11/12 max-w-2xl rounded-lg border border-gray-700 bg-gray-900 p-4 text-white shadow-lg">
        {/* Search input */}
        <div className="relative">
          <MagnifyingGlassIcon className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            placeholder="نماد انگلیسی ارز را وارد کنید (مثال: BTC)"
            value={searchQuery}
            onChange={(e) => handleChange(e.target.value)}
            onKeyDown={handleEnter}
            className="w-full rounded-md bg-gray-800 py-3 pr-4 pl-10 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none sm:text-base"
          />
        </div>
        <p className="mt-2 text-right text-xs text-gray-400">
          ورود فقط با حروف انگلیسی؛ نماد ارز را بنویسید و اینتر بزنید
        </p>

        {/* Search results */}
        <div className="no-scrollbar mt-4 max-h-96 overflow-y-auto">
          {searchQuery.trim() === "" ? (
            <div className="py-8 text-center text-gray-400">
              <MagnifyingGlassIcon className="mx-auto mb-4 h-12 w-12 opacity-50" />
              <p>برای جستجو، نماد انگلیسی ارز را تایپ کنید</p>
            </div>
          ) : isLoading ? (
            <div className="py-8 text-center text-gray-400">
              <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-blue-500"></div>
              <p>در حال جستجو...</p>
            </div>
          ) : error ? (
            <div className="py-8 text-center text-red-400">
              <p>خطا در جستجوی ارز دیجیتال</p>
            </div>
          ) : searchResults?.data?.results?.length === 0 ? (
            <div className="py-8 text-center text-gray-400">
              <p>هیچ ارزی برای «{searchQuery}» یافت نشد</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {searchResults?.data?.results?.map((coin: any) => (
                <SearchResultItem key={coin.symbol} coin={coin} onClick={handleResultClick} />
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

interface SearchResultItemProps {
  coin: any;
  onClick: () => void;
}

const SearchResultItem = ({ coin, onClick }: SearchResultItemProps) => {
  const symbol = (coin.symbol ?? "").toString();
  const name = coin.name ?? symbol;
  const price = Number(coin.price_usd ?? coin.price ?? 0);
  const change24 = Number(coin.change_24h_percent ?? 0);
  const image = coin.logo_url;
  const isUp = change24 >= 0;

  return (
    <li>
      <Link
        href={`/coins/${symbol.toLowerCase()}`}
        onClick={onClick}
        className="flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-gray-800"
      >
        <Image
          width={40}
          height={40}
          quality={100}
          alt={name}
          src={image}
          className="h-10 w-10 rounded-full"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="truncate text-sm font-medium text-gray-100">{name}</p>
              <p className="text-xs text-gray-400">{symbol}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-100">
                {price.toLocaleString("en-US", { style: "currency", currency: "USD" })}
              </p>
              <p className={`text-xs ${isUp ? "text-green-400" : "text-red-400"}`}>
                {isUp ? "+" : ""}
                {change24.toFixed(2)}%
              </p>
            </div>
          </div>
        </div>
      </Link>
    </li>
  );
};

export default SearchModal;
