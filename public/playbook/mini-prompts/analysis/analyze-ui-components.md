# Analyze UI Components (v1)

## 🎯 Goal
Discover, catalog, and document UI components systematically, creating comprehensive component inventory with metadata, usage patterns, and design system information.

## 📥 Context (ask if missing)
1. **Component Directories** – paths to UI component files and folders
2. **Design System** – existing design system or component library information
3. **Framework/Library** – React, Vue, Angular, or other UI framework
4. **Styling Approach** – CSS modules, styled-components, Tailwind, etc.
5. **Theme Configuration** – existing theme or design tokens setup
6. **Component Documentation** – existing Storybook, style guides, or docs

## ❓ Clarifying Questions (ask before proceeding)
**IMPORTANT: Ask clarifying questions directly in chat before proceeding.**

Generate concise one-line questions about: component directory locations, design system usage, styling methodologies, accessibility requirements, component naming conventions, deprecated component identification, and documentation preferences.

## 🚦 Skip if
- UI components are well-documented and recently cataloged (<30 days)
- Application has minimal or no custom UI components
- Pure backend or API-only application

## 📋 Analysis Process
1. **Component Discovery** – scan specified directories for UI component files
2. **Metadata Extraction** – analyze props, usage patterns, and dependencies
3. **Design System Analysis** – identify design libraries and custom systems
4. **Usage Pattern Mapping** – trace component usage throughout application
5. **UI Inventory Generation** – create structured ui.json catalog

## 📤 Output
**File:** `.agents-playbook/ui.json`

### JSON Structure:
```json
{
  "analysis": {
    "analyzedDate": "2025-09-24",
    "totalComponents": 45,
    "frameworksDetected": ["React", "TypeScript"],
    "designSystemsUsed": ["Material-UI", "Custom Design Tokens"],
    "componentDirectories": [
      "src/components",
      "src/shared/ui"
    ]
  },
  "components": [
    {
      "name": "Button",
      "location": "src/components/Button/Button.tsx",
      "description": "Primary button component with variants and states",
      "deprecated": false,
      "category": "Form Controls",
      "usageLocations": [
        "src/pages/Dashboard.tsx",
        "src/components/Modal/Modal.tsx"
      ],
    }
  ],
  "designSystem": {
    "primaryLibrary": "Material-UI v5.x",
    "customTokens": {
      "colors": {
        "primary": "#007bff",
        "secondary": "#6c757d",
        "success": "#28a745"
      },
      "spacing": {
        "unit": "8px",
        "scale": [4, 8, 16, 24, 32, 48, 64]
      },
      "typography": {
        "fontFamily": "Inter, sans-serif",
        "scales": ["12px", "14px", "16px", "18px", "24px", "32px"]
      }
    },
    "breakpoints": {
      "mobile": "320px",
      "tablet": "768px", 
      "desktop": "1024px",
      "wide": "1440px"
    },
    "iconSystem": {
      "library": "Heroicons",
      "customIcons": 12,
      "format": "SVG"
    }
  },
  "folderStructure": {
    "methodology": "Feature-based with shared components",
    "pattern": "Component co-location with tests and styles",
    "structure": {
      "components": {
        "path": "src/components",
        "organization": "By component type",
        "subfolders": ["forms", "layout", "navigation", "feedback"]
      },
      "shared": {
        "path": "src/shared/ui", 
        "organization": "Reusable primitives",
        "subfolders": ["atoms", "molecules"]
      }
    }
  },
  "patterns": [
    {
      "name": "Compound Components",
      "description": "Components that work together as a cohesive unit",
      "examples": ["Modal.Header", "Modal.Body", "Modal.Footer"],
      "usage": "Common for complex UI patterns"
    },
    {
      "name": "Render Props",
      "description": "Components that accept functions as children",
      "examples": ["DataProvider", "FormWrapper"],
      "usage": "For flexible data sharing"
    },
    {
      "name": "Higher-Order Components",
      "description": "Functions that enhance components with additional functionality",
      "examples": ["withAuth", "withLoading"],
      "usage": "Cross-cutting concerns like auth, loading states"
    }
  ],
  "themes": [
    {
      "name": "light",
      "description": "Default light theme",
      "file": "src/styles/themes/light.ts",
      "active": true
    },
    {
      "name": "dark",
      "description": "Dark mode theme",
      "file": "src/styles/themes/dark.ts", 
      "active": true
    }
  ],
}
```

## ✅ Quality Checklist
- [ ] **Complete Component Discovery** – all UI components found and cataloged
- [ ] **Design System Documentation** – tokens, themes, and patterns identified
- [ ] **Usage Analysis** – component relationships and patterns mapped
- [ ] **Deprecation Status** – outdated components clearly marked

## 🎯 Focus Areas
- **Component Reusability** – identifying shared patterns and duplication
- **Design Consistency** – alignment with design system principles  
- **Performance Impact** – component bundle sizes and rendering efficiency
- **Maintenance Burden** – complexity and update frequency of components

## 💡 Analysis Tips
- Look for component composition patterns and hierarchies
- Identify opportunities for component consolidation or abstraction
- Check for consistent prop naming and API patterns across similar components
- Consider component documentation and developer experience
- Evaluate accessibility implementation across component library
- Assess design token usage and theme compatibility
- Check for deprecated or rarely used components that could be removed
