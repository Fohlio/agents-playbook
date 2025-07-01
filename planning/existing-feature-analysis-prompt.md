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
1. Define scope & boundaries
2. Analyse architecture • data • APIs • deps
3. Create a planning document (if the feature is too big) for your internal tracking and checklist
4. Map user journeys & edge cases
5. Document code structure & environment
6. Capture tests coverage, debt, perf
7. Produce TRD (template‑based)
8. Reflect if everything is covered and precise

Create a complete TRD using the [TRD template](../templates/trd-template.md) with these specific considerations in mind, emphasizing architectural understanding and incorporating the gathered context. 