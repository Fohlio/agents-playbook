# Document Test Strategy Prompt (v1)

## 🎯 Goal
Create comprehensive documentation of testing approach, standards, and maintenance practices for the team.

## 📥 Context (ask if missing)
1. **Completed Coverage Improvement** – implemented tests, achieved coverage
2. **Test Implementation** – patterns used, tools configured, utilities created
3. **Coverage Metrics** – final coverage percentages, quality measures
4. **Testing Patterns Used** – conventions, approaches, best practices applied

## 🚦 Skip if
- Comprehensive test documentation already exists or minimal testing implementation completed

## 🔍 Checklist
- **Strategy Documentation**
  - [ ] Document overall testing philosophy and approach
  - [ ] Define testing standards and conventions
  - [ ] Explain coverage goals and rationale
  - [ ] Document test categorization and priorities

- **Implementation Guide**
  - [ ] Create developer guide for writing tests
  - [ ] Document testing patterns and examples
  - [ ] Explain mocking strategies and utilities
  - [ ] Provide troubleshooting and debugging guide

- **Maintenance Procedures**
  - [ ] Define test maintenance responsibilities
  - [ ] Create procedures for test updates
  - [ ] Document coverage monitoring process
  - [ ] Establish test quality review process

- **Team Resources**
  - [ ] Create quick reference guides
  - [ ] Document tool configurations
  - [ ] Provide examples and templates
  - [ ] Set up knowledge sharing practices

## 📤 Output
**File:** `.agents-playbook/[feature-or-task-name]/test-strategy.md`

Sections:
1. **Testing Philosophy** – approach, principles, goals
2. **Standards & Conventions** – naming, structure, patterns
3. **Implementation Guide** – how to write tests, examples
4. **Tools & Configuration** – framework setup, utilities
5. **Coverage & Quality** – goals, monitoring, reporting
6. **Maintenance** – responsibilities, procedures, updates
7. **Resources** – references, examples, troubleshooting

## 📚 Documentation Components

### Developer Quick Start
```markdown
## Writing Your First Test
1. Create test file: `src/utils/__tests__/helper.test.js`
2. Import function: `import { helper } from '../helper';`
3. Write test: `describe('helper', () => { ... })`
```

### Testing Patterns
```markdown
## Common Patterns
- **Pure Functions**: Input → Function → Output
- **Async Operations**: Use await/async patterns
- **Error Handling**: Test error scenarios
- **Mocking**: Mock external dependencies
```

### Quality Standards
```markdown
## Test Quality Checklist
- [ ] Test names are descriptive
- [ ] Tests are isolated and independent
- [ ] Edge cases are covered
- [ ] Mocks are appropriate
```

## 🎯 Key Documentation Areas
- **Testing Philosophy**: Why we test, what we test
- **Implementation Standards**: How to write good tests
- **Maintenance Process**: Keeping tests healthy
- **Tool Usage**: Effective use of testing tools
- **Quality Assurance**: Ensuring test reliability

## ➡️ Response Flow
Analyze implementation → Define standards → Create guides → Document procedures → Establish maintenance 