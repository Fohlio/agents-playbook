import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { createTokenSchema } from "@/lib/validators/auth";
import { generateApiToken } from "@/lib/auth/tokens";
import { prisma } from "@/lib/db/client";

/**
 * POST /api/v1/tokens
 *
 * Create a new API token
 * Requires authentication via NextAuth session
 *
 * Request Body:
 * {
 *   "name": "My MCP Token"
 * }
 *
 * Responses:
 * - 201: Token created successfully (returns plainToken ONCE)
 * - 400: Validation error
 * - 401: Unauthorized
 * - 500: Server error
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = createTokenSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const { name } = validation.data;

    // Generate token
    const { plainToken, hashedToken, expiresAt } = await generateApiToken();

    // Store in database
    const apiToken = await prisma.apiToken.create({
      data: {
        userId: session.user.id,
        name,
        tokenHash: hashedToken,
        expiresAt,
      },
      select: {
        id: true,
        name: true,
        createdAt: true,
        expiresAt: true,
      },
    });

    // Return plain token ONCE (never again)
    return NextResponse.json(
      {
        token: {
          ...apiToken,
          plainToken, // Show only on creation
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating token:", error);
    return NextResponse.json(
      { error: "Failed to create token" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/v1/tokens
 *
 * List user's API tokens
 * Requires authentication via NextAuth session
 *
 * Responses:
 * - 200: List of tokens (with masked token hashes)
 * - 401: Unauthorized
 * - 500: Server error
 */
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get user's tokens
    const tokens = await prisma.apiToken.findMany({
      where: { userId: session.user.id },
      select: {
        id: true,
        name: true,
        tokenHash: true,
        createdAt: true,
        expiresAt: true,
        lastUsedAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Mask token hashes for display
    const maskedTokens = tokens.map((token) => ({
      id: token.id,
      name: token.name,
      maskedToken: `${token.tokenHash.slice(0, 8)}...${token.tokenHash.slice(-8)}`,
      createdAt: token.createdAt,
      expiresAt: token.expiresAt,
      lastUsedAt: token.lastUsedAt,
    }));

    return NextResponse.json({ tokens: maskedTokens }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching tokens:", error);
    return NextResponse.json(
      { error: "Failed to fetch tokens" },
      { status: 500 }
    );
  }
}
