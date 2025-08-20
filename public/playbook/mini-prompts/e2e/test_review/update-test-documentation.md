# Update Test Documentation

## Purpose
Update and maintain comprehensive documentation for E2E tests, including test metadata, execution instructions, and integration with QASE or other test management systems.

## Context
- **Test Implementation**: Complete test implementation and validation results
- **Test Results**: Results from local execution, stability validation, and integration testing
- **Test Metadata**: Information about test purpose, scope, and requirements
- **QASE Integration**: Test management system integration requirements

## Instructions
1. **Update Test Descriptions**: Ensure test descriptions accurately reflect current implementation
2. **Document Test Data Requirements**: Record what data is needed and how it's managed
3. **Update Execution Instructions**: Provide clear instructions for running tests
4. **Document Dependencies**: List any external dependencies or prerequisites
5. **Update QASE Integration**: Ensure test metadata is properly configured
6. **Maintain Change History**: Track changes and updates to test documentation

## Output Format
```json
{
  "documentation_updates": {
    "test_descriptions": [
      {
        "test_name": "should complete happy path workflow",
        "current_description": "Updated description reflecting actual implementation",
        "previous_description": "Original description if different",
        "update_reason": "Why the description was updated"
      }
    ],
    "test_data_documentation": [
      {
        "test_name": "Test name",
        "data_requirements": ["List of required test data"],
        "data_sources": ["Presets", "Factories", "Manual setup"],
        "setup_instructions": "Step-by-step data setup process",
        "cleanup_requirements": "What needs to be cleaned up after test"
      }
    ],
    "execution_instructions": {
      "prerequisites": ["What must be set up before running tests"],
      "command_line": "npm run test:feature-name",
      "environment_requirements": ["Browser versions", "Dependencies"],
      "expected_duration": "Estimated time to complete test suite"
    }
  },
  "qase_integration": {
    "test_cases": [
      {
        "qase_id": "TC-123",
        "test_name": "Test name in QASE",
        "description": "Test description for QASE",
        "priority": "High/Medium/Low",
        "tags": ["e2e", "feature-name", "critical-path"],
        "automation_status": "Automated",
        "last_updated": "2024-01-15"
      }
    ],
    "test_suite": {
      "suite_name": "Feature E2E Tests",
      "suite_description": "End-to-end tests for feature functionality",
      "total_test_cases": 8,
      "automation_coverage": "100%"
    }
  },
  "change_history": [
    {
      "date": "2024-01-15",
      "change_type": "Test implementation/Test update/Documentation update",
      "description": "What was changed",
      "reason": "Why the change was made",
      "impact": "How this affects test execution or maintenance"
    }
  ],
  "maintenance_notes": [
    {
      "area": "Test data/Page objects/Assertions",
      "notes": "Important information for future maintenance",
      "recommendations": ["Suggestions for future improvements"],
      "known_issues": ["Any known limitations or issues"]
    }
  ],
  "next_documentation_tasks": [
    "Update QASE with latest test results",
    "Review and update test execution instructions",
    "Document any new dependencies or requirements"
  ]
}
```

## Documentation Guidelines
- **Accuracy**: Ensure documentation reflects current test implementation
- **Completeness**: Cover all aspects of test execution and maintenance
- **Clarity**: Use clear, concise language that's easy to understand
- **Consistency**: Follow established documentation patterns and formats
- **Maintenance**: Keep documentation updated as tests evolve
- **Integration**: Ensure proper integration with test management systems

## Success Criteria
- Test documentation is accurate and up-to-date
- Test data requirements are clearly documented
- Execution instructions are comprehensive and clear
- QASE integration is properly configured
- Change history is maintained
- Maintenance notes provide valuable guidance
