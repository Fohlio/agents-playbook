# Fix Test Issues Prompt

## 🎯 Goal
Systematically repair failing tests with minimal side effects—get green fast.

## 📥 Context (ask if missing)
1. **Root Cause Analysis** – documented failure reasons and patterns
2. **Test Failure Types** – categorized list from analysis phase
3. **Existing Test Code** – current test files and setup
4. **Test Configuration** – jest.config.js, package.json scripts

## 🚦 Skip if
- No clear root cause identified, or tests already passing.

## 🔧 Fix Checklist

- **Syntax & Import Fixes**
  - [ ] Update import statements and paths
  - [ ] Fix TypeScript compilation errors
  - [ ] Correct function/variable naming

- **Logic & Assertion Fixes**
  - [ ] Update assertions to match new behavior
  - [ ] Fix test data and expected outcomes
  - [ ] Align test logic with code changes

- **Environment & Configuration**
  - [ ] Update dependencies in package.json
  - [ ] Fix jest configuration settings
  - [ ] Resolve path mapping issues
  - [ ] Update test environment variables

- **Async & Timing Issues**
  - [ ] Add proper await statements
  - [ ] Increase timeout values if needed
  - [ ] Fix race conditions in test setup

- **Mock & Stub Updates**
  - [ ] Update mock implementations
  - [ ] Fix mock return values
  - [ ] Reset mocks between tests

### Best-Practice Guidelines
- [ ] Fix highest priority failures first
- [ ] Test fixes locally before committing
- [ ] Keep changes minimal and focused
- [ ] Document any test behavior changes

## 📤 Output
**Files:** Updated test files and configuration

**Log:** `docs/analysis/test-fixes-log.md`
1. **Changes Made** – what was fixed and why
2. **Before/After** – error messages vs passing results
3. **Validation** – confirmation all fixes work together 