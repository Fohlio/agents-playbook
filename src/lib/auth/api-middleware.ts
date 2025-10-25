import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { verifyApiToken, isTokenExpired } from "./tokens";

/**
 * API Authentication Result
 */
export type AuthResult =
  | { success: true; userId: string }
  | { success: false; response: NextResponse };

/**
 * Authenticate API Token Middleware
 *
 * Verifies Bearer token from Authorization header
 * Used for /api/v1/* endpoints that require API token authentication
 *
 * @param request - NextRequest object
 * @returns AuthResult - Success with userId or error response
 *
 * Flow:
 * 1. Extract Authorization header
 * 2. Validate Bearer token format
 * 3. Query non-expired tokens from database
 * 4. Verify token against stored hashes
 * 5. Check expiration
 * 6. Update lastUsedAt timestamp
 * 7. Return userId for authenticated request
 */
export async function authenticateApiToken(
  request: NextRequest
): Promise<AuthResult> {
  // Extract Authorization header
  const authHeader = request.headers.get("authorization");
  if (!authHeader) {
    return {
      success: false,
      response: NextResponse.json(
        { error: "Missing authorization header" },
        { status: 401 }
      ),
    };
  }

  // Validate Bearer token format
  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return {
      success: false,
      response: NextResponse.json(
        { error: "Invalid token format. Use: Bearer <token>" },
        { status: 401 }
      ),
    };
  }

  const plainToken = parts[1];

  try {
    // Find matching token in database
    // Only query non-expired tokens for efficiency
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

      if (isValid) {
        // Double-check expiration (belt and suspenders)
        if (isTokenExpired(tokenRecord.expiresAt)) {
          return {
            success: false,
            response: NextResponse.json(
              { error: "Token expired" },
              { status: 401 }
            ),
          };
        }

        // Update last used timestamp (fire and forget)
        prisma.apiToken
          .update({
            where: { id: tokenRecord.id },
            data: { lastUsedAt: new Date() },
          })
          .catch((err) => console.error("Failed to update lastUsedAt:", err));

        // Return success with userId
        return {
          success: true,
          userId: tokenRecord.userId,
        };
      }
    }

    // No matching token found
    return {
      success: false,
      response: NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      ),
    };
  } catch (error) {
    console.error("Error authenticating API token:", error);
    return {
      success: false,
      response: NextResponse.json(
        { error: "Authentication failed" },
        { status: 500 }
      ),
    };
  }
}
