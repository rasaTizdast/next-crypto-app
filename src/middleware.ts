import { NextRequest, NextResponse } from "next/server";

// Define protected routes
const protectedRoutes = ["/dashboard"];
const adminRoutes = ["/admin"];
const authRoutes = ["/auth"];

// Logging helper
function log(message: string, data?: any) {
  const timestamp = new Date().toISOString();
  console.log(`[MIDDLEWARE ${timestamp}]`, message, data ? JSON.stringify(data, null, 2) : "");
}

// Simple function to check if user has valid tokens
async function hasValidTokens(cookies: string | null): Promise<boolean> {
  try {
    const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/profile/`;
    log("Checking valid tokens", {
      apiUrl,
      hasCookies: !!cookies,
      cookieLength: cookies?.length || 0,
    });

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (cookies) {
      headers.Cookie = cookies;
    }

    log("Making request to profile endpoint", {
      headers: { ...headers, Cookie: cookies ? "[PRESENT]" : "[MISSING]" },
    });

    const response = await fetch(apiUrl, {
      method: "GET",
      headers,
      credentials: "include",
    });

    log("Profile endpoint response", {
      status: response.status,
      ok: response.ok,
      statusText: response.statusText,
    });

    return response.ok;
  } catch (error) {
    log("Error checking tokens", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return false;
  }
}

// Function to check if refresh token is valid
async function hasValidRefreshToken(cookies: string | null): Promise<boolean> {
  try {
    const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/token/refresh/`;
    log("Checking refresh token", {
      apiUrl,
      hasCookies: !!cookies,
    });

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (cookies) {
      headers.Cookie = cookies;
    }

    const response = await fetch(apiUrl, {
      method: "POST",
      headers,
      credentials: "include",
    });

    log("Refresh token response", {
      status: response.status,
      ok: response.ok,
      statusText: response.statusText,
    });

    return response.ok;
  } catch (error) {
    log("Error checking refresh token", {
      error: error instanceof Error ? error.message : String(error),
    });
    return false;
  }
}

// Function to check if user is admin/staff
async function isUserAdmin(cookies: string | null): Promise<boolean> {
  try {
    const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/profile/`;
    log("Checking admin status", { apiUrl });

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (cookies) {
      headers.Cookie = cookies;
    }

    const response = await fetch(apiUrl, {
      method: "GET",
      headers,
      credentials: "include",
    });

    if (!response.ok) {
      log("Admin check failed - response not ok", { status: response.status });
      return false;
    }

    const data = await response.json();
    log("Admin check response", { is_staff: data.is_staff });

    return data.is_staff === true;
  } catch (error) {
    log("Error checking admin status", {
      error: error instanceof Error ? error.message : String(error),
    });
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const cookies = request.headers.get("cookie");

  log("=== Middleware triggered ===", {
    pathname,
    hasCookies: !!cookies,
    host: request.headers.get("host"),
    origin: request.headers.get("origin"),
    referer: request.headers.get("referer"),
    env: {
      NODE_ENV: process.env.NODE_ENV,
      NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
    },
  });

  // Check if the current path is a protected route
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));

  // Check if the current path is an admin route
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route));

  // Check if the current path is an auth route
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  log("Route type check", { isProtectedRoute, isAdminRoute, isAuthRoute });

  if (isAdminRoute) {
    log("Processing admin route");

    // First check if user has valid access tokens
    const hasAccess = await hasValidTokens(cookies);
    log("Admin route - hasAccess result", { hasAccess });

    if (!hasAccess) {
      // If no valid access tokens, check if they have a valid refresh token
      const hasRefresh = await hasValidRefreshToken(cookies);
      log("Admin route - hasRefresh result", { hasRefresh });

      if (!hasRefresh) {
        log("Admin route - redirecting to /auth (no valid tokens)");
        return NextResponse.redirect(new URL("/auth", request.url));
      }
    }

    // Check if user is admin/staff
    const isAdmin = await isUserAdmin(cookies);
    log("Admin route - isAdmin result", { isAdmin });

    if (!isAdmin) {
      log("Admin route - redirecting to /dashboard (not admin)");
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    log("Admin route - allowing access");
    return NextResponse.next();
  }

  if (isProtectedRoute) {
    log("Processing protected route");

    // First check if user has valid access tokens
    const hasAccess = await hasValidTokens(cookies);
    log("Protected route - hasAccess result", { hasAccess });

    if (hasAccess) {
      // If user is admin, redirect them away from dashboard to admin panel
      const isAdmin = await isUserAdmin(cookies);
      log("Protected route - isAdmin result", { isAdmin });

      if (isAdmin) {
        log("Protected route - redirecting admin to /admin");
        return NextResponse.redirect(new URL("/admin", request.url));
      }

      log("Protected route - allowing access");
      return NextResponse.next();
    }

    // If no valid access tokens, check if they have a valid refresh token
    const hasRefresh = await hasValidRefreshToken(cookies);
    log("Protected route - hasRefresh result", { hasRefresh });

    if (hasRefresh) {
      // Let the client-side handle the token refresh
      // But if they are admin, still redirect them to /admin
      const isAdmin = await isUserAdmin(cookies);
      log("Protected route (with refresh) - isAdmin result", { isAdmin });

      if (isAdmin) {
        log("Protected route - redirecting admin to /admin");
        return NextResponse.redirect(new URL("/admin", request.url));
      }

      log("Protected route - allowing access (valid refresh token)");
      return NextResponse.next();
    }

    log("Protected route - redirecting to /auth (no valid tokens)");
    return NextResponse.redirect(new URL("/auth", request.url));
  }

  if (isAuthRoute) {
    log("Processing auth route");

    // Check if user already has valid access tokens
    const hasAccess = await hasValidTokens(cookies);
    log("Auth route - hasAccess result", { hasAccess });

    if (hasAccess) {
      log("Auth route - redirecting to /dashboard (already authenticated)");
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // Check if user has valid refresh token (can be auto-logged in)
    const hasRefresh = await hasValidRefreshToken(cookies);
    log("Auth route - hasRefresh result", { hasRefresh });

    if (hasRefresh) {
      log("Auth route - redirecting to /dashboard (valid refresh token)");
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    log("Auth route - allowing access (no valid tokens)");
    return NextResponse.next();
  }

  log("Non-protected route - allowing access");
  // Allow access to all other routes
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
  ],
};
