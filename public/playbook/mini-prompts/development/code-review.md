# Code Review Prompt (v2)

## 🎯 Goal
Audit the finished code for quality, security, performance, and standards, then hand back a crisp report—no fluff.

## 📥 Context (ask if missing)
1. **Code Branch / PR** – where’s the diff?
2. **Requirements / Specs** – doc or ticket link.
3. **Known Constraints** – perf targets, security mandates, style guide, etc.
4. **Deadline** – when do devs need feedback?

## 🚦 Skip if
- Only trivial config tweaks **or** review already done.

## 🔍 Checklist
- **Functional**  
  - [ ] Implements all requirements & edge cases  

- **Quality**  
  - [ ] Readable, DRY, follows style guide  
  - [ ] No dead code / duplication  

- **Security**  
  - [ ] Input validation / sanitization  
  - [ ] Secrets handled via env/secret manager  
  - [ ] AuthN/Z correct  

- **Performance**  
  - [ ] No obvious bottlenecks or N+1 queries  
  - [ ] Memory & CPU use sane  

- **Error Handling**  
  - [ ] Graceful exceptions, helpful logs  

- **Testing**  
  - [ ] Adequate unit / integration coverage  
  - [ ] Tests pass and are maintainable  

## 📤 Output
**File:** `.agents-playbook/[feature-or-task-name]/code-review.md`

Structure:
1. **Summary** – 🚦 Approved / Approved-with-changes / Needs-rework  
2. **Issue Table**  

| Severity | File/Line | Issue | Recommendation |
|----------|-----------|-------|----------------|
| Critical | `auth.go:42` | SQL injection risk | Use prepared stmt |

3. **Security Findings** – bullets  
4. **Performance Notes** – bullets  
5. **Quality & Style** – highlights + nitpicks  
6. **Test Coverage** – % plus missing cases  
7. **Next Steps** – who fixes what by when  

## ➡️ Response Flow
```mermaid
flowchart LR
    U[User] -->|PR ready| A[Review Engine]
    A --> B{Need more context?}
    B -- Yes --> C[Ask for branch / specs]
    B -- No --> D[Run review]
    D --> E[Write code_review.md]
