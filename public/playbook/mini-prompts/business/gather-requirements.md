# Gather Requirements Prompt (v2)

## 🎯 Goal
Extract crystal-clear business requirements and lock them down—no fluff.

## 📋 Context Assessment
Before gathering requirements, assess the existing documentation and project context:

### Existing Documentation
- **Current State:** Check for existing technical specs, user stories, or project notes
- **Documentation Quality:** Evaluate completeness and currency of available documents
- **Gap Analysis:** Identify missing information that needs to be gathered

### Document Generation Support
- **Requirements Format:** Determine appropriate format for requirements documentation
- **Technical Alignment:** Ensure requirements documentation meets technical needs
- **Integration Points:** Consider how requirements documentation fits into overall project documentation

## 📥 Context (ask if missing)
1. **Project Scope** – what’s being built?
2. **System Users** – what are the different user types?
3. **Business Objectives** – why does this exist?
4. **Current State** – legacy systems / processes?
5. **Existing Docs** – technical specs, user stories, notes? (Y/N)

## 🚦 Skip if
- A validated requirements doc exists (<30 days) or scope is trivial/emergency.

## 🔍 Checklist
- **System Users**  
  - [ ] End users, system administrators, integrations  

- **Functional**  
  - [ ] Core features & workflows  
  - [ ] Business rules & data needs  
  - [ ] Integrations & touchpoints  

- **NFR**  
  - [ ] Performance, security, usability, reliability, scalability  

- **Constraints**  
  - [ ] Tech stack, performance, security, regulations  

- **Doc Hygiene**  
  - [ ] Unique IDs, priority (MoSCoW), acceptance criteria, dependencies  

## 📤 Output
1. Gather insights from the user directly
2. Generate comprehensive requirements documentation
3. Fill in **File:** `.agents-playbook/[feature-or-task-name]/requirements.md`
**File:** `.agents-playbook/[feature-or-task-name]/requirements.md`  
Sections (in order):
1. **Executive Summary** – goals & scope  
2. **System Users** – types & requirements  
3. **Functional Requirements** – table w/ ID, desc, priority, AC  
4. **Non-Functional Requirements** – same table style  
5. **Business Constraints** – bullets  
6. **Assumptions & Dependencies** – clarity upfront  
7. **Open Questions** – what still needs answers  
8. **Revision Log** – date, author, change summary  

## ➡️ Response Flow
```mermaid
flowchart LR
    U[User] -->|project info| A[Requirements Engine]
    A --> B{Need more context?}
    B -- Yes --> C[Ask focused Qs]
    B -- No --> D[Draft requirements.md]
