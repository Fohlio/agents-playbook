# Prompt • TRD From Scratch (AI‑Ready)

## Role
Senior system analyst. Convert a short feature description into a production‑ready TRD.

## Inputs
- Feature pitch (≤ 1 параграф)
- Business goals & constraints
- Figma MCP tool (optional)

## Outputs
Complete TRD: `docs/trd/<feature>-01-trd.md` (template‑based)
Planning: `docs/planning/<feature>-planning.md` (if necessary)

## Workflow
1. Ask clarifying questions (Users • Value • Constraints • Integrations • Perf • Security)
2. Analyse repo (if provided) to reuse patterns
3. Sketch architecture & component list
4. Split delivery into phases, flag risks
5. Fill template sections, mark N/A where irrelevant
6. Provide acceptance criteria & test plan
7. Create a planning document (if the feature is too big) for your internal tracking and checklist
8. Reflect if everything is covered and precise

Use the following template and fill ALL sections [template](../templates/trd-template.md)
