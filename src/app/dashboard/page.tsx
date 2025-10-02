"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { logout, getUserProfile } from "@/app/services/auth";
import { UserProfile } from "@/app/services/types";

export default function Dashboard() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loadUser = async () => {
      try {
        // Use getUserProfile directly - it handles token refresh automatically via http service
        const response = await getUserProfile();

        if (response.success && response.user) {
          setUser(response.user);
        } else {
          // If profile fetch failed, redirect to auth page
          console.error("Failed to get user profile:", response.error);
          // Use Next.js router for navigation instead of window.location
          router.replace("/auth");
        }
      } catch (error) {
        console.error("Error loading user:", error);
        // On error, redirect to auth page
        router.replace("/auth");
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []); // Empty dependency array - only run once on mount

  const handleLogout = async () => {
    try {
      await logout();
      router.replace("/auth");
    } catch (error) {
      console.error("Logout error:", error);
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
    <div className="min-h-screen bg-gray-950 text-blue-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <h1 className="text-3xl font-bold">داشبورد کاربری</h1>
            <div className="flex gap-4">
              <Link
                href="/"
                className="rounded-lg bg-blue-600 px-4 py-2 transition-colors hover:bg-blue-700"
              >
                صفحه اصلی
              </Link>
              <button
                onClick={handleLogout}
                className="rounded-lg bg-red-600 px-4 py-2 transition-colors hover:bg-red-700"
              >
                خروج
              </button>
            </div>
          </div>

          {/* User Info Card */}
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
                {user.first_name && (
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-400">نام</label>
                    <p className="text-white">{user.first_name}</p>
                  </div>
                )}
                {user.last_name && (
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-400">
                      نام خانوادگی
                    </label>
                    <p className="text-white">{user.last_name}</p>
                  </div>
                )}
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-400">
                    وضعیت اشتراک
                  </label>
                  <p className={`${user.is_premium ? "text-green-400" : "text-gray-400"}`}>
                    {user.is_premium ? "پریمیوم" : "رایگان"}
                  </p>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-400">
                    تاریخ عضویت
                  </label>
                  <p className="text-white">
                    {new Date(user.date_joined).toLocaleDateString("fa-IR")}
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

          {/* Quick Actions */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <Link
              href="/coins"
              className="rounded-lg bg-gray-800 p-6 transition-colors hover:bg-gray-700"
            >
              <h3 className="mb-2 text-lg font-semibold">قیمت ارزها</h3>
              <p className="text-gray-400">مشاهده قیمت‌های لحظه‌ای ارزهای دیجیتال</p>
            </Link>

            <div
              className={`rounded-lg p-6 ${user?.is_premium ? "border border-purple-500/30 bg-gradient-to-br from-purple-600/20 to-purple-700/20" : "bg-gray-800"}`}
            >
              <div className="mb-2 flex items-center">
                {user?.is_premium && <span className="mr-2 text-lg">📊</span>}
                <h3 className="text-lg font-semibold">تحلیل‌های پیشرفته</h3>
              </div>
              <p className="text-gray-400">تحلیل‌های عمیق و هوشمند بازار</p>
              {user?.is_premium ? (
                <span className="mt-2 block text-sm text-purple-400">
                  ویژه کاربران پریمیوم - به زودی...
                </span>
              ) : (
                <div className="mt-3">
                  <span className="mb-2 block text-sm text-gray-500">
                    تحلیل‌های پیشرفته فقط برای کاربران پریمیوم
                  </span>
                  <button className="rounded bg-purple-600 px-3 py-1 text-sm text-white transition-colors hover:bg-purple-700">
                    ارتقا به پریمیوم
                  </button>
                </div>
              )}
            </div>

            <div
              className={`rounded-lg p-6 ${user?.is_premium ? "border border-yellow-500/30 bg-gradient-to-br from-yellow-600/20 to-yellow-700/20" : "bg-gray-800"}`}
            >
              <div className="mb-2 flex items-center">
                {user?.is_premium && <span className="mr-2 text-lg">👑</span>}
                <h3 className="text-lg font-semibold">پورتفولیو</h3>
              </div>
              <p className="text-gray-400">مدیریت دارایی‌های دیجیتال شما</p>
              {user?.is_premium ? (
                <span className="mt-2 block text-sm text-yellow-400">
                  ویژه کاربران پریمیوم - به زودی...
                </span>
              ) : (
                <div className="mt-3">
                  <span className="mb-2 block text-sm text-gray-500">
                    برای دسترسی به این بخش نیاز به اشتراک پریمیوم دارید
                  </span>
                  <button className="rounded bg-yellow-600 px-3 py-1 text-sm text-white transition-colors hover:bg-yellow-700">
                    ارتقا به پریمیوم
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Premium Upgrade Section */}
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
        </div>
      </div>
    </div>
  );
}
