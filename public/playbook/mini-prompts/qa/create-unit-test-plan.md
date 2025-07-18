# Create Unit Test Plan Prompt (v1)

## 🎯 Goal
Develop a comprehensive plan for implementing unit tests to achieve coverage goals efficiently.

## 📥 Context (ask if missing)
1. **Coverage Goals** – target percentages, priority areas, quality standards
2. **Code Analysis** – module structure, function complexity, critical paths
3. **Testing Priorities** – business-critical functions, high-risk areas
4. **Resource Constraints** – timeline, team capacity, existing expertise

## 🚦 Skip if
- Detailed unit test plan already exists for current scope or working on emergency fixes

## 🔍 Checklist
- **Scope & Prioritization**
  - [ ] List all modules/functions requiring tests
  - [ ] Prioritize by business impact and risk level
  - [ ] Group related functionality for batch testing
  - [ ] Identify dependencies and test order

- **Test Strategy**
  - [ ] Define testing approach for each module type
  - [ ] Plan mocking strategy for external dependencies
  - [ ] Establish test data management approach
  - [ ] Document testing patterns and conventions

- **Implementation Planning**
  - [ ] Break down work into manageable chunks
  - [ ] Estimate effort for each test group
  - [ ] Assign ownership and review responsibilities
  - [ ] Plan integration with development workflow

- **Quality Assurance**
  - [ ] Define test validation criteria
  - [ ] Plan code review process for tests
  - [ ] Establish testing standards and guidelines
  - [ ] Set up automated test execution

## 📤 Output
**File:** `docs/planning/unit-test-plan.md`

Sections:
1. **Executive Summary** – scope, goals, timeline
2. **Test Inventory** – complete list of functions/modules to test
3. **Priority Matrix** – criticality vs effort, implementation phases
4. **Implementation Strategy** – approaches, patterns, conventions
5. **Work Breakdown** – tasks, estimates, assignments
6. **Quality Framework** – standards, review process, validation
7. **Risk Mitigation** – challenges, dependencies, contingencies

## 📋 Test Categories
- **Pure Functions**: Input/output validation, edge cases
- **Business Logic**: Core algorithms, calculations, transformations
- **API/Interface**: Public methods, contract validation
- **Error Handling**: Exception scenarios, boundary conditions
- **State Management**: Object state changes, side effects
- **Integration Points**: External service interactions (mocked)

## 🎯 Implementation Phases
1. **Phase 1**: Critical business logic (highest ROI)
2. **Phase 2**: Core application functions (main workflows)
3. **Phase 3**: Utility and helper functions (completeness)
4. **Phase 4**: Edge cases and error scenarios (robustness)

## ➡️ Response Flow
Analyze scope → Prioritize functions → Plan approach → Break down work → Document plan 