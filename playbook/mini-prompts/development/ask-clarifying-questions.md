# Step • Ask Clarifying Questions

## Purpose
Gather detailed requirements, clarify ambiguities, and establish clear understanding of the task scope and constraints.

## Prerequisites
**Required MCP Servers**: 
- None (uses standard coding agent tools)

**Required Context**:
- Task description or problem statement

**Optional Context**:
- Existing documentation
- Stakeholder contact information
- Previous related work

## Validation Logic
```javascript
canExecute() {
  return hasContext('task_description') ||
         hasContext('problem_statement');
}
```

## Process
1. **Analyze the initial request** - Break down the task description into key components
2. **Identify missing information** - List what information is needed to proceed
3. **Ask targeted questions** - Create specific, actionable questions
4. **Clarify scope and boundaries** - Define what's included and excluded
5. **Confirm technical constraints** - Understand limitations, preferences, and requirements
6. **Document the clarified requirements** - Create clear, comprehensive requirements

## Inputs
- Initial task description
- Problem statement or feature request
- Any existing context or documentation

## Outputs
- Comprehensive requirements document
- Clarified scope and boundaries
- Technical constraints and preferences
- Success criteria and acceptance criteria
- Risk assessment (for complex tasks)
- Next steps and dependencies

## Success Criteria
- All ambiguities in the original request resolved
- Clear understanding of what needs to be built/fixed
- Scope boundaries clearly defined
- Technical constraints documented
- Success criteria established
- Stakeholder alignment confirmed (if applicable)

## Skip Conditions
- Requirements are already crystal clear and comprehensive
- Emergency situation where clarification time is not available
- Task is trivial and well-understood

## Question Categories to Cover

### Functional Requirements
- What specific functionality needs to be implemented?
- What are the expected inputs and outputs?
- Are there any edge cases or special scenarios to consider?

### Non-Functional Requirements
- Are there performance requirements?
- What about security considerations?
- Any scalability or reliability requirements?

### Technical Constraints
- What technology stack should be used?
- Are there any existing systems that need integration?
- Any architectural constraints or preferences?

### Scope and Timeline
- What's the expected timeline?
- Are there any dependencies on other work?
- What's the minimum viable solution vs. ideal solution?

### Success Criteria
- How will we know when this is complete?
- What are the acceptance criteria?
- Who will validate the final result?

## Example Questions

### For Bug Fixes
- Can you provide steps to reproduce the issue?
- What's the expected behavior vs. actual behavior?
- What's the impact and urgency of this fix?
- Are there any workarounds currently in place?

### For New Features
- Who is the target user for this feature?
- What problem does this solve for them?
- Are there any similar existing features to reference?
- What's the expected user flow?

### For Code Refactoring
- What specific pain points need addressing?
- Are there performance issues to resolve?
- What's the desired end state architecture?
- Are there any constraints on the refactoring approach?

## Notes
- Focus on understanding the "why" behind the request, not just the "what"
- Don't assume anything - ask for clarification even on seemingly obvious points
- Document all assumptions and get them confirmed
- Consider future maintainability and extensibility in your questions 