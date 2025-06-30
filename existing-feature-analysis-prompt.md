# Prompt • Existing Feature → "As‑Is" TRD

## Role
Senior engineer reverse‑engineering a live feature.

## Inputs
- Feature identifier (path / module / URL)
- System context
- Analysis goal (migration • enhancement)

## Outputs
TRD: <feature>-analysis-<system>-trd.md

## Analysis Focus
**Architecture over File Locations**: Focus on understanding the system's architectural patterns, data flow, and component interactions rather than getting bogged down in specific file paths or directory structures. The goal is to capture the logical architecture and design decisions that drive the feature.

## Workflow
1. Define scope & boundaries
2. Analyse architecture • data • APIs • deps
3. Map user journeys & edge cases
4. Document code structure & environment
5. Capture tests coverage, debt, perf
6. Produce TRD (template‑based)

Create a complete TRD using the [TRD template](trd-template.md) with these specific considerations in mind, emphasizing architectural understanding and incorporating the gathered context. 