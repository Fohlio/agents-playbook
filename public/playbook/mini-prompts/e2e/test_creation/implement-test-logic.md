# Implement Test Logic

## Purpose
Implement the core E2E test logic using page objects, test data, and established Playwright patterns to create comprehensive and maintainable tests.

## Context
- **Test Plan**: Output from plan-test-structure step
- **Page Objects**: Available page objects for UI interactions
- **Test Data**: Test data requirements and management strategy
- **Existing Test Patterns**: Current test structure and organization in the repository

## 🎯 Task-Based Implementation
**MUST follow tasks.md systematically:**
- Implement tasks **one by one** in order
- Complete validation step for each task
- Write unit tests for each completed task (when applicable)
- Mark tasks as ✅ completed in tasks.md

## Instructions
1. **Follow tasks.md**: Implement tests according to the planned task breakdown
2. **Use Page Objects**: Leverage page objects for all UI interactions
3. **Integrate Test Data**: Use presets, factories, and fixtures for data management
4. **Apply Playwright Patterns**: Follow established test patterns and best practices
5. **Implement Test Steps**: Use test.step for organizing test logic (but not in test body)
6. **Ensure Test Isolation**: Make tests independent and repeatable

## Output Format
```typescript
// Example test implementation
import { test, expect } from '@playwright/test';
import { FeaturePageObject } from '../models/feature-page-object';
import { testPreset } from '../presets/test-preset';

test.describe('Feature E2E Tests', () => {
  let featurePage: FeaturePageObject;
  
  test.beforeEach(async ({ page }) => {
    featurePage = new FeaturePageObject(page);
    await testPreset.setup(page);
  });
  
  test.afterEach(async ({ page }) => {
    await testPreset.cleanup(page);
  });
  
  test('should complete happy path workflow', async ({ page }) => {
    // Test implementation using page objects
    await featurePage.navigateToFeature();
    await featurePage.fillRequiredFields();
    await featurePage.submitForm();
    await featurePage.verifySuccessState();
  });
  
  test('should handle validation errors', async ({ page }) => {
    // Error scenario testing
    await featurePage.navigateToFeature();
    await featurePage.submitFormWithoutData();
    await featurePage.verifyValidationErrors();
  });
});
```

## Implementation Guidelines
- **Test Organization**: Group related tests using `test.describe()`
- **Setup/Teardown**: Use `test.beforeEach()` and `test.afterEach()` for test isolation
- **Page Object Usage**: Create page object instances in beforeEach and use throughout tests
- **Data Management**: Use presets for setup and factories for dynamic data creation
- **Assertions**: Use Playwright's expect assertions for validation
- **Test Steps**: Organize test logic logically without using test.step in test body
- **Error Handling**: Include proper error handling and meaningful test failures

## Success Criteria
- Tests follow planned test structure and organization
- All UI interactions use page objects
- Test data is properly managed through presets/factories
- Tests are independent and repeatable
- Implementation follows Playwright best practices
- Code is well-organized and maintainable
- Tests cover all identified scenarios
