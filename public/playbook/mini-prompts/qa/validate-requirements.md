# Validate Requirements Prompt (v2)

## 🎯 Goal
Prove the build meets every requirement and acceptance criterion—no fluff.

## 📥 Context (ask if missing)
1. **Requirements Doc** – link/path with AC.  
2. **Implemented Build** – branch/URL or env.  
3. **Stakeholders** – who signs off?  
4. **Compliance Targets** – PCI, GDPR, internal policies, etc.

## 🚦 Skip if
- Requirements are trivial **or** build is incomplete.

## 🔍 Checklist
- **Functional**  
  - [ ] Features complete, biz rules correct, UI matches design  
  - [ ] Data flows & integrations green  

- **Non-Functional**  
  - [ ] Perf & scalability meet SLAs  
  - [ ] Security controls pass scans  
  - [ ] Usability & reliability acceptable  

- **Acceptance**  
  - [ ] Definition of Done ticked  
  - [ ] User stories’ AC met  
  - [ ] Business value delivered  

- **Compliance**  
  - [ ] Regulatory & company standards respected  
  - [ ] Docs & audit trails complete  

### Traceability
- [ ] Each req ↔ code/component mapped  
- [ ] Missing / changed reqs logged  

## 📤 Output
1. Gather insights from the user directly
2. Fill in **File:** `.agents-playbook/[feature-or-task-name]/requirements-validation.md`

Sections:
1. **Executive Summary** – ✅ Pass / ⚠️ Conditional / ❌ Fail  
2. **Validation Matrix**

| Req ID | Category | Pass/Fail | Evidence | Notes |
|--------|----------|-----------|----------|-------|
| FR-001 | Functional | ✅ | video.mp4 | – |

3. **Gap Analysis** – missing or partial items + impact  
4. **Stakeholder Feedback** – quotes & decisions  
5. **Compliance Checklist** – PCI/GDPR/etc. status  
6. **Recommendations** – fixes or improvements  
7. **Sign-off** – names, dates, thumbs-up/down  

## ➡️ Response Flow
```mermaid
flowchart LR
    U[User] -->|build ready| A[Validation Engine]
    A --> B{Need more context?}
    B -- Yes --> C[Ask for reqs / env / stakeholders]
    B -- No --> D[Run validation]
    D --> E[Write requirements_validation.md]
