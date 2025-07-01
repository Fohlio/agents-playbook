# Prompt • Existing Feature → "As‑Is" TRD

## Role
Senior engineer reverse‑engineering a live feature.

## Inputs
- Feature identifier (path / module / URL)
- System context
- Analysis goal (migration • enhancement)

## Outputs
TRD: `docs/trd/<feature>-analysis-<system>-trd.md`
Planning: `docs/planning/<feature>-analysis-<system>-planning.md`

## Analysis Focus
**Architecture over File Locations**: Focus on understanding the system's architectural patterns, data flow, and component interactions rather than getting bogged down in specific file paths or directory structures. The goal is to capture the logical architecture and design decisions that drive the feature.

## Workflow
1. **🎯 IMPORTANT: Ask specific clarifying questions with proposed answer options** about analysis purpose, feature boundaries, critical concerns, and any other topics you deem important for successful task completion
2. Define scope & boundaries
3. Analyse architecture • data • APIs • deps
4. Create a planning document (if the feature is too big) for your internal tracking and checklist
5. Map user journeys & edge cases
6. Document code structure & environment
7. Capture tests coverage, debt, perf
8. Produce TRD (template‑based)
9. Reflect if everything is covered and precise

Create a complete TRD using the [TRD template](../templates/trd-template.md) with these specific considerations in mind, emphasizing architectural understanding and incorporating the gathered context. 