"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { upgradeUserToPremium } from "@/app/services/admin";
import { requireAdminAccess } from "@/app/services/authUtils";

export default function AdminPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [days, setDays] = useState<number>(30);
  const [submitting, setSubmitting] = useState(false);
  const [resultMsg, setResultMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const check = async () => {
      const res = await requireAdminAccess();
      if (!res.hasAccess) {
        router.replace(res.redirectTo || "/dashboard");
      }
    };
    check();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setResultMsg(null);
    setErrorMsg(null);

    const response = await upgradeUserToPremium({ email, days });
    setSubmitting(false);

    if (response.success) {
      setResultMsg(`کاربر ${email} با موفقیت به مدت ${days} روز پریمیوم شد`);
      setEmail("");
      setDays(30);
    } else {
      setErrorMsg(response.error || "درخواست ناموفق بود");
    }
  };

  return (
    <div className="mt-19 bg-gray-950 text-blue-50">
      <div className="mx-auto w-screen max-w-11/12 py-8 sm:max-w-10/12">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-center text-3xl font-bold">پنل مدیریت</h1>
          <span className="w-[116px]" />
        </div>

        <div className="rounded-lg bg-gray-800 p-6">
          <h2 className="mb-4 text-xl font-semibold">ارتقای پریمیوم کاربر</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm text-gray-300">ایمیل کاربر</label>
              <input
                type="email"
                required
                className="w-full rounded bg-gray-900 p-2 text-white ring-1 ring-gray-700 outline-none focus:ring-blue-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-gray-300">تعداد روزهای دسترسی</label>
              <input
                type="number"
                min={1}
                className="w-full rounded bg-gray-900 p-2 text-white ring-1 ring-gray-700 outline-none focus:ring-blue-500"
                value={days}
                onChange={(e) => setDays(parseInt(e.target.value || "0", 10))}
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded bg-blue-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-60"
            >
              {submitting ? "در حال ارسال..." : "ارتقای کاربر به پریمیوم"}
            </button>
          </form>

          {resultMsg && (
            <div className="mt-4 rounded border border-green-500/40 bg-green-700/20 p-3 text-green-300">
              {resultMsg}
            </div>
          )}
          {errorMsg && (
            <div className="mt-4 rounded border border-red-500/40 bg-red-700/20 p-3 text-red-300">
              {errorMsg}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
