import { NextRequest, NextResponse } from "next/server";
import { registerSchema } from "@/lib/validators/auth";
import { createUser } from "@/lib/db/queries/users";
import { validatePasswordComplexity } from "@/lib/auth/password";

// Use Node.js runtime for bcrypt support
export const runtime = 'nodejs';

/**
 * POST /api/auth/register
 * 
 * Register a new user with email/password credentials
 * 
 * Request body:
 * - email: string (RFC 5322 format)
 * - username: string (3-30 chars, alphanumeric + _-)
 * - password: string (min 8 chars with complexity requirements)
 * - confirmPassword: string (must match password)
 * 
 * Response:
 * - 201: User created successfully
 * - 400: Validation error
 * - 409: Email or username already exists
 * - 500: Server error
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();

    // Validate input with Zod schema
    const validation = registerSchema.safeParse(body);
    if (!validation.success) {
      const firstError = validation.error.errors[0];
      return NextResponse.json(
        { error: firstError.message },
        { status: 400 }
      );
    }

    const { email, username, password } = validation.data;

    // Validate password complexity
    const passwordValidation = validatePasswordComplexity(password);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { error: passwordValidation.errors[0] },
        { status: 400 }
      );
    }

    // Create user (password will be hashed by createUser)
    const user = await createUser({
      email,
      username,
      password,
    });

    // Return user data (excluding password hash)
    return NextResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          tier: user.tier,
          role: user.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    // Handle Prisma unique constraint violations
    if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
      // P2002: Unique constraint failed
      const field = "meta" in error && error.meta && typeof error.meta === "object" && "target" in error.meta && Array.isArray(error.meta.target) ? error.meta.target[0] : null;
      const fieldName = field === "email" ? "Email" : "Username";
      return NextResponse.json(
        { error: `${fieldName} already exists` },
        { status: 409 }
      );
    }

    // Log error for debugging
    console.error("Registration error:", error);

    // Return generic error
    return NextResponse.json(
      { error: "Registration failed. Please try again." },
      { status: 500 }
    );
  }
}

