# Extract Failing Test Details

## Purpose
Extract comprehensive details about failing tests including file paths, function names, failure locations, and specific error information to enable targeted investigation and fixing.

## Context
- **Failure Patterns**: Analysis from analyze-test-failures step
- **Test Report Analysis**: Overall test report analysis results
- **Test File Paths**: Location of failing test files in the repository
- **Test Function Names**: Specific test functions that are failing

## Instructions
1. **Identify Test Locations**: Map failing tests to their file locations in the repository
2. **Extract Test Function Details**: Get specific function names and test descriptions
3. **Analyze Failure Details**: Examine specific error messages and failure points
4. **Map Test Dependencies**: Identify any dependencies between failing tests
5. **Document Failure Context**: Record the context in which failures occur
6. **Prioritize Investigation**: Rank tests by investigation priority

## Output Format
```json
{
  "failing_test_mapping": [
    {
      "test_name": "should complete user workflow",
      "test_file_path": "src/tests/feature-name/feature.spec.ts",
      "test_function_name": "test('should complete user workflow', async ({ page }) => {",
      "line_number": 45,
      "failure_type": "Element not found/Timeout/Assertion failure",
      "error_message": "Element not found: submit button",
      "failure_context": "Step where the failure occurred"
    }
  ],
  "test_file_analysis": [
    {
      "file_path": "src/tests/feature-name/feature.spec.ts",
      "total_tests": 8,
      "failing_tests": 2,
      "passing_tests": 6,
      "file_failure_rate": "25%",
      "related_tests": ["List of tests in same file"]
    }
  ],
  "failure_details": [
    {
      "test_name": "Test name",
      "failure_point": "Exact step or action where test failed",
      "error_details": {
        "error_type": "Type of error (ElementNotFound, Timeout, etc.)",
        "error_message": "Full error message",
        "stack_trace": "Relevant stack trace information",
        "browser_state": "Browser state at time of failure"
      },
      "test_data": "Test data being used when failure occurred",
      "environment_factors": ["Browser", "Platform", "Timing"]
    }
  ],
  "test_dependencies": [
    {
      "test_name": "Test name",
      "depends_on": ["Tests that must run before this test"],
      "dependent_tests": ["Tests that depend on this test"],
      "shared_resources": ["Resources shared with other tests"],
      "isolation_issues": ["Any isolation problems identified"]
    }
  ],
  "investigation_priority": [
    {
      "priority": "Critical/High/Medium/Low",
      "test_name": "Name of test",
      "business_impact": "Impact on business functionality",
      "failure_frequency": "How often this test fails",
      "investigation_effort": "Estimated effort to investigate",
      "recommended_order": "Order in which to investigate"
    }
  ],
  "repository_context": {
    "test_directory_structure": "Overview of test file organization",
    "related_page_objects": ["Page objects used by failing tests"],
    "related_fixtures": ["Fixtures used by failing tests"],
    "test_data_sources": ["Where test data comes from"],
    "configuration_files": ["Relevant test configuration files"]
  },
  "next_investigation_steps": [
    "Examine test file: src/tests/feature-name/feature.spec.ts",
    "Review page object: src/models/feature-page-object.ts",
    "Check test data setup in presets/factories"
  ]
}
```

## Extraction Guidelines
- **Precise Location**: Identify exact file paths and line numbers
- **Function Mapping**: Map test names to actual test function implementations
- **Failure Context**: Understand the context in which failures occur
- **Dependency Analysis**: Identify relationships between failing tests
- **Priority Assessment**: Determine investigation order based on impact
- **Repository Context**: Understand how tests fit into the overall structure

## Success Criteria
- All failing tests are mapped to their repository locations
- Test function details are accurately extracted
- Failure details provide actionable information
- Test dependencies are clearly identified
- Investigation priorities are established
- Repository context is understood
