import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth/config";

/**
 * NextAuth.js API Route Handler
 * 
 * Handles all authentication routes:
 * - POST /api/auth/signin - Sign in
 * - POST /api/auth/signout - Sign out
 * - GET /api/auth/session - Get session
 * - GET /api/auth/csrf - Get CSRF token
 * - GET /api/auth/providers - Get available providers
 * 
 * NextAuth automatically handles these routes with the [...nextauth] catch-all.
 */
export const { handlers: { GET, POST } } = NextAuth(authConfig);

