# Execute Tests

## Goal
Execute the planned test cases to validate implementation meets requirements and identify any issues before deployment.

## Context Required
- Test plan with defined test cases
- Implementation ready for testing

## Skip When
- No test plan available or test cases undefined
- Implementation not ready for testing
- Test environment not accessible
- Emergency deployment where testing is deferred

## Complexity Assessment
- **Task Complexity**: Medium - requires testing skills and systematic execution

## Task Understanding Assessment
If task unclear - ask clarifying questions with multiple choice options

## Test Execution Categories

### Functional Test Execution
- **Core Feature Tests** - primary functionality validation
- **User Workflow Tests** - complete user journey testing
- **Business Logic Tests** - rules and validation testing
- **API Endpoint Tests** - input/output validation
- **Data Processing Tests** - data transformation and storage

### Non-Functional Test Execution
- **Performance Tests** - response time and throughput testing
- **Load Tests** - system behavior under expected load
- **Security Tests** - vulnerability and access control testing
- **Usability Tests** - user experience validation
- **Compatibility Tests** - different environments and configurations

### Integration Test Execution
- **Component Integration** - module interaction testing
- **External API Integration** - third-party service testing
- **Database Integration** - data persistence validation
- **User Interface Integration** - frontend-backend communication
- **System Integration** - end-to-end workflow testing

### Regression Test Execution
- **Existing Feature Tests** - ensure no functionality broken
- **Previous Bug Tests** - verify previously fixed issues remain fixed
- **Core Functionality Tests** - critical system features still work
- **Integration Points** - key integration still functioning
- **Performance Baseline** - performance hasn't degraded

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

## Key Tasks
1. **Set up test environment** - prepare environment with test data and configuration
2. **Execute functional tests** - run core functionality test cases
3. **Execute edge case tests** - test boundary conditions and error scenarios
4. **Execute integration tests** - verify component interactions work correctly
5. **Execute performance tests** - validate performance requirements (if applicable)
6. **Document test results** - record all test outcomes with evidence
7. **Analyze failures** - investigate and document any test failures

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

## Success Criteria
- All critical test cases executed successfully
- Test failures documented with clear reproduction steps
- Performance requirements validated (if applicable)
- Integration points working correctly
- Edge cases and error scenarios handled properly
- Complete test results documented
- Clear go/no-go recommendation provided

## Key Outputs
- Test execution results and reports
- Pass/fail status for all test cases
- Screenshots and evidence for failed tests
- Performance test results (if applicable)
- Bug reports for any issues found
- Test coverage analysis
- Overall test summary and recommendations 