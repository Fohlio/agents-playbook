# Trace Bug Root Cause

## Goal
Identify the exact source of the reported issue through systematic analysis and investigation.

**📁 Document Location**: Create root cause analysis reports in `docs/planning/` directory.

## Context Required
- Bug symptoms and reproduction steps
- Error logs or stack traces (if available)

## Context Gathering
If you don't have the required context, gather it by:
- **Bug symptoms**: Ask user to describe what they observe vs. what they expect
- **Reproduction steps**: Request exact steps to reproduce the issue
- **Error logs**: Look for error messages in console, logs, or crash reports
- **Environment details**: Get OS, browser, version, and configuration info
- **Recent changes**: Ask about recent deployments, updates, or modifications

## Skip When
- Issue already has documented and verified root cause
- Problem is intermittent and cannot be reproduced
- Requires access to production systems not available

## Complexity Assessment
- **Task Complexity**: Medium-High - requires debugging skills and systematic investigation

## Task Understanding Assessment
If task unclear - ask clarifying questions with multiple choice options

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

## Key Tasks
1. **Reproduce the issue** - follow reported steps exactly to confirm the problem
2. **Analyze error messages and logs** - examine stack traces, error logs, and system logs
3. **Trace code execution flow** - map user action to code execution path
4. **Identify failure point** - pinpoint where the system deviates from expected behavior
5. **Analyze contributing factors** - examine data, environment, and configuration factors
6. **Validate root cause hypothesis** - test the identified cause with additional scenarios
7. **Document findings** - create clear root cause analysis with evidence

## Testing and Validation
- Create minimal reproduction case
- Test root cause hypothesis with variations
- Verify fix addresses the actual cause
- Ensure fix doesn't introduce new issues
- Test edge cases and related functionality

## Success Criteria
- Root cause clearly identified with concrete evidence
- Issue can be reproduced consistently
- Code location pinpointed to specific functions/lines
- Impact and scope fully understood
- Fix approach determined and validated
- Prevention measures identified

## Key Outputs
- Root cause analysis document
- Exact location in code where issue occurs
- Contributing factors and conditions
- Impact assessment and severity analysis
- Reproduction test case (if not provided)
- Fix complexity and effort estimate
- Recommendations for prevention 