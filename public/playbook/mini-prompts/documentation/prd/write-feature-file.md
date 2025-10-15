# Create Feature Breakdown

## Objective
Create minimal, actionable feature files in `.agents-playbook/<product_slug>/features/` with clear AC and a ready-to-run prompt.

## Context Required
- **structured_requirements**
- **design_specifications**
- **design_system_specifications** (optional)
- **phase_breakdown** (optional)

## Instructions
1) Base dir: `.agents-playbook/<product_slug>/features/` (ensure exists)
2) For each feature, create `<feature-slug>.md` with:

```markdown
---
feature: [Title]
slug: [feature-slug]
phase: [Phase]
status: planned
priority: [high|medium|low]
estimated_effort: [s|m|l|xl]
---

# [Title]

## Description
[1-3 sentences]

## Acceptance Criteria
- [ ] [Criterion 1]
- [ ] [Criterion 2]

## Prompt (use with feature-development)
Implement “[Title]” for [product_name]. Requirements: [2-4 bullets]. Accept if AC met. See `design.md` and design system.
```

3) Derive features, phases, and AC from requirements/design; reference design-system components when relevant.

## Return Output
```
feature_files: [".agents-playbook/<product_slug>/features/<slug>.md", ...]
feature_list: [{ title, slug, phase, priority, effort }]
```

## Validation
- Files created in correct directory
- Frontmatter present
- AC concise and testable
- Prompt self-contained and references context

