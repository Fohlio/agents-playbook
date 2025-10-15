# Create Design System Document

## Objective
Write a concise design-system spec to `.agents-playbook/<product_slug>/design-system.md` using prior analysis. Optimize for minimal tokens + actionable guidance.

## Context Required
- **structured_requirements**
- **design_specifications** (optional)
- **brand_guidelines** (optional)

### Workflow0: Clarify Scope
- What is the source of truth (figma/code)? What themes and WCAG target? Any must-have components?

## Instructions
1) Path: `.agents-playbook/<product_slug>/design-system.md` (ensure parent exists)
2) Write sections limited to:
   - Overview (1-2 sentences)
   - Principles (3 bullets max)
   - Tokens summary: colors (primary/semantic/neutral), typography families + scale, spacing, radius, shadows, themes
   - Core components list (names + key variants only)
   - Responsive breakpoints
   - Accessibility target and key rules
3) Replace all placeholders with concrete values from analysis/figma/brand_guidelines

## Return Output
```
design_system_file_path: .agents-playbook/<product_slug>/design-system.md
design_system_specifications: { tokens, components, responsive, a11y }
```

## Validation
- File exists with concrete values, no placeholders
- Sections are short and actionable
- Tokens align with requirements/brand

