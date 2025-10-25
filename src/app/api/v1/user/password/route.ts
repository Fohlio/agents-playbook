import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { changePasswordSchema } from "@/lib/validators/auth";
import { getUserById, updateUserPassword } from "@/lib/db/queries/users";
import { verifyPassword, validatePasswordComplexity } from "@/lib/auth/password";

// Use Node.js runtime for bcrypt support
export const runtime = 'nodejs';

/**
 * PATCH /api/v1/user/password
 *
 * Change user password
 * Requires authentication via NextAuth session
 * Verifies current password before allowing change
 *
 * Request Body:
 * {
 *   "currentPassword": "current",
 *   "newPassword": "newpass123!",
 *   "confirmNewPassword": "newpass123!"
 * }
 *
 * Responses:
 * - 200: Password changed successfully
 * - 400: Validation error or incorrect current password
 * - 401: Unauthorized
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
    const validation = changePasswordSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const { currentPassword, newPassword } = validation.data;

    // Get user with password hash
    const user = await getUserById(session.user.id, true);
    if (!user || !user.passwordHash) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Verify current password
    const isCurrentPasswordValid = await verifyPassword(
      currentPassword,
      user.passwordHash
    );

    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 400 }
      );
    }

    // Validate new password complexity
    const passwordValidation = validatePasswordComplexity(newPassword);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { error: passwordValidation.errors[0] },
        { status: 400 }
      );
    }

    // Update password
    await updateUserPassword(session.user.id, newPassword);

    return NextResponse.json(
      { message: "Password changed successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error changing password:", error);
    return NextResponse.json(
      { error: "Failed to change password" },
      { status: 500 }
    );
  }
}
