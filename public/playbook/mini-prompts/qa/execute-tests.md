# Execute Tests Prompt (v2)

## 🎯 Goal
Run the test plan, capture every result, surface every bug—no fluff.

## 📥 Context (ask if missing)
1. **Test Plan** – link or path to cases.
2. **Build / Env** – branch, URL, credentials.
3. **Tools** – automation frameworks, perf rigs, recording utils.
4. **Deadline** – ship date or test window.

## 🚦 Skip if
- No test plan, env, or code ready, or emergency skip approved.

## 🔍 Checklist
- **Functional**  
  - [ ] Core features & workflows  
  - [ ] Business rules, edge cases  
  - [ ] API & data processing  

- **Non-Functional**  
  - [ ] Perf (load, stress), security scans  
  - [ ] Usability / compatibility  

- **Integration**  
  - [ ] Modules ↔ DB ↔ external APIs  
  - [ ] End-to-end flows  

- **Regression**  
  - [ ] Critical paths, previous bugs, perf baseline  

### Best-Practice Gates
- [ ] Env clean & seeded  
- [ ] Test data privacy confirmed  
- [ ] Logs, screenshots, metrics captured for fails  

## 📤 Output
**File:** `docs/planning/[feature-name]-test-execution.md`

Sections:
1. **Summary** – 🚦 Go / No-Go recommendation  
2. **Result Matrix**

| Test Case | Type | Pass/Fail | Evidence | Notes |
|-----------|------|-----------|----------|-------|
| `TC-101` | Functional | ✅ | screenshot.zip | – |

3. **Bugs Logged** – ID, severity, repro, suspect root
