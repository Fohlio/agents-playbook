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
  - [ ] **NO SHORTCUTS**: Fix imports properly, don't use `any` types

- **Logic & Assertion Fixes**
  - [ ] Update assertions to match new behavior
  - [ ] Fix test data and expected outcomes
  - [ ] Align test logic with code changes
  - [ ] **VERIFY**: Each assertion tests the right behavior

- **Circular Dependencies** 
  - [ ] **IDENTIFY**: Map circular dependency chain completely
  - [ ] **RESTRUCTURE**: Extract shared interfaces/types to separate files
  - [ ] **DEPENDENCY INJECTION**: Use DI pattern to break circles
  - [ ] **ARCHITECTURAL FIX**: Don't patch with dynamic imports as hacks

- **Environment & Configuration**
  - [ ] Update dependencies in package.json
  - [ ] Fix jest configuration settings
  - [ ] Resolve path mapping issues
  - [ ] Update test environment variables

- **Async & Timing Issues**
  - [ ] Add proper await statements
  - [ ] Fix race conditions in test setup
  - [ ] **NO TIMEOUTS**: Don't increase timeouts as band-aid fix

- **Mock & Stub Updates**
  - [ ] Update mock implementations
  - [ ] Fix mock return values
  - [ ] Reset mocks between tests
  - [ ] **PROPER MOCKS**: Mock at right boundaries, not internal functions

### Anti-Pattern Prevention
- [ ] **NO HACKS**: Avoid `@ts-ignore`, `any` types, skip flags
- [ ] **NO PATCHES**: Don't disable tests or mock everything
- [ ] **FIX ROOT CAUSE**: Address architectural issues, not symptoms
- [ ] **COMPLETE COVERAGE**: Fix ALL failing tests, not just some

### Best-Practice Guidelines
- [ ] Fix highest priority failures first
- [ ] Test fixes locally before committing
- [ ] **RUN ALL TESTS**: Verify no new failures introduced
- [ ] **ARCHITECTURAL REVIEW**: Check if fixes reveal design problems
- [ ] Document any test behavior changes

## 📤 Output
**Files:** Updated test files and configuration

**Log:** `.agents-playbook/[feature-or-task-name]/test-fixes-log.md`
1. **Changes Made** – what was fixed and why
2. **Before/After** – error messages vs passing results
3. **Validation** – confirmation all fixes work together 