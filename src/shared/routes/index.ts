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
  LOGIN: "/auth/login",
  REGISTER: "/auth/register",
} as const;

/**
 * Library routes (workflows under library)
 */
export const LIBRARY_ROUTES = {
  WORKFLOWS: {
    NEW: "/dashboard/library/workflows/new",
    EDIT: (id: string) => `/dashboard/library/workflows/${id}/edit`,
  },
  MINI_PROMPTS: {
    NEW: "/dashboard/library/mini-prompts/new",
    EDIT: (id: string) => `/dashboard/library/mini-prompts/${id}/edit`,
  },
} as const;

/**
 * Protected routes (authentication required)
 */
export const PROTECTED_ROUTES = {
  DASHBOARD: "/dashboard",
  SETTINGS: "/dashboard/settings",
  DISCOVER: "/dashboard/discover",
  LIBRARY: "/dashboard/library",
  GETTING_STARTED: "/dashboard/getting-started",
  DOCS: "/dashboard/docs",
} as const;

/**
 * Admin routes (require ADMIN role)
 */
export const ADMIN_ROUTES = {
  SYSTEM_WORKFLOWS: "/dashboard/admin/workflows",
  SYSTEM_MINI_PROMPTS: "/dashboard/admin/mini-prompts",
  TAGS: "/dashboard/admin/tags",
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
    MCP: "/api/v1/mcp",
  },
} as const;

/**
 * All routes combined
 */
export const ROUTES = {
  ...PUBLIC_ROUTES,
  ...PROTECTED_ROUTES,
  LIBRARY: LIBRARY_ROUTES,
  ADMIN: ADMIN_ROUTES,
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

