import { Page, Locator } from '@playwright/test';

/**
 * Page Object for Login Page
 *
 * Encapsulates all interactions with the login form
 * Provides semantic methods for common user actions
 */
export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly rememberMeCheckbox: Locator;
  readonly submitButton: Locator;
  readonly errorAlert: Locator;
  readonly signUpLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByTestId('login-email-input');
    this.passwordInput = page.getByTestId('login-password-input');
    this.rememberMeCheckbox = page.getByTestId('login-remember-me-checkbox');
    this.submitButton = page.getByTestId('login-submit-button');
    this.errorAlert = page.getByTestId('login-error-alert');
    this.signUpLink = page.getByRole('link', { name: /sign up/i });
  }

  /**
   * Navigate to login page
   */
  async goto() {
    await this.page.goto('/auth/login');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Fill email input
   */
  async fillEmail(email: string) {
    await this.emailInput.fill(email);
  }

  /**
   * Fill password input
   */
  async fillPassword(password: string) {
    await this.passwordInput.fill(password);
  }

  /**
   * Check/uncheck remember me checkbox
   */
  async setRememberMe(checked: boolean) {
    if (checked) {
      await this.rememberMeCheckbox.check();
    } else {
      await this.rememberMeCheckbox.uncheck();
    }
  }

  /**
   * Submit login form
   */
  async submit() {
    await this.submitButton.click();
  }

  /**
   * Complete login flow with credentials
   */
  async login(email: string, password: string, rememberMe: boolean = false) {
    await this.fillEmail(email);
    await this.fillPassword(password);
    if (rememberMe) {
      await this.setRememberMe(true);
    }

    // Wait for submit button to be ready
    await this.submitButton.waitFor({ state: 'visible', timeout: 5000 });

    // Click submit - Playwright will automatically scroll into view and handle navigation
    await this.submitButton.click({ force: false });

    // Wait for either:
    // 1. Redirect away from login page (success)
    // 2. Error message appears (failure)
    // 3. Button becomes enabled again (failure with no error message)
    await Promise.race([
      // Success: page navigates away from /login
      this.page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 15000 }),
      // Failure: error alert becomes visible
      this.errorAlert.waitFor({ state: 'visible', timeout: 15000 }).catch(() => {}),
      // Failure: button text changes back to enabled state (no longer "Signing in...")
      this.page.waitForFunction(
        () => {
          const btn = document.querySelector('[data-testid="login-submit-button"]');
          return btn && !btn.textContent?.includes('Signing in');
        },
        { timeout: 15000 }
      ).catch(() => {}),
    ]);

    // Wait a bit for any pending navigation
    await this.page.waitForTimeout(500);

    // Check final URL
    const currentUrl = this.page.url();

    // If we're still on login page (not redirected), authentication failed
    if (currentUrl.includes('/login')) {
      const error = await this.getErrorMessage();
      throw new Error(`Login failed: ${error || 'Invalid credentials - check database seed'}`);
    }
  }

  /**
   * Get error message text
   */
  async getErrorMessage(): Promise<string | null> {
    if (await this.errorAlert.isVisible()) {
      const text = await this.errorAlert.textContent();
      return text?.trim() || null;
    }
    return null;
  }

  /**
   * Navigate to registration page via sign up link
   */
  async clickSignUp() {
    await this.signUpLink.click();
  }

  /**
   * Check if form elements are visible
   */
  async isFormVisible(): Promise<boolean> {
    return (
      (await this.emailInput.isVisible()) &&
      (await this.passwordInput.isVisible()) &&
      (await this.submitButton.isVisible())
    );
  }

  /**
   * Get page title
   */
  async getPageTitle(): Promise<string> {
    return await this.page.title();
  }

  /**
   * Get validation error for a specific field
   */
  async getFieldError(fieldName: 'email' | 'password'): Promise<string | null> {
    const errorLocator = this.page.locator(`#${fieldName}-error, [id="${fieldName}"] ~ .error-message`);
    if (await errorLocator.isVisible()) {
      return await errorLocator.textContent();
    }
    return null;
  }

  /**
   * Wait for navigation after login
   */
  async waitForLoginRedirect() {
    await this.page.waitForURL(/\//, { timeout: 10000 });
  }
}
