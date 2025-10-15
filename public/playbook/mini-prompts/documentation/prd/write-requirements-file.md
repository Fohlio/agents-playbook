# Create Requirements Document

## Objective
Write a concise `requirements.md` at `.agents-playbook/<product_slug>/requirements.md` with only what downstream steps need.

## Context Required
- **product_slug**
- **product_name**
- **product_summary** (optional)
- **stakeholders/personas/business_context** (optional)

## Instructions
1) Path: `.agents-playbook/<product_slug>/requirements.md` (ensure parent exists)
2) Ask only essential questions (one-liners): problem, users, 5 core features, success metric, constraints, out-of-scope
3) Write sections, each 3-6 bullets max:

```markdown
# Product Requirements
## Overview
[1-2 sentences]
## Core Goals
- ...
## Users/Personas
- ...
## Core Features
- Feature: short description
## Non-Functional
- Performance, Security, Scalability, Accessibility (bullets)
## Constraints & Assumptions
- ...
## Success Metrics
- ...
## Out of Scope
- ...
```

## Return Output
```
requirements_file_path: .agents-playbook/<product_slug>/requirements.md
structured_requirements: { goals, personas, features, nonfunctional, constraints, success, out_of_scope }
```

## Validation
- Essential sections present and concise
- Measurable core features and metrics where possible

