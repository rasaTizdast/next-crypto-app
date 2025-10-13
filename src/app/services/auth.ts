// Define the shape of the expected server response

import { http, ensureCsrf, getCsrfTokenFromCookie } from "./http";
import { AuthResponse, UserProfile, HttpResponse } from "./types";

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
    const csrfToken = (await ensureCsrf()) || getCsrfTokenFromCookie();
    const requestBody = { username_or_email, password };
    const requestUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/login/`;

    const requestHeaders = {
      "Content-Type": "application/json",
      "X-CSRFToken": csrfToken,
    };

    const response = await fetch(requestUrl, {
      method: "POST",
      headers: requestHeaders,
      body: JSON.stringify(requestBody),
      credentials: "include",
    });

    const data = await response.json();

    // Treat non-2xx responses as failures
    if (!response.ok) {
      const errorMessage =
        (data && (data.error || data.detail || data.message)) ||
        "نام کاربری یا رمز عبور نادرست است";

      return {
        success: false,
        error: errorMessage,
        status: response.status,
        responseData: data,
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
    const csrfToken = (await ensureCsrf()) || getCsrfTokenFromCookie();
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/register/`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-CSRFToken": csrfToken },
      body: JSON.stringify({ username, email, password }),
      credentials: "include",
    });

    const data: AuthResponse = await response.json();

    // Check if the response was successful
    if (response.ok) {
      return { ...data, success: true };
    } else {
      return {
        success: false,
        error: data.detail || data.error || "ثبت نام ناموفق بود",
        status: response.status,
        responseData: data,
      };
    }
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
    const csrfToken = (await ensureCsrf()) || getCsrfTokenFromCookie();
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/auth/verify-email/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrfToken,
        },
        body: JSON.stringify({ code }),
        credentials: "include",
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
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "https://sefrocrypto.liara.run";
    const response = await http(`${apiBaseUrl}/api/users/token/refresh/`, "POST");

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

export const getUserProfile = async (): Promise<HttpResponse & { user?: UserProfile }> => {
  try {
    const profileUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/profile/`;

    const response = await http(profileUrl, "GET");

    if (response.success && response.data) {
      return {
        ...response,
        user: response.data as UserProfile,
      };
    }

    return response;
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: "دریافت اطلاعات کاربر با شکست مواجه شد!",
    };
  }
};
