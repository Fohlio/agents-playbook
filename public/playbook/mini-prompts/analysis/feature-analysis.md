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
- **Function**: Use cases, flows, business rules, data transforms, integrations
- **Tech**: Structure, patterns, quality, performance hotspots, security, error handling
- **UX & Design**: Usability, accessibility, responsiveness, design tokens, theming, consistency  

## 📤 Outputs (verbal analysis):
- Function overview: flows, data paths, diagram + breakdown
- Assessment: strengths, weaknesses, perf/security/UX/design gaps
- Prioritized improvements w/ file refs & effort estimates

## ➡️ Response Flow
```mermaid
flowchart LR
    U[User] -->|request| A[Feature Analysis Engine]
    A --> B{Need more input?}
    B -- Yes --> C[Ask for scope / repo]
    B -- No --> D[Provide verbal analysis]
