"use client";

import { EyeIcon, EyeSlashIcon } from "@heroicons/react/16/solid";
import Form from "next/form";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useFormStatus } from "react-dom";

import OTPInput from "@/components/OTPInput";
import { login, signup } from "services/auth";

type AuthMode = "login" | "signup";

const SubmitButton: React.FC<{ mode: AuthMode }> = ({ mode }) => {
  const { pending } = useFormStatus();
  return (
    <button
      disabled={pending}
      type="submit"
      className="w-full cursor-pointer rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
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

  const router = useRouter();

  const handleSubmit = async (formData: FormData): Promise<void> => {
    setError(null); // Clear previous errors
    setSuccessMessage(null);
    const email = formData.get("email") as string;
    const username_or_email = formData.get("username_or_email") as string;
    const password = formData.get("password") as string;

    if (mode === "login") {
      const result = await login({ username_or_email, password });
      if (!result.success) {
        setError(result.error || "ورود ناموفق بود");
        return;
      }
      router.push("/"); // Redirect to home after successful login
    } else {
      const username = formData.get("username") as string;
      const result = await signup({ username, email, password });
      if (!result.success) {
        setError(result.error || "ثبت نام ناموفق بود");
        return;
      }
      setShowOTP(true);
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
            <div className="mb-4 rounded-lg bg-red-500/20 p-2 text-center text-sm text-red-400">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="mb-4 rounded-lg bg-green-500/20 p-2 text-center text-sm text-green-400">
              {successMessage}
            </div>
          )}

          {!showOTP ? (
            <Form action={handleSubmit} className="space-y-4">
              {mode === "signup" && (
                <div>
                  <label className="mb-1 block text-sm text-gray-300">نام کاربری</label>
                  <input
                    name="username"
                    type="text"
                    placeholder="نام کاربری خود را وارد کنید"
                    className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
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
                    className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
              ) : (
                <div>
                  <label className="mb-1 block text-sm text-gray-300">ایمیل یا نام کاربری</label>
                  <input
                    name="username_or_email"
                    type="text"
                    placeholder="ایمیل خود را وارد کنید"
                    className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
              )}

              <div className="relative">
                <label className="mb-1 block text-sm text-gray-300">رمز عبور</label>
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="رمز عبور"
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute top-1/2 left-3 flex items-center text-gray-400 hover:text-white"
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
                    className="text-sm text-blue-400 hover:text-blue-300"
                    onClick={() => alert("صفحه فراموشی رمز عبور")}
                  >
                    فراموشی رمز عبور؟
                  </button>
                </div>
              )}

              <SubmitButton mode={mode} />
            </Form>
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
                    className="cursor-pointer text-blue-400 hover:text-blue-300"
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
                    className="cursor-pointer text-blue-400 hover:text-blue-300"
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
