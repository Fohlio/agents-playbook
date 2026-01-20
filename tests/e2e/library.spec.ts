import { test, expect } from '@playwright/test';
import { LibraryPage, LoginPage } from './page-objects';
import { TEST_USERS } from './utils/auth-helpers';

/**
 * Library E2E Tests
 *
 * Critical tests:
 * - Page load and layout
 * - Search functionality
 * - Authentication requirement
 */

test.describe('Library', () => {
  let libraryPage: LibraryPage;
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    libraryPage = new LibraryPage(page);
    loginPage = new LoginPage(page);

    // Login as test user before each test
    await loginPage.goto();
    await loginPage.login(TEST_USERS.testUser.email, TEST_USERS.testUser.password);

    // Navigate to library
    await libraryPage.goto();
    await libraryPage.waitForLoad();
  });

  test('should display library layout after navigation', async () => {
    expect(await libraryPage.isLoaded()).toBe(true);
    expect(libraryPage.page.url()).toContain('/dashboard/library');
  });

  test('should display header with search', async () => {
    await expect(libraryPage.libraryHeader).toBeVisible();
    await expect(libraryPage.searchInput).toBeVisible();
  });

  test('should allow entering search query', async () => {
    const searchQuery = 'test workflow';
    await libraryPage.search(searchQuery);
    await expect(libraryPage.searchInput).toHaveValue(searchQuery);
  });

  test('should display content area', async () => {
    await expect(libraryPage.libraryLayout).toBeVisible();
  });
});

test.describe('Library - Unauthenticated', () => {
  test('should redirect to login when not authenticated', async ({ page }) => {
    await page.goto('/dashboard/library');
    await page.waitForURL(/\/login/, { timeout: 10000 });
    expect(page.url()).toContain('/login');
  });
});
