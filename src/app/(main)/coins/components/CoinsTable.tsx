"use client";

import { useEffect, useMemo, useState } from "react";

import { GetCryptoHistory7d, GetCryptoList } from "@/app/services/crypto";

import CoinsTableHeader from "./CoinsTableHeader";
import CoinsTableRow from "./CoinsTableRow";
import PaginationControls from "./PaginationControls";

const CoinsTable = () => {
  const [page, setPage] = useState(1);
  const [coins, setCoins] = useState<any[]>([]);
  const [totalPages, setTotalPages] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [historyMap, setHistoryMap] = useState<Record<string, number[]>>({});

  const pageSize = 25;
  const REFRESH_MS = 60000; // background refresh interval

  const loadData = async (newPage: number) => {
    try {
      setLoading(true);
      setError(null);
      const res = await GetCryptoList({ page: newPage });
      // Expecting shape: { success, data: { results: Coin[], count, next, previous } }
      const data = (res as any)?.data ?? {};
      const items: any[] = data.results ?? data.items ?? data.data ?? [];
      setCoins(items);
      // Clear previous history so per-row fetch can stream in freshly
      setHistoryMap({});

      // Derive total pages from common pagination shapes
      const count = typeof data.count === "number" ? data.count : undefined;
      if (typeof count === "number") {
        setTotalPages(Math.max(1, Math.ceil(count / pageSize)));
      } else if (typeof data.total_pages === "number") {
        setTotalPages(data.total_pages);
      } else if (Array.isArray(items) && items.length < pageSize && newPage === 1) {
        setTotalPages(1);
      } else if (data.next === null) {
        // no next means we are on the last page but we don't know the number; keep previous
        setTotalPages((prev) => prev ?? newPage);
      }
    } catch {
      setError("خطا در دریافت اطلاعات");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(page);
  }, [page]);

  // Background auto-refresh without interrupting UI
  useEffect(() => {
    const id = setInterval(() => {
      const refreshData = async () => {
        try {
          // Do not toggle loading; keep current UI responsive
          const res = await GetCryptoList({ page });
          const data = (res as any)?.data ?? {};
          const items: any[] = data.results ?? data.items ?? data.data ?? [];
          setCoins(items);

          // Update total pages if it changed (won't clear history)
          const count = typeof data.count === "number" ? data.count : undefined;
          if (typeof count === "number") {
            setTotalPages(Math.max(1, Math.ceil(count / pageSize)));
          } else if (typeof data.total_pages === "number") {
            setTotalPages(data.total_pages);
          }
        } catch (e) {
          console.warn("[CoinsTable] Background refresh failed", e);
        }
      };
      refreshData();
    }, REFRESH_MS);
    return () => clearInterval(id);
  }, [page]);

  // Stream per-row 7d history after coins list is loaded
  useEffect(() => {
    if (!coins || coins.length === 0) return;
    let cancelled = false;

    const symbols = coins
      .map((it: any) => (it?.symbol ? String(it.symbol).toUpperCase() : null))
      .filter(Boolean) as string[];

    const fetchOne = async (sym: string) => {
      try {
        const res = await GetCryptoHistory7d([sym]);
        const data = (res as any)?.data ?? [];
        const entries = Array.isArray(data) ? data : (data.results ?? []);
        const points = Array.isArray(entries?.[0]?.points) ? entries[0].points : [];
        // Ensure chronological order (oldest -> newest) before deriving trend/colors
        const sortedPoints = [...points].sort(
          (a: any, b: any) => new Date(a?.[0] ?? 0).getTime() - new Date(b?.[0] ?? 0).getTime()
        );
        const values = sortedPoints.map((p: any) => Number(p?.[1] ?? 0));
        if (!cancelled) {
          setHistoryMap((prev) => ({ ...prev, [sym]: values }));
        }
      } catch {
        if (!cancelled) {
          setHistoryMap((prev) => ({ ...prev, [sym]: [] }));
        }
      }
    };

    symbols.forEach((s) => fetchOne(s));

    return () => {
      cancelled = true;
    };
  }, [coins]);

  const canPrev = useMemo(() => page > 1, [page]);
  const canNext = useMemo(() => {
    if (totalPages) return page < totalPages;
    return coins.length === pageSize; // optimistic if total unknown
  }, [page, totalPages, coins.length]);

  return (
    <div className="w-full">
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
                <CoinsTableRow item={item} historyMap={historyMap} key={`coin-${idx}`} />
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
