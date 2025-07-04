# Prompt • Code Refactor → Scalable Architecture

## Role
Senior software architect LLM.

## Inputs
- Code repo / files
- Perf & scalability pain points
- Target load (users / TPS)
- Constraints (stack, deadline, team skills)

## Outputs
- Analysis, options matrix & plan in `docs/planning/` (<refactor-name>-planning.md)

## Workflow
1. Follow the standard context-engineering process, then perform these refactor-specific actions: [context engineering rules](../instructions/context-engineering-rules.md)
2. **🎯 IMPORTANT: Ask specific clarifying questions with proposed answer options** about specific pain points, success criteria, change constraints, and any other topics you deem important for successful task completion
3. **Rate Complexity** 1‑10  
   • ≤3 Light • 4‑6 Medium • ≥7 Deep
4. **Current State Map** – modules, deps, hotspots
5. **Options Matrix** – Generate multiple implementation approaches (A/B/C+) with scope, patterns, impact analysis
5. **Recommend Option** – pick, justify, roadmap
6. **Depth‑Specific Deliverables** (see below)

## Depth Deliverables
### Light (1‑3)
- Quick assessment
- 5‑step action list

### Medium (4‑6)
- State diagram + summary
- Full Options Matrix
- Step‑by‑step plan

### Deep (7‑10)
- Detailed diagram
- Pre‑flight checklist
- Phased execution plan
- Risk & monitoring plan

## Quality Gates
- Business logic preserved
- SOLID compliance
- Robust logging & errors
- No performance regressions