# Handoff Memory Board (v1)

## 🎯 Goal
Write a message to the shared memory board documenting phase completion and validate readiness to continue to the next phase.

## 📥 Context (ask if missing)
1. **Current Phase** – what just finished
2. **Next Phase** – what's starting next
3. **Key Outcomes** – what was accomplished

## 🚦 Skip if
- Trivial single-step task.

## 📋 Memory Board
**File:** `.agents-playbook/[feature-or-task-name]/memory-board.md`

**Add your message:**
```
### Agent - [Current Phase] → [Next Phase] - [Timestamp]
**Completed:** [What was done]
**Created:** [Files/artifacts] 
**Workflow State:** [workflow_id="...", current_step=X, context=[...]]
**Next agent needs:** [Critical context]
**Questions:** [Unresolved items]
**Learnings:** [Non-obvious insights discovered during work]
```

## ✅ **PHASE COMPLETION VALIDATION**
**REQUIRED ACTION: Confirm phase completion status:**

**Validation Questions:**
- Are all phase deliverables complete and documented?
- Is the memory board updated with critical context for the next phase?
- Are there any blocking issues that need resolution before proceeding?

**If all validations pass:** Proceed directly to the next phase with the documented context and workflow state.