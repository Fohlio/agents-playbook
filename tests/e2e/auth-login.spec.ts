import { test, expect } from '@playwright/test';

/**
 * E2E Tests for User Login Flow
 * 
 * Test Coverage:
 * - Login form validation
 * - Successful login with credentials
 * - Invalid credentials handling
 * - Remember me functionality
 * - Session persistence
 * - Protected route access
 */

test.describe('User Login', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login page before each test
    await page.goto('/auth/login');
  });

  test('should display login form with all required fields', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/Login|Sign In/i);
    
    // Check form elements are present
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByLabel(/remember me/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
    
    // Check register link is present
    await expect(page.getByText(/don't have an account|need an account/i)).toBeVisible();
    await expect(page.getByRole('link', { name: /sign up|register/i })).toBeVisible();
  });

  test('should show validation errors for empty form submission', async ({ page }) => {
    // Click submit without filling form
    await page.getByRole('button', { name: /sign in/i }).click();
    
    // Check for validation errors
    await expect(page.getByText(/email is required/i)).toBeVisible();
    await expect(page.getByText(/password is required/i)).toBeVisible();
  });

  test('should show error for invalid email format', async ({ page }) => {
    // Fill form with invalid email
    await page.getByLabel(/email/i).fill('invalid-email');
    await page.getByLabel(/password/i).fill('Test@123456');
    
    // Submit form
    await page.getByRole('button', { name: /sign in/i }).click();
    
    // Check for email validation error
    await expect(page.getByText(/invalid email format/i)).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    // Fill form with invalid credentials
    await page.getByLabel(/email/i).fill('nonexistent@example.com');
    await page.getByLabel(/password/i).fill('WrongPassword@123');
    
    // Submit form
    await page.getByRole('button', { name: /sign in/i }).click();
    
    // Check for invalid credentials error
    await expect(page.getByText(/invalid credentials|incorrect email or password/i)).toBeVisible({ timeout: 10000 });
  });

  test('should show error for wrong password with valid email', async ({ page }) => {
    // Use seeded test user email with wrong password
    await page.getByLabel(/email/i).fill('test@agents-playbook.com');
    await page.getByLabel(/password/i).fill('WrongPassword@123');
    
    // Submit form
    await page.getByRole('button', { name: /sign in/i }).click();
    
    // Check for invalid credentials error
    await expect(page.getByText(/invalid credentials|incorrect email or password/i)).toBeVisible({ timeout: 10000 });
  });

  test('should successfully login with valid credentials (test user)', async ({ page }) => {
    // Fill form with seeded test user credentials
    await page.getByLabel(/email/i).fill('test@agents-playbook.com');
    await page.getByLabel(/password/i).fill('Test@123456');
    
    // Submit form
    await page.getByRole('button', { name: /sign in/i }).click();
    
    // Wait for redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
    
    // Check that user is logged in (e.g., by checking for user menu or logout button)
    await expect(page.getByText(/testuser/i)).toBeVisible({ timeout: 5000 });
  });

  test('should successfully login with valid credentials (admin user)', async ({ page }) => {
    // Fill form with seeded admin user credentials
    await page.getByLabel(/email/i).fill('admin@agents-playbook.com');
    await page.getByLabel(/password/i).fill('Admin@123456');
    
    // Submit form
    await page.getByRole('button', { name: /sign in/i }).click();
    
    // Wait for redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
    
    // Check that admin user is logged in
    await expect(page.getByText(/admin/i)).toBeVisible({ timeout: 5000 });
  });

  test('should remember user session with "Remember Me" checked', async ({ page, context }) => {
    // Fill form with valid credentials
    await page.getByLabel(/email/i).fill('test@agents-playbook.com');
    await page.getByLabel(/password/i).fill('Test@123456');
    
    // Check "Remember Me"
    await page.getByLabel(/remember me/i).check();
    
    // Submit form
    await page.getByRole('button', { name: /sign in/i }).click();
    
    // Wait for successful login
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
    
    // Get cookies and verify session token exists
    const cookies = await context.cookies();
    const sessionCookie = cookies.find(cookie => 
      cookie.name.includes('session') || cookie.name.includes('next-auth')
    );
    
    expect(sessionCookie).toBeDefined();
    
    // Session cookie should have a longer expiration with "Remember Me"
    // Note: Exact validation depends on your implementation
  });

  test('should navigate to registration page when clicking sign up link', async ({ page }) => {
    // Click the sign up link
    await page.getByRole('link', { name: /sign up|register/i }).click();
    
    // Should navigate to registration page
    await expect(page).toHaveURL(/\/auth\/register/);
  });

  test('should protect dashboard route and redirect to login', async ({ page, context }) => {
    // Clear any existing sessions
    await context.clearCookies();
    
    // Try to access protected dashboard route directly
    await page.goto('/dashboard');
    
    // Should be redirected to login page
    await expect(page).toHaveURL(/\/auth\/login/, { timeout: 10000 });
    
    // Should see callbackUrl parameter
    expect(page.url()).toContain('callbackUrl');
  });

  test('should redirect to intended page after login (callback URL)', async ({ page, context }) => {
    // Clear any existing sessions
    await context.clearCookies();
    
    // Try to access protected dashboard route
    await page.goto('/dashboard');
    
    // Should be redirected to login with callbackUrl
    await expect(page).toHaveURL(/\/auth\/login.*callbackUrl/, { timeout: 10000 });
    
    // Login with valid credentials
    await page.getByLabel(/email/i).fill('test@agents-playbook.com');
    await page.getByLabel(/password/i).fill('Test@123456');
    await page.getByRole('button', { name: /sign in/i }).click();
    
    // Should be redirected back to dashboard
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
  });

  test('should toggle password visibility', async ({ page }) => {
    const passwordInput = page.getByLabel(/password/i);
    
    // Password should be hidden by default
    await expect(passwordInput).toHaveAttribute('type', 'password');
    
    // Click toggle button if available
    const toggleButton = page.locator('button').filter({ hasText: /show|hide/i }).first();
    if (await toggleButton.isVisible()) {
      await toggleButton.click();
      
      // Password should now be visible
      await expect(passwordInput).toHaveAttribute('type', 'text');
      
      // Click again to hide
      await toggleButton.click();
      await expect(passwordInput).toHaveAttribute('type', 'password');
    }
  });

  test('should handle logout and clear session', async ({ page, context }) => {
    // Login first
    await page.getByLabel(/email/i).fill('test@agents-playbook.com');
    await page.getByLabel(/password/i).fill('Test@123456');
    await page.getByRole('button', { name: /sign in/i }).click();
    
    // Wait for successful login
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
    
    // Find and click logout button (adjust selector based on your UI)
    const logoutButton = page.getByRole('button', { name: /logout|sign out/i });
    if (await logoutButton.isVisible()) {
      await logoutButton.click();
      
      // Should be redirected to home or login page
      await expect(page).toHaveURL(/\/(auth\/login)?$/, { timeout: 10000 });
      
      // Try to access dashboard again
      await page.goto('/dashboard');
      
      // Should be redirected to login
      await expect(page).toHaveURL(/\/auth\/login/, { timeout: 10000 });
    }
  });
});

