import NextAuth from "next-auth";
import { middlewareAuthConfig } from "@/lib/auth/middleware-config";
import { ROUTES } from "@/shared/routes";

/**
 * NextAuth v5 Middleware for Route Protection
 * 
 * Uses Edge Runtime-safe configuration (no bcrypt/database dependencies)
 * 
 * Protects routes that require authentication:
 * - /dashboard/* - All dashboard pages
 * - /api/v1/* - All authenticated API routes
 * 
 * Unauthenticated requests are redirected to /login
 */
const { auth } = NextAuth(middlewareAuthConfig);

export default auth((req) => {
  const isAuthenticated = !!req.auth;
  const { pathname } = req.nextUrl;

  // Allow public API routes without authentication
  const isPublicApiRoute = pathname.startsWith("/api/v1/public");

  // Allow /dashboard/discover without authentication
  const isPublicDashboardRoute = pathname === "/dashboard/discover";

  // Check if accessing protected route
  const isProtectedRoute =
    (pathname.startsWith("/dashboard") && !isPublicDashboardRoute) ||
    (pathname.startsWith("/api/v1") && !isPublicApiRoute);

  // If not authenticated and trying to access protected route, redirect to login
  if (!isAuthenticated && isProtectedRoute) {
    const loginUrl = new URL(ROUTES.LOGIN, req.url);
    loginUrl.searchParams.set("callbackUrl", req.url);
    return Response.redirect(loginUrl);
  }
});

/**
 * Matcher configuration
 * Applies middleware to specific route patterns
 */
export const config = {
  matcher: [
    "/dashboard/:path*",  // Protect all dashboard routes
    "/api/v1/:path*",     // Protect authenticated API routes
  ],
};

