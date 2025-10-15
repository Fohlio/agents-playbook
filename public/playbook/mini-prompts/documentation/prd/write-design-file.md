# Create Technical Architecture Document

## Objective
Write a short, decisive architecture spec to `.agents-playbook/<product_slug>/design.md` covering only choices required to implement.

## Context Required
- **structured_requirements**
- **technical_constraints** (optional)
- **technology_preferences** (optional)

## Instructions
1) Path: `.agents-playbook/<product_slug>/design.md` (ensure parent exists)
2) Document only:
   - Overview (1-2 sentences)
   - Tech stack choices (FE/BE/DB) with versions
   - Key patterns (architecture style, module layout)
   - Integration/auth summary
   - Performance/scalability notes (bulleted)
   - Security essentials (bulleted)
3) Keep each subsection to 3-6 bullets. Include rationale only where trade-offs matter.

## Return Output
```
design_file_path: .agents-playbook/<product_slug>/design.md
design_specifications: { stack, patterns, integrations, security, performance }
```

## Validation
- Concrete technology choices present
- Limited to essentials, no placeholders
