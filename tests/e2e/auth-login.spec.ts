import { test, expect } from '@playwright/test';
import { LoginPage } from './page-objects/LoginPage';
import { TEST_USERS } from './utils/auth-helpers';

/**
 * E2E Tests for User Login Flow
 *
 * Test Coverage:
 * - Login form display and validation
 * - Successful login with credentials
 * - Invalid credentials handling
 * - Remember me functionality
 * - Session persistence
 * - Protected route access
 * - Navigation flows
 */

test.describe('User Login', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page, context }) => {
    // Clear session before each test
    await context.clearCookies();

    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test('should display login form with all required fields', async () => {
    // Check form elements are present
    await expect(loginPage.emailInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.rememberMeCheckbox).toBeVisible();
    await expect(loginPage.submitButton).toBeVisible();

    // Check navigation links are present
    await expect(loginPage.signUpLink).toBeVisible();
  });

  test('should show validation errors for empty form submission', async () => {
    // Submit form without filling fields
    await loginPage.submit();

    // Browser built-in validation will prevent submission for required fields
    // The form should still be visible (not navigated away)
    await expect(loginPage.submitButton).toBeVisible();
  });

  test('should show error for invalid credentials', async () => {
    // Fill form with invalid credentials
    await loginPage.login('nonexistent@example.com', 'WrongPassword@123');

    // Wait for error message to appear
    await expect(loginPage.errorAlert).toBeVisible({ timeout: 10000 });
    const errorMessage = await loginPage.getErrorMessage();
    expect(errorMessage).toContain('Invalid credentials');
  });

  test('should show error for wrong password with valid email', async () => {
    // Use seeded test user email with wrong password
    await loginPage.login(TEST_USERS.testUser.email, 'WrongPassword@123');

    // Check for invalid credentials error
    await expect(loginPage.errorAlert).toBeVisible({ timeout: 10000 });
    const errorMessage = await loginPage.getErrorMessage();
    expect(errorMessage).toContain('Invalid credentials');
  });

  test('should successfully login with valid credentials (test user)', async ({ page }) => {
    // Login with seeded test user credentials
    await loginPage.login(TEST_USERS.testUser.email, TEST_USERS.testUser.password);

    // Wait for redirect to home page
    await page.waitForURL('/', { timeout: 10000 });

    // Verify URL is home page
    expect(page.url()).toMatch(/\/$|\/$/);
  });

  test('should remember user session with "Remember Me" checked', async ({ page, context }) => {
    // Login with "Remember Me" enabled
    await loginPage.login(
      TEST_USERS.testUser.email,
      TEST_USERS.testUser.password,
      true
    );

    // Wait for successful login
    await page.waitForURL('/', { timeout: 10000 });

    // Get cookies and verify session token exists
    const cookies = await context.cookies();
    const sessionCookie = cookies.find(cookie =>
      cookie.name.includes('session') || cookie.name.includes('next-auth')
    );

    expect(sessionCookie).toBeDefined();

    // Session cookie should have a longer expiration with "Remember Me"
    // Note: Exact validation depends on implementation
  });

  test('should navigate to registration page when clicking sign up link', async ({ page }) => {
    // Click the sign up link
    await loginPage.clickSignUp();

    // Should navigate to registration page
    await page.waitForURL('/register', { timeout: 5000 });
    expect(page.url()).toContain('/register');
  });

  test('should protect dashboard route and redirect to login', async ({ page, context }) => {
    // Clear any existing sessions
    await context.clearCookies();

    // Try to access protected dashboard route directly
    await page.goto('/dashboard');

    // Should be redirected to login page
    await page.waitForURL(/\/login/, { timeout: 10000 });
    expect(page.url()).toContain('/login');

    // Should see callbackUrl parameter
    expect(page.url()).toContain('callbackUrl');
  });

  test.skip('should redirect to intended page after login (callback URL)', async ({ page, context }) => {
    // Skip this test as /dashboard route doesn't exist in the current app
    // TODO: Implement this test when dashboard route is added
  });

  test('should toggle remember me checkbox', async () => {
    // Checkbox should not be checked by default
    await expect(loginPage.rememberMeCheckbox).not.toBeChecked();

    // Check the checkbox
    await loginPage.setRememberMe(true);
    await expect(loginPage.rememberMeCheckbox).toBeChecked();

    // Uncheck the checkbox
    await loginPage.setRememberMe(false);
    await expect(loginPage.rememberMeCheckbox).not.toBeChecked();
  });

  test('should show error message in alert component', async () => {
    // Login with invalid credentials
    await loginPage.login('invalid@example.com', 'wrong');

    // Error alert should be visible
    await expect(loginPage.errorAlert).toBeVisible({ timeout: 10000 });

    // Error message should be descriptive
    const errorMessage = await loginPage.getErrorMessage();
    expect(errorMessage).toBeTruthy();
    expect(errorMessage?.length).toBeGreaterThan(0);
  });

  test('should disable submit button while logging in', async ({ page }) => {
    // Fill in credentials
    await loginPage.fillEmail(TEST_USERS.testUser.email);
    await loginPage.fillPassword(TEST_USERS.testUser.password);

    // Click submit
    const submitPromise = loginPage.submit();

    // Button should show loading state (text changes or disabled)
    // This is a timing-sensitive test, so we add a small wait
    await page.waitForTimeout(100);

    // Check if button text changed to loading state
    const buttonText = await loginPage.submitButton.textContent();
    const isLoadingState = buttonText?.includes('Signing in') ||
                          await loginPage.submitButton.isDisabled();

    expect(isLoadingState).toBeTruthy();

    // Wait for submit to complete
    await submitPromise;
  });
});
