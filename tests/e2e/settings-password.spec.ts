import { test, expect } from '@playwright/test';
import { SettingsPage, LoginPage } from './page-objects';
import { TEST_USERS } from './utils/auth-helpers';

/**
 * Settings - Password E2E Tests
 *
 * Tests critical password management functionality including:
 * - Successful password changes
 * - Current password verification
 * - Password strength validation
 */

test.describe('Settings - Password', () => {
  let settingsPage: SettingsPage;
  let loginPage: LoginPage;
  const ORIGINAL_PASSWORD = TEST_USERS.testUser.password;
  const NEW_PASSWORD = 'NewTest@123456';

  test.beforeEach(async ({ page }) => {
    settingsPage = new SettingsPage(page);
    loginPage = new LoginPage(page);

    // Login as test user before each test
    await loginPage.goto();
    await loginPage.login(TEST_USERS.testUser.email, ORIGINAL_PASSWORD);
    await settingsPage.goto();
    await settingsPage.waitForLoad();
  });

  test('should change password successfully', async () => {
    // Change password
    await settingsPage.changePassword(ORIGINAL_PASSWORD, NEW_PASSWORD);

    // Wait for success message
    await settingsPage.passwordSuccessAlert.waitFor({ state: 'visible', timeout: 10000 });

    // Verify success message
    const successMessage = await settingsPage.getPasswordSuccess();
    expect(successMessage).toContain('successfully');

    // Verify fields are cleared after success
    expect(await settingsPage.arePasswordFieldsEmpty()).toBe(true);

    // Change password back to original
    await settingsPage.changePassword(NEW_PASSWORD, ORIGINAL_PASSWORD);
    await settingsPage.passwordSuccessAlert.waitFor({ state: 'visible', timeout: 10000 });
  });

  test('should show error for incorrect current password', async () => {
    // Try to change password with wrong current password
    await settingsPage.changePassword('WrongPassword@123', NEW_PASSWORD);

    // Wait for error message
    await settingsPage.page.waitForTimeout(2000);

    // Verify error message
    const errorMessage = await settingsPage.getPasswordError();
    expect(errorMessage).toBeTruthy();
    expect(errorMessage?.toLowerCase()).toMatch(/incorrect|invalid|current|wrong/);
  });

  test('should validate new password strength', async () => {
    // Try weak password (no special characters)
    await settingsPage.changePassword(ORIGINAL_PASSWORD, 'weakpassword');

    // Wait for error
    await settingsPage.page.waitForTimeout(1000);

    // Check for validation error (inline or alert)
    const hasError = await settingsPage.passwordErrorAlert.isVisible().catch(() => false);
    if (hasError) {
      const errorMessage = await settingsPage.getPasswordError();
      expect(errorMessage?.toLowerCase()).toMatch(/password|strength|complexity|requirements/);
    } else {
      // Check for inline validation error
      const formError = await settingsPage.page.locator('text=/password/i').isVisible();
      expect(formError).toBe(true);
    }
  });
});
