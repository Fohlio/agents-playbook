# Code Review

## Goal
Review implemented code for quality, security, performance, and adherence to standards before considering the implementation complete.

## Context Required
- Completed implementation
- Original requirements and design specifications

## Skip When
- Trivial changes with no impact on functionality
- Emergency hotfix where review delay is not acceptable
- Code was reviewed in previous session
- Simple configuration changes only

## Complexity Assessment
- **Task Complexity**: Medium - requires code analysis and quality assessment skills

## Task Understanding Assessment
If task unclear - ask clarifying questions with multiple choice options

## Review Categories

### Functional Correctness
- Does the code implement all required features?
- Are all acceptance criteria met?
- Do the implemented functions work as designed?
- Are edge cases properly handled?

### Code Quality
- Is the code readable and well-organized?
- Are functions and variables named clearly?
- Is the code properly commented?
- Are coding standards followed?
- Is there unnecessary code duplication?

### Security Review
- Are all inputs validated and sanitized?
- Is sensitive data handled securely?
- Are authentication and authorization implemented correctly?
- Are there any potential security vulnerabilities?
- Are secrets and credentials properly managed?

### Performance Analysis
- Are there any obvious performance bottlenecks?
- Are database queries optimized?
- Is memory usage reasonable?
- Are expensive operations cached where appropriate?
- Will the code scale with increased load?

### Error Handling
- Are all error scenarios handled appropriately?
- Are error messages helpful and informative?
- Is logging implemented for debugging purposes?
- Are exceptions handled gracefully?
- Is there proper cleanup in error scenarios?

### Testing Quality
- Is test coverage adequate for the new code?
- Do tests cover both positive and negative scenarios?
- Are tests maintainable and reliable?
- Do integration tests verify component interactions?

## Review Severity Levels

### Critical Issues
- Security vulnerabilities
- Data corruption risks
- System stability threats
- Functional failures in core features

### Major Issues
- Performance problems
- Poor error handling
- Significant code quality issues
- Missing important functionality

### Minor Issues
- Code style violations
- Documentation gaps
- Minor optimization opportunities
- Naming convention inconsistencies

## Review Process
1. **Review code structure and organization** - check overall architecture and organization
2. **Verify requirements fulfillment** - ensure all requirements are implemented correctly
3. **Check code quality and standards** - review for coding standards compliance
4. **Analyze security implications** - look for security vulnerabilities and best practices
5. **Review performance considerations** - identify potential performance issues
6. **Validate error handling** - ensure proper error handling and edge cases
7. **Check testing coverage** - review test quality and coverage
8. **Document findings and recommendations** - create actionable feedback

## Key Review Areas
- **Architecture & Design** - follows established architecture and design patterns
- **Code Quality** - readable, well-structured, properly commented
- **Security** - input validation, authentication, data protection
- **Performance** - no bottlenecks, optimized queries, efficient algorithms
- **Error Handling** - comprehensive error scenarios, proper exception handling
- **Testing** - adequate coverage, edge cases, maintainable tests

## Success Criteria
- All critical and major issues identified and documented
- Code meets established quality standards
- Security best practices followed
- Performance requirements addressed
- Error handling is comprehensive
- Code is maintainable and readable
- Documentation is adequate and accurate

## Key Outputs
- Code review report with findings
- List of issues categorized by severity (critical, major, minor)
- Recommended improvements and optimizations
- Security assessment results
- Performance analysis summary
- Code quality metrics and recommendations
- Approval status (approved, approved with changes, needs rework) 