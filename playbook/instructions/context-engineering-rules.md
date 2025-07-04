# 📚 Context Engineering Rules

These rules apply to **all** prompts in the AI Agents Playbook.  Reference this document instead of duplicating the same blocks in every prompt.

---
## 1. Standard Workflow
1. **Read Context First**  
   • docs/project-navigation.md – single source of truth  
   • docs/examples/ – patterns & anti-patterns
2. **Gather Missing Context**  
   • Search codebase & docs  
   • Ask clarifying questions (see §2)
3. **Confidence Check**  
   Rate each area 1-10.  If any <7 → gather more context before coding.
4. **Implement Task-Specific Steps**
5. **Validate** – run quality-gates (see §3)
6. **Self-Correct** – iterate until confidence ≥7/10 & all gates pass.

---
## 2. Clarifying Questions (Cheat-Sheet)
Ask only what is missing – propose answer options to speed decision-making.

• **Code Examples & Patterns** – good vs bad, testing patterns
• **Rules & Standards** – coding style, performance, security, "never-touch" areas
• **Validation & Quality Gates** – required commands, coverage targets, benchmarks
• **Legacy Context** – support timeline, migration constraints
• **Confidence** – which areas are unclear to the team/agent
• **Additional Clarifying Questions** – any questions that deem important for you to accomplish the task with options to select.

---
## 3. Validation Checklist
Use or adapt this list for any deliverable.

- [ ] Examples from docs/examples/ referenced
- [ ] Project standards from project-navigation.md followed
- [ ] Validation commands pass (`test`, `lint`, `build`, etc.)
- [ ] Confidence ≥7/10 for all key areas
- [ ] Another developer/agent can proceed without extra context

---
## 4. Self-Correction Loop
1. **Identify Gaps** – which checklist items fail?  
2. **Research / Ask** – collect missing context  
3. **Update** – refine deliverable & confidence scores  
4. **Re-validate** – repeat until all pass

---
## 6. Confidence Scale
1 - 3 = Vague / high risk  
4 - 6 = Partial context, needs work  
7 - 8 = Good understanding  
9 - 10 = Crystal-clear, ready for production

