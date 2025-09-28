# Unit Test Cases Planning Prompt (v1)

## 🎯 Goal
Create unit test cases plan based on structured requirements, focusing on business logic validation from user perspective.

## 📋 General Instructions
- **Business-driven tests** - validate acceptance criteria and user journeys at component level
- **User perspective** - test what matters to users, not just technical correctness
- **Clear scenarios** - happy path, edge cases, error handling from business context

## 📥 Context (ask if missing)
1. **Structured Requirements** – User Stories and Acceptance Criteria
2. **Implementation Code** – functions and components to test

## ❓ Clarifying Questions (ask before proceeding)
**IMPORTANT: Ask clarifying questions directly in chat before proceeding with test planning.**

Generate concise questions about: key business logic to validate, user workflow steps to test, data validation rules, and business rule edge cases.


## 🔍 Unit Test Planning Process

- [ ] **Map Business Logic** – identify functions that implement acceptance criteria
- [ ] **Extract User Scenarios** – convert user journeys to unit test scenarios
- [ ] **Validate Business Rules** – test what users expect, not just technical functions
- [ ] **Test Data** – realistic data matching user scenarios

## 📤 Output
**File:** `.agents-playbook/[feature-name]/test-plan.md`

### Document Structure:
```markdown
# Unit Test Plan

## Business Logic to Test
- **User Story 1**: [user story] → Functions: [list functions]
- **User Story 2**: [user story] → Functions: [list functions]

## Test Cases by User Journey

### User Story: [As user, I want X, so that Y]
**Requirements**: [Reference to requirements 1.1, 1.2]
**Functions**: [functions implementing this story]

#### Test Case 1: User Happy Path
**User Scenario**: [what user is trying to do]
**Input**: [user data/actions]
**Expected**: [user-visible result]

#### Test Case 2: Business Rule Edge Case
**User Scenario**: [edge case user might encounter]
**Input**: [boundary user data/actions]  
**Expected**: [expected user experience]

#### Test Case 3: User Error Scenario
**User Scenario**: [invalid user action]
**Input**: [invalid user data/actions]
**Expected**: [how system should handle user error]

## Test Data (User-Focused)
- **Typical user data**: [realistic user scenarios]
- **Edge user cases**: [boundary user situations]  
- **Invalid user inputs**: [user error scenarios]
```

## ✅ Quality Checklist
- [ ] **User Story Coverage** – all user stories have corresponding unit tests
- [ ] **Business Logic Validation** – acceptance criteria tested at component level
- [ ] **User-Centric Scenarios** – tests reflect actual user workflows

## 💡 Best Practices
- **Think like user** – test what users care about, not just technical correctness
- **Business rule focus** – validate business logic and user expectations
- **Realistic scenarios** – use data that reflects real user behavior
