import { NextRequest, NextResponse } from "next/server";

// Define protected routes
const protectedRoutes = ["/dashboard"];
const adminRoutes = ["/admin"];
const authRoutes = ["/auth"];

// Simple function to check if user has valid tokens
async function hasValidTokens(cookies: string | null): Promise<boolean> {
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (cookies) {
      headers.Cookie = cookies;
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/profile/`, {
      method: "GET",
      headers,
      credentials: "include",
    });

    return response.ok;
  } catch (error) {
    console.error("Error checking tokens:", error);
    return false;
  }
}

// Function to check if refresh token is valid
async function hasValidRefreshToken(cookies: string | null): Promise<boolean> {
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (cookies) {
      headers.Cookie = cookies;
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/token/refresh/`,
      {
        method: "POST",
        headers,
        credentials: "include",
      }
    );

    return response.ok;
  } catch (error) {
    console.error("Error checking refresh token:", error);
    return false;
  }
}

// Function to check if user is admin/staff
async function isUserAdmin(cookies: string | null): Promise<boolean> {
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (cookies) {
      headers.Cookie = cookies;
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/profile/`, {
      method: "GET",
      headers,
      credentials: "include",
    });

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    return data.is_staff === true;
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const cookies = request.headers.get("cookie");

  // Check if the current path is a protected route
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));

  // Check if the current path is an admin route
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route));

  // Check if the current path is an auth route
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  if (isAdminRoute) {
    // First check if user has valid access tokens
    const hasAccess = await hasValidTokens(cookies);

    if (!hasAccess) {
      // If no valid access tokens, check if they have a valid refresh token
      const hasRefresh = await hasValidRefreshToken(cookies);

      if (!hasRefresh) {
        return NextResponse.redirect(new URL("/auth", request.url));
      }
    }

    // Check if user is admin/staff
    const isAdmin = await isUserAdmin(cookies);

    if (!isAdmin) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next();
  }

  if (isProtectedRoute) {
    // First check if user has valid access tokens
    const hasAccess = await hasValidTokens(cookies);

    if (hasAccess) {
      return NextResponse.next();
    }

    // If no valid access tokens, check if they have a valid refresh token
    const hasRefresh = await hasValidRefreshToken(cookies);

    if (hasRefresh) {
      // Let the client-side handle the token refresh
      return NextResponse.next();
    }

    return NextResponse.redirect(new URL("/auth", request.url));
  }

  if (isAuthRoute) {
    // Check if user already has valid access tokens
    const hasAccess = await hasValidTokens(cookies);

    if (hasAccess) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // Check if user has valid refresh token (can be auto-logged in)
    const hasRefresh = await hasValidRefreshToken(cookies);

    if (hasRefresh) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next();
  }

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
