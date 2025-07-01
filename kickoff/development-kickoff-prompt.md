# Prompt • Development Kickoff

## Role
Tech‑lead, starting implementation from an approved TRD.

## Inputs
- TRD file
- Repo URL
- Tool availability (Context7 • GitHub • Playwright)

## Outputs
- Dev checklist for work tracking `docs/planning/<trd-name>-dev-checklist.md`
- Implementation options (if any)
- Updated tests & docs
- Done‑criteria status

## Workflow
0. Generate & commit checklist
1. Verify tools; log missing ones
2. Assess complexity (Simple / Standard / Complex) and pick strategy
3. Plan phases, automation, BTC test cases
4. Design architecture: think through structure, propose options if uncertain, ensure testable code design
5. Implement with continuous validation, test with browser automation if available, ensure you cover all UI elements with testId for e2e
6. Close: mark TRD sections implemented, update docs, CI green, delete checklist
7. Reflect if everything is covered and precise
