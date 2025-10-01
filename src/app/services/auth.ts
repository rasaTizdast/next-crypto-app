// Define the shape of the expected server response

import { http } from "./http";
import { AuthResponse } from "./types";

interface LoginCredentials {
  username_or_email: string;
  password: string;
}

interface SignupCredentials {
  email: string;
  username: string;
  password: string;
}

interface VerifyEmailCredentials {
  code: string;
}

export const login = async ({
  username_or_email,
  password,
}: LoginCredentials): Promise<AuthResponse> => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/login/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username_or_email, password }),
      credentials: "include", // Include cookies for session management
    });
    const data = await response.json();

    // Treat non-2xx responses as failures
    if (!response.ok) {
      return {
        success: false,
        error:
          (data && (data.error || data.detail || data.message)) ||
          "نام کاربری یا رمز عبور نادرست است",
      };
    }

    // Successful login
    return { ...data, success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "ورود با شکست مواجه شد، مجددا تلاش کنید!" };
  }
};

export const signup = async ({
  username,
  email,
  password,
}: SignupCredentials): Promise<AuthResponse> => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/register/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    });

    const data: AuthResponse = await response.json();

    // Return server response directly
    return { ...data, success: true };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: "پروسه ثبت نام با مشکل مواجه شد، مجددا تلاش کنید!",
    };
  }
};

export const verifyEmail = async ({ code }: VerifyEmailCredentials) => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/auth/verify-email/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json", // Ensure the server knows the body is JSON
        },
        body: JSON.stringify({ code }),
      }
    );

    // Check if the response is ok (status in the range 200-299)
    if (!response.ok) {
      throw new Error("ارور از سمت سرور");
    }

    const data: AuthResponse = await response.json();

    return { ...data, status: 200 };
  } catch (error) {
    console.error(error);
    return {
      status: 400,
      error: "تائید ایمیل با شکست مواجه شد!",
    };
  }
};

export const refreshToken = async (): Promise<AuthResponse> => {
  try {
    const response = await http(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/refresh/`,
      "POST"
    );

    return { ...response, success: true };
  } catch (error) {
    console.error(error);
    return {
      status: 400,
      success: false,
      error: "دریافت حساب کاربری با شکست مواجه شد!",
    };
  }
};

export const logout = async (): Promise<AuthResponse> => {
  try {
    const response = await http(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/logout/`,
      "POST"
    );

    return { ...response, success: true };
  } catch (error) {
    console.error(error);
    return {
      status: 400,
      success: false,
      error: "خروج با شکست مواجه شد!",
    };
  }
};
