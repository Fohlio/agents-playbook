# Trace Bug Root Cause Prompt

## 🎯 Goal
Hunt down the exact line(s) causing the bug, prove it, and outline a fix—zero fluff.

## 📥 Context (ask if missing)
1. **Bug Symptoms** – what’s wrong vs. expected.
2. **Repro Steps** – click-by-click (or curl-by-curl) path to fail.
3. **Error Logs / Stack** – paste the juicy bits.
4. **Env Details** – OS / browser / version / config.
5. **Recent Changes** – deploys, merges, toggles right before the boom.

## 🚦 Skip if
- Root cause is already documented, or issue can’t be reproduced.

## 🔍 Debug Checklist
- [ ] Reproduce consistently  
- [ ] Parse logs & stack traces  
- [ ] Trace code path (breakpoints / print-debug)  
- [ ] Inspect data: inputs, edge cases, corruption  
- [ ] Compare environments & configs  
- [ ] Review recent commits / releases  
- [ ] Form & test hypothesis, then validate with alt scenarios  

## 📤 Outputs (to `.agents-playbook/[feature-or-task-name]/bug-analysis.md`)
– TL;DR + evidence (logs, code refs, screenshots) and includes: 
- scope, severity, affected users  
- minimal steps / script  
- patch outline, effort, regression tests  
- how to stop this ever happening again  

## ➡️ Response Flow
```mermaid
flowchart LR
    U[User] -->|bug report| A[Debug Engine]
    A --> B{Need more context?}
    B -- Yes --> C[Ask for logs / repro]
    B -- No --> D[Reproduce & trace]
    D --> E[Pinpoint root cause]
    E --> F[Generate reports]
