import { http } from "./http";
import { HttpResponse } from "./types";

export const refreshAndRetry = async (
  url: string,
  method: string,
  body?: unknown,
  retryCount = 0
): Promise<HttpResponse> => {
  if (retryCount > 0) {
    console.error("Token refresh failed or maximum retries reached");
    return { success: false, error: "Token refresh failed or maximum retries reached" };
  }

  try {
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
      console.log("Token refresh successful, retrying original request");
      // Retry original request after successful token refresh
      return await http(url, method, body, 1);
    }

    console.error("Token refresh failed with status:", refreshResponse.status);
    return { success: false, error: "Token refresh failed" };
  } catch (error) {
    console.error("Error during token refresh:", error);
    return { success: false, error: "Token refresh failed due to network error" };
  }
};
