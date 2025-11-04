# BCrypt and Edge Runtime Solution

## Problem Overview

When building a Next.js application with NextAuth v5 and bcrypt for password hashing, you may encounter errors when running middleware in Edge Runtime:

```
ReferenceError: bcrypt is not defined
Module not found: Can't resolve 'aws-sdk'
Module not found: Can't resolve 'mock-aws-s3'
Module not found: Can't resolve 'nock'
```

**Root Cause:** Middleware runs in Edge Runtime, which is a lightweight JavaScript runtime that doesn't support native Node.js modules like `bcrypt`. When middleware imports NextAuth configuration that includes a Credentials provider with bcrypt-based password verification, it fails.

## Architecture Solution

The solution is to **separate authentication configurations** based on runtime requirements:

```
┌─────────────────────────────────────────────────┐
│ Middleware (Edge Runtime)                       │
│ - Uses middlewareAuthConfig                     │
│ - Validates JWT sessions ONLY                   │
│ - NO bcrypt dependency                          │
│ - NO database queries                           │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ API Routes (Node.js Runtime)                    │
│ - Use full authConfig                           │
│ - Credentials provider with bcrypt              │
│ - Database operations                           │
│ - Password hashing/verification                 │
└─────────────────────────────────────────────────┘
```

## Implementation

### 1. Create Edge Runtime-Safe Config

**File:** `src/lib/auth/middleware-config.ts`

```typescript
import type { NextAuthConfig } from "next-auth";
import { ROUTES } from "@/shared/routes";

/**
 * NextAuth Middleware Configuration (Edge Runtime Safe)
 * 
 * This is a minimal config for middleware that doesn't include:
 * - Credentials provider (requires bcrypt which doesn't work in Edge Runtime)
 * - Database queries
 */
export const middlewareAuthConfig: NextAuthConfig = {
  // No providers - middleware only validates existing sessions
  providers: [],

  // JWT session strategy (no database sessions)
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  // Custom pages
  pages: {
    signIn: ROUTES.LOGIN,
    error: ROUTES.LOGIN,
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

  // Callbacks for session handling
  callbacks: {
    async jwt({ token }) {
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        // ... other fields
      }
      return session;
    },
  },
};
```

### 2. Update Middleware

**File:** `src/middleware.ts`

```typescript
import NextAuth from "next-auth";
import { middlewareAuthConfig } from "@/lib/auth/middleware-config";
import { ROUTES } from "@/shared/routes";

// Create Edge Runtime-safe auth instance
const { auth } = NextAuth(middlewareAuthConfig);

export default auth((req) => {
  const isAuthenticated = !!req.auth;
  const { pathname } = req.nextUrl;

  const isProtectedRoute = 
    pathname.startsWith("/dashboard") || 
    pathname.startsWith("/api/v1");

  if (!isAuthenticated && isProtectedRoute) {
    const loginUrl = new URL(ROUTES.LOGIN, req.url);
    loginUrl.searchParams.set("callbackUrl", req.url);
    return Response.redirect(loginUrl);
  }
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/api/v1/:path*",
  ],
};
```

### 3. Keep Full Config for API Routes

**File:** `src/lib/auth/config.ts` (with Credentials provider)

```typescript
import type { NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { verifyPassword } from "@/lib/auth/password"; // Uses bcrypt

export const authConfig: NextAuthConfig = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Password verification with bcrypt
        const isValid = await verifyPassword(
          credentials.password,
          user.passwordHash
        );
        // ... rest of logic
      },
    }),
  ],
  // ... rest of config
};
```

### 4. Mark API Routes with Node.js Runtime

**All routes that use bcrypt must explicitly use Node.js runtime:**

```typescript
// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth/config";

// Force Node.js runtime for bcrypt support
export const runtime = 'nodejs';

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
export const { GET, POST } = handlers;
```

Apply this to all routes that use bcrypt:
- `/api/auth/[...nextauth]/route.ts`
- `/api/auth/register/route.ts`
- `/api/v1/user/password/route.ts`
- Any other routes using password functions

### 5. Configure Webpack (next.config.ts)

```typescript
const nextConfig: NextConfig = {
  webpack: (config, { isServer, nextRuntime }) => {
    // Externalize native modules
    if (isServer || nextRuntime === 'edge') {
      if (Array.isArray(config.externals)) {
        config.externals.push('bcrypt', '@mapbox/node-pre-gyp');
      }
    }
    
    // Ignore optional dependencies
    config.resolve.fallback = {
      ...config.resolve.fallback,
      'aws-sdk': false,
      'mock-aws-s3': false,
      'nock': false,
    };
    
    // Suppress warnings
    config.ignoreWarnings = [
      ...(config.ignoreWarnings || []),
      /Can't resolve 'aws-sdk'/,
      /Can't resolve 'mock-aws-s3'/,
      /Can't resolve 'nock'/,
    ];
    
    return config;
  },
};
```

### 6. Fix Prisma Client for Edge Runtime

**File:** `src/lib/db/client.ts`

```typescript
import { PrismaClient } from '@prisma/client';

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

// Graceful shutdown handlers (only in Node.js runtime)
if (typeof process !== 'undefined' && 
    typeof process.on === 'function' && 
    typeof process.exit === 'function') {
  process.on('SIGTERM', async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
  // ... other handlers
}
```

## Key Principles

1. **Middleware = Session Validation Only**
   - Only checks if a valid JWT token exists
   - No authentication logic
   - No bcrypt, no database queries
   - Uses Edge Runtime for fast startup

2. **API Routes = Full Authentication**
   - Handle login, registration, password changes
   - Use bcrypt for password hashing/verification
   - Run in Node.js runtime
   - Can access native modules and database

3. **Separation of Concerns**
   - Middleware: Lightweight authorization check
   - API Routes: Heavy authentication operations

## Benefits

✅ **Fast middleware** - Edge Runtime starts instantly  
✅ **Secure authentication** - bcrypt still used for passwords in API routes  
✅ **Clean architecture** - Clear separation between validation and authentication  
✅ **No native module errors** - Each component uses appropriate runtime  

## Common Pitfalls to Avoid

❌ **Don't** import bcrypt (directly or indirectly) in middleware  
❌ **Don't** use database queries in middleware  
❌ **Don't** share auth instances between middleware and API routes  
❌ **Don't** forget to set `export const runtime = 'nodejs'` in API routes using bcrypt  

## Testing

After implementing these changes:

1. Clear the build cache: `rm -rf .next`
2. Start dev server: `npm run dev`
3. Test authentication flow:
   - Register new user → Should work
   - Login → Should work
   - Access protected route → Middleware should validate session
   - Change password → Should work with bcrypt

## References

- [Next.js Edge Runtime](https://nextjs.org/docs/app/building-your-application/rendering/edge-and-nodejs-runtimes)
- [NextAuth.js v5 Documentation](https://authjs.dev/getting-started/introduction)
- [Middleware Best Practices](https://nextjs.org/docs/app/building-your-application/routing/middleware)

