# Create Test Plan

## Goal
Create comprehensive test strategy covering functional, non-functional, and regression testing requirements.

## Context Required
- Requirements document or specifications
- System architecture and components
- Available testing tools and environment

## Skip When
- Test plan already exists and covers scope
- Simple changes not requiring formal testing
- Emergency fixes with deferred testing

## Complexity Assessment
- **Task Complexity**: Medium-High - requires testing strategy and planning skills

## Task Understanding Assessment
If task unclear - ask clarifying questions with multiple choice options

## Test Strategy Framework

### Test Types
- **Unit Tests** - individual components, business logic, edge cases
- **Integration Tests** - component interactions, API contracts, data flow
- **System Tests** - end-to-end workflows, user scenarios, acceptance criteria
- **Performance Tests** - load, stress, scalability, response times
- **Security Tests** - authentication, authorization, data protection, vulnerabilities
- **Regression Tests** - existing functionality, backward compatibility

### Test Levels
- **Component Level** - isolated unit testing, mocking dependencies
- **Integration Level** - service interactions, database integration
- **System Level** - complete workflows, user acceptance testing
- **Acceptance Level** - business criteria, stakeholder validation

## Test Planning Elements

### Test Scope
- **In Scope** - features, components, integrations to test
- **Out of Scope** - explicitly excluded areas
- **Test Environment** - development, staging, production-like setup
- **Test Data** - realistic datasets, edge cases, boundary conditions

### Test Execution
- **Manual Testing** - exploratory, user experience, complex scenarios
- **Automated Testing** - regression, performance, CI/CD integration
- **Test Schedule** - phases, milestones, dependencies
- **Entry/Exit Criteria** - when to start/stop testing phases

### Risk Assessment
- **High Risk Areas** - critical functionality, complex integrations
- **Medium Risk Areas** - standard features, known patterns
- **Low Risk Areas** - simple changes, well-tested components

## Key Outputs
- Comprehensive test plan document
- Test case specifications and scripts
- Test environment requirements
- Test data preparation strategy
- Risk assessment and mitigation
- Resource allocation and timeline

## Success Criteria
- All requirements covered by test cases
- Test environment prepared and validated
- Test data available and realistic
- Automation framework setup (if applicable)
- Team trained on test procedures 