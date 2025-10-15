import { test, expect } from '@playwright/test';

/**
 * E2E Tests for User Registration Flow
 * 
 * Test Coverage:
 * - Registration form validation
 * - Successful registration
 * - Duplicate email/username handling
 * - Password strength requirements
 * - Form UI/UX behavior
 */

test.describe('User Registration', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to registration page before each test
    await page.goto('/auth/register');
  });

  test('should display registration form with all required fields', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/Register/i);
    
    // Check form elements are present
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/username/i)).toBeVisible();
    await expect(page.getByLabel(/^password$/i)).toBeVisible();
    await expect(page.getByLabel(/confirm password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /create account/i })).toBeVisible();
    
    // Check login link is present
    await expect(page.getByText(/already have an account/i)).toBeVisible();
    await expect(page.getByRole('link', { name: /sign in/i })).toBeVisible();
  });

  test('should show validation errors for empty form submission', async ({ page }) => {
    // Click submit without filling form
    await page.getByRole('button', { name: /create account/i }).click();
    
    // Check for validation errors
    await expect(page.getByText(/email is required/i)).toBeVisible();
    await expect(page.getByText(/username is required/i)).toBeVisible();
    await expect(page.getByText(/password is required/i)).toBeVisible();
  });

  test('should show error for invalid email format', async ({ page }) => {
    // Fill form with invalid email
    await page.getByLabel(/email/i).fill('invalid-email');
    await page.getByLabel(/username/i).fill('testuser');
    await page.getByLabel(/^password$/i).fill('Test@123456');
    await page.getByLabel(/confirm password/i).fill('Test@123456');
    
    // Submit form
    await page.getByRole('button', { name: /create account/i }).click();
    
    // Check for email validation error
    await expect(page.getByText(/invalid email format/i)).toBeVisible();
  });

  test('should show error for weak password', async ({ page }) => {
    // Fill form with weak password
    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByLabel(/username/i).fill('testuser');
    await page.getByLabel(/^password$/i).fill('weak');
    await page.getByLabel(/confirm password/i).fill('weak');
    
    // Submit form
    await page.getByRole('button', { name: /create account/i }).click();
    
    // Check for password strength error
    await expect(page.locator('text=/password.*8 characters/i')).toBeVisible();
  });

  test('should show error when passwords do not match', async ({ page }) => {
    // Fill form with mismatched passwords
    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByLabel(/username/i).fill('testuser');
    await page.getByLabel(/^password$/i).fill('Test@123456');
    await page.getByLabel(/confirm password/i).fill('Test@654321');
    
    // Submit form
    await page.getByRole('button', { name: /create account/i }).click();
    
    // Check for password match error
    await expect(page.getByText(/passwords.*match/i)).toBeVisible();
  });

  test('should successfully register a new user with valid data', async ({ page }) => {
    // Generate unique email and username to avoid conflicts
    const timestamp = Date.now();
    const email = `test-${timestamp}@example.com`;
    const username = `testuser${timestamp}`;
    
    // Fill form with valid data
    await page.getByLabel(/email/i).fill(email);
    await page.getByLabel(/username/i).fill(username);
    await page.getByLabel(/^password$/i).fill('Test@123456');
    await page.getByLabel(/confirm password/i).fill('Test@123456');
    
    // Submit form
    await page.getByRole('button', { name: /create account/i }).click();
    
    // Wait for success message or redirect
    await expect(page.getByText(/account created successfully/i)).toBeVisible({ timeout: 10000 });
    
    // Should redirect to login page
    await expect(page).toHaveURL(/\/auth\/login/, { timeout: 10000 });
  });

  test('should show error when registering with existing email', async ({ page }) => {
    // Use the seeded test user email
    await page.getByLabel(/email/i).fill('test@agents-playbook.com');
    await page.getByLabel(/username/i).fill('uniqueusername123');
    await page.getByLabel(/^password$/i).fill('Test@123456');
    await page.getByLabel(/confirm password/i).fill('Test@123456');
    
    // Submit form
    await page.getByRole('button', { name: /create account/i }).click();
    
    // Check for duplicate email error
    await expect(page.getByText(/email.*already.*registered/i)).toBeVisible({ timeout: 10000 });
  });

  test('should show error when registering with existing username', async ({ page }) => {
    // Use the seeded test user username
    const timestamp = Date.now();
    await page.getByLabel(/email/i).fill(`unique-${timestamp}@example.com`);
    await page.getByLabel(/username/i).fill('testuser'); // This already exists
    await page.getByLabel(/^password$/i).fill('Test@123456');
    await page.getByLabel(/confirm password/i).fill('Test@123456');
    
    // Submit form
    await page.getByRole('button', { name: /create account/i }).click();
    
    // Check for duplicate username error
    await expect(page.getByText(/username.*already.*taken/i)).toBeVisible({ timeout: 10000 });
  });

  test('should navigate to login page when clicking sign in link', async ({ page }) => {
    // Click the sign in link
    await page.getByRole('link', { name: /sign in/i }).click();
    
    // Should navigate to login page
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test('should toggle password visibility', async ({ page }) => {
    const passwordInput = page.getByLabel(/^password$/i);
    
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
});

