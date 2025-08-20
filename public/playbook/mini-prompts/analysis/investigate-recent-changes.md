# Investigate Recent Changes

## Purpose
Investigate recent changes in the Fohlio frontend codebase to understand what modifications might have caused E2E test failures and identify potential root causes.

## Context
- **Failure Analysis**: E2E test failure analysis and statistics
- **Git History**: Recent commits and changes in the repository
- **Changed Files**: Files that have been modified recently
- **Test Failures**: Specific test failures that need investigation

## Instructions
1. **Review Git History**: Examine recent commits and changes in the repository
2. **Identify Changed Files**: Map which files have been modified recently
3. **Analyze Change Impact**: Assess how changes might affect failing tests
4. **Correlate Changes with Failures**: Link specific changes to test failures
5. **Identify Risk Areas**: Determine which changes pose the highest risk
6. **Document Investigation Findings**: Record all relevant information for analysis

## Output Format
```json
{
  "recent_changes_summary": {
    "investigation_period": "Last 7 days/Last 30 days/Custom period",
    "total_commits": 25,
    "files_changed": 45,
    "high_risk_changes": 8,
    "medium_risk_changes": 12,
    "low_risk_changes": 25
  },
  "git_history_analysis": [
    {
      "commit_hash": "abc123def456",
      "commit_date": "2024-01-15",
      "author": "Developer Name",
      "commit_message": "Update user authentication flow",
      "files_changed": ["src/components/Auth.tsx", "src/services/auth.ts"],
      "change_type": "Feature update/Bug fix/Refactoring",
      "risk_level": "High/Medium/Low"
    }
  ],
  "changed_files_analysis": [
    {
      "file_path": "src/components/Auth.tsx",
      "change_type": "Modified/Added/Deleted",
      "lines_changed": "15-25, 45-52",
      "change_description": "Updated authentication form validation",
      "related_tests": ["Tests that might be affected"],
      "risk_assessment": "High/Medium/Low",
      "potential_impact": "How this change might affect tests"
    }
  ],
  "failure_correlation": [
    {
      "test_failure": "should complete user authentication",
      "related_changes": ["List of changes that might cause this failure"],
      "correlation_strength": "Strong/Moderate/Weak",
      "change_impact": "How the change directly affects the test",
      "investigation_priority": "High/Medium/Low"
    }
  ],
  "risk_assessment": {
    "high_risk_changes": [
      {
        "change_description": "Description of high-risk change",
        "affected_tests": ["Tests likely to be impacted"],
        "risk_factors": ["Why this change is high risk"],
        "mitigation_strategies": ["How to reduce risk"]
      }
    ],
    "medium_risk_changes": ["List of medium-risk changes"],
    "low_risk_changes": ["List of low-risk changes"]
  },
  "module_impact_analysis": {
    "affected_modules": ["List of modules with recent changes"],
    "test_coverage": "How well affected modules are tested",
    "integration_points": ["Areas where modules interact"],
    "potential_conflicts": ["Possible conflicts between changes"]
  },
  "investigation_recommendations": [
    {
      "priority": "High/Medium/Low",
      "action": "Specific action to take",
      "target": "What to investigate",
      "expected_outcome": "What this investigation should reveal",
      "effort_estimate": "Time estimate for investigation"
    }
  ],
  "next_investigation_steps": [
    "Examine high-risk changes in detail",
    "Review test coverage for affected modules",
    "Analyze integration points between changed components"
  ]
}
```

## Investigation Guidelines
- **Comprehensive Review**: Examine all recent changes, not just obvious ones
- **Risk Assessment**: Evaluate the potential impact of each change
- **Correlation Analysis**: Link changes to specific test failures
- **Module Analysis**: Understand how changes affect different parts of the system
- **Test Coverage**: Assess how well affected areas are tested
- **Integration Impact**: Consider how changes affect system integration

## Success Criteria
- Recent changes are thoroughly investigated
- Risk levels are accurately assessed
- Changes are correlated with test failures
- Module impact is understood
- Investigation priorities are established
- Actionable recommendations are provided
