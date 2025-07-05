# Step • Execute Tests

## Purpose
Execute the planned test cases to validate implementation meets requirements and identify any issues before deployment.

## Prerequisites
**Required MCP Servers**: 
- None (uses standard coding agent tools)

**Required Context**:
- Test plan with defined test cases
- Implementation ready for testing

**Optional Context**:
- Test environment access
- Test data and fixtures
- Automated testing tools
- Performance monitoring tools

## Validation Logic
```javascript
canExecute() {
  return hasContext('test_plan') &&
         hasContext('implementation_ready');
}
```

## Process
1. **Set up test environment** - Prepare environment with test data and configuration
2. **Execute functional tests** - Run core functionality test cases
3. **Execute edge case tests** - Test boundary conditions and error scenarios
4. **Execute integration tests** - Verify component interactions work correctly
5. **Execute performance tests** - Validate performance requirements (if applicable)
6. **Document test results** - Record all test outcomes with evidence
7. **Analyze failures** - Investigate and document any test failures

## Inputs
- Comprehensive test plan with test cases
- Implementation ready for testing
- Test environment and test data
- Testing tools and frameworks
- Performance and monitoring tools (if applicable)

## Outputs
- Test execution results and reports
- Pass/fail status for all test cases
- Screenshots and evidence for failed tests
- Performance test results (if applicable)
- Bug reports for any issues found
- Test coverage analysis
- Overall test summary and recommendations

## Success Criteria
- All critical test cases executed successfully
- Test failures documented with clear reproduction steps
- Performance requirements validated (if applicable)
- Integration points working correctly
- Edge cases and error scenarios handled properly
- Complete test results documented
- Clear go/no-go recommendation provided

## Skip Conditions
- No test plan available or test cases undefined
- Implementation not ready for testing
- Test environment not accessible
- Emergency deployment where testing is deferred

## Test Execution Categories

### Functional Test Execution
- **Core Feature Tests**: Primary functionality validation
- **User Workflow Tests**: Complete user journey testing
- **Business Logic Tests**: Rules and validation testing
- **API Endpoint Tests**: Input/output validation
- **Data Processing Tests**: Data transformation and storage

### Non-Functional Test Execution
- **Performance Tests**: Response time and throughput testing
- **Load Tests**: System behavior under expected load
- **Security Tests**: Vulnerability and access control testing
- **Usability Tests**: User experience validation
- **Compatibility Tests**: Different environments and configurations

### Integration Test Execution
- **Component Integration**: Module interaction testing
- **External API Integration**: Third-party service testing
- **Database Integration**: Data persistence validation
- **User Interface Integration**: Frontend-backend communication
- **System Integration**: End-to-end workflow testing

### Regression Test Execution
- **Existing Feature Tests**: Ensure no functionality broken
- **Previous Bug Tests**: Verify previously fixed issues remain fixed
- **Core Functionality Tests**: Critical system features still work
- **Integration Points**: Key integration still functioning
- **Performance Baseline**: Performance hasn't degraded

## Test Execution Best Practices

### Test Environment Management
- Verify environment is clean and properly configured
- Ensure test data is available and properly set up
- Validate all required services and dependencies are running
- Check access permissions and credentials
- Document environment configuration

### Test Data Management
- Use representative test data that matches production patterns
- Include edge cases in test data (empty, null, maximum values)
- Maintain data privacy and security during testing
- Clean up test data after execution
- Document test data requirements and sources

### Test Execution Process
- Execute tests in logical order (dependencies first)
- Document exact steps taken and results observed
- Take screenshots or videos for visual verification
- Record any deviations from expected behavior
- Note performance metrics and response times

### Issue Documentation
- Provide clear reproduction steps for any failures
- Include relevant screenshots, logs, and error messages
- Classify issues by severity and impact
- Suggest potential root causes when possible
- Track issue resolution and re-test results

## Test Result Documentation

### Test Case Results
- **Test Case ID**: Reference to original test case
- **Execution Date**: When the test was performed
- **Tester**: Who executed the test
- **Result**: Pass, Fail, Blocked, Not Executed
- **Notes**: Additional observations or comments
- **Evidence**: Screenshots, logs, or other proof

### Issue Reports
- **Issue ID**: Unique identifier for tracking
- **Severity**: Critical, High, Medium, Low
- **Priority**: Must fix, Should fix, Could fix
- **Description**: Clear problem description
- **Steps to Reproduce**: Exact steps to recreate issue
- **Expected vs Actual**: What should happen vs what actually happened
- **Environment**: Where the issue was found
- **Evidence**: Screenshots, logs, or error messages

### Test Summary Report
- **Overall Results**: Pass/fail counts and percentages
- **Critical Issues**: High-priority problems found
- **Performance Results**: Response times and throughput
- **Coverage Analysis**: What was tested vs what was planned
- **Risk Assessment**: Remaining risks and mitigation recommendations
- **Go/No-Go Recommendation**: Ready for deployment decision

## Automated vs Manual Testing

### Automated Test Execution
- Run regression test suites automatically
- Execute performance and load tests
- Validate API endpoints with automated tools
- Check code quality and security scans
- Generate reports automatically

### Manual Test Execution
- Exploratory testing for usability issues
- Complex user workflow validation
- Visual and UI testing
- Ad-hoc testing based on findings
- Acceptance testing with stakeholders

## Common Test Execution Patterns

### Smoke Testing
- Quick validation that basic functionality works
- Execute after deployment or major changes
- Focus on critical path functionality
- Fast execution for rapid feedback

### Regression Testing
- Comprehensive testing to ensure no functionality broken
- Execute before releases
- Include both automated and manual tests
- Cover all major features and integrations

### User Acceptance Testing
- Final validation with actual users or stakeholders
- Focus on business requirements and user workflows
- Real-world scenario testing
- Sign-off for production deployment

### Performance Testing
- Baseline performance measurement
- Load testing under expected usage
- Stress testing under peak conditions
- Endurance testing over extended periods

## Notes
- Execute tests systematically and document everything
- Don't skip failed tests - investigate and document thoroughly
- Balance automated and manual testing based on context
- Focus on critical path and high-risk areas if time is limited
- Communicate results clearly to stakeholders and development team
- Plan for re-testing after bug fixes 