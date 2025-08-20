# Validate Test Stability

## Purpose
Assess the stability and reliability of E2E tests by analyzing execution results, identifying potential flakiness, and ensuring tests can run consistently without intermittent failures.

## Context
- **Test Execution Results**: Output from execute-test-locally step
- **Stability Metrics**: Test execution patterns and failure analysis
- **Flakiness Indicators**: Tests that fail intermittently or inconsistently
- **Retry Behavior**: How tests behave when run multiple times

## Instructions
1. **Analyze Execution Patterns**: Review test execution results for consistency
2. **Identify Flaky Tests**: Detect tests that fail intermittently or inconsistently
3. **Assess Retry Behavior**: Evaluate how tests perform with multiple executions
4. **Analyze Failure Patterns**: Look for patterns in test failures
5. **Evaluate Timing Issues**: Check for tests that are sensitive to timing
6. **Recommend Stability Improvements**: Suggest changes to improve test reliability

## Output Format
```json
{
  "stability_analysis": {
    "overall_stability_score": "85%",
    "stable_tests": ["List of consistently passing tests"],
    "potentially_flaky_tests": ["List of tests with stability concerns"],
    "unstable_tests": ["List of consistently failing tests"]
  },
  "flakiness_analysis": [
    {
      "test_name": "should complete workflow",
      "flakiness_score": "Low/Medium/High",
      "failure_pattern": "Description of when/how it fails",
      "root_cause": "Likely cause of flakiness",
      "recommendation": "How to improve stability"
    }
  ],
  "retry_behavior": [
    {
      "test_name": "should handle validation errors",
      "first_run": "passed/failed",
      "second_run": "passed/failed",
      "third_run": "passed/failed",
      "consistency": "Consistent/Inconsistent",
      "notes": "Observations about retry behavior"
    }
  ],
  "timing_analysis": [
    {
      "test_name": "should load page quickly",
      "execution_times": [15.2, 18.7, 12.9, 22.1],
      "average_time": "17.2s",
      "variance": "High/Medium/Low",
      "timing_issues": "Description of any timing-related problems"
    }
  ],
  "stability_improvements": [
    {
      "test_name": "Test name",
      "current_issue": "Description of stability problem",
      "recommended_fix": "Specific action to improve stability",
      "priority": "High/Medium/Low",
      "effort": "Estimated effort to implement"
    }
  ],
  "next_steps": [
    "Implement waitFor conditions for flaky tests",
    "Add retry logic for timing-sensitive operations",
    "Review and update selectors for unstable elements"
  ]
}
```

## Stability Guidelines
- **Consistency Check**: Run tests multiple times to identify flakiness
- **Timing Analysis**: Look for tests sensitive to execution timing
- **Element Stability**: Check for UI elements that may not be consistently available
- **Data Dependencies**: Identify tests that depend on external data or state
- **Environment Factors**: Consider browser, network, and system variations
- **Wait Strategies**: Evaluate if proper wait conditions are in place

## Success Criteria
- Test stability is thoroughly assessed
- Flaky tests are identified and documented
- Root causes of instability are analyzed
- Specific improvement recommendations are provided
- Retry behavior is evaluated
- Timing issues are identified and addressed
