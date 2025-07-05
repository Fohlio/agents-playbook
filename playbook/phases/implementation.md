# Phase • Implementation

## Purpose
Execute the technical implementation based on the design specifications, following best practices and maintaining code quality.

## Steps Sequence
1. **setup-development-environment** - Prepare development environment and tools [conditional: if new project or environment changes]
2. **implement-data-models** - Implement database schemas and data structures [conditional: if data modeling required]
3. **implement-core-logic** - Implement core business logic and algorithms
4. **implement-api-endpoints** - Implement API endpoints and handlers [conditional: if API development]
5. **implement-user-interface** - Implement UI components and user interactions [conditional: if UI development]
6. **implement-integrations** - Implement external system integrations [conditional: if integrations required]
7. **implement-security-measures** - Implement authentication, authorization, and security controls [conditional: if security requirements]
8. **code-review-and-refactoring** - Review code quality and refactor for maintainability

## Phase Prerequisites
- **Context**: Design specifications and architecture from previous phases
- **MCP Servers**: Standard coding tools (no additional MCP servers required)
- **Optional**: Development environment access, CI/CD pipeline, code review tools

## Phase Success Criteria
- All designed features implemented according to specifications
- Code follows project standards and best practices
- All components integrated and working together
- Basic error handling implemented
- Code is well-documented and maintainable
- Security measures implemented as designed
- Code review completed and issues addressed

## Skip Conditions
- No implementation work required (analysis or documentation only)
- Implementation was completed in previous session
- Only configuration or infrastructure changes needed

## Validation Logic
```javascript
canExecutePhase() {
  return hasContext('design_specifications') &&
         hasContext('development_environment') &&
         requiresImplementation();
}

shouldSkipPhase() {
  return isAnalysisOnlyTask() ||
         isConfigurationOnlyTask() ||
         hasContext('completed_implementation');
}

requiresImplementation() {
  return hasCodeChanges() ||
         hasNewFeatures() ||
         hasBugFixes() ||
         hasRefactoringWork();
}
```

## Expected Duration
**Simple**: 2-4 hours  
**Standard**: 1-3 days  
**Complex**: 1-2 weeks

## Outputs
- Working implementation of all specified features
- Clean, well-documented code following project standards
- Integrated components with proper error handling
- Security measures implemented
- Database migrations (if applicable)
- API documentation (if applicable)
- UI components and styling (if applicable)
- Code review comments addressed
- Implementation notes and decisions documented

## Notes
- Focus on code quality and maintainability from the start
- Implement incrementally and test frequently
- Follow the established design - don't make major design changes during implementation
- Document any deviations from design with clear rationale
- Prioritize core functionality first, then enhancements
- Consider pair programming for complex or critical components 