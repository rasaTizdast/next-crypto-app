"use client";

import { useMemo, useState, useEffect } from "react";

import { useCryptoWithHistory } from "@/hooks/useCrypto";
import { useCryptoActions } from "@/hooks/useCryptoActions";

import CoinsTableHeader from "./CoinsTableHeader";
import CoinsTableRow from "./CoinsTableRow";
import PaginationControls from "./PaginationControls";

const CoinsTable = () => {
  const [page, setPage] = useState(1);

  // Use React Query hook for all data fetching
  const { coins, totalPages, loading, error, historyMap, isFetching } = useCryptoWithHistory({
    page,
  });

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
            {!loading && error && (
              <tr>
                <td colSpan={5} className="px-8 py-6 text-center text-red-400">
                  {error}
                </td>
              </tr>
            )}
            {!loading && !error && coins.length === 0 && (
              <tr>
                <td colSpan={5} className="px-8 py-6 text-center text-gray-400">
                  موردی یافت نشد
                </td>
              </tr>
            )}
            {!loading &&
              !error &&
              coins.map((item: any, idx: number) => (
                <CoinsTableRow
                  item={item}
                  historyMap={historyMap}
                  key={`coin-${item?.id || item?.symbol || idx}`}
                />
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
