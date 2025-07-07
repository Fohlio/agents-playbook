# Design Architecture Prompt 

## 🎯 Goal
Craft a rock-solid solution architecture that meets all requirements—no fluff.

## 📥 Context (ask if missing)
1. **Clarified Requirements** – link or file path.
2. **Tech Constraints / Preferences** – languages, clouds, budgets, etc.
3. **Non-Func Targets** – perf, scale, security SLAs.
4. **Existing Systems** – what stays, what gets replaced?

## 🚦 Skip if
- Architecture already designed (<30 days) **or** change is trivial/bug-fix.

## 🔍 Checklist
- **Components**  
  - [ ] Front-end, back-end, DB, integrations, background jobs  

- **Cross-Cutting**  
  - [ ] AuthN/Z, logging, monitoring, resilience, caching  

- **Data**  
  - [ ] Schema, relationships, migrations, validation  

- **Integration**  
  - [ ] API style (REST/GraphQL), events, queues, third-party hooks  

- **Design Principles**  
  - [ ] SRP, loose-coupling, high cohesion, DRY, KISS  

- **Scalability & Perf**  
  - [ ] Horizontal scaling plan, bottleneck analysis  

- **Security**  
  - [ ] Threat model, data protection, compliance hits  

## 📤 Output
**File:** `docs/planning/[feature-name]-architecture-design.md`

Sections:
1. **Executive Summary** – TL;DR of the solution  
2. **System Diagram (C4 or UML)** – high-level + zoom-in views  
3. **Component Matrix** – responsibilities & interfaces  
4. **Data Flow** – CRUD + event paths  
5. **API Contracts** – endpoints, payloads, auth (if relevant)  
6. **Database Design** – schema snippet / rationale (if relevant)  
7. **Security Plan** – auth, encryption, threat mitigations  
8. **Scalability & Perf** – capacity targets, scaling strategy  
9. **Tech Stack** – chosen tech + why  
10. **Decision Log** – trade-offs & rejected options  

## ➡️ Response Flow
```mermaid
flowchart LR
    U[User] -->|reqs ready| A[Architecture Engine]
    A --> B{Need more context?}
    B -- Yes --> C[Ask for constraints / prefs]
    B -- No --> D[Design & document]
    D --> E[Write architecture_design.md]
