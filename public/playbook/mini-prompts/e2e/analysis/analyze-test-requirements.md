# Analyze Test Requirements

## Purpose
Analyze and understand the requirements for creating a new E2E test, including feature description, user stories, acceptance criteria, and business requirements.

## Context
- **Feature Description**: What functionality needs to be tested
- **User Stories**: How users interact with the feature
- **Acceptance Criteria**: What constitutes a successful test
- **Business Requirements**: Why this feature is important

## Instructions
1. **Review Input Materials**: Carefully examine all provided documentation and requirements
2. **Identify Core Functionality**: Determine what the feature actually does
3. **Map User Interactions**: Understand the user journey and workflow
4. **Extract Test Criteria**: Identify what needs to be validated
5. **Assess Complexity**: Evaluate the scope and complexity of testing needed
6. **Document Assumptions**: Note any missing information or assumptions made

## Output Format
```json
{
  "feature_summary": "Brief description of what the feature does",
  "user_journey": "Step-by-step user interaction flow",
  "critical_paths": ["List of essential user workflows to test"],
  "acceptance_criteria": ["List of specific criteria that must be met"],
  "test_scope": "High/Medium/Low complexity assessment",
  "dependencies": ["List of features or systems this depends on"],
  "assumptions": ["List of assumptions made due to missing information"],
  "risks": ["Potential testing challenges or risks identified"]
}
```

## Success Criteria
- All provided requirements are thoroughly analyzed
- Core functionality is clearly understood
- User journey is mapped out step-by-step
- Test scope and complexity are accurately assessed
- Missing information is identified and documented
- Output is structured and actionable for next steps
