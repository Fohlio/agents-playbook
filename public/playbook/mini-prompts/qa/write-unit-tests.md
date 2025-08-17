# Write Unit Tests Prompt (v1)

## 🎯 Goal
Create high-quality unit tests that effectively validate functionality and improve code coverage.

## 📥 Context (ask if missing)
1. **Tasks File** – `.agents-playbook/[task-name]/tasks.md` with implementation breakdown
2. **Requirements File** – `.agents-playbook/[task-name]/requirements.md` with original user stories & acceptance criteria
3. **Design Spec** – `.agents-playbook/[task-name]/design.md` with architecture & diagrams
4. **Current Task** – specific task from tasks.md requiring test coverage
5. **Implemented Code** – code that was just implemented for the task
6. **Test Environment** – framework setup, testing utilities available
7. **Existing Test Patterns** – current conventions, mocking strategies

## 🎯 Task-Based Testing
**MUST align with tasks.md:**
- Write tests for **current completed task only**
- Cover all validation requirements from task specification
- Ensure tests verify task acceptance criteria
- Mark testing sub-task as ✅ in tasks.md when complete

## 🚦 Skip if
- Tests for current task already implemented or emergency fixes that don't require testing

## 🔍 Checklist
- **Task-Specific Test Requirements**
  - [ ] Reference task specification from tasks.md
  - [ ] Test all acceptance criteria listed in the task
  - [ ] Cover validation requirements specified in task
  - [ ] Ensure tests verify task completion criteria

- **Test Structure & Organization**
  - [ ] Create test files following project conventions
  - [ ] Group related tests in logical describe blocks
  - [ ] Use clear, descriptive test names that reference task
  - [ ] Follow Arrange-Act-Assert (AAA) pattern

- **Test Coverage Implementation**
  - [ ] Test happy path scenarios from task requirements
  - [ ] Cover edge cases mentioned in task specification
  - [ ] Test error handling for task-specific scenarios
  - [ ] Validate input/output transformations for the task

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
1. **Task Reference** – comment linking to specific task in tasks.md
2. **Setup/Teardown** – proper test environment preparation
3. **Test Cases** – comprehensive coverage of task functionality
4. **Mocks/Stubs** – isolated external dependencies
5. **Assertions** – validation of task acceptance criteria
6. **Documentation** – comments for complex test logic

**After completion:**
- Mark the testing sub-task as ✅ in tasks.md
- Update task progress to show tests are complete

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