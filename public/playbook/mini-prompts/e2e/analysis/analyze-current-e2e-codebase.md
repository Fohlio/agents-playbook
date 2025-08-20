# Analyze Current E2E Codebase

## Purpose
Analyze the existing E2E test codebase to understand current structure, patterns, organization, and identify opportunities for improvement or areas that need attention.

## Context
- **Repository Structure**: Current organization of E2E tests in the Playwright repository
- **Existing Patterns**: Established testing patterns and conventions
- **Test Coverage**: Current test coverage and gaps
- **Code Quality**: Overall quality and maintainability of existing tests
- **Dependencies**: Test dependencies, fixtures, and utilities

## Instructions
1. **Examine Repository Structure**: Analyze how E2E tests are organized in the repository
2. **Identify Testing Patterns**: Document established testing patterns and conventions
3. **Assess Test Coverage**: Evaluate current test coverage and identify gaps
4. **Review Code Quality**: Assess the quality and maintainability of existing tests
5. **Analyze Dependencies**: Understand test dependencies, fixtures, and utilities
6. **Document Findings**: Record comprehensive analysis results and recommendations

## Output Format
```json
{
  "repository_structure_analysis": {
    "test_directory_organization": {
      "root_test_directory": "src/tests/",
      "subdirectories": [
        {
          "directory_name": "feature-name",
          "purpose": "Tests for specific feature",
          "test_files": ["List of test files"],
          "organization_pattern": "Feature-based/Page-based/Workflow-based"
        }
      ],
      "organization_quality": "Well-organized/Moderately organized/Poorly organized"
    },
    "file_naming_conventions": {
      "test_file_pattern": "*.spec.ts",
      "naming_consistency": "Consistent/Partially consistent/Inconsistent",
      "examples": ["Examples of file names"],
      "recommendations": ["Suggestions for improving naming"]
    }
  },
  "testing_patterns_analysis": {
    "established_patterns": [
      {
        "pattern_name": "Page Object Model",
        "implementation_quality": "High/Medium/Low",
        "usage_consistency": "Consistent/Partially consistent/Inconsistent",
        "examples": ["Examples of pattern usage"],
        "effectiveness": "Effective/Partially effective/Ineffective"
      }
    ],
    "convention_analysis": {
      "test_structure": "How tests are typically structured",
      "assertion_patterns": "Common assertion approaches",
      "setup_teardown": "Test setup and teardown patterns",
      "data_management": "How test data is managed"
    }
  },
  "test_coverage_assessment": {
    "overall_coverage": {
      "total_features": 25,
      "features_with_tests": 20,
      "features_without_tests": 5,
      "coverage_percentage": "80%"
    },
    "coverage_by_category": [
      {
        "category": "User Authentication",
        "test_coverage": "High/Medium/Low",
        "test_count": 8,
        "coverage_gaps": ["Areas lacking test coverage"],
        "priority": "High/Medium/Low"
      }
    ],
    "critical_path_coverage": {
      "critical_paths": ["List of critical user journeys"],
      "covered_paths": ["Paths with good test coverage"],
      "uncovered_paths": ["Paths lacking test coverage"],
      "risk_assessment": "High/Medium/Low"
    }
  },
  "code_quality_analysis": {
    "overall_quality_score": "75%",
    "quality_metrics": {
      "readability": "High/Medium/Low",
      "maintainability": "High/Medium/Low",
      "reliability": "High/Medium/Low",
      "performance": "High/Medium/Low"
    },
    "code_quality_issues": [
      {
        "issue_type": "Code duplication/Complex logic/Poor naming",
        "severity": "High/Medium/Low",
        "description": "Description of the issue",
        "affected_files": ["Files with this issue"],
        "recommendation": "How to fix the issue"
      }
    ],
    "best_practices_compliance": {
      "playwright_best_practices": "High/Medium/Low compliance",
      "page_object_usage": "Proper/Partial/Incorrect usage",
      "locator_strategies": "Best practices followed/Partially followed/Not followed",
      "test_organization": "Well-organized/Moderately organized/Poorly organized"
    }
  },
  "dependencies_and_utilities": {
    "test_fixtures": [
      {
        "fixture_name": "test",
        "file_path": "src/fixtures/test.ts",
        "capabilities": ["What this fixture provides"],
        "usage_patterns": ["How it's typically used"],
        "effectiveness": "Effective/Partially effective/Ineffective"
      }
    ],
    "page_objects": [
      {
        "page_object_name": "BasePageObject",
        "file_path": "src/models/base-page-object.ts",
        "purpose": "Base class for page objects",
        "inheritance_usage": "How often it's extended",
        "effectiveness": "Effective/Partially effective/Ineffective"
      }
    ],
    "test_utilities": [
      {
        "utility_name": "Test data helpers",
        "file_path": "src/utils/test-helpers.ts",
        "purpose": "Helper functions for test data",
        "usage_frequency": "High/Medium/Low",
        "effectiveness": "Effective/Partially effective/Ineffective"
      }
    ],
    "presets_and_factories": [
      {
        "type": "Preset/Factory",
        "name": "User preset",
        "file_path": "src/presets/user-preset.ts",
        "purpose": "Predefined test data setup",
        "usage_patterns": ["How it's typically used"],
        "effectiveness": "Effective/Partially effective/Ineffective"
      }
    ]
  },
  "performance_and_reliability": {
    "test_execution_metrics": {
      "average_execution_time": "15.2s per test",
      "fastest_tests": ["Tests that execute quickly"],
      "slowest_tests": ["Tests that take longest"],
      "performance_issues": ["Any performance concerns identified"]
    },
    "reliability_assessment": {
      "flaky_tests": ["Tests that fail intermittently"],
      "stable_tests": ["Tests that are consistently reliable"],
      "reliability_score": "85%",
      "common_failure_patterns": ["Patterns in test failures"]
    }
  },
  "maintenance_and_technical_debt": {
    "maintenance_effort": {
      "easy_to_maintain": ["Tests that are easy to maintain"],
      "difficult_to_maintain": ["Tests that are hard to maintain"],
      "maintenance_score": "70%"
    },
    "technical_debt": [
      {
        "debt_type": "Code duplication/Outdated patterns/Complex logic",
        "severity": "High/Medium/Low",
        "description": "Description of the technical debt",
        "impact": "How it affects maintenance",
        "effort_to_resolve": "Low/Medium/High"
      }
    ]
  },
  "improvement_opportunities": [
    {
      "area": "Test coverage/Code quality/Performance/Organization",
      "current_state": "Description of current state",
      "improvement_opportunity": "Specific improvement suggestion",
      "priority": "High/Medium/Low",
      "effort_estimate": "Low/Medium/High",
      "expected_benefit": "How much this would improve the codebase"
    }
  ],
  "recommendations": {
    "immediate_actions": ["Actions to take right away"],
    "short_term_improvements": ["Improvements to make soon"],
    "long_term_goals": ["Long-term improvement objectives"],
    "priority_order": ["Order of implementation priority"]
  },
  "analysis_summary": {
    "overall_assessment": "Codebase is in good/poor/acceptable condition",
    "key_strengths": ["Main positive aspects"],
    "key_concerns": ["Main areas of concern"],
    "readiness_for_enhancement": "Ready/Needs work/Not ready for enhancements",
    "next_steps": ["What should be done next"]
  }
}
```

## Analysis Guidelines
- **Comprehensive Review**: Examine all aspects of the E2E codebase
- **Pattern Recognition**: Identify established patterns and conventions
- **Quality Assessment**: Evaluate code quality and maintainability
- **Coverage Analysis**: Assess test coverage and identify gaps
- **Dependency Mapping**: Understand how different components interact
- **Improvement Focus**: Identify specific opportunities for enhancement

## Success Criteria
- Repository structure is thoroughly analyzed
- Testing patterns are clearly documented
- Test coverage is accurately assessed
- Code quality is evaluated
- Dependencies are mapped
- Improvement opportunities are identified
- Clear recommendations are provided
