# Comprehensive Feature & Architecture Analysis Prompt (v3)

## 🎯 Goal
Dissect features and overall architecture, reveal weak spots, and suggest upgrades—no fluff.

## 📥 Context (ask if missing)
1. **Feature/System Scope** – specific feature or architectural components to analyze.
2. **Repo Access** – code paths / git URL.
3. **Focus Area** – performance / architecture / UX / tech-debt / scalability / security / maintainability.
4. **Known Issues** – bugs, slow paths, UX complaints, architectural bottlenecks.
5. **Architecture Docs** – existing diagrams, ADRs, design notes.

## 🚦 Skip if
- Feature is trivial **and** unchanged, or you already have a fresh analysis (<30 days).

## 🔍 Comprehensive Analysis Checklist
### Feature Analysis
- **Function**: Use cases, flows, business rules, data transforms, integrations
- **Tech**: Structure, patterns, quality, performance hotspots, security, error handling
- **UX & Design**: Usability, accessibility, responsiveness, design tokens, theming, consistency

### Architecture Analysis
- [ ] **Components**: Responsibilities, data flows & dependencies
- [ ] **Patterns**: Architectural patterns vs anti-patterns & code smells
- [ ] **Data Layer**: Stores, consistency, access patterns
- [ ] **Quality**: ⬆️ scalability, ⚡ performance, 🔒 security, 🛠️ maintainability
- [ ] **Design System**: Tokens, components, theming, accessibility  

## 📤 Outputs (comprehensive verbal analysis):
### Feature Analysis Results
- Function overview: flows, data paths, diagram + breakdown
- Feature assessment: strengths, weaknesses, UX/design gaps

### Architecture Analysis Results  
- Architecture narrative + diagram (PlantUML/Mermaid)
- Component analysis: strengths, weaknesses, design system gaps
- Tech debt identification + roadmap priorities

### Combined Recommendations
- Prioritized improvements w/ file refs & effort estimates
- Architecture and feature enhancement roadmap

## ➡️ Response Flow
```mermaid
flowchart LR
    U[User] -->|request| A[Feature Analysis Engine]
    A --> B{Need more input?}
    B -- Yes --> C[Ask for scope / repo]
    B -- No --> D[Provide verbal analysis]
