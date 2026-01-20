import { test, expect } from '@playwright/test';
import { LoginPage } from './page-objects/LoginPage';
import { TEST_USERS } from './utils/auth-helpers';

/**
 * E2E Tests for User Login Flow
 *
 * Critical tests only:
 * - Login form display
 * - Successful login with valid credentials
 * - Protected route access
 */

test.describe('User Login', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page, context }) => {
    await context.clearCookies();
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test('should display login form with all required fields', async () => {
    await expect(loginPage.emailInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.submitButton).toBeVisible();
  });

  test('should successfully login with valid credentials', async ({ page }) => {
    await loginPage.login(TEST_USERS.testUser.email, TEST_USERS.testUser.password);

    // Wait for redirect to dashboard
    await page.waitForURL(/\/dashboard/, { timeout: 15000 });
    expect(page.url()).toContain('/dashboard');
  });

  test('should protect dashboard route and redirect to login', async ({ page, context }) => {
    await context.clearCookies();
    await page.goto('/dashboard');

    // Should redirect to login
    await page.waitForURL(/\/login/, { timeout: 10000 });
    expect(page.url()).toContain('/login');
  });
});
