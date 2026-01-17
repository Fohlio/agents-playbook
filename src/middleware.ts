import createMiddleware from 'next-intl/middleware';
import NextAuth from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { middlewareAuthConfig } from "@/server/auth/middleware-config";
import { routing } from "@/i18n/routing";
import { ROUTES } from "@/shared/routes";

/**
 * Middleware Composition: next-intl + NextAuth v5
 * 
 * 1. next-intl handles locale detection and routing
 * 2. NextAuth handles route protection
 */

// Create next-intl middleware
const intlMiddleware = createMiddleware(routing);

// Create NextAuth middleware
const { auth } = NextAuth(middlewareAuthConfig);

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip i18n for API routes
  if (pathname.startsWith('/api')) {
    // Check auth for protected API routes
    const isPublicApiRoute = pathname.startsWith("/api/v1/public");
    const isMcpRoute = pathname === "/api/v1/mcp";
    const isAuthRoute = pathname.startsWith("/api/auth");
    
    if (!isPublicApiRoute && !isMcpRoute && !isAuthRoute && pathname.startsWith("/api/v1")) {
      const session = await auth();
      if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }
    
    return NextResponse.next();
  }

  // Run i18n middleware for all other routes
  const response = intlMiddleware(request);

  // Check if this is a protected route that needs auth
  // Note: pathname here is the original, before locale prefix is stripped
  const localePattern = /^\/(en|ru)(\/|$)/;
  const pathWithoutLocale = pathname.replace(localePattern, '/');
  
  const isPublicDashboardRoute = pathWithoutLocale === "/dashboard/discover" || 
                                  pathWithoutLocale.startsWith("/dashboard/discover/");
  
  const isProtectedRoute = pathWithoutLocale.startsWith("/dashboard") && !isPublicDashboardRoute;

  if (isProtectedRoute) {
    const session = await auth();
    if (!session?.user) {
      const loginUrl = new URL(ROUTES.LOGIN, request.url);
      loginUrl.searchParams.set("callbackUrl", request.url);
      return Response.redirect(loginUrl);
    }
  }

  return response;
}

export const config = {
  // Match all pathnames except for
  // - ... if they start with `/_next` or `/_vercel`
  // - ... the ones containing a dot (e.g. `favicon.ico`)
  matcher: ['/((?!_next|_vercel|.*\\..*).*)']
};
