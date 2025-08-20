# Execute Test Locally

## Purpose
Execute E2E tests locally to validate that they work correctly, identify any issues, and ensure the test environment is properly configured before proceeding to integration testing.

## Context
- **Implemented Test**: Complete test implementation from add-assertions-validations step
- **Test Environment**: Local Playwright setup and configuration
- **Test Data**: Required test data and dependencies
- **Dependencies**: Any external systems or services needed for testing

## Instructions
1. **Verify Environment Setup**: Ensure Playwright is properly configured and dependencies are available
2. **Prepare Test Data**: Set up required test data using presets and factories
3. **Execute Test Suite**: Run the complete test suite locally
4. **Monitor Execution**: Watch for any failures, errors, or unexpected behavior
5. **Document Results**: Record test execution results, timing, and any issues found
6. **Validate Output**: Ensure test output matches expected results

## Output Format
```json
{
  "execution_summary": {
    "total_tests": 10,
    "passed": 8,
    "failed": 1,
    "skipped": 1,
    "execution_time": "2m 30s",
    "environment": "Local Playwright setup"
  },
  "test_results": [
    {
      "test_name": "should complete happy path workflow",
      "status": "passed",
      "execution_time": "15.2s",
      "details": "Test executed successfully"
    },
    {
      "test_name": "should handle validation errors",
      "status": "failed",
      "execution_time": "8.5s",
      "error_message": "Element not found: submit button",
      "details": "UI element selector issue"
    }
  ],
  "environment_validation": {
    "playwright_version": "1.40.0",
    "browser_versions": ["Chrome 119", "Firefox 119"],
    "dependencies_available": true,
    "test_data_setup": "Successfully created test data",
    "external_services": "All required services accessible"
  },
  "issues_found": [
    {
      "severity": "High/Medium/Low",
      "description": "Description of the issue",
      "impact": "How this affects test execution",
      "recommendation": "Suggested fix or next step"
    }
  ],
  "next_steps": [
    "Fix failing test: update selector for submit button",
    "Verify test data setup is working correctly",
    "Run test suite again after fixes"
  ]
}
```

## Execution Guidelines
- **Environment Check**: Verify Playwright installation and browser availability
- **Data Preparation**: Ensure test data is properly set up and accessible
- **Test Execution**: Run tests with appropriate Playwright commands
- **Result Monitoring**: Watch for failures, performance issues, and unexpected behavior
- **Issue Documentation**: Record all issues with sufficient detail for fixing
- **Environment Validation**: Confirm all dependencies and services are working

## Success Criteria
- All tests execute without environment errors
- Test data is properly set up and accessible
- Test execution completes successfully
- Any failures are clearly documented with details
- Environment configuration is validated
- Next steps are clearly identified
