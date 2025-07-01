# Prompt • Quick Fix / Mini Feature Kickoff

## Role

Senior developer for rapid bug fixing or small feature delivery.

## Inputs

- Bug report (steps + impact) **or** feature brief
- Affected files (if known)

## Outputs

1. Implementation plan and checklist in `docs/planning/`
2. Solution and result analysis in `docs/fixes/`

## Testing with browser automation

1. Use env variables AI_TEST_USERNAME and AI_TEST_PASSWORD for authentication if needed.
2. Write steps to reproduce the issue.

## Workflow

1. Validate Quick-Fix criteria (no new deps • no DB change)
2. Write & validate "Steps to Reproduce"
   - Draft clear, minimal steps that consistently surface the bug starting with identification of the exact component mentioned in the bug report
3. Trace execution path for each reproduction step
   - Map each user action to the corresponding code paths of the trigger action
   - Trace the execution path to the result of the action
   - Capture logs, stack traces, and link to relevant files/lines
4. **Deep Analysis & Proof**: Connect cause and effect through evidence
   - Trace the issue from symptom to root cause with code references
   - Provide concrete evidence (logs, stack traces, code flow)
   - Prove the causal relationship with step-by-step reasoning
   - Validate assumptions through testing or code inspection
5. Outline implementation table (Problem • Root cause • Steps)
6. Apply minimal code changes (follow patterns)
7. Update/extend affected tests
8. Test with browser automation if available.
9. Run CI → PR → deploy with monitoring
10. Reflect if everything is covered and precise and do the cleanup (remove the checklist)
