"use client";

import { useEffect, useState } from "react";

import { useAuthCheck } from "@/app/services/authUtils";
import LoginRequired from "@/components/LoginRequired";

import CoinsTable from "./components/CoinsTable";

const CoinsPage = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const { checkAuth } = useAuthCheck();

  useEffect(() => {
    const checkAuthStatus = async () => {
      const isAuth = await checkAuth();
      setIsAuthenticated(isAuth);
    };

    checkAuthStatus();
  }, [checkAuth]);

  // Show loading state while checking authentication
  if (isAuthenticated === null) {
    return (
      <div className="relative mx-auto mt-19 flex w-full max-w-11/12 flex-col items-center justify-center gap-5 py-10 pt-5 sm:max-w-10/12 sm:pt-10">
        <div className="h-96 w-full animate-pulse rounded-lg bg-gray-800"></div>
      </div>
    );
  }

  // Show login required message if not authenticated
  if (!isAuthenticated) {
    return (
      <LoginRequired
        title="دسترسی به لیست ارزها"
        message="برای مشاهده لیست کامل ارزهای دیجیتال و اطلاعات تفصیلی آن‌ها، لطفاً وارد حساب کاربری خود شوید."
        showBackButton={true}
        backHref="/"
        backText="بازگشت به صفحه اصلی"
      />
    );
  }

  return (
    <div className="relative mx-auto mt-19 flex w-full max-w-11/12 flex-col items-center justify-center gap-5 py-10 pt-5 sm:max-w-10/12 sm:pt-10">
      <CoinsTable />
    </div>
  );
};

export default CoinsPage;
