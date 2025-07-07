# Create Test Plan Prompt (v2)

## 🎯 Goal
Define a full-stack test strategy—functional, non-functional, regression—so nothing slips to prod.

## 📥 Context (ask if missing)
1. **Requirements / Specs** – link or path.
2. **Architecture Map** – components & integrations.
3. **Tools / Env** – CI, frameworks, staging env, data masks.
4. **Timeline / Release Date** – when QA gates slam shut.

## 🚦 Skip if
- A current test plan covers this scope (<30 days) or change is trivial/emergency.

## 🔍 Checklist
- **Scope**  
  - [ ] Features in/out, env details, test data plan  

- **Test Types & Levels**  
  - [ ] Unit ↔ Component ↔ Integration ↔ System ↔ Acceptance  
  - [ ] Perf, Security, Regression tagged  

- **Execution**  
  - [ ] Manual vs Automated split  
  - [ ] CI/CD hooks, schedule & milestones  
  - [ ] Entry / Exit criteria for each phase  

- **Risk & Mitigation**  
  - [ ] High, Med, Low areas flagged  
  - [ ] Mitigation / contingency steps  

- **Resources**  
  - [ ] People, tools, infra, data seeding  

## 📤 Output
**File:** `docs/planning/[feature-name]-test-plan.md`

Sections:
1. **Executive Summary** – what, why, timeline  
2. **Test Scope** – in / out, env, data  
3. **Strategy Matrix** – table mapping test types ↔ levels  
4. **Execution Plan** – who, what, when, automation hooks  
5. **Risk Assessment** – ranked list + mitigations  
6. **Resources & Tools** – allocations & licenses  
7. **Entry / Exit Criteria** – per phase  
8. **Revision Log** – date, author, change summary  

## ➡️ Response Flow
```mermaid
flowchart LR
    U[User] -->|needs QA| A[Test-Plan Engine]
    A --> B{Need more context?}
    B -- Yes --> C[Ask for specs / env / tools]
    B -- No --> D[Draft test_plan.md]
