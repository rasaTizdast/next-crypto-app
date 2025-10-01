import { http } from "./http";
import { HttpResponse } from "./types";

export const refreshAndRetry = async (
  url: string,
  method: string,
  body?: unknown,
  retryCount = 0
): Promise<HttpResponse> => {
  if (retryCount > 0) {
    throw new Error("Token refresh failed or maximum retries reached");
  }

  // Attempt to refresh token
  const refreshResponse = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/token/refresh/`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    }
  );

  if (refreshResponse.ok) {
    // Retry original request after successful token refresh
    return await http(url, method, body, 1);
  }

  throw new Error("Token refresh failed");
};
