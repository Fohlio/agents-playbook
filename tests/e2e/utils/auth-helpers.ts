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

/**
 * Navigate to settings page
 * Requires user to be authenticated
 */
export async function navigateToSettings(page: Page): Promise<void> {
  await page.goto('/dashboard/settings');
  await page.waitForLoadState('networkidle');
}

/**
 * Update user profile username
 * Requires user to be authenticated and on settings page
 */
export async function updateProfile(
  page: Page,
  username: string
): Promise<void> {
  const usernameInput = page.getByTestId('profile-username-input');
  const saveButton = page.getByTestId('profile-save-button');

  await usernameInput.clear();
  await usernameInput.fill(username);
  await saveButton.click();

  // Wait for success or error
  await page.waitForTimeout(2000);
}

/**
 * Change user password
 * Requires user to be authenticated and on settings page
 */
export async function changePassword(
  page: Page,
  currentPassword: string,
  newPassword: string,
  confirmPassword?: string
): Promise<void> {
  const currentInput = page.getByTestId('password-current-input');
  const newInput = page.getByTestId('password-new-input');
  const confirmInput = page.getByTestId('password-confirm-input');
  const saveButton = page.getByTestId('password-save-button');

  await currentInput.fill(currentPassword);
  await newInput.fill(newPassword);
  await confirmInput.fill(confirmPassword || newPassword);
  await saveButton.click();

  // Wait for success or error
  await page.waitForTimeout(2000);
}

/**
 * Create API token
 * Requires user to be authenticated and on settings page
 * Returns the plain token value (one-time display)
 */
export async function createApiToken(
  page: Page,
  tokenName: string
): Promise<string> {
  const createButton = page.getByTestId('create-token-button');
  await createButton.click();

  // Wait for modal
  await page.getByTestId('create-token-modal').waitFor({ state: 'visible' });

  const nameInput = page.getByTestId('token-name-input');
  const submitButton = page.getByTestId('submit-create-token-button');

  await nameInput.fill(tokenName);
  await submitButton.click();

  // Wait for token display modal
  await page.getByTestId('token-display-modal').waitFor({ state: 'visible' });

  // Get plain token
  const tokenInput = page.getByTestId('token-display-input');
  const plainToken = await tokenInput.inputValue();

  // Close modal
  const closeButton = page.getByTestId('close-token-modal-button');
  await closeButton.click();

  await page.getByTestId('token-display-modal').waitFor({ state: 'hidden' });

  return plainToken;
}

/**
 * Revoke API token by ID
 * Requires user to be authenticated and on settings page
 */
export async function revokeApiToken(
  page: Page,
  tokenId: string
): Promise<void> {
  const revokeButton = page.getByTestId(`revoke-token-button-${tokenId}`);
  await revokeButton.click();

  // Wait for confirmation modal
  await page.getByTestId('revoke-token-modal').waitFor({ state: 'visible' });

  const confirmButton = page.getByTestId('confirm-revoke-button');
  await confirmButton.click();

  await page.getByTestId('revoke-token-modal').waitFor({ state: 'hidden' });

  // Wait for success message
  await page.waitForTimeout(1000);
}

