# Internal Agents Chat (v2)

## 🎯 Goal
Enable multi-agent coordination through internal chat for parallel work execution.

## 📥 Context (ask if missing)
1. **Current Task** – what's being worked on
2. **Agents Involved** – which agents are coordinating
3. **Work Split** – how work is divided among agents

## 🚦 Skip if
- Single agent task
- Simple sequential work
- No parallelization benefit

## 🤖 Internal Chat Protocol

**File:** `.agents-playbook/internal-agents-chat.md`

### Chat Message Format

```markdown
### [Agent Name] - [Timestamp]

**Status:** [in-progress | blocked | complete]

**Working on:** [Current task/file]

**Files:**
- `path/to/file.ts` - [What you're doing with it]
- `path/to/component.tsx` - [What you're doing with it]
_Or if too many files:_
- Overall: [Brief description of file work]

**Progress:** [Brief update - what's done, what remains]

**Blockers:** [Any blockers, or "None"]

**Next:** [Next immediate step]

---
```

### Example Chat Exchange

```markdown
### Backend Agent - 2025-11-01 14:30

**Status:** in-progress
**Working on:** API endpoints for workflow saving
**Files:**
- `src/features/workflow-constructor/actions/workflow-actions.ts` - Adding includeMultiAgentChat field
- `src/app/api/admin/system-prompts/route.ts` - Creating new endpoint
**Progress:** API endpoints created, testing in progress
**Blockers:** None
**Next:** Write integration tests for new endpoints

---

### Frontend Agent - 2025-11-01 14:35

**Status:** in-progress
**Working on:** General Settings component
**Files:**
- `src/features/workflow-constructor/components/GeneralSettings.tsx` - Created with checkbox
- `src/features/workflow-constructor/components/WorkflowConstructor.tsx` - Integrated GeneralSettings
**Progress:** Component created and integrated, waiting for backend API
**Blockers:** Need backend agent to finish API endpoints before testing full flow
**Next:** Start on AutoPromptCard component while waiting

---

### Backend Agent - 2025-11-01 14:45

**Status:** complete
**Working on:** API endpoints for workflow saving
**Files:** (same as above)
**Progress:** All endpoints complete and tested ✅
**Blockers:** None
**Next:** Handoff to frontend - API ready for integration testing

---

### Frontend Agent - 2025-11-01 14:50

**Status:** in-progress
**Working on:** Testing full workflow save flow
**Files:**
- Overall: Testing GeneralSettings → API → Database flow
**Progress:** Integration test passing ✅
**Blockers:** None (backend unblocked me)
**Next:** Continue with stage review checkbox implementation

---
```

## 📋 Work Summary Format

When coordination phase is complete, create summary in chat file:

```markdown
## Multi-Agent Coordination Summary - [Timestamp]

### Work Accomplished
**Backend Agent:**
- Created 3 API endpoints
- Added database fields to workflow actions
- Wrote 12 integration tests

**Frontend Agent:**
- Created 4 new components
- Integrated with backend APIs
- Updated workflow constructor state management

### Files Modified/Created
- Backend: 5 files (list key ones if <= 10, or overall description)
- Frontend: 8 files (list key ones if <= 10, or overall description)
- Tests: 12 test files

### Coordination Patterns That Worked
- [What worked well in parallel execution]
- [How agents unblocked each other]

### Learnings
→ **Append to:** `.agents-playbook/learnings.md` (global file)
```

## 📝 Learnings Integration

**File:** `.agents-playbook/learnings.md`

After multi-agent coordination, append insights:

```markdown
## [Feature Name] - Multi-Agent Coordination - [Date]

### Coordination Insights:
- [Pattern that worked well for parallel work]
- [How agents communicated effectively]
- [Blocker resolution strategy]

### Technical Insights:
- [Architecture decisions made during coordination]
- [Integration challenges overcome]
- [Better approaches identified]

### Process Improvements:
- [What to do differently next time]
- [Communication patterns that worked]

---
```

## 💡 Best Practices

### For Agent Coordination:
- **Clear status updates** - Use standardized status values
- **Explicit blockers** - State dependencies clearly
- **Regular updates** - Post progress every 15-30 minutes of work
- **Completion signals** - Mark complete ✅ when done

### For File Tracking:
- List files with action (creating/modifying/testing)
- Use overall description if > 10 files
- Group by concern (backend/frontend/tests)
- Reference file purposes clearly

### For Work Distribution:
- **Vertical slicing** - Each agent owns complete vertical slice when possible
- **Clear boundaries** - Define which agent owns which files/features
- **Dependency management** - Communicate blockers immediately
- **Handoff protocol** - Mark completion and notify dependent agents

### For Learnings:
- Focus on coordination patterns (not just technical details)
- Document what worked for parallel execution
- Capture blocker resolution strategies
- Note communication patterns that were effective
- **ALWAYS append** to `.agents-playbook/learnings.md`, never overwrite

## 🎯 Goal: Simultaneous Multi-Agent Work

**Primary Benefit:**
Multiple agents work **simultaneously** on different aspects while maintaining coordination and shared context.

**Success Criteria:**
- Clear work division with minimal overlap
- Blockers communicated and resolved quickly
- Regular status updates maintain shared context
- Handoffs are clean with complete documentation
- Learnings captured for future multi-agent work
