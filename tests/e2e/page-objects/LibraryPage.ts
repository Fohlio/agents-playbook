import { Page, Locator } from '@playwright/test';

/**
 * Page Object for Library Page
 *
 * Encapsulates all interactions with the library layout and navigation
 * Provides semantic methods for common user actions
 */
export class LibraryPage {
  readonly page: Page;

  // Layout elements
  readonly libraryLayout: Locator;
  readonly librarySidebar: Locator;
  readonly libraryHeader: Locator;
  readonly breadcrumbs: Locator;

  // Sidebar navigation
  readonly uncategorizedLink: Locator;
  readonly trashLink: Locator;
  readonly createFolderButton: Locator;

  // Header elements
  readonly searchInput: Locator;
  readonly searchClearButton: Locator;
  readonly tabWorkflows: Locator;
  readonly tabMiniPrompts: Locator;

  // Selection toolbar
  readonly selectionToolbar: Locator;

  constructor(page: Page) {
    this.page = page;

    // Layout
    this.libraryLayout = page.getByTestId('library-layout');
    this.librarySidebar = page.getByTestId('library-sidebar');
    this.libraryHeader = page.getByTestId('library-header');
    this.breadcrumbs = page.getByTestId('breadcrumbs');

    // Sidebar
    this.uncategorizedLink = page.getByTestId('sidebar-uncategorized');
    this.trashLink = page.getByTestId('sidebar-trash');
    this.createFolderButton = page.getByRole('button', { name: /create.*folder/i });

    // Header
    this.searchInput = page.getByPlaceholder(/search/i);
    this.searchClearButton = page.getByTestId('search-clear');
    this.tabWorkflows = page.getByRole('tab', { name: /workflow/i });
    this.tabMiniPrompts = page.getByRole('tab', { name: /mini.*prompt/i });

    // Selection
    this.selectionToolbar = page.getByTestId('selection-toolbar');
  }

  /**
   * Navigate to library page
   */
  async goto() {
    await this.page.goto('/dashboard/library');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Wait for library page to load
   */
  async waitForLoad() {
    await this.page.waitForLoadState('networkidle');
    await this.libraryLayout.waitFor({ state: 'visible', timeout: 10000 });
  }

  /**
   * Check if library layout is visible
   */
  async isLoaded(): Promise<boolean> {
    return await this.libraryLayout.isVisible();
  }

  /**
   * Navigate to uncategorized view
   */
  async goToUncategorized() {
    await this.uncategorizedLink.click();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Navigate to trash view
   */
  async goToTrash() {
    await this.trashLink.click();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Click on a folder in sidebar
   */
  async goToFolder(folderId: string) {
    const folderLink = this.page.getByTestId(`sidebar-folder-${folderId}`);
    await folderLink.click();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Search for items
   */
  async search(query: string) {
    await this.searchInput.fill(query);
    // Wait for debounce
    await this.page.waitForTimeout(350);
  }

  /**
   * Clear search
   */
  async clearSearch() {
    await this.searchClearButton.click();
  }

  /**
   * Switch to Workflows tab
   */
  async switchToWorkflows() {
    await this.tabWorkflows.click();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Switch to Mini-Prompts tab
   */
  async switchToMiniPrompts() {
    await this.tabMiniPrompts.click();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Get count of workflow cards visible
   */
  async getWorkflowCardCount(): Promise<number> {
    const cards = this.page.locator('[data-testid^="workflow-card-"]');
    return await cards.count();
  }

  /**
   * Get count of prompt cards visible
   */
  async getPromptCardCount(): Promise<number> {
    const cards = this.page.locator('[data-testid^="prompt-card-"]');
    return await cards.count();
  }

  /**
   * Get count of folder cards visible
   */
  async getFolderCardCount(): Promise<number> {
    const cards = this.page.locator('[data-testid^="folder-card-"]');
    return await cards.count();
  }

  /**
   * Click on a workflow card
   */
  async clickWorkflowCard(workflowId: string) {
    const card = this.page.getByTestId(`workflow-card-${workflowId}`);
    await card.click();
  }

  /**
   * Click on a prompt card
   */
  async clickPromptCard(promptId: string) {
    const card = this.page.getByTestId(`prompt-card-${promptId}`);
    await card.click();
  }

  /**
   * Click on a folder card
   */
  async clickFolderCard(folderId: string) {
    const card = this.page.getByTestId(`folder-card-${folderId}`);
    await card.click();
  }

  /**
   * Check if selection toolbar is visible
   */
  async isSelectionToolbarVisible(): Promise<boolean> {
    return await this.selectionToolbar.isVisible();
  }

  /**
   * Get current breadcrumb text
   */
  async getBreadcrumbText(): Promise<string | null> {
    return await this.breadcrumbs.textContent();
  }

  /**
   * Check if sidebar is visible (desktop)
   */
  async isSidebarVisible(): Promise<boolean> {
    return await this.librarySidebar.isVisible();
  }

  /**
   * Get uncategorized count from sidebar
   */
  async getUncategorizedCount(): Promise<string | null> {
    const badge = this.uncategorizedLink.locator('.bg-gray-100, .text-gray-500');
    if (await badge.isVisible()) {
      return await badge.textContent();
    }
    return null;
  }

  /**
   * Get trash count from sidebar
   */
  async getTrashCount(): Promise<string | null> {
    const badge = this.trashLink.locator('.bg-gray-100, .text-gray-500');
    if (await badge.isVisible()) {
      return await badge.textContent();
    }
    return null;
  }
}
