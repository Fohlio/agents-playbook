# Prompt • Development Kickoff

## Role
Tech‑lead, starting implementation from an approved TRD.

## Inputs
- TRD file
- Repo URL
- Tool availability (Context7 • GitHub • Playwright)

## Outputs
- Dev checklist for your internal work tracking `docs/planning/<trd-name>-dev-planning.md` with systematic task breakdown, dependencies, and complexity analysis as the checklist
- Implementation options (if any)
- Updated tests & docs
- Done‑criteria status

## Workflow
0. **🎯 IMPORTANT: Ask specific clarifying questions with proposed answer options** about TRD completeness, development standards, deployment requirements, and any other topics you deem important for successful task completion
1. **Generate structured development checklist** using `instructions/task-breakdown-helper-prompt.md`:
   - Break down TRD into manageable tasks with complexity assessment
   - Map dependencies and identify critical path
   - Create phased implementation plan with progress tracking
2. Verify tools; log missing ones
3. Assess complexity (Simple / Standard / Complex) and pick strategy
4. Plan phases and automation
5. **Design architecture**: think through structure, **propose multiple implementation options** (at least 2-3 approaches), ensure testable code design
6. Implement with continuous validation, ensure you cover all UI elements with testId for e2e
7. **QA & Testing**: Use [QA Validation & Testing](../qa/qa-validation-prompt.md) for comprehensive testing
8. Close: mark TRD sections implemented, update docs, CI green, delete checklist
9. Reflect if everything is covered and precise
