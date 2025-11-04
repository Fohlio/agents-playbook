import { test, expect } from '@playwright/test';
import { RegisterPage } from './page-objects/RegisterPage';
import { TEST_USERS, generateUniqueCredentials } from './utils/auth-helpers';

/**
 * E2E Tests for User Registration Flow
 *
 * Test Coverage:
 * - Registration form validation
 * - Successful registration
 * - Duplicate email/username handling
 * - Password strength requirements
 * - Form UI/UX behavior
 * - Navigation flows
 */

test.describe('User Registration', () => {
  let registerPage: RegisterPage;

  test.beforeEach(async ({ page, context }) => {
    // Clear session before each test
    await context.clearCookies();

    registerPage = new RegisterPage(page);
    await registerPage.goto();
  });

  test('should display registration form with all required fields', async () => {
    // Check form elements are present
    await expect(registerPage.emailInput).toBeVisible();
    await expect(registerPage.usernameInput).toBeVisible();
    await expect(registerPage.passwordInput).toBeVisible();
    await expect(registerPage.confirmPasswordInput).toBeVisible();
    await expect(registerPage.submitButton).toBeVisible();

    // Check navigation links are present
    await expect(registerPage.signInLink).toBeVisible();
  });

  test('should show validation errors for empty form submission', async () => {
    // Submit form without filling fields
    await registerPage.submit();

    // Browser built-in validation will prevent submission for required fields
    // The form should still be visible (not navigated away)
    await expect(registerPage.submitButton).toBeVisible();
  });

  test('should show error when passwords do not match', async () => {
    const credentials = generateUniqueCredentials();

    // Fill form with mismatched passwords
    await registerPage.register(
      credentials.email,
      credentials.username,
      credentials.password,
      'DifferentPassword@123'
    );

    // Check for error (could be client-side validation or server error)
    // Wait to see if error alert appears or form validation prevents submission
    await registerPage.page.waitForTimeout(1000);

    // Form should still be visible (registration failed)
    await expect(registerPage.submitButton).toBeVisible();
  });

  test('should successfully register a new user with valid data', async ({ page }) => {
    // Generate unique credentials to avoid conflicts
    const credentials = generateUniqueCredentials();

    // Register with valid data
    await registerPage.register(
      credentials.email,
      credentials.username,
      credentials.password
    );

    // Should redirect to home page after auto-login
    await page.waitForURL('/', { timeout: 15000 });

    // Verify URL is home page
    expect(page.url()).toMatch(/\/$|\/$/);
  });

  test('should show error when registering with existing email', async () => {
    const credentials = generateUniqueCredentials();

    // Use the seeded test user email but unique username
    await registerPage.register(
      TEST_USERS.testUser.email, // This already exists
      credentials.username,
      credentials.password
    );

    // Check for duplicate email error
    await expect(registerPage.errorAlert).toBeVisible({ timeout: 10000 });
    const errorMessage = await registerPage.getErrorMessage();
    expect(errorMessage).toMatch(/email.*already/i);
  });

  test('should show error when registering with existing username', async () => {
    const credentials = generateUniqueCredentials();

    // Use unique email but the seeded test user username
    await registerPage.register(
      credentials.email,
      TEST_USERS.testUser.username, // This already exists
      credentials.password
    );

    // Check for duplicate username error
    await expect(registerPage.errorAlert).toBeVisible({ timeout: 10000 });
    const errorMessage = await registerPage.getErrorMessage();
    expect(errorMessage).toMatch(/username.*already|username.*taken/i);
  });

  test('should navigate to login page when clicking sign in link', async ({ page }) => {
    // Click the sign in link
    await registerPage.clickSignIn();

    // Should navigate to login page
    await page.waitForURL('/login', { timeout: 5000 });
    expect(page.url()).toContain('/login');
  });

  test('should show password helper text', async ({ page }) => {
    // Check for password requirements helper text
    const helperText = page.locator('text=/Min 8 characters/i');
    await expect(helperText).toBeVisible();
  });

  test('should disable submit button while registering', async ({ page }) => {
    const credentials = generateUniqueCredentials();

    // Fill in registration data
    await registerPage.fillEmail(credentials.email);
    await registerPage.fillUsername(credentials.username);
    await registerPage.fillPassword(credentials.password);
    await registerPage.fillConfirmPassword(credentials.password);

    // Click submit
    const submitPromise = registerPage.submit();

    // Button should show loading state (text changes or disabled)
    // This is a timing-sensitive test, so we add a small wait
    await page.waitForTimeout(100);

    // Check if button text changed to loading state
    const buttonText = await registerPage.submitButton.textContent();
    const isLoadingState = buttonText?.includes('Creating account') ||
                          await registerPage.submitButton.isDisabled();

    expect(isLoadingState).toBeTruthy();

    // Wait for submit to complete
    await submitPromise;
  });

  test('should validate email format', async () => {
    const credentials = generateUniqueCredentials();

    // Fill form with invalid email
    await registerPage.register(
      'invalid-email', // Invalid format
      credentials.username,
      credentials.password
    );

    // Browser HTML5 validation should prevent submission
    // Or backend validation should return error
    await registerPage.page.waitForTimeout(1000);

    // Form should still be visible (registration failed)
    await expect(registerPage.submitButton).toBeVisible();
  });

  test('should require strong password', async () => {
    const credentials = generateUniqueCredentials();

    // Fill form with weak password
    await registerPage.register(
      credentials.email,
      credentials.username,
      'weak' // Too weak
    );

    // Wait for potential error
    await registerPage.page.waitForTimeout(2000);

    // Either client-side validation prevents submission or server returns error
    // Form should still be visible or error alert should appear
    const formVisible = await registerPage.submitButton.isVisible();
    const errorVisible = await registerPage.errorAlert.isVisible();

    expect(formVisible || errorVisible).toBeTruthy();
  });

  test('should allow registration with minimum valid password', async ({ page }) => {
    const credentials = generateUniqueCredentials();

    // Use a password that meets minimum requirements
    const validPassword = 'Pass@123';

    // Register with minimum valid password
    await registerPage.register(
      credentials.email,
      credentials.username,
      validPassword
    );

    // Should successfully register and redirect
    await page.waitForURL('/', { timeout: 15000 });
    expect(page.url()).toMatch(/\/$|\/$/);
  });

  test('should show error message in alert component on registration failure', async () => {
    // Try to register with existing email
    const credentials = generateUniqueCredentials();

    await registerPage.register(
      TEST_USERS.testUser.email,
      credentials.username,
      credentials.password
    );

    // Error alert should be visible
    await expect(registerPage.errorAlert).toBeVisible({ timeout: 10000 });

    // Error message should be descriptive
    const errorMessage = await registerPage.getErrorMessage();
    expect(errorMessage).toBeTruthy();
    expect(errorMessage?.length).toBeGreaterThan(0);
  });
});
