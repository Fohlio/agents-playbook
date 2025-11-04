import NextAuth from "next-auth";
import { authConfig } from "./config";

/**
 * NextAuth.js v5 Helper Functions
 * 
 * Exports auth utilities for use in:
 * - Server components
 * - Server actions  
 * - API routes (Node.js runtime)
 * 
 * DO NOT import in middleware (use middleware-config instead)
 */

// Use Node.js runtime for bcrypt support
export const runtime = 'nodejs';

export const { auth, signIn, signOut } = NextAuth(authConfig);

