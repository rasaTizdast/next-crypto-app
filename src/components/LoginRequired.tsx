"use client";

import { LockClosedIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

interface LoginRequiredProps {
  title?: string;
  message?: string;
  showBackButton?: boolean;
  backHref?: string;
  backText?: string;
}

const LoginRequired = ({
  title = "ورود الزامی است",
  message = "برای مشاهده این صفحه باید وارد حساب کاربری خود شوید.",
  showBackButton = false,
  backHref = "/",
  backText = "بازگشت به صفحه اصلی",
}: LoginRequiredProps) => {
  return (
    <div className="relative mx-auto mt-19 flex w-full max-w-11/12 flex-col items-center justify-center gap-6 py-20 pt-10 sm:max-w-10/12">
      {/* Back Button */}
      {showBackButton && (
        <Link
          href={backHref}
          className="flex w-fit items-center gap-2 self-start text-gray-400 transition-colors hover:text-white"
        >
          <ArrowRightIcon className="h-4 w-4" />
          <span>{backText}</span>
        </Link>
      )}

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center gap-6 text-center">
        {/* Lock Icon */}
        <div className="rounded-full bg-gray-800 p-6">
          <LockClosedIcon className="h-16 w-16 text-gray-400" />
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-white">{title}</h1>

        {/* Message */}
        <p className="max-w-md text-lg text-gray-400">{message}</p>

        {/* Login Button */}
        <Link
          href="/auth"
          className="rounded-lg bg-blue-600 px-8 py-3 text-lg font-semibold text-white transition-colors hover:bg-blue-700"
        >
          ورود / ثبت نام
        </Link>

        {/* Additional Info */}
        <div className="mt-4 rounded-lg border border-gray-700 bg-gray-800/50 p-4 text-sm text-gray-300">
          <p>
            <strong>چرا باید وارد شوم؟</strong>
          </p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-gray-400">
            <li>دسترسی به اطلاعات کامل ارزهای دیجیتال</li>
            <li>مشاهده نمودارهای تفصیلی قیمت</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default LoginRequired;
