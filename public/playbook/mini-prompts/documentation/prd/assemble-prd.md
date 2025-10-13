# Assemble PRD

## Objective
Create a `prd.md` file that serves as the index and entry point for the entire PRD, with links to all created files (requirements, design, features).

## Context Required
- **product_slug**: The unique identifier/slug for the product
- **requirements_file_path**: Path to the requirements file
- **design_file_path**: Path to the design file
- **feature_files**: Array of paths to all feature files
- **product_name** (optional): Human-readable product name
- **product_summary** (optional): Brief product description
- **design_system_file_path** (optional): Path to the design system file

## Instructions

### 1. Prepare Output Path
Calculate the absolute output path:
```
.agents-playbook/<product_slug>/prd.md
```

### 2. Structure the PRD Index

Create a comprehensive PRD index document:

```markdown
# Product Requirements Document (PRD)
## [Product Name]

> [Brief product summary/tagline]

---

## 📋 Document Overview

This PRD contains the complete planning documentation for [Product Name], including requirements, architecture design, and feature specifications.

**Status**: Planning Complete  
**Version**: 1.0  
**Last Updated**: [Current Date]

---

## 📚 Core Documents

### [Requirements](./requirements.md)
Complete product requirements, user personas, goals, and success metrics.

### [Design & Architecture](./design.md)
Technical architecture, technology stack, infrastructure, and development methodology.

### [Design System](./design-system.md)
UI/UX principles, component library, theming, typography, colors, and accessibility standards.

---

## 🎯 Features & Implementation Plan

### Phase 1: [Phase Name]
- [Feature 1 Name](./features/feature-1-slug.md) - [Brief description]
- [Feature 2 Name](./features/feature-2-slug.md) - [Brief description]

### Phase 2: [Phase Name]
- [Feature 3 Name](./features/feature-3-slug.md) - [Brief description]
- [Feature 4 Name](./features/feature-4-slug.md) - [Brief description]

### Phase N: [Phase Name]
- [Feature N Name](./features/feature-n-slug.md) - [Brief description]

---

## 🚀 Getting Started

### For Product Managers
1. Review the [Requirements](./requirements.md) to understand user needs and goals
2. Examine the [Design & Architecture](./design.md) for technical approach
3. Explore the [Design System](./design-system.md) for UI/UX guidelines
4. Review individual feature files to understand implementation details

### For Developers
1. Start with [Design & Architecture](./design.md) to understand the technical stack
2. Review the [Design System](./design-system.md) for component library and styling
3. Examine feature files in order of phases
4. Each feature file contains a ready-to-use prompt for the feature-development workflow

### For Designers
1. Review the [Requirements](./requirements.md) for user needs and context
2. Study the [Design System](./design-system.md) for complete design guidelines
3. Reference feature files for specific UI requirements and user flows

### For Stakeholders
1. Read the [Requirements](./requirements.md) for business context and success metrics
2. Review the phase breakdown below for timeline and priorities
3. Individual feature files contain detailed acceptance criteria

---

## 📊 Project Structure

```
.agents-playbook/[product-slug]/
├── prd.md                    # This file - PRD index
├── requirements.md           # Product requirements
├── design.md                 # Technical architecture
├── design-system.md          # Design system & UI/UX guidelines
└── features/                 # Individual feature specifications
    ├── [feature-1-slug].md
    ├── [feature-2-slug].md
    └── ...
```

---

## 🔄 Using This PRD

### To Implement a Feature
1. Open the feature's markdown file from the features/ directory
2. Review the feature requirements and acceptance criteria
3. Copy the "Feature Development Prompt" from the file
4. Use the prompt with the **feature-development workflow**

### To Track Progress
- Update feature frontmatter `status` field: `planned` → `in-progress` → `completed`
- Add implementation notes to feature files as development progresses
- Link to pull requests or issues in feature files

### To Iterate on the PRD
- Update individual documents (requirements, design, features) as needed
- Maintain version history in each document
- This index file links to all components

---

## 📝 Notes

- All feature files include frontmatter with phase, priority, and status
- Each feature has a self-contained prompt ready for the feature-development workflow
- Design decisions and technical constraints are documented in design.md
- Success metrics and validation criteria are in requirements.md

---

## 🤝 Contributing

When adding new features or updating this PRD:
1. Create feature files in the features/ directory with proper frontmatter
2. Update this index to link to new features
3. Keep requirements and design documents in sync
4. Use consistent formatting and structure

---

**Ready to start building?** Pick a feature from Phase 1 and use its development prompt with the feature-development workflow!
```

### 3. Populate Content

#### a) Extract Product Information
- Use `product_name` if available, otherwise derive from `product_slug`
- Use `product_summary` if available
- Add current date

#### b) Organize Features by Phase
- Parse `feature_files` array
- Read frontmatter from each feature file to extract:
  - Feature title
  - Phase information
  - Brief description
- Group features by phase
- Sort within phases by priority or logical order

#### c) Create Relative Links
Convert absolute paths to relative paths:
- `requirements_file_path` → `./requirements.md`
- `design_file_path` → `./design.md`
- `design_system_file_path` → `./design-system.md` (if available)
- Feature files → `./features/<feature-slug>.md`

#### d) Generate Feature Summary
For each feature, create a one-line summary:
```markdown
- [Feature Name](./features/feature-slug.md) - Brief description
```

### 4. Write the File
Write the formatted content to the calculated output path.

### 5. Return Output
Set the output context:
```
prd_index_file_path: .agents-playbook/<product_slug>/prd.md
```

## Output Format
The PRD index should be:
- Well-structured and navigable
- Contain working relative links to all documents
- Provide clear guidance for different stakeholders
- Include practical "getting started" instructions
- Be a comprehensive entry point to the entire PRD

## Best Practices
- Make the PRD index scannable and easy to navigate
- Group features logically by phase
- Include visual separators and clear sections
- Provide practical usage instructions
- Make links prominent and easy to find
- Include a project structure diagram
- Add context for different audience types

## Validation
- File created at correct location (root of product directory)
- All relative links are correct and working
- Features properly organized by phase
- Clear instructions for using the PRD
- Path stored in context for later reference
- Document is complete and professional

## Success Criteria
✅ PRD index is the clear entry point  
✅ All documents are linked and accessible  
✅ Features are organized and easy to find  
✅ Instructions for using the PRD are clear  
✅ Different stakeholder needs are addressed

