import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { updateUsernameSchema } from "@/lib/validators/auth";
import { updateUser } from "@/lib/db/queries/users";

// Use Node.js runtime for database operations
export const runtime = 'nodejs';

/**
 * PATCH /api/v1/user/profile
 *
 * Update user profile (username)
 * Requires authentication via NextAuth session
 *
 * Request Body:
 * {
 *   "username": "newusername"
 * }
 *
 * Responses:
 * - 200: Profile updated successfully
 * - 400: Validation error
 * - 401: Unauthorized
 * - 409: Username already taken
 * - 500: Server error
 */
export async function PATCH(request: NextRequest) {
  try {
    // Verify authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = updateUsernameSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const { username } = validation.data;

    // Update user in database
    const updatedUser = await updateUser(session.user.id, { username });

    return NextResponse.json(
      {
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          username: updatedUser.username,
          tier: updatedUser.tier,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    // Handle unique constraint violations (duplicate username)
    if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
      return NextResponse.json(
        { error: "Username already taken" },
        { status: 409 }
      );
    }

    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
