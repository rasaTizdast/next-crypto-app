import React from "react";

import { getUserProfile } from "./auth";
import { AuthState, UserProfile } from "./types";

/**
 * Check if user is currently logged in by verifying their profile
 * This function handles token refresh automatically via the http service
 */
export const isUserLoggedIn = async (): Promise<boolean> => {
  try {
    // getUserProfile uses http service which automatically handles token refresh
    const response = await getUserProfile();
    return response.success && !!response.user;
  } catch (error) {
    console.error("Error checking user login status:", error);
    return false;
  }
};

/**
 * Get current user authentication state including profile data
 * This function uses getUserProfile which automatically handles token refresh
 */
export const getAuthState = async (): Promise<AuthState> => {
  try {
    // getUserProfile uses the http service which handles automatic token refresh
    const response = await getUserProfile();

    if (response.success && response.user) {
      return {
        isAuthenticated: true,
        user: response.user,
        loading: false,
      };
    }

    return {
      isAuthenticated: false,
      user: null,
      loading: false,
      error: response.error,
    };
  } catch (error) {
    console.error("Error getting auth state:", error);
    return {
      isAuthenticated: false,
      user: null,
      loading: false,
      error: "خطا در دریافت وضعیت احراز هویت",
    };
  }
};

/**
 * Check if user has premium access
 */
export const checkPremiumAccess = async (): Promise<{
  hasPremium: boolean;
  user?: UserProfile;
  isExpired?: boolean;
}> => {
  try {
    const response = await getUserProfile();

    if (!response.success || !response.user) {
      return { hasPremium: false };
    }

    const user = response.user;

    // Check if user has premium and if it's not expired
    if (!user.is_premium) {
      return { hasPremium: false, user };
    }

    // Check if premium is expired
    if (user.premium_expires_at) {
      const expirationDate = new Date(user.premium_expires_at);
      const now = new Date();

      if (expirationDate < now) {
        return { hasPremium: false, user, isExpired: true };
      }
    }

    return { hasPremium: true, user };
  } catch (error) {
    console.error("Error checking premium access:", error);
    return { hasPremium: false };
  }
};

/**
 * Client-side hook for checking authentication status
 * This can be used in React components
 */
export const useAuthCheck = () => {
  // Use useCallback to memoize functions and prevent unnecessary re-renders
  const checkAuth = React.useCallback(async () => {
    return await isUserLoggedIn();
  }, []);

  const getUser = React.useCallback(async () => {
    const authState = await getAuthState();
    return authState.user;
  }, []);

  const checkPremium = React.useCallback(async () => {
    return await checkPremiumAccess();
  }, []);

  const memoizedGetAuthState = React.useCallback(async () => {
    return await getAuthState();
  }, []);

  return {
    checkAuth,
    getUser,
    checkPremium,
    getAuthState: memoizedGetAuthState,
  };
};

/**
 * Utility function to redirect to login if user is not authenticated
 * This can be used in pages or components that require authentication
 */
export const requireAuth = async (): Promise<{
  isAuthenticated: boolean;
  user?: UserProfile;
  redirectTo?: string;
}> => {
  const authState = await getAuthState();

  if (!authState.isAuthenticated) {
    return {
      isAuthenticated: false,
      redirectTo: "/auth",
    };
  }

  return {
    isAuthenticated: true,
    user: authState.user!,
  };
};

/**
 * Utility function to check premium access for premium features
 */
export const requirePremiumAccess = async (): Promise<{
  hasAccess: boolean;
  user?: UserProfile;
  isExpired?: boolean;
  redirectTo?: string;
}> => {
  const premiumCheck = await checkPremiumAccess();

  if (!premiumCheck.hasPremium) {
    const authState = await getAuthState();

    if (!authState.isAuthenticated) {
      return {
        hasAccess: false,
        redirectTo: "/auth",
      };
    }

    return {
      hasAccess: false,
      user: premiumCheck.user,
      isExpired: premiumCheck.isExpired,
      redirectTo: "/dashboard", // Redirect to dashboard to show upgrade options
    };
  }

  return {
    hasAccess: true,
    user: premiumCheck.user,
  };
};

/**
 * Utility function to check if user has admin/staff permissions
 */
export const checkAdminAccess = async (): Promise<{
  isAdmin: boolean;
  user?: UserProfile;
}> => {
  try {
    const authState = await getAuthState();

    if (!authState.isAuthenticated || !authState.user) {
      return { isAdmin: false };
    }

    return {
      isAdmin: authState.user.is_staff,
      user: authState.user,
    };
  } catch (error) {
    console.error("Error checking admin access:", error);
    return { isAdmin: false };
  }
};

/**
 * Utility function to require admin access for admin-only features
 */
export const requireAdminAccess = async (): Promise<{
  hasAccess: boolean;
  user?: UserProfile;
  redirectTo?: string;
}> => {
  const adminCheck = await checkAdminAccess();

  if (!adminCheck.isAdmin) {
    const authState = await getAuthState();

    if (!authState.isAuthenticated) {
      return {
        hasAccess: false,
        redirectTo: "/auth",
      };
    }

    return {
      hasAccess: false,
      user: adminCheck.user,
      redirectTo: "/dashboard", // Redirect to dashboard - no admin access
    };
  }

  return {
    hasAccess: true,
    user: adminCheck.user,
  };
};
