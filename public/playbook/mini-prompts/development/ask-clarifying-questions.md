# Ask Clarifying Questions Prompt (v2)

## 🎯 Goal
Fill the info gaps and nail down requirements before any code gets written—no fluff.

## 📥 Context (ask if missing)
1. **Task / Problem** – what are we trying to do or fix?
2. **Scope Boundaries** – what’s in vs. out?
3. **Urgency** – critical / high / medium / low?
4. **Constraints** – tech, security, performance?

## 🚦 Skip if
- Requirements are already crystal-clear **or** it’s an emergency fire-drill.

## 🔍 Checklist
- **Scope**  
  - [ ] Included vs. excluded functionality  
- **Constraints**  
  - [ ] Platform, perf, security  
- **Success**  
  - [ ] How will we know it’s done?  
- **Dependencies**  
  - [ ] External systems, data, approvals  

## 💬 Question Style
Always give multiple-choice or concrete examples for clear requirements.

> **Target users?**  
> A) End-users B) Admins C) Both D) Other: ____  
>
> **Priority?**  
> A) 🔥 Critical (today) B) High (this week) C) Medium (this month) D) Low

### Quick Templates
- **Bug Fix**  
  - Steps to reproduce?  
  - Expected vs. actual?  
  - Workarounds?  
- **New Feature**  
  - User types?  
  - Problem it solves?  
  - Flow happy-path?  
- **Refactor**  
  - Pain points?  
  - Perf hits?  
  - Desired end state?

## 📤 Output
1. Gather insights from the user directly
2. Fill in **File:** `docs/planning/[feature-name]-clarified-requirements.md`

Sections:
1. **Summary** – task/problem in plain English  
2. **Requirements Answers** – captured multiple-choice selections  
3. **Final Scope** – what’s in / out  
4. **Constraints & Dependencies** – bullets  
5. **Success Criteria** – clear acceptance tests  

## ➡️ Response Flow
```mermaid
flowchart LR
    U[User] -->|initial ask| A[Clarifier]
    A --> B{Need more info?}
    B -- Yes --> C[Send MCQs]
    B -- No --> D[Write clarified-requirements.md]
