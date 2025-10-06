"use client";

import { useMemo, useState, useEffect } from "react";

import { useCryptoList } from "@/hooks/useCrypto";
import { useCryptoActions } from "@/hooks/useCryptoActions";

import CoinsTableHeader from "./CoinsTableHeader";
import CoinsTableRow from "./CoinsTableRow";
import PaginationControls from "./PaginationControls";

const CoinsTable = () => {
  const [page, setPage] = useState(1);

  // Use React Query hook for data fetching
  const {
    data: cryptoData,
    isLoading: loading,
    error,
    isFetching,
  } = useCryptoList({
    page,
  });

  const coins = cryptoData?.data?.results || [];
  const errorMessage = (error as any)?.message || null;
  const totalPages = (() => {
    const data = cryptoData?.data || {};
    const count = typeof data.count === "number" ? data.count : undefined;
    const pageSize = 25;

    if (typeof count === "number") {
      return Math.max(1, Math.ceil(count / pageSize));
    } else if (typeof data.total_pages === "number") {
      return data.total_pages;
    }
    return null;
  })();

  const { prefetchCryptoList } = useCryptoActions();
  const pageSize = 25;

  // Prefetch next page for better UX
  useEffect(() => {
    if (totalPages && page < totalPages) {
      prefetchCryptoList(page + 1);
    }
  }, [page, totalPages, prefetchCryptoList]);

  const canPrev = useMemo(() => page > 1, [page]);
  const canNext = useMemo(() => {
    if (totalPages) return page < totalPages;
    return coins.length === pageSize; // optimistic if total unknown
  }, [page, totalPages, coins.length]);

  return (
    <div className="w-full">
      {/* Show subtle background fetching indicator */}
      {isFetching && !loading && (
        <div className="mb-2 text-center text-xs text-gray-400">در حال به‌روزرسانی...</div>
      )}

      <div className="overflow-x-auto rounded-lg border shadow-sm">
        <table className="w-full table-auto bg-gray-800 text-right text-sm">
          <CoinsTableHeader />
          <tbody className="divide-y text-gray-200">
            {loading &&
              Array.from({ length: 10 }).map((_, i) => (
                <tr key={`skeleton-${i}`} className="animate-pulse">
                  <td className="px-8 py-3">
                    <div className="flex items-center gap-x-3">
                      <div className="h-10 w-10 rounded-full bg-gray-700" />
                      <div className="flex flex-col gap-2">
                        <div className="h-3 w-28 rounded bg-gray-700" />
                        <div className="h-2 w-16 rounded bg-gray-700" />
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-4">
                    <div className="h-3 w-24 rounded bg-gray-700" />
                  </td>
                  <td className="px-8 py-4">
                    <div className="h-3 w-16 rounded bg-gray-700" />
                  </td>
                  <td className="px-8 py-4">
                    <div className="h-3 w-28 rounded bg-gray-700" />
                  </td>
                  <td className="px-8 py-4">
                    <div className="h-10 w-full rounded bg-gray-700" />
                  </td>
                </tr>
              ))}
            {!loading && errorMessage && (
              <tr>
                <td colSpan={5} className="px-8 py-6 text-center text-red-400">
                  {errorMessage}
                </td>
              </tr>
            )}
            {!loading && !errorMessage && coins.length === 0 && (
              <tr>
                <td colSpan={5} className="px-8 py-6 text-center text-gray-400">
                  موردی یافت نشد
                </td>
              </tr>
            )}
            {!loading &&
              !errorMessage &&
              coins.map((item: any, idx: number) => (
                <CoinsTableRow item={item} key={`coin-${item?.id || item?.symbol || idx}`} />
              ))}
          </tbody>
        </table>
      </div>

      <PaginationControls
        page={page}
        totalPages={totalPages}
        canPrev={canPrev}
        canNext={canNext}
        loading={loading}
        onPrev={() => canPrev && setPage((p) => Math.max(1, p - 1))}
        onNext={() => canNext && setPage((p) => p + 1)}
      />
    </div>
  );
};
export default CoinsTable;
