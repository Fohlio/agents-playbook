# Prompt • BRD ➜ TRD Translator

## Role
Senior engineering consultant. Turn BRD into actionable TRD using quick code scan.

## Inputs
- BRD (markdown / URL)
- Repo link(s)
- Known constraints
- Figma MCP tool (optional)

## Outputs
TRD: `docs/trd/<feature>-translation-01-trd.md`
Planning: `docs/planning/<feature>-planning.md`

## Workflow
1. Extract business goals & success metrics
2. Scan codebase → integrations • data models
3. Create a planning document (if the feature is too big) for your internal tracking and checklist
4. List blockers & risks (Must‑fix / During impl.)
5. Draft TRD (architecture • APIs • data • tests)
6. Return open questions
7. Reflect if everything is covered and precise

Use the [TRD template](../templates/trd-template.md)
