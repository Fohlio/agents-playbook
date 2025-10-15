# Assemble PRD

## Objective
Create a lean `prd.md` linking requirements, design, design system, and features.

## Context Required
- **requirements_file_path**
- **design_file_path**
- **feature_files**
- **product_name** (optional)
- **product_summary** (optional)
- **design_system_file_path** (optional)

## Instructions
1) Path: `.agents-playbook/<product_slug>/prd.md` (ensure parent exists)
2) Build a minimal index with:

```markdown
# Product Requirements Document (PRD)
## [Product Name]
> [Brief summary]

## Core Documents
- [Requirements](./requirements.md)
- [Design & Architecture](./design.md)
- [Design System](./design-system.md)

## Features by Phase
- Phase 1: [Feature A](./features/a.md), [Feature B](./features/b.md)
- Phase 2: [...]
```

3) Extract feature titles/phase from frontmatter; group by phase; create relative links.
4) Replace all placeholders with real values; include current date in a short metadata line if helpful.

## Return Output
```
prd_index_file_path: .agents-playbook/<product_slug>/prd.md
```

## Validation
- File at correct location
- Links resolve relatively
- Features grouped by phase

