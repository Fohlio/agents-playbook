import { test, expect } from '@playwright/test';
import { RegisterPage } from './page-objects/RegisterPage';
import { generateUniqueCredentials } from './utils/auth-helpers';

/**
 * E2E Tests for User Registration
 *
 * Critical tests only:
 * - Registration form display
 * - Successful registration with valid credentials
 */

test.describe('User Registration', () => {
  let registerPage: RegisterPage;

  test.beforeEach(async ({ page }) => {
    registerPage = new RegisterPage(page);
    await registerPage.goto();
  });

  test('should display registration form with all required fields', async () => {
    await expect(registerPage.emailInput).toBeVisible();
    await expect(registerPage.usernameInput).toBeVisible();
    await expect(registerPage.passwordInput).toBeVisible();
    await expect(registerPage.confirmPasswordInput).toBeVisible();
    await expect(registerPage.submitButton).toBeVisible();
  });

  test('should successfully register with valid credentials', async ({ page }) => {
    const credentials = generateUniqueCredentials();

    await registerPage.register(
      credentials.email,
      credentials.username,
      credentials.password
    );

    // Should redirect to dashboard after auto-login
    await page.waitForURL(/\/dashboard/, { timeout: 20000 });
    expect(page.url()).toContain('/dashboard');
  });
});
