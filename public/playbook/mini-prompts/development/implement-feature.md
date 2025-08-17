# Implement Feature Prompt (v2)

## 🎯 Goal
Ship the feature per specs with clean, secure, performant code. **Consider alternative implementation approaches and choose the most appropriate one.**

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
7. **Libraries & Dependencies** – when working with libraries, use MCP tools like Context7 for fresh docs or check latest documentation.  

### Quality Gates (Per Task)
- [ ] Task implemented according to tasks.md specifications
- [ ] Task validation completed successfully
- [ ] Unit tests written and passing for the task
- [ ] Follows style guide & naming conventions.  
- [ ] Inputs validated, secrets via env/manager.  
- [ ] No hard-coded limits; efficient queries.  
- [ ] Task marked as ✅ complete in tasks.md  

## 🛠️ Common Patterns
Repository • Service • Factory • Middleware • Decorator • Observer

## 📤 Output
1. **Updated tasks.md** – mark completed tasks with ✅
2. **Implementation code** – following task specifications exactly
3. **Unit tests** – comprehensive test coverage for each task
4. **File:** `.agents-playbook/[feature-or-task-name]/implementation-progress.md`

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
    B -- No --> D[Code + tests]
    D --> E[Write implementation_plan.md]
