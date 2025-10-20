import { test, expect } from '@playwright/test';
import { DashboardPage } from './page-objects';
import { LoginPage } from './page-objects';
import { TEST_USERS } from './utils/auth-helpers';

/**
 * Dashboard E2E Tests
 *
 * Tests critical dashboard functionality including:
 * - User authentication verification
 * - Navigation to settings
 * - Sign out functionality
 */

test.describe('Dashboard', () => {
  let dashboardPage: DashboardPage;
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    dashboardPage = new DashboardPage(page);
    loginPage = new LoginPage(page);

    // Login as test user before each test
    await loginPage.goto();
    await loginPage.login(TEST_USERS.testUser.email, TEST_USERS.testUser.password);
    await dashboardPage.waitForLoad();
  });

  test('should display user information after login', async () => {
    // Verify user is authenticated
    expect(await dashboardPage.isAuthenticated()).toBe(true);

    // Verify header navigation is visible
    expect(await dashboardPage.isHeaderVisible()).toBe(true);

    // Verify user display name is shown
    const displayName = await dashboardPage.getUserDisplayName();
    expect(displayName).toBeTruthy();
    expect(displayName).toContain(TEST_USERS.testUser.username);

    // Verify user tier badge is shown
    const tier = await dashboardPage.getUserTier();
    expect(tier).toBe(TEST_USERS.testUser.tier);
  });

  test('should navigate to settings page', async () => {
    // Click settings navigation link
    await dashboardPage.navigateToSettings();

    // Verify we're on settings page
    expect(dashboardPage.page.url()).toContain('/dashboard/settings');

    // Verify settings heading is visible
    const settingsHeading = dashboardPage.page.getByTestId('settings-heading');
    await expect(settingsHeading).toBeVisible();
  });

  test('should sign out successfully', async () => {
    // Sign out
    await dashboardPage.signOut();

    // Verify redirect to home page
    expect(dashboardPage.page.url()).toMatch(/\/$/);

    // Verify user is no longer authenticated by trying to access dashboard
    await dashboardPage.page.goto('/dashboard');

    // Should redirect to login
    await dashboardPage.page.waitForURL(/\/login/, { timeout: 10000 });
    expect(dashboardPage.page.url()).toContain('/login');
  });
});
