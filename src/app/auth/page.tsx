"use client";

import { EyeIcon, EyeSlashIcon } from "@heroicons/react/16/solid";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useFormStatus } from "react-dom";

import { login, signup } from "@/app/services/auth";
import OTPInput from "@/components/OTPInput";

type AuthMode = "login" | "signup";

const SubmitButton: React.FC<{ mode: AuthMode }> = ({ mode }) => {
  const { pending } = useFormStatus();
  return (
    <button
      disabled={pending}
      type="submit"
      className="w-full cursor-pointer rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {pending ? "در حال پردازش..." : mode === "login" ? "ورود" : "ثبت نام"}
    </button>
  );
};

const AuthPage: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showOTP, setShowOTP] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  // Handle redirect after successful login
  useEffect(() => {
    if (successMessage && mode === "login") {
      const timer = setTimeout(() => {
        router.replace("/dashboard");
      }, 1500); // Give user time to see success message
      return () => clearTimeout(timer);
    }
  }, [successMessage, mode, router]);

  const handleSubmit = async (formData: FormData): Promise<void> => {
    setError(null); // Clear previous errors
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      if (mode === "login") {
        const username_or_email = formData.get("username_or_email") as string;
        const password = formData.get("password") as string;

        const result = await login({ username_or_email, password });

        if (!result.success) {
          setError("ورود ناموفق بود. لطفاً اطلاعات خود را بررسی کنید.");
          return;
        }

        setSuccessMessage("ورود موفقیت‌آمیز بود! در حال انتقال...");
        // Redirect will happen via useEffect
      } else {
        const username = formData.get("username") as string;
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;

        const result = await signup({ username, email, password });

        if (!result.success) {
          // Show specific error messages
          let errorMessage = "ثبت نام ناموفق بود";
          if (result.error && typeof result.error === "object") {
            const errorObj = result.error as Record<string, any>;
            if (errorObj.password) {
              errorMessage =
                "رمز عبور باید حداقل 8 کاراکتر باشد و شامل حروف، اعداد و نمادهای خاص باشد";
            } else if (errorObj.username) {
              errorMessage = "نام کاربری قبلاً استفاده شده است";
            } else if (errorObj.email) {
              errorMessage = "ایمیل قبلاً استفاده شده است";
            }
          } else if (typeof result.error === "string") {
            errorMessage = result.error;
          }

          setError(errorMessage);
          return;
        }

        setSuccessMessage("ثبت نام موفقیت‌آمیز بود! کد تایید به ایمیل شما ارسال شد.");
        setShowOTP(true);
      }
    } catch (error) {
      setError(
        `خطا در ${mode === "login" ? "ورود" : "ثبت نام"}: ${error instanceof Error ? error.message : "خطای نامشخص"}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPSuccess = () => {
    setSuccessMessage("ایمیل شما تایید شد. حالا می‌توانید وارد شوید.");
    setShowOTP(false);
    setMode("login");
  };

  const handleOTPError = (msg: string) => {
    setError(msg);
  };

  return (
    <>
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 text-white">
        <div className="w-full max-w-md rounded-2xl border border-gray-50/40 bg-gray-500/20 p-8 shadow-xl backdrop-blur-sm">
          <h2 className="mb-6 text-center text-2xl font-bold">
            {mode === "login" ? "ورود به حساب" : "ساخت حساب جدید"}
          </h2>

          {error && (
            <div className="mb-4 rounded-lg border border-red-500/50 bg-red-500/20 p-3 text-center text-sm text-red-400">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="mb-4 rounded-lg border border-green-500/50 bg-green-500/20 p-3 text-center text-sm text-green-400">
              {successMessage}
            </div>
          )}

          {!showOTP ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                handleSubmit(formData);
              }}
              className="space-y-4"
            >
              {mode === "signup" && (
                <div>
                  <label className="mb-1 block text-sm text-gray-300">نام کاربری</label>
                  <input
                    name="username"
                    type="text"
                    placeholder="نام کاربری خود را وارد کنید"
                    disabled={isLoading}
                    className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
              )}

              {mode === "signup" ? (
                <div>
                  <label className="mb-1 block text-sm text-gray-300">ایمیل</label>
                  <input
                    name="email"
                    type="email"
                    placeholder="ایمیل خود را وارد کنید"
                    disabled={isLoading}
                    className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
              ) : (
                <div>
                  <label className="mb-1 block text-sm text-gray-300">ایمیل یا نام کاربری</label>
                  <input
                    name="username_or_email"
                    type="text"
                    placeholder="ایمیل یا نام کاربری خود را وارد کنید"
                    disabled={isLoading}
                    className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
              )}

              <div className="relative">
                <label className="mb-1 block text-sm text-gray-300">رمز عبور</label>
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="رمز عبور"
                  disabled={isLoading}
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  disabled={isLoading}
                  className="absolute top-1/2 left-3 flex items-center text-gray-400 hover:text-white disabled:opacity-50"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>

              {mode === "login" && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    disabled={isLoading}
                    className="text-sm text-blue-400 hover:text-blue-300 disabled:opacity-50"
                    onClick={() => alert("صفحه فراموشی رمز عبور")}
                  >
                    فراموشی رمز عبور؟
                  </button>
                </div>
              )}

              <SubmitButton mode={mode} />
            </form>
          ) : (
            <div className="space-y-4">
              <p className="text-center text-sm text-gray-300">
                کد تایید ۶ رقمی ارسال شده به ایمیل خود را وارد کنید:
              </p>
              <OTPInput onSuccess={handleOTPSuccess} onError={handleOTPError} />
            </div>
          )}

          {!showOTP && (
            <div className="mt-6 text-center text-sm text-gray-400">
              {mode === "login" ? (
                <>
                  حساب ندارید؟{" "}
                  <button
                    type="button"
                    disabled={isLoading}
                    className="cursor-pointer text-blue-400 hover:text-blue-300 disabled:opacity-50"
                    onClick={() => setMode("signup")}
                  >
                    ثبت نام
                  </button>
                </>
              ) : (
                <>
                  حساب دارید؟{" "}
                  <button
                    type="button"
                    disabled={isLoading}
                    className="cursor-pointer text-blue-400 hover:text-blue-300 disabled:opacity-50"
                    onClick={() => setMode("login")}
                  >
                    ورود
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AuthPage;
