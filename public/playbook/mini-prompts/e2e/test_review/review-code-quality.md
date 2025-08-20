# Review Code Quality

## Purpose
Review the code quality of E2E tests to ensure they follow Playwright best practices, repository standards, and maintainability guidelines.

## Context
- **Test Implementation**: Complete test implementation from previous steps
- **Playwright Best Practices**: Established patterns and recommendations
- **Repository Standards**: Code quality standards used in the project
- **Linting Results**: Any automated code quality checks

## Instructions
1. **Review Code Structure**: Assess overall test organization and readability
2. **Check Playwright Patterns**: Verify adherence to Playwright best practices
3. **Evaluate Maintainability**: Assess how easy the code is to maintain and update
4. **Review Naming Conventions**: Check consistency in naming and organization
5. **Assess Error Handling**: Evaluate how errors and edge cases are handled
6. **Check Documentation**: Review code comments and documentation quality

## Output Format
```json
{
  "code_quality_score": "85%",
  "structure_analysis": {
    "test_organization": "Good/Needs Improvement",
    "file_structure": "Follows conventions/Needs restructuring",
    "naming_conventions": "Consistent/Inconsistent",
    "code_readability": "Clear/Unclear"
  },
  "playwright_compliance": {
    "locator_usage": "Follows best practices/Needs improvement",
    "wait_strategies": "Appropriate/Inappropriate",
    "page_object_usage": "Properly implemented/Needs work",
    "test_step_usage": "Correctly applied/Incorrect usage"
  },
  "maintainability_assessment": {
    "code_duplication": "Low/Medium/High",
    "complexity": "Simple/Moderate/Complex",
    "extensibility": "Easy/Moderate/Difficult",
    "documentation": "Comprehensive/Partial/Minimal"
  },
  "issues_found": [
    {
      "severity": "High/Medium/Low",
      "category": "Structure/Playwright/Maintainability",
      "description": "Description of the issue",
      "location": "File and line number",
      "recommendation": "How to fix the issue"
    }
  ],
  "best_practices_compliance": [
    {
      "practice": "Use getByRole over locator",
      "compliance": "Compliant/Partially compliant/Non-compliant",
      "examples": ["List of compliant/non-compliant usage"],
      "impact": "How this affects code quality"
    }
  ],
  "improvement_recommendations": [
    {
      "priority": "High/Medium/Low",
      "area": "Code structure/Playwright usage/Maintainability",
      "recommendation": "Specific improvement action",
      "effort": "Estimated effort to implement",
      "benefit": "Expected improvement in code quality"
    }
  ]
}
```

## Code Quality Guidelines
- **Structure**: Tests should be well-organized and easy to navigate
- **Playwright Patterns**: Follow established Playwright best practices
- **Naming**: Use descriptive names for tests, methods, and variables
- **Documentation**: Include clear comments explaining complex logic
- **Error Handling**: Properly handle errors and edge cases
- **Maintainability**: Code should be easy to update and extend
- **Consistency**: Follow established patterns throughout the codebase

## Success Criteria
- Code quality is thoroughly assessed
- Playwright best practices compliance is evaluated
- Maintainability issues are identified
- Specific improvement recommendations are provided
- Code structure follows repository standards
- Documentation quality is assessed
