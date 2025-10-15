import { Page } from '@playwright/test';

/**
 * Authentication Test Helpers
 * 
 * Common utilities for E2E authentication tests
 */

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export const TEST_USERS = {
  admin: {
    email: 'admin@agents-playbook.com',
    password: 'Admin@123456',
    username: 'admin',
    tier: 'PREMIUM',
    role: 'ADMIN',
  },
  testUser: {
    email: 'test@agents-playbook.com',
    password: 'Test@123456',
    username: 'testuser',
    tier: 'FREE',
    role: 'USER',
  },
} as const;

/**
 * Login helper function
 * Navigates to login page and submits credentials
 */
export async function loginUser(
  page: Page,
  credentials: LoginCredentials
): Promise<void> {
  await page.goto('/auth/login');
  
  await page.getByLabel(/email/i).fill(credentials.email);
  await page.getByLabel(/password/i).fill(credentials.password);
  
  if (credentials.rememberMe) {
    await page.getByLabel(/remember me/i).check();
  }
  
  await page.getByRole('button', { name: /sign in/i }).click();
}

/**
 * Register helper function
 * Navigates to registration page and submits new user data
 */
export async function registerUser(
  page: Page,
  data: {
    email: string;
    username: string;
    password: string;
    confirmPassword?: string;
  }
): Promise<void> {
  await page.goto('/auth/register');
  
  await page.getByLabel(/email/i).fill(data.email);
  await page.getByLabel(/username/i).fill(data.username);
  await page.getByLabel(/^password$/i).fill(data.password);
  await page.getByLabel(/confirm password/i).fill(data.confirmPassword || data.password);
  
  await page.getByRole('button', { name: /create account/i }).click();
}

/**
 * Logout helper function
 * Finds and clicks the logout button
 */
export async function logoutUser(page: Page): Promise<void> {
  const logoutButton = page.getByRole('button', { name: /logout|sign out/i });
  await logoutButton.click();
}

/**
 * Generate unique test credentials
 * Useful for tests that need unique user data
 */
export function generateUniqueCredentials(): {
  email: string;
  username: string;
  password: string;
} {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);
  
  return {
    email: `test-${timestamp}-${random}@example.com`,
    username: `user${timestamp}${random}`,
    password: 'Test@123456',
  };
}

/**
 * Wait for authentication to complete
 * Useful for tests that need to verify login/logout state
 */
export async function waitForAuthentication(
  page: Page,
  authenticated: boolean = true
): Promise<void> {
  if (authenticated) {
    // Wait for redirect to dashboard or authenticated route
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
  } else {
    // Wait for redirect to login or public route
    await page.waitForURL(/\/(auth\/login)?$/, { timeout: 10000 });
  }
}

/**
 * Clear all sessions and cookies
 * Useful for tests that need a clean state
 */
export async function clearSession(page: Page): Promise<void> {
  await page.context().clearCookies();
  await page.context().clearPermissions();
}

