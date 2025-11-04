import { Page, Locator } from '@playwright/test';

/**
 * Page Object for Registration Page
 *
 * Encapsulates all interactions with the registration form
 * Provides semantic methods for common user actions
 */
export class RegisterPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly submitButton: Locator;
  readonly errorAlert: Locator;
  readonly signInLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByTestId('register-email-input');
    this.usernameInput = page.getByTestId('register-username-input');
    this.passwordInput = page.getByTestId('register-password-input');
    this.confirmPasswordInput = page.getByTestId('register-confirm-password-input');
    this.submitButton = page.getByTestId('register-submit-button');
    this.errorAlert = page.getByTestId('register-error-alert');
    this.signInLink = page.getByRole('link', { name: /sign in/i });
  }

  /**
   * Navigate to registration page
   */
  async goto() {
    await this.page.goto('/register');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Fill email input
   */
  async fillEmail(email: string) {
    await this.emailInput.fill(email);
  }

  /**
   * Fill username input
   */
  async fillUsername(username: string) {
    await this.usernameInput.fill(username);
  }

  /**
   * Fill password input
   */
  async fillPassword(password: string) {
    await this.passwordInput.fill(password);
  }

  /**
   * Fill confirm password input
   */
  async fillConfirmPassword(confirmPassword: string) {
    await this.confirmPasswordInput.fill(confirmPassword);
  }

  /**
   * Submit registration form
   */
  async submit() {
    await this.submitButton.click();
  }

  /**
   * Complete registration flow with user data
   */
  async register(
    email: string,
    username: string,
    password: string,
    confirmPassword?: string
  ) {
    await this.fillEmail(email);
    await this.fillUsername(username);
    await this.fillPassword(password);
    await this.fillConfirmPassword(confirmPassword || password);
    await this.submit();

    // Wait for redirect after successful registration
    // The register page uses window.location.href which causes full page navigation
    await this.page.waitForURL(url => url.pathname.includes('/dashboard'), { timeout: 15000 });
    await this.page.waitForLoadState('networkidle');
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
   * Navigate to login page via sign in link
   */
  async clickSignIn() {
    await this.signInLink.click();
  }

  /**
   * Check if form elements are visible
   */
  async isFormVisible(): Promise<boolean> {
    return (
      (await this.emailInput.isVisible()) &&
      (await this.usernameInput.isVisible()) &&
      (await this.passwordInput.isVisible()) &&
      (await this.confirmPasswordInput.isVisible()) &&
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
  async getFieldError(
    fieldName: 'email' | 'username' | 'password' | 'confirmPassword'
  ): Promise<string | null> {
    const errorLocator = this.page.locator(
      `#${fieldName}-error, [id="${fieldName}"] ~ .error-message`
    );
    if (await errorLocator.isVisible()) {
      return await errorLocator.textContent();
    }
    return null;
  }

  /**
   * Wait for success message after registration
   */
  async waitForSuccessMessage() {
    await this.page.waitForSelector('text=/account created successfully/i', {
      timeout: 10000,
    });
  }

  /**
   * Wait for navigation after registration
   */
  async waitForRegistrationRedirect() {
    await this.page.waitForURL(/\//, { timeout: 10000 });
  }
}
