import type { NextAuthConfig } from "next-auth";
import { ROUTES } from "@/shared/routes";

/**
 * NextAuth Middleware Configuration (Edge Runtime Safe)
 * 
 * This is a minimal config for middleware that doesn't include:
 * - Credentials provider (requires bcrypt which doesn't work in Edge Runtime)
 * - Database queries
 * 
 * IMPORTANT: Must use the same AUTH_SECRET as the main auth config
 * 
 * For the full auth configuration with providers, see src/lib/auth/config.ts
 */
export const middlewareAuthConfig: NextAuthConfig = {
  // CRITICAL: Use the same secret as the main auth config for JWT validation
  secret: process.env.AUTH_SECRET,
  
  // No providers - middleware only validates existing sessions
  providers: [],

  // JWT session strategy (no database sessions)
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days default
  },

  // Custom pages
  pages: {
    signIn: ROUTES.LOGIN,
    error: ROUTES.LOGIN,
  },

  // Cookie configuration - MUST match main auth config
  cookies: {
    sessionToken: {
      name: "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },

  // Callbacks for session handling
  callbacks: {
    async jwt({ token }) {
      // Middleware only needs to validate tokens, not create them
      return token;
    },
    async session({ session, token }) {
      // Pass through session data from token
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.username = token.username as string;
        session.user.tier = token.tier as any;
        session.user.role = token.role as any;
      }
      return session;
    },
  },
};

