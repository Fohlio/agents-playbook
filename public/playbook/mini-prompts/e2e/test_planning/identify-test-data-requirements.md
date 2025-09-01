# Identify Test Data Requirements

## Purpose
Determine the specific test data needed for E2E tests, including data setup, state management, and cleanup requirements based on the planned test structure and scenarios.

## Context
- **Test Structure**: Output from plan-test-structure step
- **Test Scenarios**: Detailed scenarios that need data
- **Existing Presets**: Available test data presets in the repository
- **Existing Factories**: Available data factories for creating test entities
- **Test Data**: Current test data management patterns

## Instructions
1. **Analyze Data Needs**: Review each test scenario to identify required data
2. **Map Data Dependencies**: Determine what data must exist before tests can run
3. **Identify Data Sources**: Determine whether to use presets, factories, or manual setup
4. **Plan Data State Management**: Design how test data will be created, modified, and cleaned up
5. **Consider Data Isolation**: Ensure tests don't interfere with each other's data
6. **Assess Cleanup Requirements**: Plan how to restore system state after tests

## Output Format
```json
{
  "data_requirements": [
    {
      "scenario_id": "scenario_1",
      "data_needs": [
        {
          "entity_type": "User/Project/Item/etc",
          "data_attributes": ["Required fields and values"],
          "data_source": "Preset/Factory/Manual",
          "setup_method": "How to create this data",
          "cleanup_method": "How to remove this data"
        }
      ],
      "prerequisites": ["Data that must exist before this test"],
      "expected_changes": ["Data modifications this test will make"],
      "cleanup_required": true
    }
  ],
  "data_sources": {
    "presets_to_use": [
      {
        "preset_name": "preset_name",
        "file_path": "src/presets/preset-name.ts",
        "description": "What this preset provides",
        "modifications_needed": ["Any changes needed for this test"]
      }
    ],
    "factories_to_use": [
      {
        "factory_name": "factory_name",
        "file_path": "src/factories/factory-name.ts",
        "capabilities": ["What this factory can create"],
        "customization_needed": ["Any custom parameters needed"]
      }
    ],
    "manual_setup_required": [
      {
        "description": "Data that needs manual setup",
        "reason": "Why it can't use presets/factories",
        "setup_steps": ["Step-by-step setup process"]
      }
    ]
  },
  "data_management_strategy": {
    "setup_approach": "Before each test/Before test suite/Shared setup",
    "isolation_strategy": "How to prevent test interference",
    "cleanup_approach": "After each test/After test suite/Manual cleanup",
    "state_preservation": "How to maintain system state between tests"
  },
  "data_validation": {
    "pre_test_validation": ["Checks to ensure data is properly set up"],
    "post_test_validation": ["Checks to ensure data changes are correct"],
    "cleanup_validation": ["Checks to ensure cleanup was successful"]
  }
}
```

## Success Criteria
- All test scenarios have clear data requirements identified
- Data sources are appropriate for each requirement
- Data management strategy ensures test isolation
- Cleanup requirements are clearly defined
- Data validation approach is comprehensive
- Strategy aligns with existing repository patterns
