import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { headers } from 'next/headers';
import { prisma } from '@/lib/db/client';
import { verifyApiToken, isTokenExpired } from '@/lib/auth/tokens';
import { AsyncLocalStorage } from 'async_hooks';

// AsyncLocalStorage to pass userId through async call stack
export const userIdStorage = new AsyncLocalStorage<string | null>();

/**
 * Get userId from either session auth or API token auth
 * Returns userId if authenticated, null otherwise
 */
export async function getUserId(): Promise<string | null> {
  // First check if userId is in async local storage (set by request wrapper)
  const storedUserId = userIdStorage.getStore();
  if (storedUserId !== undefined) {
    return storedUserId;
  }

  // Try session auth
  const session = await auth();
  if (session?.user?.id) {
    return session.user.id;
  }

  // Try API token auth from Authorization header
  try {
    const headersList = await headers();
    const authHeader = headersList.get('authorization');
    
    if (authHeader) {
      const parts = authHeader.split(' ');
      if (parts.length === 2 && parts[0] === 'Bearer') {
        const plainToken = parts[1];
        
        // Find matching token in database
        const apiTokens = await prisma.apiToken.findMany({
          where: {
            expiresAt: { gte: new Date() },
          },
          select: {
            id: true,
            userId: true,
            tokenHash: true,
            expiresAt: true,
          },
        });

        // Verify token against hashes
        for (const tokenRecord of apiTokens) {
          const isValid = await verifyApiToken(plainToken, tokenRecord.tokenHash);

          if (isValid && !isTokenExpired(tokenRecord.expiresAt)) {
            // Update last used timestamp (fire and forget)
            prisma.apiToken
              .update({
                where: { id: tokenRecord.id },
                data: { lastUsedAt: new Date() },
              })
              .catch((err) => console.error('Failed to update lastUsedAt:', err));

            return tokenRecord.userId;
          }
        }
      }
    }
  } catch (error) {
    // Silently fail if headers() is not available or token validation fails
    console.error('[MCP] Error checking API token:', error);
  }

  return null;
}

/**
 * Extract userId from request and store in async context
 */
export async function extractUserIdFromRequest(request: NextRequest): Promise<string | null> {
  // Try session auth first
  const session = await auth();
  if (session?.user?.id) {
    console.log(`[MCP] Session auth found, userId: ${session.user.id}`);
    return session.user.id;
  }

  // Try API token auth from Authorization header
  const authHeader = request.headers.get('authorization');
  console.log(`[MCP] Authorization header: ${authHeader ? `present (${authHeader.substring(0, 20)}...)` : 'missing'}`);
  
  if (authHeader) {
    const parts = authHeader.split(' ');
    if (parts.length === 2 && parts[0] === 'Bearer') {
      const plainToken = parts[1];
      console.log(`[MCP] Bearer token extracted, length: ${plainToken.length}`);
      
      // Find matching token in database
      const apiTokens = await prisma.apiToken.findMany({
        where: {
          expiresAt: { gte: new Date() },
        },
        select: {
          id: true,
          userId: true,
          tokenHash: true,
          expiresAt: true,
        },
      });

      console.log(`[MCP] Found ${apiTokens.length} non-expired tokens in database`);

      // Verify token against hashes
      for (const tokenRecord of apiTokens) {
        const isValid = await verifyApiToken(plainToken, tokenRecord.tokenHash);
        console.log(`[MCP] Token validation attempt - isValid: ${isValid}, userId: ${tokenRecord.userId}`);

        if (isValid && !isTokenExpired(tokenRecord.expiresAt)) {
          // Update last used timestamp (fire and forget)
          prisma.apiToken
            .update({
              where: { id: tokenRecord.id },
              data: { lastUsedAt: new Date() },
            })
            .catch((err) => console.error('Failed to update lastUsedAt:', err));

          console.log(`[MCP] ✅ API token authenticated successfully for userId: ${tokenRecord.userId}`);
          return tokenRecord.userId;
        }
      }
      
      console.log(`[MCP] ❌ No matching token found after checking ${apiTokens.length} tokens`);
    } else {
      console.log(`[MCP] Invalid Authorization header format: ${authHeader.substring(0, 30)}...`);
    }
  }

  return null;
}

