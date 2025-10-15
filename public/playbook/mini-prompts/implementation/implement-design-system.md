# Implement Design System

## Objective
Generate only what teams need to start building: a single spec file plus minimal tokens, optionally split docs if requested.

## Universal Implementation Rules
1. Do not over-engineer and make precise fixes
2. Use only static imports
3. Do not add excessive markdown files and console logs
4. Do not use any work arounds, hacks and fallbacks
5. Validate and document each step
6. Do not use "any" or "unknown" types or any fallbacks or hacks
7. Do not pass functions as dependencies to hooks
8. Name functions and variables and classes technically or business wise
9. Follow strict typisation if applicable
10. Fix lint errors and do not write code which is not used
11. Locate existing design system or UI components if applicable
12. Use context7 MCP if available for documentation if applicable

## Context Required
- **product_slug**
- **design_analysis**
- **design_requirements**
- **clarified_design_scope**
- **figma_data** (optional)
- **design_source_of_truth** (optional)

### Workflow0: Clarify Scope
- Confirm source of truth (figma/code) and required themes (light/dark)
- Confirm minimal output set (default minimal) or full set (colors/typography/components/guide)

## Minimal Output (default)
Paths under `.agents-playbook/<product_slug>/design-system/`:
- `design-system.md` (single, concise spec)
- `design-tokens.json` (tokens only)

## Full Output (only if explicitly requested)
- `colors.md`, `typography.md`, `components.md`, `implementation-guide.md`

## Instructions
1) Ensure directory exists: `.agents-playbook/<product_slug>/design-system/`
2) Create `design-system.md` with sections: overview, principles, tokens summary (colors/typography/spacing/radius/shadows), core components (names, variants), responsive breakpoints, a11y target
3) Create `design-tokens.json` with tokens from `figma_data` if present else `design_analysis`
4) If full output requested, generate the additional docs based on the spec; else skip

## Return Output
```
design_system_directory
design_system_file_path
design_tokens_file_path
colors_file_path? (only if created)
typography_file_path? (only if created)
components_file_path? (only if created)
implementation_guide_path? (only if created)
design_system_specifications
```

## Validation
- No placeholders left
- Tokens populated with concrete values
- Source of truth documented
- Only requested files created

## Success Criteria
- Minimal set created with specific tokens and actionable guidance

