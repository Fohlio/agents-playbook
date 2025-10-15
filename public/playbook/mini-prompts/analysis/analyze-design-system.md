# Analyze Design System

## Objective
Produce a lean snapshot of the current design system (tokens, components, responsive, accessibility) to drive design-system authoring.

## Context Required
- **existing_components** (optional)
- **brand_guidelines** (optional)
- **design_files** (optional)
- **ui_screenshots** (optional)

## Prerequisites
- Figma MCP server (if available)

### Workflow0: Clarify Scope
- Source of truth: Figma vs code/screenshots?
- Figma MCP available?
- Themes required (light/dark)? Target WCAG level (AA/AAA)?
- Critical components to prioritize? Primary breakpoints?

## Instructions
1. Collect data
   - If Figma MCP is available: extract colors, typography, spacing, components, breakpoints
   - Otherwise: infer from code/styles/screenshots and brand_guidelines

2. Analyze
   - Visual tokens: colors (primary/secondary/semantic/neutral), typography, spacing, radius, shadows, themes
   - Components: atomic, composite, layout; key variants/states only
   - Responsive: breakpoints and adaptation rules
   - Accessibility: contrast, keyboard focus, essential ARIA

3. Identify gaps
   - Missing tokens/components, inconsistencies, a11y issues, unclear source of truth

## Return Output
```
design_analysis: { tokens, components, responsive, accessibility, gaps }
design_requirements: { principles, theming, a11y_level }
clarified_design_scope: { priorities, out_of_scope }
component_inventory: [...]
design_patterns: [...]
accessibility_assessment: { level, issues }
responsive_strategy: { breakpoints, rules }
figma_data: { tokens, components } | null
design_source_of_truth: "figma" | "code" | "mixed"
```

## Validation
- Source of truth stated
- Tokens/components captured at useful granularity
- Breakpoints listed
- A11y level and major issues noted
- Gaps/priorities recorded

## Success Criteria
- Concise, actionable analysis stored for the next step

