"use client";

import { useEffect, useRef, useState } from "react";

import { verifyEmail } from "@/app/services/auth";

const OTPInput: React.FC<{
  onSuccess: () => void;
  onError: (msg: string) => void;
}> = ({ onSuccess, onError }) => {
  const [digits, setDigits] = useState<string[]>(Array(6).fill(""));
  const [submitting, setSubmitting] = useState(false);
  const inputs = useRef<HTMLInputElement[]>([]);

  useEffect(() => {
    inputs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const newDigits = [...digits];
    newDigits[index] = value;
    setDigits(newDigits);

    if (value && index < 5) {
      inputs.current[index + 1]?.focus();
    }

    if (newDigits.every((d) => d !== "") && !submitting) {
      submitOTP(newDigits.join(""));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const submitOTP = async (code: string) => {
    setSubmitting(true);
    try {
      const response = await verifyEmail({ code });
      if (response.status === 200) {
        onSuccess();
      } else if (response.status === 400) {
        throw new Error("کد تایید نامعتبر است");
      } else {
        throw new Error("خطایی رخ داد");
      }
    } catch (err: any) {
      onError(err.message || "خطایی رخ داد");
      setDigits(Array(6).fill(""));
      setTimeout(() => inputs.current[0]?.focus(), 0);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-wrap justify-center gap-2 sm:gap-3" dir="ltr">
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => {
            inputs.current[index] = el!;
          }}
          type="text"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          disabled={submitting}
          className="h-10 w-10 rounded-lg border border-gray-700 bg-gray-800 text-center text-xl focus:border-blue-500 focus:outline-none sm:h-12 sm:w-12 sm:text-2xl"
        />
      ))}
    </div>
  );
};

export default OTPInput;
