# Gather Requirements Prompt (v2)

## 🎯 Goal
Extract crystal-clear business requirements and lock them down—no fluff.

## 📋 Context Assessment
Before gathering requirements, assess the existing documentation and project context:

### Existing Documentation
- **Current State:** Check for existing BRD, user stories, technical specs, or project notes
- **Documentation Quality:** Evaluate completeness and currency of available documents
- **Gap Analysis:** Identify missing information that needs to be gathered

### Document Generation Support
- **Requirements Format:** Determine appropriate format for requirements documentation
- **Stakeholder Alignment:** Ensure requirements documentation meets team needs
- **Integration Points:** Consider how requirements documentation fits into overall project documentation

## 📥 Context (ask if missing)
1. **Project Scope** – what’s being built?
2. **Stakeholders** – who uses / owns / supports this?
3. **Business Objectives** – why does this exist?
4. **Current State** – legacy systems / processes?
5. **Existing Docs** – BRD, user stories, notes? (Y/N)

## 🚦 Skip if
- A validated requirements doc exists (<30 days) or scope is trivial/emergency.

## 🔍 Checklist
- **Stakeholder List**  
  - [ ] End users, business owners, ops, compliance, integrations  

- **Functional**  
  - [ ] Core features & workflows  
  - [ ] Business rules & data needs  
  - [ ] Integrations & touchpoints  

- **NFR**  
  - [ ] Performance, security, usability, reliability, scalability  

- **Constraints**  
  - [ ] Budget, timeline, resources, tech stack, regulations  

- **Doc Hygiene**  
  - [ ] Unique IDs, priority (MoSCoW), acceptance criteria, dependencies  

## 📤 Output
1. Gather insights from the user directly
2. Generate comprehensive requirements documentation
3. Fill in **File:** `docs/planning/[feature-name]-requirements.md`
**File:** `docs/planning/[feature-name]-requirements.md`  
Sections (in order):
1. **Executive Summary** – goals & scope  
2. **Stakeholder Analysis** – roles & interests  
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
