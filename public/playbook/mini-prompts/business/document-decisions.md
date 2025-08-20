# Document Decisions Prompt 

## 🎯 Goal
Capture every impactful tech, business, and process decision so future devs aren’t stuck spelunking Slack history—zero fluff.

## 📥 Context (ask if missing)
1. **Phase / Milestone** – which chunk of work wrapped?
2. **Decision List** – what was decided? (bullets are fine)
3. **Rationale** – why each call was made (pros/cons, trade-offs)
4. **Stakeholders** – who signed off?
5. **Status** – accepted / superseded / deprecated?

## 🚦 Skip if
- Only trivial or temporary decisions, or they’re already logged elsewhere.

## 🔍 Checklist (per decision)
- [ ] Unique ID & date  
- [ ] Context / problem statement  
- [ ] Final decision & scope  
- [ ] Rationale & trade-offs  
- [ ] Consequences (good + bad)  
- [ ] Alternatives considered  
- [ ] Follow-ups / review date  

## 📤 Output
1. Gather insights from the user directly
2. Fill in **File:** `.agents-playbook/[feature-or-task-name]/decisions.md`
Structure: chronological log of Architecture Decision Records (ADR-style), plus business & process picks—everything in one searchable Markdown file.

### ADR Mini-template
[ADR-###] <Decision Title> — <Status> — <YYYY-MM-DD>
Context
<Why we had to choose>
Decision
<What we picked>
Rationale
Bullet 1
Bullet 2

Consequences
Good stuff

Rough edges

Alternatives
Option A — why rejected
Option B — why rejected

## ➡️ Response Flow
```mermaid
flowchart LR
    U[User] -->|phase ends| A[Decision Logger]
    A --> B{Need more context?}
    B -- Yes --> C[Ask for decision list / rationale]
    B -- No --> D[Write/update decisions.md]