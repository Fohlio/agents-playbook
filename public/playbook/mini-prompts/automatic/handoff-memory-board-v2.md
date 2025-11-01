# Handoff Memory Board (v2)

## 🎯 Goal
Document phase completion, track file changes, and capture learnings for knowledge retention.

## 📥 Context (ask if missing)
1. **Current Phase** – what just finished
2. **Next Phase** – what's starting next
3. **Key Outcomes** – what was accomplished

## 🚦 Skip if
Trivial single-step task.

## 📋 Memory Board
**File:** `.agents-playbook/[feature-or-task-name]/memory-board.md`

```markdown
### Agent - [Current Phase] → [Next Phase] - [Timestamp]

**Completed:** [What was done]

**Files & Work Summary:**
- `path/to/file1.ts` - Created/Modified
- `path/to/file2.tsx` - Created/Modified
- `path/to/component.spec.ts` - Created/Modified
_Or if file list is too long:_
- Overall: [Brief description of work - e.g., "Implemented 15 components across 3 feature directories"]

**Workflow State:** [workflow_id="...", current_step=X, context=[...]]

**Next agent needs:** [Critical context]

**Questions:** [Unresolved items]

**Learnings:**
[Record non-obvious insights, patterns discovered, gotchas encountered]
→ **Append to:** `.agents-playbook/learnings.md` (global file, don't overwrite existing content)
```

## ✅ Validation & 🔒 User Approval

**REQUIRED ACTIONS:**
1. **Summarize completed work** - List files created/modified or overall work description
2. **Document learnings** - Write insights to `.agents-playbook/learnings.md` (append, don't overwrite)
3. **ASK USER FOR EXPLICIT APPROVAL** before proceeding
4. **Present summary:** what completed + what's next
5. **Wait for confirmation**

**Example:**
```
Phase [Current] complete. Ready for [Next Phase]?

Completed:
- Created 5 components in src/features/workflow-constructor
- Modified 3 server actions for workflow saving
- Updated 2 type definitions

Learnings added to .agents-playbook/learnings.md

Please confirm to proceed.
```

## 📝 Learnings File Format

**File:** `.agents-playbook/learnings.md`

```markdown
## [Feature/Task Name] - [Date]

### Phase: [Current Phase]

**Technical Insights:**
- [Non-obvious pattern or solution discovered]
- [Gotcha or tricky issue encountered and resolved]
- [Better approach identified for similar problems]

**Architecture Decisions:**
- [Why certain design choice was made]
- [Trade-offs considered]

**Process Improvements:**
- [What worked well in this phase]
- [What could be improved for next time]

---
```

## 💡 Best Practices

**For File Tracking:**
- List key files if <= 10 files
- Use overall description if > 10 files
- Always include file purpose (Created/Modified/Deleted)
- Group by directory when relevant

**For Learnings:**
- Focus on non-obvious insights (not "React uses props" - that's obvious)
- Include solutions to tricky problems
- Document "why" decisions were made
- Keep it actionable for future work
- ALWAYS append, never overwrite existing learnings

**For User Approval:**
- Be specific about what was accomplished
- Mention key deliverables
- State what's needed for next phase
- Ask clearly for approval to proceed
