"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { upgradeUserToPremium } from "@/app/services/admin";
import { logout, getUserProfile } from "@/app/services/auth";
import { requireAdminAccess } from "@/app/services/authUtils";
import type { UserProfile } from "@/app/services/types";

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    const loadUser = async () => {
      try {
        const response = await getUserProfile();
        if (response.success && response.user) {
          setUser(response.user);
        } else {
          router.replace("/auth");
        }
      } catch {
        router.replace("/auth");
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      router.replace("/auth");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

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

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-32 w-32 animate-spin rounded-full border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-300">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-19 min-h-screen w-full max-w-11/12 bg-gray-950 text-blue-50 sm:max-w-10/12 sm:pt-10">
      <div className="mx-auto">
        <div className="w-full">
          <div className="mb-8 flex items-center justify-between">
            <h1 className="text-3xl font-bold">پنل مدیریت</h1>
            <div className="flex gap-4">
              <Link
                href="/"
                className="rounded-lg bg-blue-600 px-4 py-2 transition-colors hover:bg-blue-700"
              >
                صفحه اصلی
              </Link>
              <button
                onClick={handleLogout}
                className="cursor-pointer rounded-lg bg-red-600 px-4 py-2 transition-colors hover:bg-red-700"
              >
                خروج
              </button>
            </div>
          </div>

          {/* User Info Card (same as dashboard) */}
          <div className="mb-8 rounded-lg bg-gray-800 p-6">
            <h2 className="mb-4 text-xl font-semibold">اطلاعات کاربری</h2>
            {user ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-400">نام کاربری</label>
                  <p className="text-white">{user.username}</p>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-400">ایمیل</label>
                  <p className="text-white">{user.email}</p>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-400">نقش کاربری</label>
                  <p className={`${user.is_staff ? "text-red-400" : "text-gray-400"}`}>
                    {user.is_staff ? "مدیر" : "کاربر عادی"}
                  </p>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-400">
                    وضعیت اشتراک
                  </label>
                  <p className={`${user.is_premium ? "text-green-400" : "text-gray-400"}`}>
                    {user.is_premium ? "پریمیوم" : "رایگان"}
                  </p>
                </div>
                {user.is_premium && user.premium_expires_at && (
                  <div className="md:col-span-2">
                    <div className="rounded-lg bg-gradient-to-r from-yellow-700 to-yellow-800 p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <span className="text-lg">👑</span>
                          <span className="mr-2 font-bold text-white">اشتراک پریمیوم</span>
                        </div>
                        <span className="text-sm font-bold text-yellow-100">
                          تا {new Date(user.premium_expires_at).toLocaleDateString("fa-IR")}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-400">اطلاعات کاربری در دسترس نیست</p>
            )}
          </div>

          {/* Main Links (same as dashboard) */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Link
              href="/coins"
              className="rounded-lg bg-gray-800 p-6 transition-colors hover:bg-gray-700"
            >
              <h3 className="mb-2 text-lg font-semibold">کریپتو</h3>
              <p className="text-gray-400">قیمت‌ها و بازار ارزهای دیجیتال</p>
            </Link>

            <Link
              href="/smart-advisor"
              className={`rounded-lg p-6 ${user?.is_premium ? "border border-purple-500/30 bg-gradient-to-br from-purple-600/20 to-purple-700/20" : "bg-gray-800"}`}
            >
              <div className="mb-2 flex items-center">
                {user?.is_premium && <span className="mr-2 text-lg">🤖</span>}
                <h3 className="text-lg font-semibold">مشاور هوشمند</h3>
              </div>
              <p className="text-gray-400">تحلیل و پیشنهادات هوشمند بازار</p>
              {!user?.is_premium && (
                <span className="mt-2 block text-sm text-gray-500">
                  دسترسی فقط برای کاربران پریمیوم
                </span>
              )}
            </Link>
          </div>

          {/* Premium Upgrade Section (same as dashboard) */}
          {!user?.is_premium && (
            <div className="mt-8 rounded-lg bg-gradient-to-r from-yellow-600 to-yellow-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="mb-2 text-xl font-bold text-white">ارتقا به پریمیوم</h3>
                  <p className="text-yellow-100">دسترسی به تمام امکانات پیشرفته صفرو</p>
                </div>
                <button className="rounded-lg bg-white px-6 py-3 font-semibold text-yellow-700 transition-colors hover:bg-yellow-50">
                  مشاهده پلن‌ها
                </button>
              </div>
            </div>
          )}

          {/* Admin Tools (extra section) */}
          <div className="mt-8 rounded-lg border border-red-500/30 bg-gradient-to-br from-red-600/20 to-red-700/20 p-6">
            <div className="mb-4 flex items-center">
              <span className="ml-2 text-lg">🛡️</span>
              <h2 className="text-xl font-semibold text-red-400">ابزارهای ادمین</h2>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="rounded-lg bg-gray-800 p-6">
                <h3 className="mb-4 text-lg font-semibold">ارتقای پریمیوم کاربر</h3>
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

              <div className="rounded-lg bg-gray-800 p-6">
                <h3 className="mb-2 text-lg font-semibold">وضعیت سیستم</h3>
                <p className="text-sm text-gray-400">بخش‌های مدیریتی بیشتر به‌زودی اضافه می‌شود.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
