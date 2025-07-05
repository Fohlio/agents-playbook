# Code Analysis

## Goal
Deep dive into codebase structure, patterns, and quality to understand implementation details and identify improvement opportunities.

**📁 Document Location**: Create code analysis reports in `docs/planning/` directory.

## Context Required
- Access to relevant codebase
- Scope of code to analyze (specific modules, functions, or areas)

## Skip When
- Code is very simple and doesn't warrant deep analysis
- Analysis was completed in previous session
- Only configuration or documentation changes needed
- Emergency fix where analysis is not required

## Complexity Assessment
- **Task Complexity**: High - requires deep code analysis and architecture understanding

## Task Understanding Assessment
If task unclear - ask clarifying questions with multiple choice options

## Analysis Categories

### Structural Analysis
- **Code Organization** - how files, modules, and packages are structured
- **Separation of Concerns** - how different responsibilities are separated
- **Dependency Management** - how modules depend on each other
- **Layer Architecture** - how different layers (UI, business, data) are organized
- **Interface Design** - how components interact with each other

### Design Pattern Analysis
- **Architectural Patterns** - MVC, MVP, Clean Architecture, etc.
- **Design Patterns** - factory, observer, strategy, repository, etc.
- **Anti-patterns** - god objects, spaghetti code, copy-paste programming
- **Code Smells** - long methods, large classes, duplicate code
- **SOLID Principles** - single responsibility, open/closed, etc.

### Quality Analysis
- **Readability** - clear naming, appropriate comments, consistent style
- **Maintainability** - ease of making changes and adding features
- **Complexity** - cyclomatic complexity, nesting levels, method length
- **Coupling** - how tightly components are connected
- **Cohesion** - how focused and related code within modules is

### Performance Analysis
- **Algorithm Efficiency** - Big O complexity of key algorithms
- **Resource Usage** - memory allocation, CPU intensive operations
- **I/O Operations** - database queries, file operations, network calls
- **Caching Strategies** - what is cached and how effectively
- **Scalability Patterns** - how code handles increased load

### Security Analysis
- **Input Validation** - how user input is validated and sanitized
- **Authentication/Authorization** - how security is implemented
- **Data Protection** - how sensitive data is handled and stored
- **Error Handling** - how errors are handled without exposing information
- **Dependency Vulnerabilities** - known vulnerabilities in dependencies

### Testing Analysis
- **Test Coverage** - what percentage of code is covered by tests
- **Test Quality** - how well tests verify functionality
- **Test Types** - unit, integration, end-to-end test distribution
- **Test Maintainability** - how easy tests are to understand and update
- **Testing Patterns** - how testing is organized and structured

## Analysis Techniques

### Static Code Analysis
- Review code structure and organization
- Identify patterns and anti-patterns
- Check coding standard compliance
- Analyze complexity metrics
- Review documentation and comments

### Dynamic Analysis
- Trace code execution paths
- Profile performance characteristics
- Monitor resource usage
- Test error handling scenarios
- Analyze runtime behavior

### Dependency Analysis
- Map component dependencies
- Identify circular dependencies
- Analyze external library usage
- Review version management
- Assess security vulnerabilities

### Historical Analysis
- Review git history and change patterns
- Identify frequently changed files
- Analyze bug patterns and hotspots
- Review code evolution trends
- Assess technical debt accumulation

## Key Analysis Tasks
1. **Survey code structure** - get high-level overview of codebase organization
2. **Analyze design patterns** - identify patterns, anti-patterns, and architectural decisions
3. **Review code quality** - assess readability, maintainability, and adherence to standards
4. **Examine performance characteristics** - look for potential bottlenecks and optimizations
5. **Assess security practices** - review security implementations and potential vulnerabilities
6. **Evaluate testing coverage** - analyze test quality and coverage
7. **Document findings** - create comprehensive code analysis report

## Common Code Issues

### Structural Issues
- Monolithic functions or classes
- Tight coupling between components
- Missing abstractions or layers
- Inconsistent error handling
- Poor separation of concerns

### Quality Issues
- Inconsistent naming conventions
- Lack of meaningful comments
- Code duplication and copy-paste
- Magic numbers and hard-coded values
- Overly complex conditional logic

### Performance Issues
- Inefficient algorithms or data structures
- Unnecessary loops or iterations
- Missing caching opportunities
- Blocking I/O operations
- Memory leaks or excessive allocation

### Security Issues
- Unvalidated user input
- SQL injection vulnerabilities
- Cross-site scripting (XSS) risks
- Insecure data storage
- Missing authentication checks

## Success Criteria
- Comprehensive understanding of code structure and patterns
- Code quality thoroughly assessed with specific recommendations
- Performance and security issues identified
- Testing gaps and opportunities documented
- Technical debt quantified and prioritized
- Clear action plan for improvements

## Key Outputs
- Code structure and organization analysis
- Design pattern identification and assessment
- Code quality metrics and recommendations
- Performance bottleneck identification
- Security vulnerability assessment
- Testing coverage and quality analysis
- Technical debt assessment
- Refactoring recommendations

## Inputs
- Codebase or specific code modules to analyze
- Code style guidelines and standards (if available)
- Performance and security requirements
- Existing documentation and comments
- Test suites and coverage reports

## Outputs
- Code structure and organization analysis
- Design pattern identification and assessment
- Code quality metrics and recommendations
- Performance bottleneck identification
- Security vulnerability assessment
- Testing coverage and quality analysis
- Technical debt assessment
- Refactoring recommendations

## Documentation Format
- **Executive Summary**: Key findings and recommendations
- **Code Structure**: Organization and architectural overview
- **Quality Assessment**: Detailed quality metrics and issues
- **Performance Analysis**: Bottlenecks and optimization opportunities
- **Security Review**: Vulnerabilities and security practices
- **Testing Analysis**: Coverage and test quality assessment
- **Recommendations**: Prioritized improvement actions
- **Technical Debt**: Quantified debt and remediation plan

## Tools and Automation
- Static analysis tools (SonarQube, ESLint, etc.)
- Code coverage tools
- Performance profilers
- Security scanners
- Documentation generators
- Complexity analyzers

## Notes
- Focus analysis on areas most critical to the current task
- Balance thorough analysis with available time and project needs
- Use automated tools to gather data, but interpret results manually
- Consider both immediate issues and long-term maintainability
- Document specific examples and locations for each finding 