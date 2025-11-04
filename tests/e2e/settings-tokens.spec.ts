import { test, expect } from '@playwright/test';
import { SettingsPage, LoginPage } from './page-objects';
import { TEST_USERS } from './utils/auth-helpers';

/**
 * Settings - API Tokens E2E Tests
 *
 * Tests critical API token management functionality including:
 * - Token creation with one-time display
 * - Token listing
 * - Token revocation
 */

test.describe('Settings - API Tokens', () => {
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

  test('should create new API token', async () => {
    const tokenName = `test-token-${Date.now()}`;

    // Create token
    const plainToken = await settingsPage.createToken(tokenName);

    // Verify token display modal is visible
    await expect(settingsPage.tokenDisplayModal).toBeVisible();

    // Verify warning message
    await expect(settingsPage.tokenDisplayWarning).toBeVisible();
    const warningText = await settingsPage.tokenDisplayWarning.textContent();
    expect(warningText?.toLowerCase()).toContain('copy');
    expect(warningText?.toLowerCase()).toContain("won't be able to see it again");

    // Verify plain token is displayed
    expect(plainToken).toBeTruthy();
    expect(plainToken.length).toBeGreaterThan(20);

    // Close modal
    await settingsPage.closeTokenDisplayModal();

    // Verify modal is closed
    await expect(settingsPage.tokenDisplayModal).not.toBeVisible();

    // Verify token appears in list
    expect(await settingsPage.hasTokenWithName(tokenName)).toBe(true);

    // Cleanup: revoke the token
    const tokenCount = await settingsPage.getTokenCount();
    if (tokenCount > 0) {
      // Find and revoke the token we just created
      const tokenItems = await settingsPage.page.locator('[data-testid^="token-item-"]').all();
      for (const item of tokenItems) {
        const nameElement = item.locator('[data-testid^="token-name-"]');
        const name = await nameElement.textContent();
        if (name === tokenName) {
          const tokenId = (await item.getAttribute('data-testid'))?.replace('token-item-', '');
          if (tokenId) {
            await settingsPage.revokeToken(tokenId);
            break;
          }
        }
      }
    }
  });

  test('should display token only once', async () => {
    const tokenName = `onetime-token-${Date.now()}`;

    // Create token
    await settingsPage.createToken(tokenName);

    // Close modal
    await settingsPage.closeTokenDisplayModal();

    // Try to find the token in the list
    const tokenItems = await settingsPage.page.locator('[data-testid^="token-item-"]').all();
    let foundToken = false;
    let tokenId: string | null = null;

    for (const item of tokenItems) {
      const nameElement = item.locator('[data-testid^="token-name-"]');
      const name = await nameElement.textContent();
      if (name === tokenName) {
        foundToken = true;
        tokenId = (await item.getAttribute('data-testid'))?.replace('token-item-', '') || null;

        // Verify masked token is displayed (not plain token)
        const maskedElement = item.locator('[data-testid^="token-masked-"]');
        const maskedToken = await maskedElement.textContent();
        expect(maskedToken).toContain('***');
        expect(maskedToken).not.toContain('Bearer ');
        break;
      }
    }

    expect(foundToken).toBe(true);

    // Cleanup
    if (tokenId) {
      await settingsPage.revokeToken(tokenId);
    }
  });

  test('should list all user tokens', async () => {
    // Create multiple tokens
    const tokenNames = [
      `list-token-1-${Date.now()}`,
      `list-token-2-${Date.now()}`,
    ];

    const createdTokenIds: string[] = [];

    for (const name of tokenNames) {
      await settingsPage.completeTokenCreation(name);
      await settingsPage.page.waitForTimeout(500);
    }

    // Verify all tokens are in the list
    for (const name of tokenNames) {
      expect(await settingsPage.hasTokenWithName(name)).toBe(true);
    }

    // Verify token count increased
    const tokenCount = await settingsPage.getTokenCount();
    expect(tokenCount).toBeGreaterThanOrEqual(tokenNames.length);

    // Cleanup: revoke created tokens
    const tokenItems = await settingsPage.page.locator('[data-testid^="token-item-"]').all();
    for (const item of tokenItems) {
      const nameElement = item.locator('[data-testid^="token-name-"]');
      const name = await nameElement.textContent();
      if (tokenNames.includes(name || '')) {
        const tokenId = (await item.getAttribute('data-testid'))?.replace('token-item-', '');
        if (tokenId) {
          createdTokenIds.push(tokenId);
        }
      }
    }

    for (const tokenId of createdTokenIds) {
      await settingsPage.revokeToken(tokenId);
      await settingsPage.page.waitForTimeout(500);
    }
  });

  test('should revoke token successfully', async () => {
    const tokenName = `revoke-token-${Date.now()}`;

    // Create token
    await settingsPage.completeTokenCreation(tokenName);

    // Verify token exists
    expect(await settingsPage.hasTokenWithName(tokenName)).toBe(true);

    // Get initial token count
    const initialCount = await settingsPage.getTokenCount();

    // Find token ID
    const tokenItems = await settingsPage.page.locator('[data-testid^="token-item-"]').all();
    let tokenId: string | null = null;

    for (const item of tokenItems) {
      const nameElement = item.locator('[data-testid^="token-name-"]');
      const name = await nameElement.textContent();
      if (name === tokenName) {
        tokenId = (await item.getAttribute('data-testid'))?.replace('token-item-', '') || null;
        break;
      }
    }

    expect(tokenId).toBeTruthy();

    // Revoke token
    await settingsPage.revokeToken(tokenId!);

    // Wait for success message
    await settingsPage.tokensSuccessAlert.waitFor({ state: 'visible', timeout: 5000 });
    const successMessage = await settingsPage.getTokensSuccess();
    expect(successMessage?.toLowerCase()).toContain('revoked');

    // Verify token is removed from list
    await settingsPage.page.waitForTimeout(1000);
    expect(await settingsPage.hasTokenWithName(tokenName)).toBe(false);

    // Verify token count decreased
    const finalCount = await settingsPage.getTokenCount();
    expect(finalCount).toBe(initialCount - 1);
  });
});
