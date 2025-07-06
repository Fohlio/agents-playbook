# Implement Feature

## Goal
Execute technical implementation based on design specifications with high code quality.

## Context Required
- Design specifications or architecture plan
- Requirements document with acceptance criteria

## Context Gathering
If you don't have the required context, gather it by:
- **Design specs**: Ask user for technical design, architecture decisions, or implementation approach
- **Requirements**: Request feature requirements, acceptance criteria, or user stories
- **Codebase access**: Explore project structure to understand existing patterns and conventions
- **Environment setup**: Verify development environment, dependencies, and build tools are ready

## Skip When
- No implementation work required (analysis/docs only)
- Implementation completed in previous session
- Only configuration changes needed

## Complexity Assessment
- **Task Complexity**: Medium-High - requires technical implementation and coding expertise

## Task Understanding Assessment
If task unclear - ask clarifying questions with multiple choice options

## Implementation Priority Order
1. **Core business logic** - essential functionality first
2. **Data layer** - database access, models, validation
3. **API layer** - endpoints, request/response handling
4. **Integration layer** - external system connections
5. **UI layer** - user interface components
6. **Cross-cutting concerns** - logging, monitoring, error handling

## Key Implementation Practices
- **Code Quality** - follow project standards, meaningful names, comments for complex logic
- **Security** - validate inputs, sanitize data, secure auth/authz, no hardcoded secrets
- **Performance** - efficient algorithms, caching, optimized queries, resource monitoring
- **Maintainability** - modular code, separation of concerns, testable design, documentation

## Common Patterns
- Repository (data access), Service (business logic), Factory (object creation)
- Observer (events), Middleware (request processing), Decorator (feature enhancement)

## Testing Focus
- Unit tests for critical business logic
- Integration tests for external connections
- Error scenario and edge case testing
- Security measure validation

## Output
- Working implementation meeting all specifications
- Clean, documented code following project standards
- Proper error handling and logging
- Security measures implemented
- Integration points functional
- Basic test coverage 