# Design Architecture Prompt 

## 🎯 Goal
Craft a rock-solid solution architecture that meets all requirements. **Always propose multiple architecture variants with pros/cons analysis.**

## 📥 Context (ask if missing)
1. **Clarified Requirements** – link or file path.
2. **Tech Constraints / Preferences** – languages, clouds, budgets, etc.
3. **Non-Func Targets** – perf, scale, security SLAs.
4. **Existing Systems** – what stays, what gets replaced?

## 🚦 Skip if
- Architecture already designed (<30 days) **or** change is trivial/bug-fix.

## 🔍 Checklist
- **Architecture Variants**: 2-3 approaches, trade-offs, recommended option
- **Implementation**: Vertical slice delivery, incremental rollout, minimal dependencies
- **Core Components**: Front/back-end, DB, integrations, background jobs
- **Cross-Cutting**: AuthN/Z, logging, monitoring, resilience, caching
- **Data Layer**: Schema, relationships, migrations, validation
- **Integration**: API style, events, queues, third-party hooks
- **Design Principles**: SRP, loose-coupling, cohesion, DRY, KISS
- **Scale & Performance**: Scaling plan, bottleneck analysis
- **Security**: Threat model, data protection, compliance
- **Design System**: Tokens, components, theming, accessibility, responsive patterns  

## 📤 Output
1. Gather insights from the user directly
2. Fill in **File:** `.agents-playbook/[feature-or-task-name]/architecture-design.md`

Sections:
1. **Executive Summary** – TL;DR + tech stack
2. **System Diagram** – C4/UML views
3. **Component Matrix** – responsibilities & interfaces
4. **Data & API Design** – schema, endpoints, flows
5. **Security & Performance** – auth, scaling, bottlenecks
6. **Design System** – tokens, components, theming, accessibility
7. **Decision Log** – trade-offs & rejected options  

## ➡️ Response Flow
```mermaid
flowchart LR
    U[User] -->|reqs ready| A[Architecture Engine]
    A --> B{Need more context?}
    B -- Yes --> C[Ask for constraints / prefs]
    B -- No --> D[Design & document]
    D --> E[Write architecture_design.md]
