import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { prisma } from "@/lib/db/client";

/**
 * DELETE /api/v1/tokens/:id
 *
 * Revoke an API token
 * Requires authentication via NextAuth session
 * User can only delete their own tokens
 *
 * Responses:
 * - 200: Token revoked successfully
 * - 401: Unauthorized
 * - 404: Token not found or doesn't belong to user
 * - 500: Server error
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Verify token belongs to user before deletion
    const token = await prisma.apiToken.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!token) {
      return NextResponse.json(
        { error: "Token not found" },
        { status: 404 }
      );
    }

    // Delete token
    await prisma.apiToken.delete({
      where: { id: params.id },
    });

    return NextResponse.json(
      { message: "Token revoked successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error revoking token:", error);
    return NextResponse.json(
      { error: "Failed to revoke token" },
      { status: 500 }
    );
  }
}
