# Write and Execute Unit Tests Prompt (v1)

## 🎯 Goal
Write unit tests from test plan, run them, capture results—no fluff.

## 📥 Context (ask if missing)
1. **Test Plan** – unit test plan from test-cases-planning phase
2. **Implementation Code** – functions to test
3. **Testing Framework** – Jest, Vitest, or preferred setup

## 🔍 Checklist
- **Write Tests**  
  - [ ] Create test files following test plan
  - [ ] User scenarios: happy path, edge cases, errors
  - [ ] Mock dependencies as needed

- **Execute Tests**  
  - [ ] Run test suite, capture fails
  - [ ] Fix issues, re-run until green
  - [ ] Document coverage vs acceptance criteria

Sections:
1. **Summary** – 🚦 Pass/Fail status per user story
2. **Result Matrix**

| Test Case | User Story | Pass/Fail | Notes |
|-----------|------------|-----------|-------|
| `should calculate tax correctly` | 2.1 | ✅ | – |
| `should handle invalid input` | 2.1 | ❌ | Returns null instead of error |

3. **Issues Found** – what broke, how fixed
4. **Coverage** – acceptance criteria validation status
