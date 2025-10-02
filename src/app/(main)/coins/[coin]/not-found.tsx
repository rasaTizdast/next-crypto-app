import { ArrowLeft, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="relative mx-auto mt-19 flex w-full max-w-11/12 flex-col items-center justify-center gap-6 py-20 sm:max-w-10/12">
      <div className="text-center">
        <AlertCircle className="mx-auto mb-4 h-16 w-16 text-red-400" />
        <h1 className="mb-2 text-3xl font-bold text-white">ارز دیجیتال مورد نظر یافت نشد</h1>
        <p className="mb-6 text-gray-400">
          متأسفانه ارز دیجیتال مورد نظر شما یافت نشد. لطفاً لینک را بررسی کنید.
        </p>

        <Link
          href="/coins"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700"
        >
          <ArrowLeft className="h-4 w-4" />
          بازگشت به لیست ارزها
        </Link>
      </div>
    </div>
  );
}
