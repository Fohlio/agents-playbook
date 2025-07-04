# Helper • Task Breakdown & Planning

## Purpose
Systematic task breakdown, dependency analysis, and checklist generation for development projects.

## When to Use
- When implementing features from TRDs
- When fixing complex bugs requiring multiple steps
- When breaking down any development work into manageable chunks

## Core Functions

### 1. Task Analysis & Breakdown
```
For each major component:
1. Identify core functionality
2. Break into 3-7 manageable subtasks
3. Estimate complexity (1-10 scale)
4. Identify external dependencies
5. Define acceptance criteria
```

### 2. Dependency Mapping
```
For each task:
- Prerequisites (what must be done first)
- Blockers (external dependencies)
- Parallel opportunities (what can be done simultaneously)
- Impact analysis (what depends on this task)
```

### 3. Complexity Assessment
```
Complexity Factors:
- Technical difficulty (1-4)
- External dependencies (0-3)
- Integration complexity (1-3)
- Testing requirements (0-2)
- Unknown/research required (0-2)

Total: 1-10 scale
Recommendation: >7 = expand into subtasks
```

### 4. Checklist Generation Format
```markdown
# [Project Name] - Development Checklist

## Phase 1: Foundation
- [ ] **Task 1.1**: [Description] `complexity: 3/10` `deps: none`
  - [ ] Subtask A
  - [ ] Subtask B
  - [ ] Test cases defined
- [ ] **Task 1.2**: [Description] `complexity: 5/10` `deps: 1.1`

## Phase 2: Core Implementation
- [ ] **Task 2.1**: [Description] `complexity: 7/10` `deps: 1.1, 1.2`
  
## Testing & Integration
- [ ] **E2E Testing**: Browser automation scenarios
- [ ] **Integration Tests**: API and component testing
- [ ] **Performance**: Load testing if applicable

## Completion Criteria
- [ ] All tasks marked complete
- [ ] CI/CD pipeline green
- [ ] Documentation updated
- [ ] Code review completed
```

### 5. Task Prioritization Matrix
```
Priority = (Business Impact × Urgency) / (Complexity × Risk)

High Priority: Foundation tasks, critical path items
Medium Priority: Feature enhancements, optimizations  
Low Priority: Nice-to-have, future improvements
```

### 6. Progress Tracking
```
Status Options:
- pending: Not started
- in-progress: Currently being worked on
- blocked: Waiting on dependency
- review: Code review/testing phase
- done: Completed and validated

Update format: `[YYYY-MM-DD] Task X.Y: Status change reason`
```

## Output Templates

### Planning Document Structure
```
docs/planning/[project-name]-planning.md

1. Project Overview
2. Task Breakdown (by phase)
3. Dependency Graph
4. Risk Analysis
5. Timeline Estimates
6. Progress Tracking Log
```

### Task Expansion Criteria
```
Expand task if:
- Complexity > 7/10
- Duration estimate > 4 hours
- Multiple distinct skill areas required
- High uncertainty/research component
- Multiple integration points
```

## Integration Notes
- Reference this helper in kickoff prompts with: `Apply task breakdown using planning/task-breakdown-helper-prompt.md`
- Generate initial checklist during planning phase
- Update checklist throughout implementation
- Archive completed checklists for retrospective analysis 