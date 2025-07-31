# Architecture Analysis Prompt 

## 🎯 Goal
Describe the current architecture, highlight weak spots, and propose improvements—no fluff.

## 📥 Context (ask if missing)
1. **Scope** – which services/modules to inspect.
2. **Codebase** – repo paths or file access.
3. **Docs** – diagrams, ADRs, design notes.
4. **Focus** – pick the priority: scalability / performance / security / maintainability.

## 🚦 Skip the analysis if
- The system is trivial **and** unchanged.
- A fresh report exists (< 30 days old).
- Only an urgent bug-fix is needed, with no architecture impact.

## 🔍 Analysis Checklist
- [ ] Components + responsibilities  
- [ ] Data flows & dependencies  
- [ ] Architectural patterns  
- [ ] Anti-patterns & code smells  
- [ ] Data stores, consistency, access patterns  
- [ ] Quality attributes: ⬆️ scalability, ⚡ performance, 🔒 security, 🛠️ maintainability  

## 📤 Outputs (provide verbal analysis)
- narrative + diagram (PlantUML or Mermaid)
- strengths & weaknesses per attribute
- tech debt + roadmap

## ➡️ Response Flow
```mermaid
flowchart LR
    A[User] -->|request| B[Analysis Engine]
    B --> C{Need more context?}
    C -- Yes --> D[Ask clarifying questions]
    C -- No --> E[Provide verbal analysis]