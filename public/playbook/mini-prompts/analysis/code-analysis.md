# Code Analysis Prompt

## 🎯 Goal
Deep-scan the codebase, expose issues, and recommend fixes—no fluff.

## 📥 Context (ask if missing)
1. **Scope** – specific modules/files to inspect.
2. **Repo Access** – git URL or path.
3. **Known Issues** – bugs, perf pains, security worries.
4. **Focus** – pick the priority: architecture / performance / security / maintainability.

## 🚦 Skip if
- The code is trivial **and** unchanged, or a fresh analysis exists (<30 days).

## 🔍 Checklist
- **Structure**  
  - [ ] File & module layout  
  - [ ] Architecture patterns  
  - [ ] Dependency graph & coupling  
  - [ ] Interfaces / public APIs  

- **Quality**  
  - [ ] Readability (naming, comments, style)  
  - [ ] Maintainability & extensibility  
  - [ ] Complexity hotspots (length, nesting, cyclomatic)  
  - [ ] Anti-patterns, code smells & duplication  

- **Perf / Sec**  
  - [ ] Algorithmic complexity on critical paths  
  - [ ] Resource usage (memory, DB, I/O)  
  - [ ] Security: input validation, authN/Z, crypto, secrets  
  - [ ] Error & exception handling patterns  

## 📤 Outputs (in `.agents-playbook/[feature-or-task-name]/code-analysis-report.md`), which includes:
- overview + dependency diagram (Mermaid/PlantUML)
- metrics, smells, maintainability score
- prioritized table with file/line refs
- quick wins, tech-debt roadmap, effort estimates

## ➡️ Response Flow
```mermaid
flowchart LR
    U[User] -->|request| A[Code Analysis Engine]
    A --> B{Need input?}
    B -- Yes --> C[Ask for repo / scope]
    B -- No --> D[Run analysis & generate reports]