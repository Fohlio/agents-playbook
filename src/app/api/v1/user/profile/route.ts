import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { updateUsernameSchema } from "@/lib/validators/auth";
import { updateUser } from "@/lib/db/queries/users";

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
    const session = await getServerSession(authOptions);
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
  } catch (error: any) {
    // Handle unique constraint violations (duplicate username)
    if (error.code === "P2002") {
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
