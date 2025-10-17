import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

/**
 * NextAuth Middleware for Route Protection
 * 
 * Protects routes that require authentication:
 * - /dashboard/* - All dashboard pages
 * - /api/v1/* - All authenticated API routes
 * 
 * Unauthenticated requests are redirected to /auth/login
 */
export async function middleware(request: NextRequest) {
  // Get token from the request
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Check if user is authenticated
  const isAuthenticated = !!token;

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // User is authenticated, allow request to proceed
  return NextResponse.next();
}

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

