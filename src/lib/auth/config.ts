import type { NextAuthConfig } from "next-auth";
import type { UserTier, UserRole } from "@prisma/client";
import CredentialsProvider from "next-auth/providers/credentials";
import { getUserByEmail } from "@/lib/db/queries/users";
import { verifyPassword } from "@/lib/auth/password";

/**
 * NextAuth.js v5 Configuration
 * 
 * Features:
 * - JWT session strategy (no database session storage)
 * - Credentials provider for email/password authentication
 * - 30-day default session, 90-day with "Remember me"
 * - HTTP-only cookies with Secure flag in production
 * - CSRF protection via NextAuth built-in tokens
 */
export const authConfig: NextAuthConfig = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        rememberMe: { label: "Remember Me", type: "checkbox" },
      },
      async authorize(credentials) {
        // Validate input
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        const rememberMe = credentials?.rememberMe as string | boolean | undefined;

        if (!email || !password) {
          throw new Error("Invalid credentials");
        }

        // Get user from database (includes passwordHash)
        const user = await getUserByEmail(email);
        if (!user) {
          // Generic error - don't reveal if user exists
          throw new Error("Invalid credentials");
        }

        // Verify password with bcrypt
        const isValid = await verifyPassword(
          password,
          user.passwordHash
        );
        if (!isValid) {
          // Generic error - don't reveal password is wrong
          throw new Error("Invalid credentials");
        }

        // Return user data for JWT (exclude passwordHash)
        return {
          id: user.id,
          email: user.email,
          name: user.username, // NextAuth expects 'name' field
          username: user.username,
          tier: user.tier,
          role: user.role,
          rememberMe: rememberMe === "true" || rememberMe === true,
        };
      },
    }),
  ],

  // JWT session strategy (no database sessions)
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days default
  },

  // JWT and session callbacks
  callbacks: {
    async jwt({ token, user }) {
      // Add user data to JWT on sign in
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.username = user.username;
        token.tier = user.tier;
        token.role = user.role;

        // Extend session if "Remember me" was checked
        if (user.rememberMe) {
          token.maxAge = 90 * 24 * 60 * 60; // 90 days
          token.rememberMe = true;
        } else {
          token.maxAge = 30 * 24 * 60 * 60; // 30 days
          token.rememberMe = false;
        }
      }

      return token;
    },

    async session({ session, token }) {
      // Add user data to session from JWT
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.username = token.username as string;
        session.user.tier = token.tier as UserTier;
        session.user.role = token.role as UserRole;
      }

      return session;
    },
  },

  // Custom pages
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },

  // Cookie configuration
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

  // Enable debug in development
  debug: process.env.NODE_ENV === "development",
};

