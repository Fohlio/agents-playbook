# Handoff to Sub-Agent (v1)

## 🎯 Goal
Prepare detailed context handoff for sub-agent to work on specific implementation tasks in a clean new chat.

## 📥 Context (ask if missing)
1. **Task Complexity** – is this a big/complex implementation task?
2. **Current Context** – requirements, design, and implementation plan
3. **Specific Sub-Task** – what particular piece needs sub-agent focus

## 🚦 Skip if
- Simple, single-file changes
- Trivial implementations
- User prefers to continue in same chat
- Task doesn't benefit from clean context

## 📋 Sub-Agent Context Package
**Create comprehensive handoff document for sub-agent:**

### 🔗 Context Files Quick Links
- **requirements.md** - structured_requirements, user_stories, acceptance_criteria
- **design.md** - design_specifications, technical_requirements, architecture_specifications
- **implementation-plan.md** - implementation_plan, task_breakdown, technical_specifications
- **scope-definition.md** - refactoring_requirements, scope_definition, priority_areas
- **memory-board.md** - phase handoffs, agent communications, workflow state
- **architecture-diagrams/** - system flows, component diagrams, data flows
- **next-step-id:** [workflow_id="...", current_step=X] - use agents-playbook MCP `get_next_step`

### Implementation Context Summary
```markdown
# Sub-Agent Implementation Task - [Task Name]

## 🎯 Your Specific Task
[Clear, focused description of what this sub-agent should accomplish]

## 📋 Requirements Context
[Key requirements from analysis phase - what user wants]

## 🏗️ Architecture Context  
[Design decisions and technical approach from planning]

## 📝 Implementation Plan
[Specific implementation steps for this sub-task]

## 🔧 Technical Specifications
[APIs, interfaces, data structures, dependencies]

## 📁 Files to Work With
[List of files that need to be created/modified]

## ✅ Definition of Done
[Clear success criteria for this sub-task]

## 🔄 Next Sub-Agent Context
[What should be passed to the next sub-agent, if any]
```

## 🔄 Sub-Agent Instructions
**Tell user:**

```
🤖 SUB-AGENT WORKFLOW RECOMMENDED

This task is complex enough to benefit from a clean context sub-agent approach.

NEXT STEPS:
1. **Start New Chat** - Open a fresh conversation for cleaner context
2. **Copy Context** - Paste the implementation context above into the new chat
3. **Sub-Agent Acknowledgment** - The sub-agent will confirm understanding
4. **Focused Implementation** - Sub-agent works only on this specific task
5. **Return Here** - When complete, sub-agent will update memory board

This approach provides:
✅ Clean context without conversation history noise  
✅ Focused attention on specific implementation
✅ Better code quality through specialization
✅ Clear handoffs between implementation phases

Ready to proceed with sub-agent workflow?
```

## 📝 Memory Board Update
**Update memory board with sub-agent handoff:**

```
### Agent - [Current Phase] → SUB-AGENT - [Timestamp]
**Sub-Agent Task:** [Specific implementation focus]
**Context Package:** [Summary of what was provided]
**Expected Deliverable:** [What sub-agent should produce]
**Next Step:** User will start new chat with sub-agent context
**Main Agent Status:** Waiting for sub-agent completion
```

## 🔒 User Decision Point
**REQUIRED ACTIONS:**
1. Explain benefits of sub-agent approach for this task
2. **ASK USER TO CHOOSE:** Continue here OR start sub-agent workflow  
3. If sub-agent chosen, provide complete context package
4. If continuing here, proceed with regular handoff-memory-board

**Example:**
```
This implementation task is complex with [X components/files]. 

OPTION 1: Continue here (current context)
OPTION 2: Sub-agent workflow (clean context, focused implementation)

Sub-agent benefits: cleaner context, focused attention, specialized implementation.

Which approach would you prefer?
```
