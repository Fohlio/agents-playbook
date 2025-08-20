# Create Page Objects

## Purpose
Implement page objects for E2E tests following Playwright best practices and established patterns in the repository, based on the page object needs assessment.

## Context
- **Page Object Assessment**: Output from assess-page-object-needs step
- **UI Elements**: Specific UI components that need page object methods
- **Existing Models**: Current page object patterns in the repository
- **Component Structure**: How UI components are organized

## Instructions
1. **Follow Repository Patterns**: Use existing page object structure and naming conventions
2. **Implement Page Object Methods**: Create methods for all required UI interactions
3. **Use Playwright Best Practices**: Implement proper locators and wait strategies
4. **Apply test.step Wrapping**: Wrap methods inside classes with test.step as per repository rules
5. **Ensure Reusability**: Design methods to be reusable across different test scenarios
6. **Add Proper Documentation**: Include JSDoc comments for all methods

## Output Format
```typescript
// Example page object implementation
export class FeaturePageObject extends BasePageObject {
  // Locators
  private readonly submitButton = this.page.getByRole('button', { name: 'Submit' });
  private readonly inputField = this.page.getByLabel('Input Label');
  
  // Methods wrapped with test.step
  async fillInput(value: string) {
    return await test.step('Fill input field', async () => {
      await this.inputField.fill(value);
    });
  }
  
  async clickSubmit() {
    return await test.step('Click submit button', async () => {
      await this.submitButton.click();
    });
  }
  
  async verifySuccessMessage() {
    return await test.step('Verify success message', async () => {
      await expect(this.page.getByText('Success')).toBeVisible();
    });
  }
}
```

## Implementation Guidelines
- **Locator Strategy**: Prefer `page.getByRole()`, `page.getByLabel()`, `page.getByText()` over `page.locator()`
- **Wait Strategies**: Use appropriate wait conditions for element visibility and interactability
- **Error Handling**: Include proper error handling and meaningful error messages
- **Method Naming**: Use descriptive method names that clearly indicate the action
- **Return Values**: Return appropriate values for assertions and further test logic
- **Test Steps**: Wrap all methods with `test.step()` for better test reporting

## Success Criteria
- Page objects follow established repository patterns
- All required UI interactions are implemented
- Methods use proper Playwright locators
- test.step wrapping is applied correctly
- Code is well-documented and maintainable
- Page objects are reusable across test scenarios
- Implementation aligns with Playwright best practices
