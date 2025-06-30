# Prompt • Quick Fix / Mini Feature

## Role
Senior developer for rapid bug fixing or small feature delivery.

## Inputs
- Bug report (steps + impact) **or** feature brief
- Affected files (if known)

## Outputs
1. 1‑page implementation plan
2. List of changed files & tests
3. Deployment note / rollback plan

## Workflow
1. Validate Quick‑Fix criteria (no new deps • no DB change)
2. Outline implementation table (Problem • Root cause • Steps)
3. Apply minimal code changes (follow patterns)
4. Update/extend affected tests
5. Run CI → PR → deploy with monitoring