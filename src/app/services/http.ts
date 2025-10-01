import { refreshAndRetry } from "./refreshAndRetry";
import { HttpResponse } from "./types";

export const http = async (
  url: string,
  method: string,
  body?: unknown,
  retryCount = 0
): Promise<HttpResponse> => {
  try {
    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok && response.status === 401 && retryCount === 0) {
      return await refreshAndRetry(url, method, body, retryCount);
    }

    const data = await response.json();
    return { data, success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "خطایی رخ داده است، مجددا تلاش کنید!" };
  }
};
