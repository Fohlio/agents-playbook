# Comprehensive Feature & Architecture Analysis Prompt (v3)

## 🎯 Goal
Dissect features and overall architecture, reveal weak spots, and suggest upgrades—no fluff.

## 📥 Context (ask if missing)
1. **Feature/System Scope** – specific feature or architectural components to analyze.
2. **Repo Access** – code paths / git URL.
3. **Focus Area** – performance / architecture / UX / tech-debt / scalability / security / maintainability.
4. **Known Issues** – bugs, slow paths, UX complaints, architectural bottlenecks.
5. **Architecture Docs** – existing diagrams, ADRs, design notes.
6. **Codebase Patterns** – need to analyze existing code patterns, conventions, and best practices.

## 🚦 Skip if
- Feature is trivial **and** unchanged, or you already have a fresh analysis (<30 days).

## 🔍 Comprehensive Analysis Checklist

### Code Patterns & Best Practices Analysis
- [ ] **Existing Patterns**: Analyze current architectural and design patterns in use
- [ ] **Code Conventions**: Document naming conventions, file structure, and coding standards
- [ ] **Reusable Components**: Identify existing utility functions and reusable components
- [ ] **Error Handling**: Analyze current error handling and logging patterns
- [ ] **Testing Patterns**: Examine existing test structures and testing conventions
- [ ] **State Management**: Understand current state management patterns and data flow

### Feature Analysis
- **Function**: Use cases, flows, business rules, data transforms, integrations
- **Tech**: Structure, patterns, quality, performance hotspots, security, error handling
- **UX & Design**: Usability, accessibility, responsiveness, design tokens, theming, consistency
- **Pattern Alignment**: How well feature aligns with existing codebase patterns

### Architecture Analysis
- [ ] **Components**: Responsibilities, data flows & dependencies following existing patterns
- [ ] **Patterns**: Architectural patterns vs anti-patterns & code smells, consistency with codebase
- [ ] **Data Layer**: Stores, consistency, access patterns aligned with existing approaches
- [ ] **Quality**: ⬆️ scalability, ⚡ performance, 🔒 security, 🛠️ maintainability
- [ ] **Design System**: Tokens, components, theming, accessibility following established patterns  

## 📤 Outputs (comprehensive verbal analysis):

### Code Patterns & Best Practices Results
- Pattern analysis: current conventions, standards, and reusable components identified
- Best practices assessment: alignment with industry standards and internal consistency
- Recommendations for pattern improvements and standardization

### Feature Analysis Results
- Function overview: flows, data paths, diagram + breakdown
- Feature assessment: strengths, weaknesses, UX/design gaps
- Pattern compliance: how well feature follows existing codebase patterns

### Architecture Analysis Results  
- Architecture narrative + diagram (PlantUML/Mermaid)
- Component analysis: strengths, weaknesses, design system gaps
- Pattern consistency: alignment with established architectural patterns
- Tech debt identification + roadmap priorities

### Combined Recommendations
- Prioritized improvements w/ file refs & effort estimates
- Pattern alignment recommendations and standardization opportunities
- Architecture and feature enhancement roadmap following best practices

## ➡️ Response Flow
```mermaid
flowchart LR
    U[User] -->|request| A[Feature Analysis Engine]
    A --> B{Need more input?}
    B -- Yes --> C[Ask for scope / repo]
    B -- No --> D[Provide verbal analysis]
