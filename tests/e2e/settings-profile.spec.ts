import { test, expect } from '@playwright/test';
import { SettingsPage, LoginPage } from './page-objects';
import { TEST_USERS, generateUniqueCredentials } from './utils/auth-helpers';

/**
 * Settings - Profile E2E Tests
 *
 * Tests critical profile management functionality including:
 * - Display of current user information
 * - Username updates
 * - Validation errors
 */

test.describe('Settings - Profile', () => {
  let settingsPage: SettingsPage;
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    settingsPage = new SettingsPage(page);
    loginPage = new LoginPage(page);

    // Login as test user before each test
    await loginPage.goto();
    await loginPage.login(TEST_USERS.testUser.email, TEST_USERS.testUser.password);
    await settingsPage.goto();
    await settingsPage.waitForLoad();
  });

  test('should display current username and email', async () => {
    // Verify profile section is visible
    expect(await settingsPage.isProfileSectionVisible()).toBe(true);

    // Verify email is displayed (read-only)
    const email = await settingsPage.getEmail();
    expect(email).toBe(TEST_USERS.testUser.email);

    // Verify email input is disabled
    await expect(settingsPage.profileEmailInput).toBeDisabled();

    // Verify username is displayed
    const username = await settingsPage.getUsername();
    expect(username).toBeTruthy();

    // Verify tier badge is displayed
    const tier = await settingsPage.getTier();
    expect(tier).toBe(TEST_USERS.testUser.tier);
  });

  test('should update username successfully', async () => {
    // Generate unique username
    const newUsername = `user_${Date.now()}`;

    // Update username
    await settingsPage.updateUsername(newUsername);

    // Wait for success message
    await settingsPage.profileSuccessAlert.waitFor({ state: 'visible', timeout: 10000 });

    // Verify success message
    const successMessage = await settingsPage.getProfileSuccess();
    expect(successMessage).toContain('successfully');

    // Verify username was updated
    const updatedUsername = await settingsPage.getUsername();
    expect(updatedUsername).toBe(newUsername);

    // Restore original username for cleanup
    await settingsPage.updateUsername(TEST_USERS.testUser.username);
    await settingsPage.profileSuccessAlert.waitFor({ state: 'visible', timeout: 10000 });
  });

  test('should show validation error for invalid username', async () => {
    // Try username with less than 3 characters
    await settingsPage.profileUsernameInput.clear();
    await settingsPage.profileUsernameInput.fill('ab');
    await settingsPage.profileSaveButton.click();

    // Verify error message appears
    await settingsPage.page.waitForTimeout(500);

    // Check for validation error (inline or alert)
    const hasError = await settingsPage.profileErrorAlert.isVisible().catch(() => false);
    if (hasError) {
      const errorMessage = await settingsPage.getProfileError();
      expect(errorMessage?.toLowerCase()).toContain('at least 3 characters');
    } else {
      // Check for inline validation error
      const formError = await settingsPage.page.locator('text=/at least 3 characters/i').isVisible();
      expect(formError).toBe(true);
    }
  });
});
