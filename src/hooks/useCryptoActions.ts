"use client";

import { useQueryClient } from "@tanstack/react-query";

import { cryptoKeys } from "./useCrypto";

// Hook for crypto-related actions like manual refresh
export function useCryptoActions() {
  const queryClient = useQueryClient();

  const refreshCryptoList = (page?: number) => {
    if (page) {
      // Invalidate specific page
      return queryClient.invalidateQueries({
        queryKey: cryptoKeys.list(page),
      });
    } else {
      // Invalidate all crypto list queries
      return queryClient.invalidateQueries({
        queryKey: cryptoKeys.lists(),
      });
    }
  };

  const refreshCryptoHistory = (symbols?: string[]) => {
    if (symbols) {
      // Invalidate specific symbols
      return queryClient.invalidateQueries({
        queryKey: cryptoKeys.history(symbols),
      });
    } else {
      // Invalidate all history queries
      return queryClient.invalidateQueries({
        queryKey: cryptoKeys.histories(),
      });
    }
  };

  const refreshAllCrypto = () => {
    // Invalidate all crypto-related queries
    return queryClient.invalidateQueries({
      queryKey: cryptoKeys.all,
    });
  };

  const prefetchCryptoList = (page: number) => {
    // Prefetch next page for better UX
    return queryClient.prefetchQuery({
      queryKey: cryptoKeys.list(page),
      queryFn: async () => {
        const { GetCryptoList } = await import("@/app/services/crypto");
        const response = await GetCryptoList({ page });
        if (!response.success) {
          throw new Error(response.error || "Failed to fetch crypto list");
        }
        return response;
      },
      staleTime: 30 * 1000,
    });
  };

  return {
    refreshCryptoList,
    refreshCryptoHistory,
    refreshAllCrypto,
    prefetchCryptoList,
  };
}
