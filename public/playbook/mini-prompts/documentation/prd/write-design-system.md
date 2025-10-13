# Create Design System Document

## Objective
Define comprehensive design system including UI/UX principles, component library, theming, and visual design guidelines, and write them to `.agents-playbook/<product-slug>/design-system.md`.

## Context Required
- **structured_requirements**: The requirements from the requirements phase
- **product_slug**: The unique identifier/slug for the product
- **design_specifications** (optional): Technical architecture specifications
- **brand_guidelines** (optional): Existing brand guidelines or style guides

## Instructions

### 1. Design System Analysis
Based on requirements and technical architecture, define:
- Design philosophy and principles
- Component library structure and hierarchy
- Color palette and theming system
- Typography scale and font choices
- Spacing and layout system
- Iconography and visual elements
- Animation and interaction patterns
- Accessibility requirements and standards
- Responsive design approach
- Component documentation standards

### 2. Prepare Output Path
Calculate the absolute output path:
```
.agents-playbook/<product_slug>/design-system.md
```

Ensure the parent directory `.agents-playbook/<product_slug>/` exists.

### 3. Structure the Design System File

Create a comprehensive design system document:

```markdown
# Design System

## Overview
[High-level design philosophy and approach]

## Design Principles
### Core Principles
1. **[Principle 1]**: [Description]
2. **[Principle 2]**: [Description]
3. **[Principle 3]**: [Description]

### UX Guidelines
- [Key UX guideline 1]
- [Key UX guideline 2]
- [Key UX guideline 3]

## Visual Design

### Color Palette
#### Primary Colors
- **Primary**: #[hex] - [Usage description]
- **Secondary**: #[hex] - [Usage description]
- **Accent**: #[hex] - [Usage description]

#### Semantic Colors
- **Success**: #[hex]
- **Warning**: #[hex]
- **Error**: #[hex]
- **Info**: #[hex]

#### Neutral Colors
- **Background**: #[hex]
- **Surface**: #[hex]
- **Border**: #[hex]
- **Text Primary**: #[hex]
- **Text Secondary**: #[hex]

#### Theme Support
[Light/Dark mode strategy, theme switching approach]

### Typography
#### Font Families
- **Primary**: [Font name] - [Usage: body text, UI elements]
- **Headings**: [Font name] - [Usage: titles, headings]
- **Monospace**: [Font name] - [Usage: code, technical content]

#### Type Scale
- **Heading 1**: [size/weight/line-height]
- **Heading 2**: [size/weight/line-height]
- **Heading 3**: [size/weight/line-height]
- **Body Large**: [size/weight/line-height]
- **Body**: [size/weight/line-height]
- **Body Small**: [size/weight/line-height]
- **Caption**: [size/weight/line-height]

### Spacing System
[Spacing scale: 4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px, etc.]

### Elevation & Shadows
[Shadow definitions for different elevation levels]

### Border Radius
[Border radius scale for different UI elements]

## Component Library

### Atomic Components
#### Buttons
- **Primary Button**: [Description, usage, variants]
- **Secondary Button**: [Description, usage, variants]
- **Text Button**: [Description, usage, variants]
- **Icon Button**: [Description, usage, variants]

#### Form Elements
- **Text Input**: [Description, states, validation]
- **Select/Dropdown**: [Description, single/multi-select]
- **Checkbox**: [Description, states]
- **Radio Button**: [Description, states]
- **Toggle/Switch**: [Description, states]
- **Slider**: [Description, range, step]

#### Feedback Components
- **Alert/Notification**: [Types: success, warning, error, info]
- **Toast**: [Position, duration, actions]
- **Progress Indicator**: [Linear, circular, determinate/indeterminate]
- **Skeleton Loader**: [Usage for loading states]

### Composite Components
#### Navigation
- **Header/Navigation Bar**: [Structure, responsive behavior]
- **Sidebar**: [Collapsible, navigation items]
- **Breadcrumbs**: [Navigation trail]
- **Tabs**: [Content organization]
- **Pagination**: [Data navigation]

#### Data Display
- **Card**: [Content container, variants]
- **Table**: [Data grid, sorting, filtering]
- **List**: [Item rendering, virtualization]
- **Badge**: [Status indicators, counts]
- **Avatar**: [User representation, sizes]

#### Overlays
- **Modal/Dialog**: [Size variants, actions]
- **Drawer**: [Side panel, position]
- **Tooltip**: [Contextual information]
- **Popover**: [Rich content display]
- **Dropdown Menu**: [Action menus]

### Layout Components
- **Container**: [Max-width, padding]
- **Grid**: [Responsive grid system]
- **Stack**: [Vertical/horizontal spacing]
- **Divider**: [Content separation]

## Iconography
### Icon System
- **Icon Library**: [Icon set choice: Material, Heroicons, Lucide, custom]
- **Icon Sizes**: [16px, 20px, 24px, 32px, etc.]
- **Icon Style**: [Outlined, filled, two-tone]
- **Custom Icons**: [When and how to create custom icons]

## Animation & Interactions
### Animation Principles
- [Timing functions, duration guidelines]
- [Motion patterns: enter, exit, emphasis]

### Interaction States
- **Hover**: [Visual feedback]
- **Active/Pressed**: [Interaction feedback]
- **Focus**: [Keyboard navigation indicator]
- **Disabled**: [Unavailable state styling]
- **Loading**: [Loading state indicators]

### Transitions
- [Page transitions]
- [Component state transitions]
- [Micro-interactions]

## Accessibility
### WCAG Compliance
- **Target Level**: [AA or AAA]
- **Color Contrast**: [Minimum contrast ratios]
- **Keyboard Navigation**: [Tab order, focus management]
- **Screen Reader Support**: [ARIA labels, roles, live regions]

### Inclusive Design
- [Touch target sizes]
- [Error message clarity]
- [Form label associations]
- [Alternative text for images]

## Responsive Design
### Breakpoints
- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: 1024px - 1440px
- **Wide**: > 1440px

### Responsive Strategy
[Mobile-first approach, component adaptation, layout shifts]

## Component Documentation Standards
### Component Specifications
For each component, document:
- **Purpose**: What the component does
- **Usage**: When and how to use it
- **Props/API**: Configuration options
- **States**: All possible states
- **Accessibility**: ARIA attributes, keyboard support
- **Examples**: Code samples and visual examples

## Implementation Guidelines
### Code Organization
- [Component file structure]
- [Styling approach: CSS-in-JS, CSS Modules, Tailwind, etc.]
- [Component testing strategy]

### Design Tokens
[How design values are defined and consumed in code]

### Version Control
[Design system versioning strategy]

## Design Tools & Resources
### Design Software
- [Figma, Sketch, Adobe XD]
- [Component library location]

### Development Resources
- [Storybook/component playground URL]
- [Design system documentation site]
- [Code repository]

## Future Considerations
[Planned additions, improvements, experimental features]
```

### 4. Populate Content
- Use design analysis based on requirements
- Extract relevant information from optional context (design_specifications, brand_guidelines)
- Be specific about design choices (colors, fonts, sizes)
- Include examples and visual references where helpful
- Ensure comprehensive coverage of all design aspects
- Reference industry standards and best practices

### 5. Write the File
Write the formatted content to the calculated output path.

### 6. Return Output
Set the output context:
```
design_system_file_path: .agents-playbook/<product_slug>/design-system.md
design_system_specifications: [design system data structure]
```

Store the design system specifications in context for use by subsequent steps (planning, feature breakdown).

## Output Format
The file should be:
- Comprehensive design system specification
- Specific values for all design tokens (colors, spacing, typography)
- Clear usage guidelines for each component
- Actionable for both designers and developers
- Include accessibility standards and responsive guidelines

## Best Practices
- Start with foundational elements (colors, typography) before components
- Provide rationale for major design decisions
- Include visual examples or ASCII diagrams where helpful
- Document component variants and states thoroughly
- Ensure design system aligns with technical architecture
- Make it a living document that can evolve

## Validation
- File created at correct location
- All major design system areas covered
- Design tokens clearly defined with specific values
- Component library comprehensively documented
- Accessibility standards included
- Responsive design approach defined
- Path stored in context for later reference

## Success Criteria
✅ Complete design token system defined  
✅ Component library documented with all states  
✅ Accessibility requirements specified  
✅ Responsive strategy clearly outlined  
✅ Design principles aligned with product goals

