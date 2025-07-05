# Phase • Testing & Validation

## Purpose
Verify that the implementation meets requirements through comprehensive testing and validation against acceptance criteria.

## Steps Sequence
1. **create-test-plan** - Develop comprehensive test strategy and test cases
2. **execute-unit-tests** - Run and validate unit tests for individual components [conditional: if unit tests exist/required]
3. **execute-integration-tests** - Test component interactions and data flow [conditional: if integration testing required]
4. **ai-browser-testing** - Automated browser testing for web applications [conditional: if web app and playwright available]
5. **manual-testing** - Execute manual test scenarios and edge cases
6. **performance-testing** - Validate performance requirements and benchmarks [conditional: if performance requirements]
7. **security-testing** - Validate security measures and access controls [conditional: if security requirements]
8. **user-acceptance-testing** - Validate against original requirements and user stories
9. **regression-testing** - Ensure existing functionality remains intact [conditional: if existing system]

## Phase Prerequisites
- **Context**: Completed implementation and original requirements
- **MCP Servers**: 
  - `playwright` (for automated browser testing)
- **Optional**: Test environment access, test data, performance monitoring tools

## Phase Success Criteria
- All test cases executed with documented results
- Critical bugs identified and resolved
- Performance requirements validated
- Security requirements verified
- User acceptance criteria confirmed
- Regression testing passed
- Test coverage meets project standards
- Known issues documented with workarounds

## Skip Conditions
- Simple configuration changes with no functional impact
- Emergency hotfix where extensive testing delays critical resolution
- Non-functional changes (documentation, comments only)
- Testing was completed in previous session

## Validation Logic
```javascript
canExecutePhase() {
  return hasContext('completed_implementation') &&
         hasContext('requirements') &&
         requiresTesting();
}

shouldSkipPhase() {
  return isConfigurationOnly() ||
         isDocumentationOnly() ||
         isEmergencyHotfix() ||
         hasContext('completed_testing');
}

requiresTesting() {
  return hasCodeChanges() ||
         hasNewFeatures() ||
         hasCriticalBugFixes() ||
         hasSecurityChanges();
}
```

## Expected Duration
**Simple**: 1-2 hours  
**Standard**: 4-8 hours  
**Complex**: 1-3 days

## Outputs
- Comprehensive test plan with test cases
- Test execution results and reports
- Unit test coverage report (if applicable)
- Integration test results
- Performance test results (if applicable)
- Security test results (if applicable)
- User acceptance testing sign-off
- Bug reports for any issues found
- Regression testing confirmation
- Test environment validation
- Go/no-go recommendation for deployment

## Notes
- Testing should not be an afterthought - plan testing early in the process
- Automate testing where possible to ensure consistency
- Focus testing effort on critical paths and edge cases
- Document all test results, including negative test cases
- Get user/stakeholder validation before proceeding to deployment
- Consider testing in production-like environment when possible
- Balance thorough testing with project timeline constraints 