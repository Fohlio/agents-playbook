# Handoff Memory Board (v1)

## 🎯 Goal
Write a message to the next agent on the shared memory board and ask if user wants to switch chats.

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

## 🔄 **PHASE TRANSITION NOTICE**
**REQUIRED ACTION: You MUST ask the user:** "Would you like to switch to a new chat for the next phase? (YES/NO)"

**If YES, use this in new chat:**
```
Continuing [workflow-name] from [current-phase] to [next-phase].
Memory board: .agents-playbook/[feature-or-task-name]/memory-board.md
Key context: [2-3 critical points]
Ready for [next-phase].
```