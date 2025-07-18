# Write Unit Tests Prompt (v1)

## 🎯 Goal
Create high-quality unit tests that effectively validate functionality and improve code coverage.

## 📥 Context (ask if missing)
1. **Test Plan** – prioritized list of functions to test, testing approach
2. **Target Functions** – specific modules/functions requiring test coverage
3. **Test Environment** – framework setup, testing utilities available
4. **Existing Test Patterns** – current conventions, mocking strategies

## 🚦 Skip if
- All planned tests already implemented or emergency fixes that don't require testing

## 🔍 Checklist
- **Test Structure & Organization**
  - [ ] Create test files following project conventions
  - [ ] Group related tests in logical describe blocks
  - [ ] Use clear, descriptive test names
  - [ ] Follow Arrange-Act-Assert (AAA) pattern

- **Test Coverage Implementation**
  - [ ] Test happy path scenarios
  - [ ] Cover edge cases and boundary conditions
  - [ ] Test error handling and exception scenarios
  - [ ] Validate input/output transformations

- **Mocking & Isolation**
  - [ ] Mock external dependencies appropriately
  - [ ] Use dependency injection for testability
  - [ ] Isolate units from side effects
  - [ ] Mock asynchronous operations properly

- **Test Quality & Maintainability**
  - [ ] Make tests readable and self-documenting
  - [ ] Avoid test interdependencies
  - [ ] Use appropriate assertions
  - [ ] Keep tests focused and atomic

## 📤 Output
**Test Files:** Following project structure (e.g., `__tests__/`, `*.test.js`, `*.spec.ts`)

Each test file should include:
1. **Setup/Teardown** – proper test environment preparation
2. **Test Cases** – comprehensive coverage of functionality
3. **Mocks/Stubs** – isolated external dependencies
4. **Assertions** – clear validation of expected behavior
5. **Documentation** – comments for complex test logic

## 🧪 Test Types & Patterns
- **Pure Function Tests**: Input → Function → Expected Output
- **State Change Tests**: Initial State → Action → Expected State
- **Error Handling Tests**: Invalid Input → Function → Expected Error
- **Async Tests**: Promise/Callback → Function → Resolved Value
- **Mock Integration Tests**: Service → Mocked Dependency → Expected Interaction

## ⚡ Best Practices
- **Test Naming**: `should [expected behavior] when [condition]`
- **Test Data**: Use descriptive test data, avoid magic numbers
- **Assertions**: Use specific assertions (toBe, toEqual, toContain)
- **Performance**: Keep tests fast, avoid unnecessary delays
- **Reliability**: Make tests deterministic and repeatable

## ➡️ Response Flow
Select function → Analyze behavior → Write test cases → Implement mocks → Validate coverage 