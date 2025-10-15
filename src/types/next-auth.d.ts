import { DefaultSession, DefaultUser } from "next-auth";
import { DefaultJWT } from "next-auth/jwt";
import type { UserTier, UserRole } from "@prisma/client";

/**
 * Module augmentation for NextAuth.js
 * Extends default types to include custom user fields (tier, role, username)
 */

declare module "next-auth" {
  /**
   * Extended Session interface
   * Adds custom user fields to the session object
   */
  interface Session extends DefaultSession {
    user: {
      id: string;
      email: string;
      username: string;
      tier: UserTier;
      role: UserRole;
    } & DefaultSession["user"];
  }

  /**
   * Extended User interface
   * Adds custom fields returned from authorize callback
   */
  interface User extends DefaultUser {
    id: string;
    email: string;
    username: string;
    tier: UserTier;
    role: UserRole;
    rememberMe?: boolean;
  }
}

declare module "next-auth/jwt" {
  /**
   * Extended JWT interface
   * Adds custom fields stored in JWT token
   */
  interface JWT extends DefaultJWT {
    id: string;
    email: string;
    username: string;
    tier: UserTier;
    role: UserRole;
    maxAge?: number;
    rememberMe?: boolean;
  }
}

