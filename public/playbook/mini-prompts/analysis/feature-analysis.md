# Feature Analysis Prompt (v2)

## 🎯 Goal
Dissect an existing feature, reveal weak spots, and suggest upgrades—no fluff.

## 📥 Context (ask if missing)
1. **Feature** – name or scope boundaries.
2. **Repo Access** – code paths / git URL.
3. **Focus** – choose: performance / architecture / UX / tech-debt.
4. **Known Pains** – bugs, slow paths, UX complaints.

## 🚦 Skip if
- Feature is trivial **and** unchanged, or you already have a fresh analysis (<30 days).

## 🔍 Checklist
- **Function**  
  - [ ] Core use cases & user flows  
  - [ ] Business rules & validation  
  - [ ] Data inputs → transforms → outputs  
  - [ ] Integration touchpoints  

- **Tech**  
  - [ ] Component structure & patterns  
  - [ ] Code quality & organization  
  - [ ] Performance hotspots (CPU, I/O, DB)  
  - [ ] Security: authN/Z, data protection  
  - [ ] Error / edge-case handling  

- **UX**  
  - [ ] Usability & interface sanity  
  - [ ] Accessibility flags (WCAG, etc.)  
  - [ ] Perceived speed / responsiveness  
  - [ ] Clarity of error messages  

## 📤 Outputs (provide verbal analysis), which includes:
- what it does, user flows, data paths
- diagram + component breakdown
- strengths, weaknesses, perf/security findings
- prioritized list w/ file & line refs
- quick wins, larger refactors, effort estimates

## ➡️ Response Flow
```mermaid
flowchart LR
    U[User] -->|request| A[Feature Analysis Engine]
    A --> B{Need more input?}
    B -- Yes --> C[Ask for scope / repo]
    B -- No --> D[Provide verbal analysis]
