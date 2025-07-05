# Step • Code Analysis

## Purpose
Deep dive into codebase structure, patterns, and quality to understand implementation details and identify improvement opportunities.

## Prerequisites
**Required MCP Servers**: 
- None (uses standard coding agent tools)

**Required Context**:
- Access to relevant codebase
- Scope of code to analyze (specific modules, functions, or areas)

**Optional Context**:
- Code style guidelines and standards
- Performance requirements
- Security requirements
- Testing frameworks and practices

## Validation Logic
```javascript
canExecute() {
  return hasContext('codebase_access') &&
         hasContext('analysis_scope');
}
```

## Process
1. **Survey code structure** - Get high-level overview of codebase organization
2. **Analyze design patterns** - Identify patterns, anti-patterns, and architectural decisions
3. **Review code quality** - Assess readability, maintainability, and adherence to standards
4. **Examine performance characteristics** - Look for potential bottlenecks and optimizations
5. **Assess security practices** - Review security implementations and potential vulnerabilities
6. **Evaluate testing coverage** - Analyze test quality and coverage
7. **Document findings** - Create comprehensive code analysis report

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

## Success Criteria
- Comprehensive understanding of code structure and patterns
- Code quality thoroughly assessed with specific recommendations
- Performance and security issues identified
- Testing gaps and opportunities documented
- Technical debt quantified and prioritized
- Clear action plan for improvements

## Skip Conditions
- Code is very simple and doesn't warrant deep analysis
- Analysis was completed in previous session
- Only configuration or documentation changes needed
- Emergency fix where analysis time is not available

## Analysis Categories

### Structural Analysis
- **Code Organization**: How files, modules, and packages are structured
- **Separation of Concerns**: How different responsibilities are separated
- **Dependency Management**: How modules depend on each other
- **Layer Architecture**: How different layers (UI, business, data) are organized
- **Interface Design**: How components interact with each other

### Design Pattern Analysis
- **Architectural Patterns**: MVC, MVP, Clean Architecture, etc.
- **Design Patterns**: Factory, Observer, Strategy, Repository, etc.
- **Anti-patterns**: God objects, spaghetti code, copy-paste programming
- **Code Smells**: Long methods, large classes, duplicate code
- **SOLID Principles**: Single responsibility, open/closed, etc.

### Quality Analysis
- **Readability**: Clear naming, appropriate comments, consistent style
- **Maintainability**: Ease of making changes and adding features
- **Complexity**: Cyclomatic complexity, nesting levels, method length
- **Coupling**: How tightly components are connected
- **Cohesion**: How focused and related code within modules is

### Performance Analysis
- **Algorithm Efficiency**: Big O complexity of key algorithms
- **Resource Usage**: Memory allocation, CPU intensive operations
- **I/O Operations**: Database queries, file operations, network calls
- **Caching Strategies**: What is cached and how effectively
- **Scalability Patterns**: How code handles increased load

### Security Analysis
- **Input Validation**: How user input is validated and sanitized
- **Authentication/Authorization**: How security is implemented
- **Data Protection**: How sensitive data is handled and stored
- **Error Handling**: How errors are handled without exposing information
- **Dependency Vulnerabilities**: Known vulnerabilities in dependencies

### Testing Analysis
- **Test Coverage**: What percentage of code is covered by tests
- **Test Quality**: How well tests verify functionality
- **Test Types**: Unit, integration, end-to-end test distribution
- **Test Maintainability**: How easy tests are to understand and update
- **Testing Patterns**: How testing is organized and structured

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

## Quality Metrics

### Complexity Metrics
- Cyclomatic complexity per method/function
- Lines of code per file/class/method
- Nesting depth and branching factor
- Number of parameters per method
- Class coupling and cohesion metrics

### Maintainability Metrics
- Code duplication percentage
- Comment density and quality
- Naming consistency and clarity
- Method and class size distribution
- Technical debt ratio

### Test Metrics
- Code coverage percentage
- Test case pass/fail rates
- Test execution time
- Test maintainability index
- Bug escape rate

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