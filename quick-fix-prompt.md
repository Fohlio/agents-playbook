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
2. **Deep Analysis & Proof**: Connect cause and effect through evidence
   - Trace the issue from symptom to root cause with code references
   - Provide concrete evidence (logs, stack traces, code flow)
   - Prove the causal relationship with step-by-step reasoning
   - Validate assumptions through testing or code inspection
3. Outline implementation table (Problem • Root cause • Steps)
4. Apply minimal code changes (follow patterns)
5. Update/extend affected tests
6. Run CI → PR → deploy with monitoring