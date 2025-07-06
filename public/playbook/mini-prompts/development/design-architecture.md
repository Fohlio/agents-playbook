# Design Architecture

## Goal
Create comprehensive solution architecture based on requirements, including component design, data flow, and integration patterns.

**📁 Document Location**: Create architecture design documents in `docs/planning/` directory.

## Context Required
- Clarified requirements from planning phase
- Technical constraints and preferences

## Skip When
- Simple bug fix with no architectural impact
- Very trivial changes that don't affect system design
- Architecture was designed in previous session
- Using existing, well-established patterns with no modifications

## Complexity Assessment
- **Task Complexity**: High - requires architectural thinking and system design skills

## Task Understanding Assessment
If task unclear - ask clarifying questions with multiple choice options

## Architecture Components

### System Components
- **Frontend components** (if UI changes)
- **Backend services and APIs**
- **Database and data storage**
- **External integrations**
- **Background processing** (if needed)

### Cross-Cutting Concerns
- **Authentication and authorization**
- **Logging and monitoring**
- **Error handling and resilience**
- **Caching strategies**
- **Performance optimization**

### Data Architecture
- **Database schema design**
- **Data relationships and constraints**
- **Data migration strategies** (if applicable)
- **Data validation and integrity**

### Integration Patterns
- **API design patterns** (REST, GraphQL, etc.)
- **Event-driven architecture** (if applicable)
- **Message queues and async processing**
- **External system integration**

## Design Principles
- **Single Responsibility** - each component has a clear, focused purpose
- **Loose Coupling** - components are independent with well-defined interfaces
- **High Cohesion** - related functionality is grouped together
- **Separation of Concerns** - different aspects (UI, business logic, data) are separated
- **DRY (Don't Repeat Yourself)** - avoid code and logic duplication
- **KISS (Keep It Simple)** - choose the simplest solution that meets requirements

## Key Design Tasks
1. **Analyze requirements for architectural implications** - identify components and interactions needed
2. **Design system components** - define major components and their responsibilities
3. **Design data flow and storage** - plan how data moves through the system
4. **Design API interfaces** - define contracts between components (if applicable)
5. **Consider scalability and performance** - plan for growth and performance requirements
6. **Design security architecture** - plan authentication, authorization, and data protection
7. **Create architectural diagrams** - visual representation of the solution
8. **Document design decisions** - rationale for architectural choices

## Documentation Format
- Use standard diagramming conventions (UML, C4, etc.)
- Include both high-level and detailed views
- Document assumptions and constraints
- Explain trade-offs and alternative approaches considered
- Include technology choices and rationale

## Success Criteria
- All requirements can be fulfilled by the proposed architecture
- Architecture follows established patterns and best practices
- Scalability and performance considerations addressed
- Security requirements incorporated into design
- Component interfaces clearly defined
- Architecture is maintainable and extensible

## Key Outputs
- High-level architecture diagram
- Component responsibility matrix
- Data flow diagrams
- API interface specifications (if applicable)
- Database schema design (if applicable)
- Security architecture plan
- Technology stack recommendations
- Design decision log with rationale 