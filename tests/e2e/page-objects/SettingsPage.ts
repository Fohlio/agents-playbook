import { Page, Locator } from '@playwright/test';

/**
 * Page Object for Settings Page
 *
 * Encapsulates all interactions with the settings page including:
 * - Profile management
 * - Password changes
 * - API token management
 */
export class SettingsPage {
  readonly page: Page;

  // Page-level elements
  readonly settingsPage: Locator;
  readonly settingsHeading: Locator;
  readonly settingsDescription: Locator;

  // Profile Section
  readonly profileSection: Locator;
  readonly profileHeading: Locator;
  readonly profileDescription: Locator;
  readonly profileEmailInput: Locator;
  readonly profileUsernameInput: Locator;
  readonly profileTierBadge: Locator;
  readonly profileSaveButton: Locator;
  readonly profileErrorAlert: Locator;
  readonly profileSuccessAlert: Locator;

  // Password Section
  readonly passwordSection: Locator;
  readonly passwordHeading: Locator;
  readonly passwordDescription: Locator;
  readonly passwordCurrentInput: Locator;
  readonly passwordNewInput: Locator;
  readonly passwordConfirmInput: Locator;
  readonly passwordSaveButton: Locator;
  readonly passwordErrorAlert: Locator;
  readonly passwordSuccessAlert: Locator;

  // API Tokens Section
  readonly apiTokensSection: Locator;
  readonly tokensHeading: Locator;
  readonly tokensDescription: Locator;
  readonly createTokenButton: Locator;
  readonly tokensErrorAlert: Locator;
  readonly tokensSuccessAlert: Locator;
  readonly tokensLoading: Locator;
  readonly tokensEmptyState: Locator;
  readonly tokensList: Locator;

  // Create Token Modal
  readonly createTokenModal: Locator;
  readonly createTokenModalHeading: Locator;
  readonly tokenNameInput: Locator;
  readonly cancelCreateTokenButton: Locator;
  readonly submitCreateTokenButton: Locator;

  // Token Display Modal
  readonly tokenDisplayModal: Locator;
  readonly tokenDisplayModalHeading: Locator;
  readonly tokenDisplayWarning: Locator;
  readonly tokenDisplayInput: Locator;
  readonly copyTokenButton: Locator;
  readonly closeTokenModalButton: Locator;

  // Revoke Token Modal
  readonly revokeTokenModal: Locator;
  readonly revokeTokenModalHeading: Locator;
  readonly revokeTokenModalDescription: Locator;
  readonly cancelRevokeButton: Locator;
  readonly confirmRevokeButton: Locator;

  constructor(page: Page) {
    this.page = page;

    // Page-level
    this.settingsPage = page.getByTestId('settings-page');
    this.settingsHeading = page.getByTestId('settings-heading');
    this.settingsDescription = page.getByTestId('settings-description');

    // Profile Section
    this.profileSection = page.getByTestId('profile-section');
    this.profileHeading = page.getByTestId('profile-heading');
    this.profileDescription = page.getByTestId('profile-description');
    this.profileEmailInput = page.getByTestId('profile-email-input');
    this.profileUsernameInput = page.getByTestId('profile-username-input');
    this.profileTierBadge = page.getByTestId('profile-tier-badge');
    this.profileSaveButton = page.getByTestId('profile-save-button');
    this.profileErrorAlert = page.getByTestId('profile-error-alert');
    this.profileSuccessAlert = page.getByTestId('profile-success-alert');

    // Password Section
    this.passwordSection = page.getByTestId('password-section');
    this.passwordHeading = page.getByTestId('password-heading');
    this.passwordDescription = page.getByTestId('password-description');
    this.passwordCurrentInput = page.getByTestId('password-current-input');
    this.passwordNewInput = page.getByTestId('password-new-input');
    this.passwordConfirmInput = page.getByTestId('password-confirm-input');
    this.passwordSaveButton = page.getByTestId('password-save-button');
    this.passwordErrorAlert = page.getByTestId('password-error-alert');
    this.passwordSuccessAlert = page.getByTestId('password-success-alert');

    // API Tokens Section
    this.apiTokensSection = page.getByTestId('api-tokens-section');
    this.tokensHeading = page.getByTestId('tokens-heading');
    this.tokensDescription = page.getByTestId('tokens-description');
    this.createTokenButton = page.getByTestId('create-token-button');
    this.tokensErrorAlert = page.getByTestId('tokens-error-alert');
    this.tokensSuccessAlert = page.getByTestId('tokens-success-alert');
    this.tokensLoading = page.getByTestId('tokens-loading');
    this.tokensEmptyState = page.getByTestId('tokens-empty-state');
    this.tokensList = page.getByTestId('tokens-list');

    // Create Token Modal
    this.createTokenModal = page.getByTestId('create-token-modal');
    this.createTokenModalHeading = page.getByTestId('create-token-modal-heading');
    this.tokenNameInput = page.getByTestId('token-name-input');
    this.cancelCreateTokenButton = page.getByTestId('cancel-create-token-button');
    this.submitCreateTokenButton = page.getByTestId('submit-create-token-button');

    // Token Display Modal
    this.tokenDisplayModal = page.getByTestId('token-display-modal');
    this.tokenDisplayModalHeading = page.getByTestId('token-display-modal-heading');
    this.tokenDisplayWarning = page.getByTestId('token-display-warning');
    this.tokenDisplayInput = page.getByTestId('token-display-input');
    this.copyTokenButton = page.getByTestId('copy-token-button');
    this.closeTokenModalButton = page.getByTestId('close-token-modal-button');

    // Revoke Token Modal
    this.revokeTokenModal = page.getByTestId('revoke-token-modal');
    this.revokeTokenModalHeading = page.getByTestId('revoke-token-modal-heading');
    this.revokeTokenModalDescription = page.getByTestId('revoke-token-modal-description');
    this.cancelRevokeButton = page.getByTestId('cancel-revoke-button');
    this.confirmRevokeButton = page.getByTestId('confirm-revoke-button');
  }

  /**
   * Navigate to settings page
   */
  async goto() {
    await this.page.goto('/dashboard/settings');
    await this.page.waitForLoadState('networkidle');
  }

  // ========== Profile Section Methods ==========

  /**
   * Get current email from profile section
   */
  async getEmail(): Promise<string> {
    return await this.profileEmailInput.inputValue();
  }

  /**
   * Get current username from profile section
   */
  async getUsername(): Promise<string> {
    return await this.profileUsernameInput.inputValue();
  }

  /**
   * Get user tier from badge
   */
  async getTier(): Promise<string | null> {
    if (await this.profileTierBadge.isVisible()) {
      return await this.profileTierBadge.textContent();
    }
    return null;
  }

  /**
   * Update username in profile section
   */
  async updateUsername(newUsername: string) {
    await this.profileUsernameInput.clear();
    await this.profileUsernameInput.fill(newUsername);
    await this.profileSaveButton.click();
  }

  /**
   * Get profile error message
   */
  async getProfileError(): Promise<string | null> {
    if (await this.profileErrorAlert.isVisible()) {
      return await this.profileErrorAlert.textContent();
    }
    return null;
  }

  /**
   * Get profile success message
   */
  async getProfileSuccess(): Promise<string | null> {
    if (await this.profileSuccessAlert.isVisible()) {
      return await this.profileSuccessAlert.textContent();
    }
    return null;
  }

  /**
   * Check if profile section is visible
   */
  async isProfileSectionVisible(): Promise<boolean> {
    return await this.profileSection.isVisible();
  }

  // ========== Password Section Methods ==========

  /**
   * Change password with all fields
   */
  async changePassword(
    currentPassword: string,
    newPassword: string,
    confirmPassword?: string
  ) {
    await this.passwordCurrentInput.fill(currentPassword);
    await this.passwordNewInput.fill(newPassword);
    await this.passwordConfirmInput.fill(confirmPassword || newPassword);
    await this.passwordSaveButton.click();
  }

  /**
   * Get password error message
   */
  async getPasswordError(): Promise<string | null> {
    if (await this.passwordErrorAlert.isVisible()) {
      return await this.passwordErrorAlert.textContent();
    }
    return null;
  }

  /**
   * Get password success message
   */
  async getPasswordSuccess(): Promise<string | null> {
    if (await this.passwordSuccessAlert.isVisible()) {
      return await this.passwordSuccessAlert.textContent();
    }
    return null;
  }

  /**
   * Check if password section is visible
   */
  async isPasswordSectionVisible(): Promise<boolean> {
    return await this.passwordSection.isVisible();
  }

  /**
   * Check if password fields are cleared (after successful change)
   */
  async arePasswordFieldsEmpty(): Promise<boolean> {
    const current = await this.passwordCurrentInput.inputValue();
    const newPass = await this.passwordNewInput.inputValue();
    const confirm = await this.passwordConfirmInput.inputValue();
    return current === '' && newPass === '' && confirm === '';
  }

  // ========== API Tokens Section Methods ==========

  /**
   * Check if tokens section is visible
   */
  async isTokensSectionVisible(): Promise<boolean> {
    return await this.apiTokensSection.isVisible();
  }

  /**
   * Check if tokens list is loading
   */
  async isTokensLoading(): Promise<boolean> {
    return await this.tokensLoading.isVisible();
  }

  /**
   * Check if tokens empty state is visible
   */
  async isTokensEmpty(): Promise<boolean> {
    return await this.tokensEmptyState.isVisible();
  }

  /**
   * Get number of tokens in list
   */
  async getTokenCount(): Promise<number> {
    if (await this.tokensList.isVisible()) {
      const tokenItems = await this.page.locator('[data-testid^="token-item-"]').count();
      return tokenItems;
    }
    return 0;
  }

  /**
   * Open create token modal
   */
  async openCreateTokenModal() {
    await this.createTokenButton.click();
    await this.createTokenModal.waitFor({ state: 'visible' });
  }

  /**
   * Create a new token
   */
  async createToken(tokenName: string): Promise<string> {
    await this.openCreateTokenModal();
    await this.tokenNameInput.fill(tokenName);
    await this.submitCreateTokenButton.click();

    // Wait for token display modal
    await this.tokenDisplayModal.waitFor({ state: 'visible' });

    // Get the plain token value
    const plainToken = await this.tokenDisplayInput.inputValue();

    return plainToken;
  }

  /**
   * Copy token from display modal
   */
  async copyToken() {
    await this.copyTokenButton.click();
  }

  /**
   * Close token display modal
   */
  async closeTokenDisplayModal() {
    await this.closeTokenModalButton.click();
    await this.tokenDisplayModal.waitFor({ state: 'hidden' });
  }

  /**
   * Complete token creation flow (create, copy, close)
   */
  async completeTokenCreation(tokenName: string): Promise<string> {
    const plainToken = await this.createToken(tokenName);
    await this.closeTokenDisplayModal();
    return plainToken;
  }

  /**
   * Get token item by ID
   */
  getTokenItem(tokenId: string): Locator {
    return this.page.getByTestId(`token-item-${tokenId}`);
  }

  /**
   * Get token name by ID
   */
  getTokenName(tokenId: string): Locator {
    return this.page.getByTestId(`token-name-${tokenId}`);
  }

  /**
   * Get masked token by ID
   */
  getTokenMasked(tokenId: string): Locator {
    return this.page.getByTestId(`token-masked-${tokenId}`);
  }

  /**
   * Get token metadata by ID
   */
  getTokenMetadata(tokenId: string): Locator {
    return this.page.getByTestId(`token-metadata-${tokenId}`);
  }

  /**
   * Get revoke button for a token
   */
  getRevokeTokenButton(tokenId: string): Locator {
    return this.page.getByTestId(`revoke-token-button-${tokenId}`);
  }

  /**
   * Open revoke token modal for a specific token
   */
  async openRevokeModal(tokenId: string) {
    await this.getRevokeTokenButton(tokenId).click();
    await this.revokeTokenModal.waitFor({ state: 'visible' });
  }

  /**
   * Cancel token revocation
   */
  async cancelRevoke() {
    await this.cancelRevokeButton.click();
    await this.revokeTokenModal.waitFor({ state: 'hidden' });
  }

  /**
   * Confirm token revocation
   */
  async confirmRevoke() {
    await this.confirmRevokeButton.click();
    await this.revokeTokenModal.waitFor({ state: 'hidden' });
  }

  /**
   * Revoke a token by ID (complete flow)
   */
  async revokeToken(tokenId: string) {
    await this.openRevokeModal(tokenId);
    await this.confirmRevoke();
  }

  /**
   * Get tokens error message
   */
  async getTokensError(): Promise<string | null> {
    if (await this.tokensErrorAlert.isVisible()) {
      return await this.tokensErrorAlert.textContent();
    }
    return null;
  }

  /**
   * Get tokens success message
   */
  async getTokensSuccess(): Promise<string | null> {
    if (await this.tokensSuccessAlert.isVisible()) {
      return await this.tokensSuccessAlert.textContent();
    }
    return null;
  }

  /**
   * Check if a token exists in the list by name
   */
  async hasTokenWithName(tokenName: string): Promise<boolean> {
    const tokenNames = await this.page.locator('[data-testid^="token-name-"]').allTextContents();
    return tokenNames.includes(tokenName);
  }

  /**
   * Wait for settings page to load
   */
  async waitForLoad() {
    await this.page.waitForLoadState('networkidle');
    await this.settingsPage.waitFor({ state: 'visible', timeout: 10000 });
  }
}
