# Create Test Fix Requirements Document Prompt (v1)

## 🎯 Goal
Create structured requirements document for fixing failing E2E tests with clear analysis of failures and implementation approach.

## 📋 General Instructions
- **Follow instructions precisely** - implement exactly what is requested, no more, no less

## 📥 Context (ask if missing)
1. **Test Report Analysis** – detailed analysis of E2E test failures with statistics and traces
2. **Failing Test Details** – specific test names, error messages, and failure patterns
3. **Recent Changes** – any recent changes that might have caused the failures
4. **Test Files** – location and content of failing test files

## ❓ Clarifying Questions (ask before proceeding)
**IMPORTANT: Ask clarifying questions directly in chat before proceeding with fix requirements.**

Generate a concise, prioritized set of one-line clarifying questions to understand:
- Root cause of test failures
- Expected vs actual behavior
- UI changes or selector issues
- Test data problems
- Environment or timing issues
- Business impact and urgency

## 🚦 Skip if
- All tests are already passing or fix requirements already exist

## 🔍 Fix Requirements Structure Format

### Fix Story Format
**Fix Story:** As a QA engineer, I want to [fix specific issue], so that [test passes and validates correct functionality].

### Acceptance Criteria Format
#### Acceptance Criteria
1. WHEN [test condition] THEN test SHALL [expected behavior]
2. WHEN [fix is applied] THEN test SHALL [pass consistently]
3. WHEN [validation occurs] THEN test SHALL [maintain original intent]

## 📋 Requirements Analysis Process
1. **Identify root causes** of each failing test
2. **Define fix approach** without changing test intent
3. **Specify validation steps** to ensure fixes work
4. **Maintain test value** - never remove meaningful assertions

## 📤 Output
**File:** `.agents-playbook/[test-fix]/requirements.md`

### Document Structure:
```markdown
# Test Fix Requirements Document

## Introduction
[Brief description of test failures and overall fix approach]

## Failing Tests Summary
[List of failing tests with brief failure reasons]

## Fix Requirements

### Requirement 1: [Test Name/Issue]
**Fix Story:** As a QA engineer, I want to [specific fix], so that [test outcome].

#### Acceptance Criteria
1. WHEN [test runs] THEN it SHALL [pass with correct assertions]
2. WHEN [specific condition] THEN test SHALL [expected behavior]

### Requirement 2: [Next Test/Issue]
[Repeat structure for each distinct fix needed]
```

## ✅ Quality Checklist
- [ ] **Complete Fix Stories** – each requirement has clear fix objective
- [ ] **Root Cause Identified** – understand why tests are failing
- [ ] **Maintains Test Intent** – fixes don't remove meaningful validations
- [ ] **Testable Fixes** – each fix can be validated
- [ ] **No Test Removal** – never use test.skip or test.fail()

## 🎯 Focus Areas
- **Selector Updates** – fix outdated UI selectors
- **Wait Conditions** – add proper waiting for elements
- **Test Data** – ensure test data is properly set up
- **Environment Issues** – address timing or environment problems
- **UI Changes** – adapt to recent frontend changes
- **Assertions** – maintain meaningful validations

## 🔄 Critical Rules
- **NEVER remove test logic** or simplify tests to just check page loads
- **ALWAYS maintain test value** - keep meaningful assertions
- **NEVER edit fohlio-frontend** - only investigate and analyze
- **UPDATE selectors and waits** to match current UI structure
