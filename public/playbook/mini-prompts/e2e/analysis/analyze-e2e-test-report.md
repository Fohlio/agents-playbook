# Analyze E2E Test Report

## Purpose
Analyze comprehensive E2E test reports to understand test execution results, identify failures, and gather insights for investigation and fixing.

## Context
- **Test Report File**: HTML or JSON test report from Playwright execution
- **Failure Statistics**: Summary of test results and failure counts
- **Trace Files**: Playwright trace files for failed tests
- **Attachments**: Screenshots, videos, and other test artifacts

## Instructions
1. **Review Test Report**: Examine the overall test execution report and statistics
2. **Analyze Failure Patterns**: Identify common failure types and patterns
3. **Examine Trace Files**: Review Playwright traces for detailed failure information
4. **Review Attachments**: Analyze screenshots, videos, and other test artifacts
5. **Extract Key Metrics**: Gather important statistics and performance data
6. **Document Findings**: Record all relevant information for further investigation

## Output Format
```json
{
  "report_summary": {
    "total_tests": 45,
    "passed": 38,
    "failed": 5,
    "skipped": 2,
    "execution_time": "12m 45s",
    "pass_rate": "84.4%",
    "report_file_path": "path/to/test-report.html"
  },
  "failure_analysis": {
    "failure_count": 5,
    "failure_rate": "11.1%",
    "failure_types": {
      "element_not_found": 2,
      "timeout_error": 1,
      "assertion_failure": 1,
      "network_error": 1
    },
    "critical_failures": ["List of high-impact failures"],
    "intermittent_failures": ["List of flaky tests"]
  },
  "trace_analysis": [
    {
      "test_name": "should complete user workflow",
      "trace_file": "path/to/trace.zip",
      "failure_point": "Step where test failed",
      "error_message": "Specific error message",
      "browser_state": "Browser state at failure",
      "network_requests": ["Relevant network calls"],
      "console_errors": ["JavaScript errors in console"]
    }
  ],
  "attachment_review": [
    {
      "test_name": "Test name",
      "screenshots": ["List of screenshot files"],
      "videos": ["List of video files"],
      "logs": ["List of log files"],
      "key_insights": ["Important observations from attachments"]
    }
  ],
  "performance_metrics": {
    "average_test_duration": "15.2s",
    "slowest_tests": ["List of tests taking longest"],
    "fastest_tests": ["List of tests completing quickly"],
    "performance_anomalies": ["Tests with unusual timing"]
  },
  "environment_information": {
    "browser_versions": ["Chrome 119", "Firefox 119"],
    "platform": "Operating system and version",
    "playwright_version": "1.40.0",
    "test_environment": "CI/Local/Staging"
  },
  "investigation_priorities": [
    {
      "priority": "High/Medium/Low",
      "test_name": "Name of test to investigate",
      "reason": "Why this test needs priority investigation",
      "estimated_effort": "Time estimate for investigation"
    }
  ],
  "next_steps": [
    "Investigate high-priority failures first",
    "Review trace files for root cause analysis",
    "Analyze screenshots for visual clues"
  ]
}
```

## Analysis Guidelines
- **Comprehensive Review**: Examine all aspects of the test report
- **Pattern Recognition**: Look for common failure types and patterns
- **Trace Investigation**: Use Playwright traces to understand failure context
- **Visual Analysis**: Review screenshots and videos for visual clues
- **Performance Review**: Identify performance issues and anomalies
- **Priority Assessment**: Determine which failures need immediate attention

## Success Criteria
- Test report is thoroughly analyzed
- Failure patterns are identified and categorized
- Trace files provide actionable insights
- Attachments reveal relevant information
- Key metrics are extracted and documented
- Investigation priorities are established
