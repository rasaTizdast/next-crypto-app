"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";

export default function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Stale time: how long data is considered fresh
            staleTime: 30 * 1000, // 30 seconds
            // Cache time: how long data stays in cache after component unmounts
            gcTime: 60 * 1000, // 1 minute
            // Retry failed requests
            retry: (failureCount, error: any) => {
              // Don't retry on 4xx errors except 401 (handled by refresh logic)
              if (error?.status >= 400 && error?.status < 500 && error?.status !== 401) {
                return false;
              }
              return failureCount < 3;
            },
            // Background refetch on window focus
            refetchOnWindowFocus: true,
            // Background refetch on reconnect
            refetchOnReconnect: true,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
