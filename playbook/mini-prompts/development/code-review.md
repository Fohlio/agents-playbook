# Step • Code Review

## Purpose
Review implemented code for quality, security, performance, and adherence to standards before considering the implementation complete.

## Prerequisites
**Required MCP Servers**: 
- None (uses standard coding agent tools)

**Required Context**:
- Completed implementation
- Original requirements and design specifications

**Optional Context**:
- Code style guidelines
- Security requirements
- Performance requirements
- Testing results

## Validation Logic
```javascript
canExecute() {
  return hasContext('completed_implementation') &&
         hasContext('requirements') &&
         hasCodeToReview();
}

hasCodeToReview() {
  return hasNewCode() ||
         hasModifiedCode() ||
         hasRefactoredCode();
}
```

## Process
1. **Review code structure and organization** - Check overall architecture and organization
2. **Verify requirements fulfillment** - Ensure all requirements are implemented correctly
3. **Check code quality and standards** - Review for coding standards compliance
4. **Analyze security implications** - Look for security vulnerabilities and best practices
5. **Review performance considerations** - Identify potential performance issues
6. **Validate error handling** - Ensure proper error handling and edge cases
7. **Check testing coverage** - Review test quality and coverage
8. **Document findings and recommendations** - Create actionable feedback

## Inputs
- Completed implementation code
- Original requirements and acceptance criteria
- Design specifications and architecture plans
- Code style guidelines and standards
- Security and performance requirements

## Outputs
- Code review report with findings
- List of issues categorized by severity (critical, major, minor)
- Recommended improvements and optimizations
- Security assessment results
- Performance analysis summary
- Code quality metrics and recommendations
- Approval status (approved, approved with changes, needs rework)

## Success Criteria
- All critical and major issues identified and documented
- Code meets established quality standards
- Security best practices followed
- Performance requirements addressed
- Error handling is comprehensive
- Code is maintainable and readable
- Documentation is adequate and accurate

## Skip Conditions
- Trivial changes with no impact on functionality
- Emergency hotfix where review delay is not acceptable
- Code was reviewed in previous session
- Simple configuration changes only

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

## Review Checklist

### Architecture & Design
- [ ] Code follows the established architecture
- [ ] Design patterns are used appropriately
- [ ] Component interfaces are well-defined
- [ ] Separation of concerns is maintained

### Code Quality
- [ ] Code is readable and well-structured
- [ ] Functions have single responsibilities
- [ ] Variables and functions are named clearly
- [ ] Code is properly commented where needed
- [ ] No dead or commented-out code

### Security
- [ ] Input validation is comprehensive
- [ ] SQL injection protection implemented
- [ ] XSS prevention measures in place
- [ ] Authentication and authorization correct
- [ ] Sensitive data encrypted and protected

### Performance
- [ ] No obvious performance bottlenecks
- [ ] Database queries are optimized
- [ ] Caching implemented where beneficial
- [ ] Resource usage is reasonable
- [ ] Algorithms are efficient

### Error Handling
- [ ] All error scenarios handled
- [ ] Proper exception handling implemented
- [ ] Logging is adequate for debugging
- [ ] User-friendly error messages
- [ ] Graceful degradation implemented

### Testing
- [ ] Adequate test coverage
- [ ] Tests cover edge cases
- [ ] Integration tests verify interactions
- [ ] Tests are maintainable
- [ ] Mock objects used appropriately

## Notes
- Focus on providing constructive, actionable feedback
- Balance thoroughness with practicality based on project timeline
- Prioritize critical and major issues over minor style issues
- Consider the skill level of the implementer when providing feedback
- Document positive aspects of the code as well as issues
- For complex reviews, consider doing them in multiple passes 