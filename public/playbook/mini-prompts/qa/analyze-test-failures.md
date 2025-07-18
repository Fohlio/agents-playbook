# Analyze Test Failures Prompt

## 🎯 Goal
Quickly categorize test failures, identify patterns, and prioritize fixes—no fluff.

## 📥 Context (ask if missing)
1. **Test Error Output** – jest output, stack traces, error messages
2. **Failing Test Names** – which specific tests are broken
3. **Recent Changes** – commits, dependency updates, config changes
4. **Test Environment** – local vs CI/CD, node version, OS details

## 🚦 Skip if
- Only one obvious syntax error, or all tests already passing.

## 🔍 Analysis Checklist
- **Failure Types**
  - [ ] Syntax errors (missing imports, typos)
  - [ ] Logic errors (wrong assertions, business logic bugs)
  - [ ] **Circular dependencies** (import cycles, architectural issues)
  - [ ] Environment issues (missing deps, wrong config)
  - [ ] Timing issues (async/await, race conditions)
  - [ ] Mock/stub problems (outdated mocks, missing setup)
  - [ ] **Test isolation issues** (tests affecting each other)

- **Failure Patterns**
  - [ ] Single test vs multiple tests
  - [ ] Specific test suite vs across suites
  - [ ] Local only vs CI/CD only
  - [ ] Intermittent vs consistent failures

- **Impact Assessment**
  - [ ] Critical path tests affected
  - [ ] Blocking deployment pipeline
  - [ ] Test coverage gaps created

## 📤 Output
**File:** `docs/analysis/test-failure-analysis.md`

Sections:
1. **Summary** – failure count, types, urgency level
2. **Categorized Failures**

| Test Name | Type | Error Message | Pattern | Priority |
|-----------|------|---------------|---------|----------|
| `user.test.ts` | Logic | "Expected 200, got 404" | API change | High |

3. **Root Cause Hypothesis** – likely causes to investigate
4. **Fix Strategy** – order of operations for repairs 