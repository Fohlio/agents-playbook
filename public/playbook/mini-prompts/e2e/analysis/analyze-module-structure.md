# Analyze Module Structure

## Purpose
Analyze the structure and dependencies of modules in the Fohlio frontend codebase to understand how recent changes might affect E2E tests and identify potential integration issues.

## Context
- **Recent Changes Analysis**: Output from investigate-recent-changes step
- **Module Dependencies**: How different modules interact with each other
- **File Structure**: Organization of code files and components
- **Import Graphs**: Dependencies between different parts of the system

## Instructions
1. **Map Module Structure**: Understand how the codebase is organized into modules
2. **Analyze Dependencies**: Identify dependencies between different modules
3. **Examine File Organization**: Review how files are structured within modules
4. **Assess Integration Points**: Identify areas where modules interact
5. **Evaluate Test Coverage**: Understand how well modules are tested
6. **Document Architecture Insights**: Record findings about system architecture

## Output Format
```json
{
  "module_structure_overview": {
    "total_modules": 12,
    "core_modules": ["List of core system modules"],
    "feature_modules": ["List of feature-specific modules"],
    "shared_modules": ["List of shared utility modules"],
    "architecture_pattern": "Monolithic/Modular/Micro-frontend"
  },
  "module_dependency_analysis": [
    {
      "module_name": "UserAuthentication",
      "dependencies": ["List of modules this module depends on"],
      "dependents": ["List of modules that depend on this module"],
      "coupling_level": "High/Medium/Low",
      "change_impact_radius": "How many modules are affected by changes here"
    }
  ],
  "file_structure_analysis": [
    {
      "module_name": "Module name",
      "file_organization": "How files are organized within the module",
      "key_files": ["Important files in this module"],
      "recent_changes": ["Files that were recently modified"],
      "test_files": ["Test files associated with this module"],
      "test_coverage": "Percentage of module covered by tests"
    }
  ],
  "integration_points": [
    {
      "integration_name": "User authentication with dashboard",
      "modules_involved": ["UserAuthentication", "Dashboard"],
      "integration_type": "API calls/Shared state/Event handling",
      "test_coverage": "How well this integration is tested",
      "recent_changes": ["Changes that might affect this integration"],
      "risk_assessment": "High/Medium/Low"
    }
  ],
  "dependency_graph": {
    "circular_dependencies": ["Any circular dependencies found"],
    "high_coupling_modules": ["Modules with many dependencies"],
    "isolated_modules": ["Modules with few dependencies"],
    "critical_paths": ["Critical dependency paths in the system"]
  },
  "test_coverage_analysis": {
    "overall_coverage": "75%",
    "well_tested_modules": ["Modules with good test coverage"],
    "poorly_tested_modules": ["Modules with insufficient test coverage"],
    "test_gaps": ["Areas where test coverage is lacking"],
    "coverage_impact": "How test coverage affects failure investigation"
  },
  "change_impact_analysis": [
    {
      "changed_module": "Module that was recently changed",
      "direct_impact": ["Modules directly affected by the change"],
      "indirect_impact": ["Modules indirectly affected by the change"],
      "test_impact": ["How the change affects testing"],
      "risk_level": "High/Medium/Low"
    }
  ],
  "architecture_insights": {
    "strengths": ["Positive aspects of the current architecture"],
    "weaknesses": ["Areas where architecture could be improved"],
    "technical_debt": ["Technical debt that might affect testing"],
    "recommendations": ["Suggestions for improving architecture"]
  },
  "next_analysis_steps": [
    "Deep dive into high-risk integration points",
    "Review test coverage for affected modules",
    "Analyze specific dependency chains"
  ]
}
```

## Analysis Guidelines
- **Comprehensive Mapping**: Understand the complete module structure
- **Dependency Tracking**: Map all dependencies between modules
- **Integration Focus**: Pay special attention to integration points
- **Test Coverage Assessment**: Evaluate how well modules are tested
- **Change Impact Analysis**: Understand how changes propagate through the system
- **Architecture Evaluation**: Assess the overall system architecture

## Success Criteria
- Module structure is clearly understood
- Dependencies are accurately mapped
- Integration points are identified
- Test coverage is assessed
- Change impact is analyzed
- Architecture insights are documented
