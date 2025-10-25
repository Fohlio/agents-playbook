/**
 * Centralized Routes Configuration
 * 
 * This file contains all application routes in one place
 * for easy maintenance and type-safe route navigation.
 */

/**
 * Public routes (no authentication required)
 */
export const PUBLIC_ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
} as const;

/**
 * Protected routes (authentication required)
 */
export const PROTECTED_ROUTES = {
  DASHBOARD: "/dashboard",
  SETTINGS: "/settings",
} as const;

/**
 * API routes
 */
export const API_ROUTES = {
  AUTH: {
    REGISTER: "/api/auth/register",
    SESSION: "/api/auth/session",
  },
  V1: {
    TOKENS: "/api/v1/tokens",
    USER: "/api/v1/user",
  },
  MCP: "/api/mcp",
} as const;

/**
 * All routes combined
 */
export const ROUTES = {
  ...PUBLIC_ROUTES,
  ...PROTECTED_ROUTES,
  API: API_ROUTES,
} as const;

/**
 * Helper function to check if a route is public
 */
export function isPublicRoute(pathname: string): boolean {
  const publicRoutes = Object.values(PUBLIC_ROUTES) as string[];
  return publicRoutes.includes(pathname);
}

/**
 * Helper function to check if a route is protected
 */
export function isProtectedRoute(pathname: string): boolean {
  return Object.values(PROTECTED_ROUTES).some(route => 
    pathname.startsWith(route)
  );
}

