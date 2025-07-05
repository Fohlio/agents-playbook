# Step • Trace Bug Root Cause

## Purpose
Identify the exact source of the reported issue through systematic analysis and investigation.

## Prerequisites
**Required MCP Servers**: 
- None (uses standard coding agent tools)

**Required Context**:
- Bug symptoms and reproduction steps
- Error logs or stack traces (if available)

**Optional Context**:
- Existing test suite
- Performance monitoring data
- User impact reports
- Similar previous issues

## Validation Logic
```javascript
canExecute() {
  return hasContext('bug_symptoms') &&
         hasContext('reproduction_steps');
}
```

## Process
1. **Reproduce the issue** - Follow reported steps exactly to confirm the problem
2. **Analyze error messages and logs** - Examine stack traces, error logs, and system logs
3. **Trace code execution flow** - Map user action to code execution path
4. **Identify failure point** - Pinpoint where the system deviates from expected behavior
5. **Analyze contributing factors** - Examine data, environment, and configuration factors
6. **Validate root cause hypothesis** - Test the identified cause with additional scenarios
7. **Document findings** - Create clear root cause analysis with evidence

## Inputs
- Bug report with symptoms and reproduction steps
- Error messages and stack traces
- System logs and monitoring data
- Codebase access for investigation
- Test environment for reproduction

## Outputs
- Root cause analysis document
- Exact location in code where issue occurs
- Contributing factors and conditions
- Impact assessment and severity analysis
- Reproduction test case (if not provided)
- Fix complexity and effort estimate
- Recommendations for prevention

## Success Criteria
- Root cause clearly identified with concrete evidence
- Issue can be reproduced consistently
- Code location pinpointed to specific functions/lines
- Impact and scope fully understood
- Fix approach determined and validated
- Prevention measures identified

## Skip Conditions
- Issue already has documented and verified root cause
- Problem is intermittent and cannot be reproduced
- Requires access to production systems not available

## Investigation Techniques

### Code Analysis
- Review recent changes related to affected functionality
- Examine error handling and validation logic
- Check data flow and state management
- Look for race conditions and timing issues
- Analyze dependency and integration points

### Data Analysis
- Examine input data that triggers the issue
- Check data validation and sanitization
- Look for edge cases and boundary conditions
- Analyze data corruption or inconsistency
- Review database constraints and triggers

### Environment Analysis
- Check configuration differences between environments
- Examine system resources (memory, disk, network)
- Review deployment and version differences
- Look for external dependency issues
- Analyze load and performance characteristics

### Historical Analysis
- Review similar issues and their resolutions
- Check for recurring patterns or regressions
- Examine change history around issue introduction
- Look for correlation with deployments or changes
- Analyze user behavior patterns

## Common Root Cause Categories

### Logic Errors
- Incorrect business logic implementation
- Missing validation or error handling
- Incorrect conditional statements
- Off-by-one errors or boundary issues

### Data Issues
- Invalid or corrupted input data
- Missing or null data handling
- Data type mismatches
- Constraint violations

### Integration Problems
- API contract violations
- Timeout or connectivity issues
- Version incompatibilities
- Authentication or authorization failures

### Environment Issues
- Configuration differences
- Resource limitations (memory, disk, CPU)
- Permission or access problems
- External service dependencies

### Concurrency Issues
- Race conditions
- Deadlocks or resource contention
- Thread safety violations
- Async operation problems

## Documentation Format
- **Issue Summary**: Brief description of the problem
- **Reproduction Steps**: Exact steps to reproduce the issue
- **Root Cause**: Detailed explanation of what's causing the problem
- **Evidence**: Screenshots, logs, and data supporting the analysis
- **Impact Assessment**: Who and what is affected
- **Fix Recommendations**: Suggested solutions and alternatives
- **Prevention Measures**: How to prevent similar issues

## Testing and Validation
- Create minimal reproduction case
- Test root cause hypothesis with variations
- Verify fix addresses the actual cause
- Ensure fix doesn't introduce new issues
- Test edge cases and related functionality

## Notes
- Be systematic and methodical in your investigation
- Document all findings, even those that don't lead to the root cause
- Don't stop at the first plausible explanation - verify it thoroughly
- Consider multiple contributing factors, not just a single cause
- Balance investigation time with issue urgency and impact 