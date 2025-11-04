import { Page, Locator } from '@playwright/test';

/**
 * Page Object for Dashboard Page
 *
 * Encapsulates all interactions with the dashboard layout and navigation
 * Provides semantic methods for common user actions
 */
export class DashboardPage {
  readonly page: Page;

  // Header elements
  readonly dashboardLogo: Locator;
  readonly dashboardNavLink: Locator;
  readonly settingsNavLink: Locator;
  readonly userInfo: Locator;
  readonly userDisplayName: Locator;
  readonly userTierBadge: Locator;
  readonly signOutButton: Locator;

  constructor(page: Page) {
    this.page = page;

    // Header navigation
    this.dashboardLogo = page.getByTestId('dashboard-logo');
    this.dashboardNavLink = page.getByTestId('dashboard-nav-link');
    this.settingsNavLink = page.getByTestId('settings-nav-link');

    // User menu
    this.userInfo = page.getByTestId('user-info');
    this.userDisplayName = page.getByTestId('user-display-name');
    this.userTierBadge = page.getByTestId('user-tier-badge');
    this.signOutButton = page.getByTestId('signout-button');
  }

  /**
   * Navigate to dashboard page
   */
  async goto() {
    await this.page.goto('/dashboard');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Check if user is authenticated and dashboard is visible
   */
  async isAuthenticated(): Promise<boolean> {
    return await this.signOutButton.isVisible();
  }

  /**
   * Get displayed username or email
   */
  async getUserDisplayName(): Promise<string | null> {
    if (await this.userDisplayName.isVisible()) {
      return await this.userDisplayName.textContent();
    }
    return null;
  }

  /**
   * Get user tier from badge
   */
  async getUserTier(): Promise<string | null> {
    if (await this.userTierBadge.isVisible()) {
      return await this.userTierBadge.textContent();
    }
    return null;
  }

  /**
   * Navigate to settings page via navigation link
   */
  async navigateToSettings() {
    await this.settingsNavLink.click();
    await this.page.waitForURL(/\/dashboard\/settings/, { timeout: 10000 });
  }

  /**
   * Navigate to dashboard via navigation link
   */
  async navigateToDashboard() {
    await this.dashboardNavLink.click();
    await this.page.waitForURL(/\/dashboard$/, { timeout: 10000 });
  }

  /**
   * Sign out and wait for redirect
   */
  async signOut() {
    await this.signOutButton.click();
    await this.page.waitForURL(/\/$/, { timeout: 10000 });
  }

  /**
   * Check if header navigation is visible
   */
  async isHeaderVisible(): Promise<boolean> {
    return (
      (await this.dashboardLogo.isVisible()) &&
      (await this.dashboardNavLink.isVisible()) &&
      (await this.settingsNavLink.isVisible())
    );
  }

  /**
   * Wait for dashboard page to load
   */
  async waitForLoad() {
    await this.page.waitForLoadState('networkidle');
    await this.dashboardLogo.waitFor({ state: 'visible' });
  }
}
