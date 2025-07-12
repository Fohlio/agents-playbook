# Phase • Planning & Clarification

## Purpose
Gather requirements, clarify scope, and establish clear understanding of the task before proceeding with execution.

## Steps Sequence
1. **ask-clarifying-questions** - Gather detailed requirements and constraints
2. **research-new-libraries** - Research required technologies and libraries [conditional: if new libraries mentioned]
3. **define-scope** - Establish clear boundaries and success criteria
4. **requirements-validation** - Validate requirements completeness and accuracy

## Phase Prerequisites
- **Context**: Task description or problem statement
- **MCP Servers**: None required for basic planning
- **Optional**: Existing documentation, system specifications

## Phase Success Criteria
- Clear, detailed requirements documented
- Scope and boundaries defined
- Technical approach outlined
- All questions answered and ambiguities resolved
- Requirements validation completed

## Skip Conditions
- Requirements are already crystal clear
- Emergency/urgent fix where planning is not feasible
- Task is trivial and well-understood

## Validation Logic
```javascript
canExecutePhase() {
  return hasContext('task_description') || 
         hasContext('problem_statement');
}

shouldSkipPhase() {
  return hasContext('detailed_requirements') &&
         hasContext('scope_definition') &&
         !hasMissingInformation();
}
```

## Expected Duration
**Simple**: 15-30 minutes  
**Standard**: 30-60 minutes  
**Complex**: 1-2 hours

## Outputs
- Detailed requirements document
- Scope definition with boundaries
- Technical constraints and preferences
- Success criteria and acceptance criteria
- Risk assessment (for complex tasks)

## Notes
- This phase is almost always required unless requirements are extremely clear
- Skip only for emergency fixes or trivial tasks
- Investment in planning saves significant time in later phases 