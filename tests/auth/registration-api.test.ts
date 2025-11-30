/**
 * Registration API Tests
 *
 * Tests for POST /api/auth/register endpoint
 * @jest-environment node
 */

import { NextRequest } from "next/server";
import { POST } from "@/app/api/auth/register/route";
import { createUser } from "@/server/db/queries/users";
import { validatePasswordComplexity } from "@/server/auth/password";

// Mock dependencies
jest.mock("@/server/db/queries/users");
jest.mock("@/server/auth/password");

jest.mock('next/server', () => ({
  NextRequest: class NextRequest {
    method: string;
    body: any;

    constructor(url: string, init?: any) {
      this.method = init?.method || 'GET';
      this.body = init?.body;
    }

    async json() {
      return JSON.parse(this.body);
    }
  },
  NextResponse: {
    json: (data: any, init?: any) => {
      const response = {
        status: init?.status || 200,
        json: async () => data,
      };
      return response;
    },
  },
}));

const mockCreateUser = createUser as jest.MockedFunction<typeof createUser>;
const mockValidatePasswordComplexity = validatePasswordComplexity as jest.MockedFunction<
  typeof validatePasswordComplexity
>;

describe("POST /api/auth/register", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const createMockRequest = (body: any) => {
    return {
      json: async () => body,
    } as NextRequest;
  };

  describe("Validation", () => {
    it("should return 400 for invalid email format", async () => {
      const request = createMockRequest({
        email: "invalid-email",
        username: "testuser",
        password: "Password123!",
        confirmPassword: "Password123!",
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain("email");
    });

    it("should return 400 for short username (< 3 characters)", async () => {
      const request = createMockRequest({
        email: "test@example.com",
        username: "ab",
        password: "Password123!",
        confirmPassword: "Password123!",
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain("at least 3 characters");
    });

    it("should return 400 for long username (> 30 characters)", async () => {
      const request = createMockRequest({
        email: "test@example.com",
        username: "a".repeat(31),
        password: "Password123!",
        confirmPassword: "Password123!",
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain("at most 30 characters");
    });

    it("should return 400 for username with invalid characters", async () => {
      const request = createMockRequest({
        email: "test@example.com",
        username: "test user!",
        password: "Password123!",
        confirmPassword: "Password123!",
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain("letters, numbers, underscores, and hyphens");
    });

    it("should return 400 when passwords do not match", async () => {
      const request = createMockRequest({
        email: "test@example.com",
        username: "testuser",
        password: "Password123!",
        confirmPassword: "DifferentPassword123!",
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain("do not match");
    });

    it("should return 400 for weak password", async () => {
      mockValidatePasswordComplexity.mockReturnValue({
        valid: false,
        errors: ["Password must contain at least one uppercase letter"],
      });

      const request = createMockRequest({
        email: "test@example.com",
        username: "testuser",
        password: "weakpassword",
        confirmPassword: "weakpassword",
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain("uppercase");
      expect(mockValidatePasswordComplexity).toHaveBeenCalledWith("weakpassword");
    });
  });

  describe("User Creation", () => {
    beforeEach(() => {
      mockValidatePasswordComplexity.mockReturnValue({
        valid: true,
        errors: [],
      });
    });

    it("should create user with valid data", async () => {
      const mockUser = {
        id: "user-123",
        email: "test@example.com",
        username: "testuser",
        tier: "FREE" as const,
        role: "USER" as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockCreateUser.mockResolvedValue(mockUser);

      const request = createMockRequest({
        email: "test@example.com",
        username: "testuser",
        password: "Password123!",
        confirmPassword: "Password123!",
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.user).toMatchObject({
        id: "user-123",
        email: "test@example.com",
        username: "testuser",
        tier: "FREE",
        role: "USER",
      });

      expect(mockCreateUser).toHaveBeenCalledWith({
        email: "test@example.com",
        username: "testuser",
        password: "Password123!",
      });
    });

    it("should not return password hash in response", async () => {
      const mockUser = {
        id: "user-123",
        email: "test@example.com",
        username: "testuser",
        tier: "FREE" as const,
        role: "USER" as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockCreateUser.mockResolvedValue(mockUser);

      const request = createMockRequest({
        email: "test@example.com",
        username: "testuser",
        password: "Password123!",
        confirmPassword: "Password123!",
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data.user).not.toHaveProperty("passwordHash");
      expect(data.user).not.toHaveProperty("password");
    });
  });

  describe("Duplicate User Handling", () => {
    beforeEach(() => {
      mockValidatePasswordComplexity.mockReturnValue({
        valid: true,
        errors: [],
      });
    });

    it("should return 409 for duplicate email", async () => {
      const prismaError = {
        code: "P2002",
        meta: { target: ["email"] },
      };

      mockCreateUser.mockRejectedValue(prismaError);

      const request = createMockRequest({
        email: "existing@example.com",
        username: "testuser",
        password: "Password123!",
        confirmPassword: "Password123!",
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.error).toBe("Email already exists");
    });

    it("should return 409 for duplicate username", async () => {
      const prismaError = {
        code: "P2002",
        meta: { target: ["username"] },
      };

      mockCreateUser.mockRejectedValue(prismaError);

      const request = createMockRequest({
        email: "test@example.com",
        username: "existinguser",
        password: "Password123!",
        confirmPassword: "Password123!",
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.error).toBe("Username already exists");
    });
  });

  describe("Error Handling", () => {
    beforeEach(() => {
      mockValidatePasswordComplexity.mockReturnValue({
        valid: true,
        errors: [],
      });
    });

    it("should return 500 for unexpected errors", async () => {
      mockCreateUser.mockRejectedValue(new Error("Database connection failed"));

      const request = createMockRequest({
        email: "test@example.com",
        username: "testuser",
        password: "Password123!",
        confirmPassword: "Password123!",
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toContain("Registration failed");
    });
  });

  describe("Password Security", () => {
    it("should validate password complexity before creating user", async () => {
      mockValidatePasswordComplexity.mockReturnValue({
        valid: true,
        errors: [],
      });

      mockCreateUser.mockResolvedValue({
        id: "user-123",
        email: "test@example.com",
        username: "testuser",
        tier: "FREE" as const,
        role: "USER" as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const request = createMockRequest({
        email: "test@example.com",
        username: "testuser",
        password: "SecurePass123!",
        confirmPassword: "SecurePass123!",
      });

      await POST(request);

      expect(mockValidatePasswordComplexity).toHaveBeenCalledWith("SecurePass123!");
      // Password complexity validation should be called before user creation
      expect(mockCreateUser).toHaveBeenCalled();
    });

    it("should not create user if password complexity validation fails", async () => {
      mockValidatePasswordComplexity.mockReturnValue({
        valid: false,
        errors: ["Password must be at least 8 characters"],
      });

      const request = createMockRequest({
        email: "test@example.com",
        username: "testuser",
        password: "weak",
        confirmPassword: "weak",
      });

      await POST(request);

      expect(mockCreateUser).not.toHaveBeenCalled();
    });
  });

  describe("Input Sanitization", () => {
    it("should accept valid alphanumeric username with underscore", async () => {
      mockValidatePasswordComplexity.mockReturnValue({
        valid: true,
        errors: [],
      });

      mockCreateUser.mockResolvedValue({
        id: "user-123",
        email: "test@example.com",
        username: "test_user",
        tier: "FREE" as const,
        role: "USER" as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const request = createMockRequest({
        email: "test@example.com",
        username: "test_user",
        password: "Password123!",
        confirmPassword: "Password123!",
      });

      const response = await POST(request);

      expect(response.status).toBe(201);
    });

    it("should accept valid alphanumeric username with hyphen", async () => {
      mockValidatePasswordComplexity.mockReturnValue({
        valid: true,
        errors: [],
      });

      mockCreateUser.mockResolvedValue({
        id: "user-123",
        email: "test@example.com",
        username: "test-user",
        tier: "FREE" as const,
        role: "USER" as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const request = createMockRequest({
        email: "test@example.com",
        username: "test-user",
        password: "Password123!",
        confirmPassword: "Password123!",
      });

      const response = await POST(request);

      expect(response.status).toBe(201);
    });
  });
});

