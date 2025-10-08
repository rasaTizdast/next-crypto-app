"use client";

import { useQuery, useQueries } from "@tanstack/react-query";

import {
  GetCryptoHistory7d,
  GetCryptoList,
  GetCoinDetails,
  GetCoinHistory,
  SearchCoins,
} from "@/app/services/crypto";

// Types for better type safety
interface CryptoListParams {
  page: number;
}

interface CryptoHistoryParams {
  symbols: string[];
}

// Query keys factory for better cache management
export const cryptoKeys = {
  all: ["crypto"] as const,
  lists: () => [...cryptoKeys.all, "list"] as const,
  list: (page: number) => [...cryptoKeys.lists(), page] as const,
  histories: () => [...cryptoKeys.all, "history"] as const,
  history: (symbols: string[]) => [...cryptoKeys.histories(), symbols.sort().join(",")] as const,
  details: () => [...cryptoKeys.all, "details"] as const,
  detail: (symbol: string) => [...cryptoKeys.details(), symbol.toUpperCase()] as const,
  coinHistory: (symbol: string, interval: string) =>
    [...cryptoKeys.histories(), symbol.toUpperCase(), interval] as const,
  search: () => [...cryptoKeys.all, "search"] as const,
  searchQuery: (query: string) => [...cryptoKeys.search(), query.toLowerCase().trim()] as const,
};

// Hook for fetching crypto list with pagination
export function useCryptoList({ page }: CryptoListParams) {
  return useQuery({
    queryKey: cryptoKeys.list(page),
    queryFn: async () => {
      const response = await GetCryptoList({ page });
      if (!response.success) {
        throw new Error(response.error || "Failed to fetch crypto list");
      }
      return response;
    },
    // Background refetch every 60 seconds (matching your current interval)
    refetchInterval: 60 * 1000,
    // Keep previous data while fetching new page to prevent loading states
    placeholderData: (previousData) => previousData,
    // Stale time shorter than refetch interval to ensure fresh data
    staleTime: 30 * 1000,
  });
}

// Hook for fetching crypto history for multiple symbols
export function useCryptoHistory({ symbols }: CryptoHistoryParams) {
  return useQuery({
    queryKey: cryptoKeys.history(symbols),
    queryFn: async () => {
      if (symbols.length === 0) return {};

      const response = await GetCryptoHistory7d(symbols);
      if (!response.success) {
        throw new Error(response.error || "Failed to fetch crypto history");
      }
      return response;
    },
    enabled: symbols.length > 0,
    // Cache history data longer since it changes less frequently
    staleTime: 2 * 60 * 1000, // 2 minutes
    // Don't refetch history as frequently
    refetchInterval: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook for fetching individual crypto histories (for streaming pattern)
export function useCryptoHistories(symbols: string[]) {
  return useQueries({
    queries: symbols.map((symbol) => ({
      queryKey: cryptoKeys.history([symbol]),
      queryFn: async () => {
        const response = await GetCryptoHistory7d([symbol]);
        if (!response.success) {
          // Return empty array instead of throwing to prevent one failed request from breaking others
          return { data: [], symbol };
        }

        const data = (response as any)?.data ?? [];
        const entries = Array.isArray(data) ? data : (data.results ?? []);
        const points = Array.isArray(entries?.[0]?.points) ? entries[0].points : [];

        // Ensure chronological order (oldest -> newest)
        const sortedPoints = [...points].sort(
          (a: any, b: any) => new Date(a?.[0] ?? 0).getTime() - new Date(b?.[0] ?? 0).getTime()
        );
        const values = sortedPoints.map((p: any) => Number(p?.[1] ?? 0));

        return { values, symbol };
      },
      // Cache individual histories longer
      staleTime: 2 * 60 * 1000, // 2 minutes
      refetchInterval: 5 * 60 * 1000, // 5 minutes
      // Don't retry individual history requests as aggressively
      retry: 1,
    })),
  });
}

// Hook for fetching single coin details
export function useCoinDetails(symbol: string) {
  return useQuery({
    queryKey: cryptoKeys.detail(symbol),
    queryFn: async () => {
      const response = await GetCoinDetails(symbol);
      if (!response.success) {
        throw new Error(response.error || "Failed to fetch coin details");
      }
      return response;
    },
    enabled: !!symbol,
    // Refetch every 30 seconds for real-time price updates
    refetchInterval: 30 * 1000,
    staleTime: 15 * 1000, // Consider data stale after 15 seconds
  });
}

// Hook for fetching coin price history with custom interval
export function useCoinHistory(symbol: string, interval: string = "7d", limit: number = 8) {
  return useQuery({
    queryKey: cryptoKeys.coinHistory(symbol, interval),
    queryFn: async () => {
      const response = await GetCoinHistory(symbol, interval, limit);
      if (!response.success) {
        throw new Error(response.error || "Failed to fetch coin history");
      }
      return response;
    },
    enabled: !!symbol,
    // Cache history data longer since it changes less frequently
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook for searching coins
export function useCoinSearch(query: string) {
  return useQuery({
    queryKey: cryptoKeys.searchQuery(query),
    queryFn: async () => {
      const response = await SearchCoins(query);
      if (!response.success) {
        throw new Error(response.error || "Failed to search coins");
      }
      return response;
    },
    enabled: query.trim().length > 0,
    // Cache search results for a short time to avoid repeated requests
    staleTime: 30 * 1000, // 30 seconds
    // Don't refetch search results automatically
    refetchInterval: false,
  });
}

// Utility hook to get processed crypto data with history
export function useCryptoWithHistory({ page }: CryptoListParams) {
  const cryptoListQuery = useCryptoList({ page });

  // Extract symbols from the crypto list
  const symbols =
    cryptoListQuery.data?.data?.results
      ?.map((coin: any) => (coin?.symbol ? String(coin.symbol).toUpperCase() : null))
      .filter(Boolean) || [];

  const historyQueries = useCryptoHistories(symbols);

  // Create history map from individual queries
  const historyMap = historyQueries.reduce(
    (acc, query) => {
      if (query.data?.symbol && query.data?.values) {
        acc[query.data.symbol] = query.data.values;
      }
      return acc;
    },
    {} as Record<string, number[]>
  );

  return {
    // Main crypto list data
    coins: cryptoListQuery.data?.data?.results || [],
    totalPages: (() => {
      const data = cryptoListQuery.data?.data || {};
      const count = typeof data.count === "number" ? data.count : undefined;
      const pageSize = 25;

      if (typeof count === "number") {
        return Math.max(1, Math.ceil(count / pageSize));
      } else if (typeof data.total_pages === "number") {
        return data.total_pages;
      }
      return null;
    })(),

    // Loading and error states
    loading: cryptoListQuery.isLoading,
    error: cryptoListQuery.error?.message || null,

    // History data
    historyMap,
    historyLoading: historyQueries.some((q) => q.isLoading),

    // Refetch functions
    refetch: cryptoListQuery.refetch,

    // Background fetching state (for showing subtle indicators)
    isFetching: cryptoListQuery.isFetching,
  };
}
