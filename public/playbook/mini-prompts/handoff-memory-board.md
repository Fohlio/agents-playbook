# Handoff Memory Board (v1)

## 🎯 Goal
Document phase completion and validate readiness for next phase.

## 📥 Context (ask if missing)
1. **Current Phase** – what just finished
2. **Next Phase** – what's starting next  
3. **Key Outcomes** – what was accomplished

## 🚦 Skip if
Trivial single-step task.

## 📋 Memory Board
**File:** `.agents-playbook/[feature-or-task-name]/memory-board.md`

```
### Agent - [Current Phase] → [Next Phase] - [Timestamp]
**Completed:** [What was done]
**Created:** [Files/artifacts] 
**Workflow State:** [workflow_id="...", current_step=X, context=[...]]
**Next agent needs:** [Critical context]
**Questions:** [Unresolved items]
**Learnings:** [Non-obvious insights]
```

## ✅ Validation & 🔒 User Approval
**REQUIRED ACTIONS:**
1. Confirm all deliverables complete and documented
2. **ASK USER FOR EXPLICIT APPROVAL** before proceeding
3. Present summary: what completed + what's next
4. Wait for user confirmation

**Example:** 
```
Phase [Current] complete. Ready for [Next Phase]? 
Completed: [key items]
Please confirm to proceed.
```