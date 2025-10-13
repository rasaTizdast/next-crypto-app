import { refreshAndRetry } from "./refreshAndRetry";
import { HttpResponse } from "./types";

// Circuit breaker to prevent infinite retry loops
let consecutiveFailures = 0;
const maxConsecutiveFailures = 3;
let lastFailureTime = 0;
const failureResetTime = 30000; // 30 seconds

export function getCsrfTokenFromCookie(): string {
  return (
    document.cookie
      .split("; ")
      .find((r) => r.startsWith("csrftoken="))
      ?.split("=")[1] || ""
  );
}

export async function ensureCsrf(): Promise<string> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/csrf/`, {
      method: "GET",
      credentials: "include",
    });
    const text = await res.text();
    try {
      const js = JSON.parse(text);
      return js?.csrfToken || "";
    } catch {
      // fallback to cookie if server returned HTML (should not happen in prod)
      return getCsrfTokenFromCookie();
    }
  } catch {
    // swallow; caller will handle network errors on subsequent call
    return "";
  }
}

export const http = async (
  url: string,
  method: string,
  body?: unknown,
  retryCount = 0
): Promise<HttpResponse> => {
  const now = Date.now();

  // Reset failure count if enough time has passed
  if (now - lastFailureTime > failureResetTime) {
    consecutiveFailures = 0;
  }

  // Circuit breaker: if too many consecutive failures, stop trying
  if (consecutiveFailures >= maxConsecutiveFailures) {
    return { success: false, error: "Service temporarily unavailable" };
  }

  try {
    const upper = (method || "GET").toUpperCase();
    const isUnsafe = ["POST", "PUT", "PATCH", "DELETE"].includes(upper);
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (isUnsafe) {
      let token = getCsrfTokenFromCookie();
      if (!token) {
        token = await ensureCsrf();
      }
      if (token) headers["X-CSRFToken"] = token;
    }

    const response = await fetch(url, {
      method,
      headers,
      credentials: "include",
      body: body ? JSON.stringify(body) : undefined,
    });

    if (response.ok) {
      // Reset failure count on success
      consecutiveFailures = 0;
      const data = await response.json();
      return { data, success: true };
    }

    if (!response.ok && response.status === 401 && retryCount === 0) {
      const refreshResult = await refreshAndRetry(url, method, body, retryCount);
      if (refreshResult.success) {
        consecutiveFailures = 0; // Reset on successful refresh
        return refreshResult;
      } else {
        consecutiveFailures++;
        lastFailureTime = now;
        return refreshResult;
      }
    }

    // For other errors, increment failure count
    consecutiveFailures++;
    lastFailureTime = now;

    const data = await response.json();
    return { data, success: false, error: data.detail || data.error || `HTTP ${response.status}` };
  } catch (error) {
    console.error(error);
    return { success: false, error: "خطایی رخ داده است، مجددا تلاش کنید!" };
  }
};
