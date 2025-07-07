# Create Project Navigation Prompt 

## 🎯 Goal
Map the project’s structure, patterns, and tech stack, then generate AGENTS.MD + navigation docs—no fluff.

## 📥 Context (ask if missing)
1. **Repo Access** – path / git URL.
2. **Project Root** – confirmation of root directory.
3. **Freshness** – does navigation already exist? If so, date of last update.
4. **Special Focus** – architecture / workflow / tech-debt, etc.

## 🚦 Skip if
- An up-to-date navigation already exists **or** project is trivial/deprecated.

## 🔍 Checklist
- **Overview**  
  - [ ] Project purpose, scope, business context  
  - [ ] High-level architecture & tech stack  

- **Directories**  
  - [ ] Source code layout & responsibilities  
  - [ ] Configs, assets, docs, build/deploy scripts  

- **Patterns**  
  - [ ] Common architectural & design patterns  
  - [ ] Coding standards, naming conventions, data flow  

- **Anti-patterns**  
  - [ ] Code smells, perf/security pitfalls, maintainability issues  

- **Stack Map**  
  - [ ] Front-end, back-end, data stores, DevOps, testing tools  

## 📤 Outputs
1. Gather insights from the user directly
2. Fill in **File:** `docs/planning/project-navigation.md`
Structure:
  - directory tree + purpose  
  - patterns & conventions  
  - what to avoid  
  - full stack & versions  
  - key APIs, components, data flows  
- `./AGENTS.MD` – AI agent context & quick-start guide with reference 

## ➡️ Response Flow
```mermaid
flowchart LR
    U[User] -->|request| A[Navigation Engine]
    A --> B{Need more context?}
    B -- Yes --> C[Ask for repo / root / focus]
    B -- No --> D[Analyze project]
    D --> E[Generate docs]
