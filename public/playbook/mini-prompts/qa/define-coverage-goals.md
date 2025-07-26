# Define Coverage Goals Prompt (v1)

## 🎯 Goal
Establish realistic and meaningful test coverage targets based on project needs and constraints.

## 📥 Context (ask if missing)
1. **Coverage Analysis** – current coverage state, gap analysis results
2. **Code Structure** – module criticality, business logic distribution
3. **Team Standards** – existing testing guidelines, quality gates
4. **Project Requirements** – compliance needs, quality standards, timeline

## 🚦 Skip if
- Coverage goals already defined and documented or project has strict predefined coverage requirements

## 🔍 Checklist
- **Target Definition**
  - [ ] Set overall coverage percentage goal (realistic but meaningful)
  - [ ] Define module-specific targets based on criticality
  - [ ] Establish minimum thresholds for critical business logic
  - [ ] Set timeline for achieving coverage goals

- **Quality Standards**
  - [ ] Define test quality requirements (not just quantity)
  - [ ] Establish standards for test categories (unit vs integration)
  - [ ] Set expectations for edge case coverage
  - [ ] Define mocking and isolation standards

- **Measurement Criteria**
  - [ ] Choose coverage metrics (line, branch, function, statement)
  - [ ] Define what counts toward coverage goals
  - [ ] Establish reporting and monitoring frequency
  - [ ] Set up automated coverage tracking

- **Resource Planning**
  - [ ] Estimate effort required for target achievement
  - [ ] Identify team members and skills needed
  - [ ] Plan integration with development workflow
  - [ ] Consider maintenance overhead

## 📤 Output
**File:** `.agents-playbook/[feature-or-task-name]/coverage-goals.md`

Sections:
1. **Coverage Targets** – overall %, by module, by priority
2. **Quality Standards** – test requirements, best practices
3. **Measurement Framework** – metrics, tools, reporting
4. **Implementation Plan** – phases, timeline, resources
5. **Success Criteria** – definition of done, validation methods
6. **Risk Assessment** – challenges, mitigation strategies

## 🎯 Recommended Targets
- **Critical Business Logic**: 90-95% coverage
- **Core Application Logic**: 80-85% coverage  
- **Utility Functions**: 70-80% coverage
- **Configuration/Setup**: 50-70% coverage
- **Overall Project Goal**: 75-85% (realistic for most projects)

## ⚖️ Balancing Factors
- **Quality over Quantity**: Meaningful tests vs coverage percentage
- **ROI Consideration**: Focus on high-value, high-risk areas first
- **Maintenance Cost**: Balance coverage with test maintainability
- **Team Capacity**: Realistic goals based on available resources

## ➡️ Response Flow
Assess current state → Set targets → Define standards → Plan implementation → Document goals 