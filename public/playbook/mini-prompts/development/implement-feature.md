# Implement Feature Prompt (v2)

## 🎯 Goal
Ship the feature per specs with clean, secure, performant code. **Consider alternative implementation approaches and choose the most appropriate one.**

## 📋 General Instructions
- **Follow instructions precisely** - implement exactly what is requested, no more, no less
- **Avoid unnecessary code** - write only the code that is essential for the functionality  
- **Minimal logging** - use logging sparingly, only for essential debugging/monitoring

## 📥 Context (ask if missing)
1. **Tasks File** – `.agents-playbook/[task-name]/tasks.md` with implementation breakdown
2. **Requirements File** – `.agents-playbook/[task-name]/requirements.md` with original user stories & acceptance criteria
3. **Design Spec** – `.agents-playbook/[task-name]/design.md` with architecture & diagrams
4. **Repo Access** – branch / directory path.  
5. **Dev Environment** – setup quirks, build tools, secrets manager?

## 🎯 Task-Based Implementation
**MUST follow tasks.md systematically:**
- Implement tasks **one by one** in order
- Complete validation step for each task
- Write unit tests for each completed task
- Mark tasks as ✅ completed in tasks.md

## 🚦 Skip if
- Implementation already merged **or** change is trivial/config-only.

## 📋 Preparation Steps
**Before implementation:** Verify Context7 MCP access and fetch fresh documentation for libraries that may have updates since AI training cutoff (React, Next.js, testing frameworks, etc.) if needed (you can check package.json or any version file)

## 🔍 Implementation Flow
**For Each Task in tasks.md:**
1. **Implement** – write the code for the task
2. **Validate** – test functionality meets requirements
3. **Unit Test** – write comprehensive tests
4. **Mark Complete** – update tasks.md with ✅

- **Implementation Strategy**
  - [ ] Follow tasks.md order exactly - don't skip ahead
  - [ ] Use vertical slice approach: implement complete user scenarios end-to-end
  - [ ] Complete each task's validation and testing before moving to next
  - [ ] Update tasks.md progress as you go

### Task Categories (from tasks.md):
1. **Core Logic** – business rules first.  
2. **Data Layer** – models, migrations, validation.  
3. **API** – endpoints, request/response schema.  
4. **Integrations** – external services, queues, webhooks.  
5. **UI** – components, state mgmt, a11y.  
6. **Cross-Cutting** – logging, monitoring, error handling, auth.  
7. **Libraries & Dependencies** – refer to fresh documentation gathered in Preparation Steps; use Context7 for any additional library queries during implementation.  

### Quality Gates (Per Task)
- [ ] Task implemented according to tasks.md specifications
- [ ] Task validation completed successfully
- [ ] Unit tests written and passing for the task
- [ ] Follows style guide & naming conventions.  
- [ ] Inputs validated, secrets via env/manager.  
- [ ] No hard-coded limits; efficient queries.
- [ ] **Remove old code**: Clean up old logging, debug statements, commented code, unused functions
- [ ] Task marked as ✅ complete in tasks.md  

## 🛠️ Common Patterns
Repository • Service • Factory • Middleware • Decorator • Observer

## 📤 Output
1. **Updated tasks.md** – mark completed tasks with ✅
2. **Implementation code** – following task specifications exactly
3. **Unit tests** – comprehensive test coverage for each task

Sections:
1. **Current Task** – which task from tasks.md is being worked on
2. **Completed Tasks** – list of ✅ tasks with brief notes
3. **Implementation Notes** – code decisions, patterns used
4. **Test Coverage** – tests written for each completed task
5. **Next Task** – what will be implemented next
6. **Blockers** – any issues preventing task completion  

## ➡️ Response Flow
```mermaid
flowchart LR
    U[User] -->|specs ready| A[Implementation Engine]
    A --> B{Need more context?}
    B -- Yes --> C[Ask for spec / env]
    B -- No --> D[Check Context7 + Code + tests]
    D --> E[Write implementation_plan.md]
