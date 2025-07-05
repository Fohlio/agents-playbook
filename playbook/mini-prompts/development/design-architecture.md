# Step • Design Architecture

## Purpose
Create a comprehensive solution architecture based on requirements, including component design, data flow, and integration patterns.

## Prerequisites
**Required MCP Servers**: 
- None (uses standard coding agent tools)

**Required Context**:
- Clarified requirements from planning phase
- Technical constraints and preferences

**Optional Context**:
- Project navigation context (AGENTS.MD)
- Existing system architecture
- Design patterns documentation
- Performance requirements
- Security requirements

## Validation Logic
```javascript
canExecute() {
  return hasContext('clarified_requirements') &&
         hasContext('technical_constraints') &&
         requiresArchitecturalDesign();
}

requiresArchitecturalDesign() {
  return hasNewFeatures() ||
         hasSystemChanges() ||
         hasIntegrationRequirements() ||
         hasDataModelChanges();
}
```

## Process
1. **Analyze requirements for architectural implications** - Identify components and interactions needed
2. **Design system components** - Define major components and their responsibilities
3. **Design data flow and storage** - Plan how data moves through the system
4. **Design API interfaces** - Define contracts between components (if applicable)
5. **Consider scalability and performance** - Plan for growth and performance requirements
6. **Design security architecture** - Plan authentication, authorization, and data protection
7. **Create architectural diagrams** - Visual representation of the solution
8. **Document design decisions** - Rationale for architectural choices

## Inputs
- Detailed requirements document
- Technical constraints and preferences
- Existing system architecture (if applicable)
- Performance and security requirements
- Integration requirements

## Outputs
- High-level architecture diagram
- Component responsibility matrix
- Data flow diagrams
- API interface specifications (if applicable)
- Database schema design (if applicable)
- Security architecture plan
- Technology stack recommendations
- Design decision log with rationale

## Success Criteria
- All requirements can be fulfilled by the proposed architecture
- Architecture follows established patterns and best practices
- Scalability and performance considerations addressed
- Security requirements incorporated into design
- Component interfaces clearly defined
- Architecture is maintainable and extensible
- Design review completed (if team process requires)

## Skip Conditions
- Simple bug fix with no architectural impact
- Very trivial changes that don't affect system design
- Architecture was designed in previous session
- Using existing, well-established patterns with no modifications

## Architecture Components to Consider

### System Components
- Frontend components (if UI changes)
- Backend services and APIs
- Database and data storage
- External integrations
- Background processing (if needed)

### Cross-Cutting Concerns
- Authentication and authorization
- Logging and monitoring
- Error handling and resilience
- Caching strategies
- Performance optimization

### Data Architecture
- Database schema design
- Data relationships and constraints
- Data migration strategies (if applicable)
- Data validation and integrity

### Integration Patterns
- API design patterns (REST, GraphQL, etc.)
- Event-driven architecture (if applicable)
- Message queues and async processing
- External system integration

## Design Principles to Follow
- **Single Responsibility**: Each component has a clear, focused purpose
- **Loose Coupling**: Components are independent and interact through well-defined interfaces
- **High Cohesion**: Related functionality is grouped together
- **Separation of Concerns**: Different aspects (UI, business logic, data) are separated
- **DRY (Don't Repeat Yourself)**: Avoid code and logic duplication
- **KISS (Keep It Simple)**: Choose the simplest solution that meets requirements

## Documentation Format
- Use standard diagramming conventions (UML, C4, etc.)
- Include both high-level and detailed views
- Document assumptions and constraints
- Explain trade-offs and alternative approaches considered
- Include technology choices and rationale

## Notes
- Invest time in good architecture - it saves debugging and refactoring later
- Consider multiple design alternatives and document trade-offs
- Get architecture review from senior developers when possible
- Focus on solving the current requirements while considering future extensibility
- Don't over-engineer - build what's needed now with room for growth 