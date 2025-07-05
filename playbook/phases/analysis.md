# Phase • Analysis

## Purpose
Systematically analyze the problem space, existing systems, and technical landscape to understand current state and identify the optimal solution approach.

## Steps Sequence
1. **trace-bug-root-cause** - Identify exact source of reported issues [conditional: if bug fixing]
2. **feature-analysis** - Analyze existing feature functionality and architecture [conditional: if working with existing features]
3. **code-analysis** - Deep dive into codebase structure and patterns [conditional: if code changes required]
4. **architecture-analysis** - Analyze system architecture and dependencies [conditional: if system design changes]
5. **performance-analysis** - Assess performance implications and bottlenecks [conditional: if performance concerns]
6. **security-analysis** - Review security implications and requirements [conditional: if security-sensitive]
7. **dependency-analysis** - Analyze external dependencies and compatibility [conditional: if external dependencies involved]

## Phase Prerequisites
- **Context**: Requirements from Planning phase
- **MCP Servers**: 
  - `context7` (for library/dependency research)
  - `playwright` (for web application analysis)
- **Optional**: Access to existing codebase, monitoring data, documentation

## Phase Success Criteria
- Current state fully understood and documented
- Problem scope clearly defined with evidence
- Technical constraints and limitations identified
- Solution approach outlined with pros/cons
- Risk assessment completed
- Performance and security implications understood

## Skip Conditions
- Problem is trivial and well-understood
- Emergency fix where analysis time is not available
- Analysis was completed in a previous session
- No existing system to analyze (greenfield project with simple requirements)

## Validation Logic
```javascript
canExecutePhase() {
  return hasContext('requirements') &&
         (hasContext('codebase_access') || 
          hasContext('system_access') ||
          isNewProject());
}

shouldSkipPhase() {
  return hasContext('detailed_analysis') ||
         isEmergencyFix() ||
         isTrivialTask();
}
```

## Expected Duration
**Simple**: 30-60 minutes  
**Standard**: 1-3 hours  
**Complex**: 4-8 hours

## Outputs
- Current state analysis report
- Problem root cause identification (if applicable)
- Architecture overview and patterns
- Technical constraint documentation
- Performance baseline (if applicable)
- Security assessment (if applicable)
- Recommended solution approach
- Risk assessment with mitigation strategies

## Notes
- Critical phase for complex projects - thorough analysis prevents costly mistakes
- Can be time-consuming but saves significant rework later
- Skip only for simple, well-understood tasks or emergencies
- Consider breaking into multiple sessions for very complex systems 