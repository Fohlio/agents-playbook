# Feature Analysis

## Goal
Analyze existing feature functionality, architecture, and implementation to understand current state and identify opportunities for improvement or modification.

## Context Required
- Feature scope and boundaries definition
- Access to relevant codebase

## Skip When
- Feature is very simple with obvious implementation
- Analysis was completed in previous session
- Feature doesn't exist yet (new feature development)
- Analysis scope is limited to bug fix only

## Complexity Assessment
- **Task Complexity**: High - requires deep feature analysis and architecture understanding

## Task Understanding Assessment
If task unclear - ask clarifying questions with multiple choice options

## Analysis Dimensions

### Functional Analysis
- What does the feature do?
- What are the key use cases and user flows?
- What are the inputs, processing, and outputs?
- What business rules and validation are implemented?
- What edge cases and error scenarios are handled?

### Technical Analysis
- How is the feature implemented architecturally?
- What design patterns and frameworks are used?
- How is the code organized and structured?
- What are the key algorithms and data structures?
- How does it integrate with other system components?

### Data Analysis
- What data does the feature create, read, update, or delete?
- How is data validated and transformed?
- What are the data schemas and relationships?
- How is data persisted and retrieved?
- What are the data access patterns and performance?

### User Experience Analysis
- How do users interact with the feature?
- What is the user interface and interaction flow?
- What feedback and error handling is provided?
- How intuitive and usable is the feature?
- What accessibility considerations are implemented?

### Performance Analysis
- How does the feature perform under normal load?
- What are the bottlenecks and resource consumption patterns?
- How does it scale with increased usage?
- What caching and optimization strategies are used?
- What monitoring and alerting is in place?

## Investigation Techniques

### Code Review
- Static code analysis for structure and patterns
- Dynamic code tracing during execution
- Review of related tests and documentation
- Examination of recent changes and history
- Dependency and import analysis

### Data Flow Tracing
- Follow data from input to output
- Identify transformation and validation points
- Map database interactions and queries
- Trace API calls and external integrations
- Analyze error handling and edge cases

### User Journey Mapping
- Document step-by-step user interactions
- Identify decision points and branching logic
- Map error scenarios and recovery paths
- Analyze user feedback and pain points
- Review usage analytics and patterns

### Performance Profiling
- Measure response times and resource usage
- Identify slow queries and operations
- Analyze memory and CPU consumption
- Review caching effectiveness
- Examine scalability characteristics

## Key Analysis Tasks
1. **Map feature boundaries** - identify all components and code involved in the feature
2. **Analyze user flows** - understand how users interact with the feature
3. **Examine code architecture** - review implementation patterns and structure
4. **Identify data flow** - trace how data moves through the feature
5. **Assess dependencies** - map internal and external dependencies
6. **Evaluate performance** - analyze current performance characteristics
7. **Document findings** - create comprehensive feature analysis report

## Common Analysis Patterns

### Legacy Feature Analysis
- Understand historical context and decisions
- Identify technical debt and maintenance issues
- Assess modernization opportunities
- Plan migration strategies

### Performance-Critical Feature Analysis
- Focus on bottlenecks and optimization opportunities
- Analyze scalability and resource usage
- Review monitoring and alerting
- Identify performance regression risks

### Integration-Heavy Feature Analysis
- Map all external dependencies
- Analyze integration patterns and protocols
- Review error handling and resilience
- Assess impact of external changes

### User-Facing Feature Analysis
- Prioritize user experience and usability
- Review accessibility and responsive design
- Analyze user feedback and usage patterns
- Identify user interface improvements

## Success Criteria
- Complete understanding of feature functionality
- All components and dependencies identified
- Data flow thoroughly mapped
- Performance characteristics documented
- Code quality and maintainability assessed
- User experience patterns understood
- Clear recommendations for improvements

## Key Outputs
- Feature architecture diagram
- Component interaction map
- Data flow documentation
- Dependency analysis
- Performance assessment
- Code quality evaluation
- User experience analysis
- Improvement recommendations 