"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { requirePremiumAccess } from "@/app/services/authUtils";
import { http } from "@/app/services/http";

function escapeHtml(input: string): string {
  return input.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function formatBoldMarkdown(input: string): string {
  const escaped = escapeHtml(input);
  return escaped.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
}

export default function SmartAdvisorPage() {
  const router = useRouter();
  const [question, setQuestion] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [messages, setMessages] = useState<
    Array<{
      role: "user" | "assistant";
      id: string;
      content: string;
    }>
  >([]);
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const check = async () => {
      const res = await requirePremiumAccess();
      if (!res.hasAccess) {
        router.replace(res.redirectTo || "/dashboard");
      }
    };
    check();
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending]);

  const canSend = useMemo(() => question.trim().length > 0 && !isSending, [question, isSending]);

  const handleSend = async () => {
    if (!canSend) return;
    const text = question.trim();
    setQuestion("");
    const userMsgId = crypto.randomUUID();
    setMessages((prev) => [...prev, { role: "user", id: userMsgId, content: text }]);

    setIsSending(true);
    try {
      const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/crypto/ai/ask/`;
      const askRes = await http(url, "POST", { question: text });
      if (!askRes.success || !askRes.data) {
        throw new Error("Request failed");
      }

      const { answer } = askRes.data as { answer?: string };

      const assistantMsgId = crypto.randomUUID();
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          id: assistantMsgId,
          content: (answer ?? "").toString().trim(),
        },
      ]);
    } catch {
      const errId = crypto.randomUUID();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", id: errId, content: "متاسفانه خطایی رخ داد. لطفاً دوباره تلاش کنید." },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="mx-auto flex h-screen w-full max-w-11/12 flex-col overflow-hidden bg-gray-950 text-blue-50 sm:max-w-10/12 sm:pt-10">
      <div className="relative mt-19 flex w-full flex-1 flex-col overflow-hidden pb-5">
        <main className="flex min-h-0 flex-1 flex-col">
          <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-gray-800/70 bg-gradient-to-b from-gray-900/70 to-gray-900/30 shadow-[0_10px_40px_-12px_rgba(0,0,0,0.6)]">
            <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-white/5 ring-inset" />
            <div className="min-h-[360px] flex-1 space-y-4 overflow-y-auto px-3 py-4 sm:min-h-[420px] sm:px-6 sm:py-6">
              {messages.length === 0 && (
                <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-gray-400">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border border-gray-800 bg-gray-900/70">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="h-5 w-5 text-gray-300"
                    >
                      <path d="M2.75 12A9.25 9.25 0 1 1 12 21.25 9.26 9.26 0 0 1 2.75 12Zm8.5-3.5h1.5v5.25h-1.5V8.5Zm.75 8.25a1.13 1.13 0 1 0 0-2.25 1.13 1.13 0 0 0 0 2.25Z" />
                    </svg>
                  </div>
                  <p className="text-sm sm:text-base">سوال خود را درباره ارزهای دیجیتال بپرسید</p>
                  <p className="text-xs text-gray-500">
                    مثلا: بهترین گزینه برای سرمایه‌گذاری میان مدت چیست؟
                  </p>
                </div>
              )}

              {messages.map((m) => (
                <div key={m.id} className="flex">
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm sm:text-base md:max-w-[70%] ${
                      m.role === "user"
                        ? "ml-auto bg-blue-600 text-white shadow-[0_4px_16px_rgba(37,99,235,0.35)]"
                        : "mr-auto border border-gray-700 bg-gray-800/80 text-blue-50"
                    }`}
                  >
                    <p
                      dir="auto"
                      className="leading-6 whitespace-pre-wrap"
                      dangerouslySetInnerHTML={{ __html: formatBoldMarkdown(m.content) }}
                    />
                  </div>
                </div>
              ))}

              {isSending && (
                <div className="flex">
                  <div className="mr-auto max-w-[85%] rounded-2xl border border-gray-700 bg-gray-800/80 px-4 py-3 text-sm text-blue-50">
                    <div className="flex items-center gap-2">
                      <span className="inline-block h-2 w-2 animate-bounce rounded-full bg-gray-300 [animation-delay:-200ms]" />
                      <span className="inline-block h-2 w-2 animate-bounce rounded-full bg-gray-300" />
                      <span className="inline-block h-2 w-2 animate-bounce rounded-full bg-gray-300 [animation-delay:200ms]" />
                    </div>
                  </div>
                </div>
              )}

              <div ref={endRef} />
            </div>

            <div className="border-t border-gray-800/70 p-3 sm:p-4">
              <div className="flex items-end gap-2">
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="پیامتان را بنویسید..."
                  rows={1}
                  className="min-h-[44px] flex-1 resize-none rounded-xl border border-gray-800 bg-gray-900/80 px-3 py-3 text-sm text-blue-50 outline-none placeholder:text-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-base"
                />
                <button
                  type="button"
                  disabled={!canSend}
                  onClick={handleSend}
                  className={`inline-flex h-[44px] items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition-colors sm:h-[48px] sm:px-5 ${
                    canSend
                      ? "bg-blue-600 text-white hover:bg-blue-500"
                      : "bg-gray-700 text-gray-300"
                  }`}
                  aria-busy={isSending}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-4 w-4"
                  >
                    <path d="M2.01 21 23 12 2.01 3 2 10l15 2-15 2z" />
                  </svg>
                  ارسال
                </button>
              </div>
              <p className="mt-2 text-center text-[11px] leading-5 text-gray-500">
                پاسخ ‌ها صرفا جهت اطلاعات هستند و توصیه مالی محسوب نمی‌شوند.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
