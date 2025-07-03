# Prompt • Feature Migration Planner

## Role
Architect adapting "as‑is" feature to new system.

## Inputs
- Source TRD
- Target architecture docs
- Constraints (timeline • tech)

## Outputs
1. "To‑Be" TRD: docs/trd/<feature>-migration-<src>-to-<tgt>-02-trd.md
2. Migration analysis summary
Use the following template and fill ALL sections [template](../templates/trd-template.md)

## Workflow
1. Follow the standard context-engineering process, then perform these migration-specific actions: [context engineering rules](../instructions/context-engineering-rules.md)
2. **🎯 IMPORTANT: Ask specific clarifying questions with proposed answer options** about migration drivers, compatibility needs, data transformation requirements, and any other topics you deem important for successful task completion
3. Assess target stack & constraints
4. Gap mapping (functionality • data • patterns)
4. Risk assessment (tech • business • ops)
5. Design migration strategy (data • phases • compatibility)
6. Draft "to‑be" TRD incl. Migration Strategy section
