# Step • Implement Feature

## Purpose
Execute the technical implementation based on design specifications, following best practices and maintaining code quality.

## Prerequisites
**Required MCP Servers**: 
- None (uses standard coding agent tools)

**Required Context**:
- Design specifications or architecture plan
- Requirements document

**Optional Context**:
- Project navigation context (AGENTS.MD)
- Existing codebase patterns from project navigation
- Development environment setup
- Code style guidelines
- Testing framework

## Validation Logic
```javascript
canExecute() {
  return hasContext('design_specifications') &&
         (hasContext('requirements') || hasContext('clarified_requirements')) &&
         requiresImplementation();
}

requiresImplementation() {
  return hasCodeChanges() ||
         hasNewFeatures() ||
         hasBugFixes() ||
         hasRefactoringWork();
}
```

## Process
1. **Set up development environment** - Ensure all tools and dependencies are ready
2. **Break down implementation into tasks** - Create manageable implementation steps
3. **Implement core functionality** - Start with essential features and business logic
4. **Add error handling** - Implement proper error handling and validation
5. **Implement interfaces and integrations** - Connect components and external systems
6. **Add logging and monitoring** - Include observability features
7. **Write or update tests** - Ensure code is testable and has appropriate coverage
8. **Document the implementation** - Add comments and update documentation

## Inputs
- Design specifications and architecture plans
- Requirements document with acceptance criteria
- Existing codebase (if applicable)
- Development environment and tools
- Code style and quality guidelines

## Outputs
- Working implementation of specified features
- Clean, well-documented code following project standards
- Unit tests for new functionality (if testing framework available)
- Integration points properly implemented
- Error handling and validation implemented
- Logging and monitoring hooks added
- Updated documentation reflecting changes

## Success Criteria
- All specified features implemented according to design
- Code follows project standards and best practices
- Error handling covers expected failure scenarios
- Code is well-documented with clear comments
- Implementation integrates properly with existing system
- Basic testing completed (at minimum, manual verification)
- Performance requirements met (if specified)

## Skip Conditions
- No implementation work required (analysis or documentation only)
- Implementation completed in previous session
- Only configuration changes needed (no code changes)

## Implementation Best Practices

### Code Quality
- Follow established coding standards and conventions
- Write clear, readable code with meaningful variable names
- Add comments for complex logic and business rules
- Implement proper error handling and validation
- Avoid code duplication - extract reusable functions

### Security Considerations
- Validate all inputs and sanitize data
- Implement proper authentication and authorization
- Handle sensitive data securely (encryption, secure storage)
- Avoid hardcoding secrets or credentials
- Follow security best practices for the technology stack

### Performance
- Consider performance implications of implementation choices
- Implement efficient algorithms and data structures
- Add caching where appropriate
- Optimize database queries and data access
- Monitor resource usage (memory, CPU, network)

### Maintainability
- Write modular, loosely-coupled code
- Implement proper separation of concerns
- Make code easily testable
- Document complex business logic and decisions
- Plan for future extensibility where reasonable

## Implementation Order
1. **Core business logic** - Implement the essential functionality first
2. **Data layer** - Database access, models, and data validation
3. **API layer** - Endpoints, request/response handling
4. **Integration layer** - External system connections
5. **UI layer** - User interface components (if applicable)
6. **Cross-cutting concerns** - Logging, monitoring, error handling

## Testing During Implementation
- Write unit tests for critical business logic
- Test error scenarios and edge cases
- Verify integration points work correctly
- Test with realistic data volumes (if applicable)
- Validate security measures are working
- Perform basic performance testing

## Common Implementation Patterns
- **Repository Pattern**: For data access abstraction
- **Service Layer**: For business logic organization
- **Factory Pattern**: For object creation
- **Observer Pattern**: For event handling
- **Middleware Pattern**: For request processing
- **Decorator Pattern**: For feature enhancement

## Notes
- Implement incrementally and test frequently
- Don't make major design changes during implementation - stick to the plan
- Document any necessary deviations from design with clear rationale
- Focus on making it work correctly first, then optimize if needed
- Consider code review checkpoints for complex implementations
- Balance speed of delivery with code quality and maintainability 