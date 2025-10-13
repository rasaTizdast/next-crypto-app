import { http, ensureCsrf, getCsrfTokenFromCookie } from "./http";
import { HttpResponse } from "./types";

export const refreshAndRetry = async (
  url: string,
  method: string,
  body?: unknown,
  retryCount = 0
): Promise<HttpResponse> => {
  const maxRetries = 1; // Limit to 1 retry to prevent infinite loops

  if (retryCount > maxRetries) {
    console.error("Token refresh failed or maximum retries reached");
    return { success: false, error: "Token refresh failed or maximum retries reached" };
  }

  try {
    // Attempt to refresh token
    const csrfToken = (await ensureCsrf()) || getCsrfTokenFromCookie();

    const refreshResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/token/refresh/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrfToken,
        },
        credentials: "include",
      }
    );

    if (refreshResponse.ok) {
      // Retry original request after successful token refresh
      return await http(url, method, body, retryCount + 1);
    }

    // Try to get error details from response
    let errorMessage = "Token refresh failed";
    try {
      const errorData = await refreshResponse.json();
      errorMessage = errorData.detail || errorData.error || errorMessage;
    } catch {
      // If we can't parse the error response, use the status text
      errorMessage = refreshResponse.statusText || errorMessage;
    }

    return { success: false, error: errorMessage };
  } catch (error) {
    console.error("Error during token refresh:", error);
    return { success: false, error: "Token refresh failed due to network error" };
  }
};
