# Analyze UI Components (v1)

## 🎯 Goal
Discover and document UI component folder structure and organization, creating a high-level inventory of component directories, categories, and design system information without detailed individual component analysis.

## 📥 Context (ask if missing)
1. **Component Directories** – paths to UI component files and folders
2. **Design System** – existing design system or component library information
3. **Framework/Library** – React, Vue, Angular, or other UI framework
4. **Styling Approach** – CSS modules, styled-components, Tailwind, etc.
5. **Theme Configuration** – existing theme or design tokens setup
6. **Component Documentation** – existing Storybook, style guides, or docs

## ❓ Clarifying Questions (ask before proceeding)
**IMPORTANT: Ask clarifying questions directly in chat before proceeding.**

Generate concise one-line questions about: component directory locations, folder organization methodology, design system usage, styling methodologies, component naming conventions, and documentation preferences.


## 📋 Analysis Process
1. **Directory Discovery** – scan and map component folder structures
2. **Organization Analysis** – identify folder organization methodology
3. **Design System Analysis** – identify design libraries and custom systems
4. **Component Category Mapping** – categorize components by folder structure
5. **UI Structure Documentation** – create structured ui.json folder inventory

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
  "directories": [
    {
      "path": "src/components/forms",
      "componentCount": 12,
      "category": "Form Controls",
      "description": "Input fields, buttons, validation components",
      "examples": ["Button.tsx", "Input.tsx", "Form.tsx"]
    },
    {
      "path": "src/components/layout",
      "componentCount": 8,
      "category": "Layout",
      "description": "Page structure and positioning components",
      "examples": ["Header.tsx", "Sidebar.tsx", "Container.tsx"]
    },
    {
      "path": "src/components/navigation",
      "componentCount": 6,
      "category": "Navigation",
      "description": "Menu, breadcrumb, and routing components",
      "examples": ["Menu.tsx", "Breadcrumb.tsx", "NavItem.tsx"]
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
- [ ] **Complete Directory Discovery** – all component directories found and mapped
- [ ] **Organization Analysis** – folder structure methodology documented
- [ ] **Design System Documentation** – tokens, themes, and patterns identified
- [ ] **Component Categorization** – directories categorized by purpose and type

## 🎯 Focus Areas
- **Component Reusability** – identifying shared patterns and duplication
- **Design Consistency** – alignment with design system principles  
- **Performance Impact** – component bundle sizes and rendering efficiency
- **Maintenance Burden** – complexity and update frequency of components

## 💡 Analysis Tips
- Focus on directory structure and organization patterns rather than individual components
- Look for folder naming conventions and categorization logic
- Identify the component hierarchy and nesting patterns
- Check for consistent folder organization across different component types
- Consider the scalability of the current folder structure
- Assess whether the organization supports the design system architecture
- Note any inconsistencies in directory structure that could be improved
