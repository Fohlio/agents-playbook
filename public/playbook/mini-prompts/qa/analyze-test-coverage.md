# Analyze Test Coverage Prompt (v1)

## 🎯 Goal
Evaluate current unit test coverage to identify gaps and opportunities for improvement.

## 📥 Context (ask if missing)
1. **Codebase Analysis** – code structure, main modules, business logic locations
2. **Existing Tests** – current test files, testing framework used
3. **Coverage Reports** – existing coverage data if available
4. **Build Configuration** – package.json, test scripts, coverage tools setup

## 🚦 Skip if
- Coverage analysis completed recently (<7 days) or comprehensive coverage already exists (>85%)

## 🔍 Checklist
- **Current State Assessment**
  - [ ] Identify testing framework (Jest, Vitest, Mocha, etc.)
  - [ ] Locate existing test files and structure
  - [ ] Run coverage analysis if tools are configured
  - [ ] Document current coverage percentage by module

- **Gap Analysis**
  - [ ] Identify untested modules and functions
  - [ ] Flag critical business logic without tests
  - [ ] Note complex functions needing comprehensive testing
  - [ ] Document edge cases and error handling gaps

- **Quality Assessment**
  - [ ] Review existing test quality and patterns
  - [ ] Identify flaky or unreliable tests
  - [ ] Check for proper mocking and isolation
  - [ ] Assess test maintainability and readability

- **Tool & Environment Review**
  - [ ] Verify coverage tools configuration
  - [ ] Check CI/CD integration for test reporting
  - [ ] Document test environment setup requirements
  - [ ] Note any missing testing infrastructure

## 📤 Output
**File:** `.agents-playbook/[feature-or-task-name]/test-coverage-analysis.md`

Sections:
1. **Executive Summary** – current coverage state, key findings
2. **Coverage Metrics** – overall %, by module, critical gaps
3. **Test Quality Assessment** – patterns, issues, recommendations
4. **Gap Analysis** – untested functions, priority areas
5. **Infrastructure Review** – tools, CI/CD, environment
6. **Recommendations** – priority actions, target metrics
7. **Next Steps** – immediate actions, resource requirements

## 🧠 Analysis Framework
- **Critical Priority**: Core business logic, API endpoints, data processing
- **High Priority**: User-facing features, security functions, error handling  
- **Medium Priority**: Utility functions, helpers, configuration
- **Low Priority**: Generated code, simple getters/setters, deprecated code

## ➡️ Response Flow
Analyze → Assess → Prioritize → Recommend → Document → Plan next steps 