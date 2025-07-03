# Prompt • TRD From Scratch (AI‑Ready)

## Role
Senior system analyst. Convert a short feature description into a production‑ready TRD.

## Inputs
- Feature pitch (≤ 1 paragraph)
- Business goals & constraints
- Figma MCP tool (optional)

## Outputs
Complete TRD: `docs/trd/<feature>-01-trd.md` (template‑based)

## Workflow
1. Follow the standard context-engineering process, then perform these trd-creation-specific actions: [context engineering rules](../instructions/context-engineering-rules.md)
1. **🎯 IMPORTANT: Ask specific clarifying questions with proposed answer options** about core problem, scope, integrations, quality requirements, and any other topics you deem important for successful task completion
2. Analyse repo (if provided) to reuse patterns
3. **Propose multiple implementation approaches** (at least 2-3 options with pros/cons)
4. Sketch architecture & component list
5. Split delivery into phases, flag risks
6. Fill template sections, mark N/A where irrelevant
7. Provide acceptance criteria & test plan
8. Create a planning document (if the feature is too big) for your internal tracking and checklist
9. Reflect if everything is covered and precise

Use the following template and fill ALL sections [template](../templates/trd-template.md)
