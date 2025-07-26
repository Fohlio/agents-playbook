# Create Technical Requirements Document (TRD) Prompt 

## 🎯 Goal
Turn business needs into a tech-ready TRD, ready for devs to pick up—no fluff.

## 📥 Context (ask if missing)
1. **Business Requirements / BRD** – link or paste.
2. **Scope** – which features / systems are in play?
3. **Tech Constraints** – platform, compliance, perf targets, etc.
4. **Stakeholders** – who signs off on the tech design?

## 🚦 Skip if
- A current TRD exists (<30 days) or scope is trivial/temporary.

## 🔍 Checklist
- **Overview**  
  - [ ] Objectives + timeline  
  - [ ] High-level architecture & stack  

- **Implementation Strategy**
  - [ ] Break features into vertical slices (complete user scenarios)
  - [ ] Define delivery order from simplest to most complex slice
  - [ ] Ensure each slice delivers working end-to-end functionality

- **Functional**  
  - [ ] Feature list, workflows, UI notes  

- **NFR**  
  - [ ] Perf, scalability, security, reliability targets  

- **Data**  
  - [ ] Models, storage, validation rules  

- **API**  
  - [ ] Endpoints, payloads, auth, rate limits  

- **Integration**  
  - [ ] External services, queues, webhooks, SSO  

- **Infra**  
  - [ ] Environments, deploy, monitoring, backup  

- **Dev Standards**  
  - [ ] Code style, testing, error handling patterns  

## 📤 Outputs
1. Gather insights from the user directly
2. Fill in **File:** `.agents-playbook/[feature-or-task-name]/trd.md`
- complete doc covering all sections above and also:
- Diagrams: architecture & data (PlantUML/Mermaid inline)  
- endpoint table + examples  
- env matrix, sizing, tooling  

## ➡️ Response Flow
```mermaid
flowchart LR
    U[User] -->|BRD / scope| A[TRD Engine]
    A --> B{Need more context?}
    B -- Yes --> C[Ask for BRD / constraints]
    B -- No --> D[Draft TRD]
    D --> E[Generate docs]
