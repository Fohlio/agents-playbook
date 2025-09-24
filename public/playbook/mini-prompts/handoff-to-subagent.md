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

### 📄 Create `subagent-prompt.md` File
**Generate this file for user to copy directly:**

**File:** `.agents-playbook/[feature-name]/subagent-prompt.md`

### 🔗 Context Files for Sub-Agent to Read
**Tell sub-agent to read these files first to refresh context:**
- **requirements.md** - structured_requirements, user_stories, acceptance_criteria
- **design.md** - design_specifications, technical_requirements, architecture_specifications  
- **implementation-plan.md** - implementation_plan, task_breakdown, technical_specifications
- **scope-definition.md** - refactoring_requirements, scope_definition, priority_areas
- **memory-board.md** - phase handoffs, agent communications, workflow state
- **architecture-diagrams/** - system flows, component diagrams, data flows
- **next-step-id:** [workflow_id="...", current_step=X] - use agents-playbook MCP `get_next_step`

### Sub-Agent Prompt Template
```markdown
# Sub-Agent Implementation Task - [Task Name]

## 📚 FIRST: Read These Context Files
Before starting implementation, read these files to refresh your context:
1. requirements.md - understand what user wants
2. design.md - understand technical approach  
3. implementation-plan.md - understand your specific tasks
4. memory-board.md - understand current workflow state

Then use: workflow_id="[id]", current_step=[X] with agents-playbook MCP get_next_step

## 🌊 Workflow Flow & Your Role
**Overall Workflow:** [workflow_name] → Analysis → Design-Architecture → Planning → **[YOUR PHASE]** → Testing-Review

**What's Been Completed:**
- ✅ Analysis: [Brief summary of requirements and clarification]
- ✅ Design-Architecture: [Brief summary of technical design decisions]
- ✅ Planning: [Brief summary of implementation strategy]

**Your Phase:** [Phase name - e.g., Implementation Phase 1 of 3]
**Your Scope:** [Specific boundary - e.g., Backend API implementation only, Frontend components only, Database layer only]

**What Comes Next:** [What the next sub-agent or phase will handle]

## 🎯 Your Specific Task
[Clear, focused description of what this sub-agent should accomplish]

## 🚫 Scope Boundaries - DO NOT:
- Work on phases outside your assignment
- Continue to next workflow phase when done
- Implement features not in your specific scope
- Make architectural decisions (already decided in planning)
- Skip steps from your implementation plan

## ✅ Task Progress Tracking
**IMPORTANT:** Mark each completed task with ✅ as you work:
- Update tasks.md or implementation-plan.md with completed status
- Example: `- [x] ✅ Create user authentication API endpoints`
- Keep progress visible for handoffs to next sub-agent

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

## 🏁 Completion & Handoff Protocol
When you complete your phase:
1. **Update memory-board.md** - Document what you completed
2. **Create handoff summary** - What the next sub-agent needs to know
3. **Test your work** - Ensure your phase deliverables work correctly
4. **STOP HERE** - Do not continue to next phase
5. **Ask user** to start new chat for next sub-agent with updated context

## 🔄 Next Sub-Agent Context
[What should be passed to the next sub-agent, if any]
- Files created/modified in your phase
- Any discoveries or issues encountered
- Updated context for next phase
```

## 🔄 Sub-Agent Instructions
**Write SHORT and PRECISE instructions to user in chat:**

```
🤖 SUB-AGENT WORKFLOW RECOMMENDED

This task is complex enough to benefit from a clean context sub-agent approach.

NEXT STEPS:
1. **Copy the subagent-prompt.md file** I just created above
2. **Start New Chat** - Open a fresh conversation for cleaner context  
3. **Paste the file contents** into the new chat
4. **Sub-Agent reads context files** - They'll refresh context from linked .md files
5. **Sub-Agent implements** - Works only on this specific task
6. **Return Here** - When complete, sub-agent will update memory board

This approach provides:
✅ Clean context without conversation history noise  
✅ Focused attention on specific implementation
✅ Better code quality through specialization
✅ Clear handoffs between implementation phases

Ready to proceed with sub-agent workflow?
```

## 💬 Chat Communication Guidelines
**Agent must provide CONCISE user guidance:**
- **Keep instructions brief** - 2-3 sentences maximum per step
- **Be specific** - Tell user exactly what to copy/paste and where
- **Include next action** - Clear "what to do next" statement
- **Avoid explanations** - Focus on actionable steps, not theory
- **Create the subagent-prompt.md file** - Generate actual file content for easy copying
- **Fill in ALL template sections** - Don't leave placeholders blank
- **Be explicit about scope** - Clearly define what sub-agent should and shouldn't do
- **Show workflow progression** - Make it clear where this fits in the overall flow

## 📖 Sub-Agent Context Refresh Instructions
**Add this to the subagent-prompt.md file:**
```markdown
## 📚 FIRST: Read These Context Files
Before starting implementation, read these files to refresh your context:
1. requirements.md - understand what user wants
2. design.md - understand technical approach  
3. implementation-plan.md - understand your specific tasks
4. memory-board.md - understand current workflow state

Then use: workflow_id="[id]", current_step=[X] with agents-playbook MCP get_next_step
```

## 🎯 Required Information for Planning Agent
**When creating subagent-prompt.md, you MUST include:**
- **Workflow name** and current progress status
- **What phases are complete** with brief summaries  
- **Sub-agent's specific phase** and boundaries
- **Exact scope limits** - what they should NOT work on
- **Implementation breakdown** - specific tasks only for this sub-agent
- **Success criteria** - how they know they're done
- **Next phase preview** - what comes after their work

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
