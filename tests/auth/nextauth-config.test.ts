/// <reference types="jest" />

/**
 * NextAuth Configuration Tests
 * 
 * Tests for JWT session creation, callbacks, and authentication flow
 */

// Note: We test the configuration object directly, not the full NextAuth integration
// Full integration tests would require a running Next.js server

import type { NextAuthConfig } from "next-auth";

describe("NextAuth Configuration", () => {
  // Import config within test to avoid module issues
  let authOptions: NextAuthConfig;

  beforeAll(async () => {
    // Mock next-auth modules before importing
    jest.mock("next-auth/providers/credentials", () => ({
      __esModule: true,
      default: jest.fn((config: Record<string, unknown>) => ({
        ...config,
        type: "credentials",
        name: "credentials",
      })),
    }));

    // Mock dependencies
    jest.mock("@/lib/db/queries/users");
    jest.mock("@/lib/auth/password");

    // Import after mocks are set up
    const configModule = await import("@/lib/auth/config");
    authOptions = configModule.authConfig;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Session Configuration", () => {
    it("should use JWT session strategy", () => {
      expect(authOptions.session?.strategy).toBe("jwt");
    });

    it("should set default session maxAge to 30 days", () => {
      const thirtyDaysInSeconds = 30 * 24 * 60 * 60;
      expect(authOptions.session?.maxAge).toBe(thirtyDaysInSeconds);
    });
  });

  describe("JWT Callback", () => {
    it("should add user data to JWT token on sign in", async () => {
      const mockUser = {
        id: "user-123",
        email: "test@example.com",
        username: "testuser",
        tier: "FREE" as const,
        role: "USER" as const,
        rememberMe: false,
      };

      const mockToken = {} as any;
      
      const result = await authOptions.callbacks?.jwt?.({
        token: mockToken,
        user: mockUser as any,
        trigger: "signIn",
        session: undefined,
        account: undefined,
      });

      expect(result).toMatchObject({
        id: "user-123",
        email: "test@example.com",
        username: "testuser",
        tier: "FREE",
        role: "USER",
        maxAge: 30 * 24 * 60 * 60, // 30 days
      });
    });

    it("should set 90-day maxAge when rememberMe is true", async () => {
      const mockUser = {
        id: "user-123",
        email: "test@example.com",
        username: "testuser",
        tier: "FREE" as const,
        role: "USER" as const,
        rememberMe: true,
      };

      const mockToken = {} as any;
      
      const result = await authOptions.callbacks?.jwt?.({
        token: mockToken,
        user: mockUser as any,
        trigger: "signIn",
        session: undefined,
        account: undefined,
      });

      expect(result?.maxAge).toBe(90 * 24 * 60 * 60); // 90 days
      expect(result?.rememberMe).toBe(true);
    });

    it("should preserve existing token data when user is undefined", async () => {
      const mockToken = {
        id: "user-123",
        email: "test@example.com",
        username: "testuser",
        tier: "FREE",
        role: "USER",
      } as any;

      const result = await authOptions.callbacks?.jwt?.({
        token: mockToken,
        user: undefined as any,
        trigger: "update",
        session: undefined,
        account: undefined,
      });

      expect(result).toEqual(mockToken);
    });
  });

  describe("Session Callback", () => {
    it("should add user data from JWT to session", async () => {
      const mockToken = {
        id: "user-123",
        email: "test@example.com",
        username: "testuser",
        tier: "FREE",
        role: "USER",
      } as any;

      const mockSession = {
        user: {},
        expires: new Date().toISOString(),
      } as any;

      const result = await authOptions.callbacks?.session?.({
        session: mockSession,
        token: mockToken,
        user: undefined as any,
        newSession: undefined,
        trigger: "update",
      });

      expect(result?.user).toMatchObject({
        id: "user-123",
        email: "test@example.com",
        username: "testuser",
        tier: "FREE",
        role: "USER",
      });
    });
  });

  describe("Custom Pages", () => {
    it("should configure custom sign-in page", () => {
      expect(authOptions.pages?.signIn).toBe("/auth/login");
    });

    it("should configure custom error page", () => {
      expect(authOptions.pages?.error).toBe("/auth/error");
    });
  });

  describe("Cookie Configuration", () => {
    it("should configure HTTP-only session token cookie", () => {
      expect(authOptions.cookies?.sessionToken?.options?.httpOnly).toBe(true);
    });

    it("should set SameSite to lax", () => {
      expect(authOptions.cookies?.sessionToken?.options?.sameSite).toBe("lax");
    });

    it("should set path to root", () => {
      expect(authOptions.cookies?.sessionToken?.options?.path).toBe("/");
    });

    it("should set secure flag based on environment", () => {
      // In test environment, it should match NODE_ENV === "production"
      const expected = process.env.NODE_ENV === "production";
      expect(authOptions.cookies?.sessionToken?.options?.secure).toBe(expected);
    });
  });

  describe("Debug Mode", () => {
    it("should enable debug in development", () => {
      const expected = process.env.NODE_ENV === "development";
      expect(authOptions.debug).toBe(expected);
    });
  });
});
