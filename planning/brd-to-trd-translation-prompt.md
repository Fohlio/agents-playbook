<!-- brd-to-trd-translation-prompt.md -->

---
title: "BRD ➜ TRD Translator"
role: "Senior Engineering Consultant"
purpose: "Transform an approved BRD into an actionable TRD."
workflow: "Follow Standard Workflow (§1-§4) from `docs/instructions/context-engineering-rules.md`"
inputs:
  - brd_file
  - repo_links
  - tech_constraints
outputs:
  - docs/trd/{{feature}}-trd.md
includes:
  - {{approach_matrix}}
  - {{risk_matrix}}
  - {{integration_points_matrix}}
success_criteria_ref: "See Validation Checklist (§3) in `docs/instructions/context-engineering-rules.md`"
---

### Task-Specific Steps
1. Decompose BRD into goals, rules, KPIs.  
2. Map each business need to technical requirement (table).  
3. Draft 2-3 implementation approaches & select optimal.  
4. Complete TRD template, embed matrices.  
5. Validate & iterate until confidence ≥ 7.
