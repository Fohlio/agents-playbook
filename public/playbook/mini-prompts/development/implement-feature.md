# Implement Feature Prompt (v2)

## 🎯 Goal
Ship the feature per specs with clean, secure, performant code. **Consider alternative implementation approaches and choose the most appropriate one.**

## 📥 Context (ask if missing)
1. **Design Spec** – link/file for architecture & diagrams.  
2. **Requirements** – user stories + acceptance criteria.  
3. **Repo Access** – branch / directory path.  
4. **Dev Environment** – setup quirks, build tools, secrets manager?

## 🚦 Skip if
- Implementation already merged **or** change is trivial/config-only.

## 🔍 Checklist
- **Implementation Strategy**
  - [ ] Use vertical slice approach: implement complete user scenarios end-to-end
  - [ ] Prioritize working software over perfect layers
  - [ ] Start with simplest valuable slice, then iterate

1. **Core Logic** – business rules first.  
2. **Data Layer** – models, migrations, validation.  
3. **API** – endpoints, request/response schema.  
4. **Integrations** – external services, queues, webhooks.  
5. **UI** – components, state mgmt, a11y.  
6. **Cross-Cutting** – logging, monitoring, error handling, auth.  
7. **Libraries & Dependencies** – when working with libraries, use MCP tools like Context7 for fresh docs or check latest documentation.  

### Quality Gates
- [ ] Follows style guide & naming conventions.  
- [ ] Inputs validated, secrets via env/manager.  
- [ ] No hard-coded limits; efficient queries.  
- [ ] Unit + integration tests pass (≥ 90 % coverage for new code).  

## 🛠️ Common Patterns
Repository • Service • Factory • Middleware • Decorator • Observer

## 📤 Output
1. Gather insights from the user directly
2. Fill in **File:** `docs/planning/[feature-name]-implementation-plan.md`

Sections:
1. **Summary** – feature scope & branch.  
2. **Done Checklist** – items from the 🔍 Checklist with ✅ / ❌.  
3. **Security Notes** – validation, authZ, secret handling.  
4. **Performance Notes** – known bottlenecks or caching.  
5. **Test Coverage** – % + key scenarios covered.  
6. **Next Steps** – remaining todos + owner.  

## ➡️ Response Flow
```mermaid
flowchart LR
    U[User] -->|specs ready| A[Implementation Engine]
    A --> B{Need more context?}
    B -- Yes --> C[Ask for spec / env]
    B -- No --> D[Code + tests]
    D --> E[Write implementation_plan.md]
