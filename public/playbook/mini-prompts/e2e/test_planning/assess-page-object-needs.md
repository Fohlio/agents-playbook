# Assess Page Object Needs

## Purpose
Evaluate what page objects are needed for E2E tests, identifying which existing ones can be reused, which need extension, and which need to be created from scratch.

## Context
- **Test Structure**: Output from plan-test-structure step
- **UI Elements**: User interface components that tests will interact with
- **Existing Models**: Current page objects in the repository
- **Component Reusability**: How well existing components can be adapted

## Instructions
1. **Analyze UI Interactions**: Review test scenarios to identify all UI elements that need interaction
2. **Map Existing Page Objects**: Identify which existing page objects can be reused
3. **Assess Extension Needs**: Determine which existing page objects need modification
4. **Identify New Page Objects**: Determine what new page objects need to be created
5. **Evaluate Component Structure**: Assess how page objects should be organized
6. **Plan Reusability**: Design page objects for maximum reusability across tests

## Output Format
```json
{
  "ui_element_analysis": [
    {
      "element_type": "Button/Input/Table/Modal/etc",
      "element_identifier": "How to locate this element",
      "interaction_type": "Click/Type/Select/Verify/etc",
      "test_scenarios": ["Which scenarios use this element"],
      "complexity": "Simple/Medium/Complex"
    }
  ],
  "existing_page_objects": [
    {
      "page_object_name": "ExistingPageObject",
      "file_path": "src/models/existing-page-object.ts",
      "relevance": "High/Medium/Low",
      "reuse_potential": "Direct reuse/Extension needed/Not suitable",
      "capabilities": ["What this page object can do"],
      "limitations": ["What it cannot handle"]
    }
  ],
  "page_object_extensions": [
    {
      "base_page_object": "ExistingPageObject",
      "extension_needs": ["New methods or properties needed"],
      "modification_scope": "Minor/Moderate/Major",
      "impact_assessment": "How this affects existing usage"
    }
  ],
  "new_page_objects": [
    {
      "page_object_name": "NewPageObject",
      "purpose": "What this page object will handle",
      "ui_elements": ["List of UI elements it will manage"],
      "methods_needed": ["List of methods to implement"],
      "complexity": "Simple/Medium/Complex",
      "reusability": "High/Medium/Low"
    }
  ],
  "page_object_architecture": {
    "hierarchy": "How page objects relate to each other",
    "inheritance_strategy": "Base classes and extensions",
    "composition_approach": "How page objects combine functionality",
    "naming_conventions": "Consistent naming patterns to follow"
  },
  "implementation_priority": {
    "high_priority": ["Page objects needed for critical tests"],
    "medium_priority": ["Page objects needed for important tests"],
    "low_priority": ["Page objects for edge cases or future tests"]
  }
}
```

## Success Criteria
- All UI interactions are mapped to page object needs
- Existing page objects are thoroughly evaluated for reuse
- Extension requirements are clearly identified
- New page object requirements are well-defined
- Architecture follows established patterns
- Implementation priority is logical and practical
