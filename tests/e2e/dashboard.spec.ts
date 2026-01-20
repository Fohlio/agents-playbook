import { test, expect } from '@playwright/test';
import { DashboardPage, LoginPage } from './page-objects';
import { TEST_USERS } from './utils/auth-helpers';

/**
 * Dashboard E2E Tests
 *
 * Critical tests:
 * - Dashboard page load
 * - Authentication requirement
 */

test.describe('Dashboard', () => {
  let dashboardPage: DashboardPage;
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    dashboardPage = new DashboardPage(page);
    loginPage = new LoginPage(page);

    // Login as test user
    await loginPage.goto();
    await loginPage.login(TEST_USERS.testUser.email, TEST_USERS.testUser.password);
  });

  test('should display dashboard after login', async () => {
    await dashboardPage.goto();
    expect(dashboardPage.page.url()).toContain('/dashboard');
  });

  test('should require authentication', async ({ page, context }) => {
    await context.clearCookies();
    await page.goto('/dashboard');

    // Should redirect to login
    await page.waitForURL(/\/login/, { timeout: 10000 });
    expect(page.url()).toContain('/login');
  });
});
