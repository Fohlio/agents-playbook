# Analyze Project Structure (v1)

## 🎯 Goal
Analyze and document project structure, module hierarchy, and organizational methodology to understand foundational architecture and identify best practices compliance.

## 📥 Context (ask if missing)
1. **Project Root Directory** – main project directory path to analyze
2. **Technology Stack** – framework(s) and primary technologies used
3. **Project Type** – web application, library, monorepo, microservice, etc.
4. **Team Structure** – team size and development approach (individual, small team, large team)
5. **Existing Documentation** – any current architecture or structure documentation

## ❓ Clarifying Questions (ask before proceeding)
**IMPORTANT: Ask clarifying questions directly in chat before proceeding.**

Generate concise one-line questions about: project boundaries to analyze, specific directories to focus on or exclude, framework conventions to validate against, team naming conventions, existing technical debt concerns, performance considerations, and desired output detail level.

## 🚦 Skip if
- Project structure is well-documented and recently analyzed (<30 days)
- Simple single-file or minimal project structure
- Emergency hotfix that doesn't require structure analysis

## 📋 Analysis Process
1. **Directory Scanning** – traverse project structure and catalog files/folders
2. **Module Classification** – identify component types (components, services, utilities, etc.)
3. **Dependency Analysis** – map internal and external dependencies
4. **Pattern Recognition** – detect organizational methodology and naming conventions
5. **Compliance Assessment** – evaluate against best practices and framework conventions

## 📤 Output
**File:** `.agents-playbook/project-structure.md`

### Document Structure:
```markdown
# Project Structure Analysis

## Overview
- **Project Type:** [Web app, library, etc.]
- **Primary Framework:** [React, Vue, Angular, etc.]
- **Organization Pattern:** [Feature-based, layer-based, domain-driven, hybrid]
- **Analysis Date:** [Current date]

## Directory Structure
```
/project-root
├── src/
│   ├── components/     # UI components
│   ├── services/       # Business logic
│   ├── utils/          # Helper functions
│   └── [other dirs]
├── public/             # Static assets
├── tests/              # Test files
└── [other root dirs]
```

## Module Hierarchy
1. **Components** ([count] files)
   - Location: [path]
   - Organization: [by feature/type/etc.]
   - Naming Pattern: [PascalCase/kebab-case/etc.]

2. **Services** ([count] files)
   - Location: [path] 
   - Organization: [by domain/function/etc.]
   - Dependencies: [internal/external]

[Continue for each module type]

## Architecture Assessment
### Organization Methodology
- **Primary Pattern:** [Feature-based/Layer-based/Domain-driven/Hybrid]
- **Consistency Score:** [1-10 rating]
- **Rationale:** [Why this pattern was identified]

### Best Practices Compliance
- ✅ **Clear Separation of Concerns**
- ✅ **Consistent Naming Conventions** 
- ⚠️  **[Issue found]** - [Description]
- ❌ **[Violation found]** - [Description and impact]

## Dependencies Analysis
### Internal Dependencies
- **Circular Dependencies:** [None found / List of cycles]
- **Coupling Level:** [Loose/Tight with examples]
- **Import Patterns:** [Relative/Absolute path usage]

### External Dependencies
- **Core Framework:** [Version and key dependencies]
- **UI Libraries:** [Component libraries used]
- **State Management:** [Redux, Zustand, Context API, etc.]
- **Testing:** [Jest, Cypress, etc.]

## Recommendations
1. **[High Priority]** - [Specific recommendation with rationale]
2. **[Medium Priority]** - [Improvement suggestion]
3. **[Low Priority]** - [Nice-to-have enhancement]

## Action Items
- [ ] [Specific task to improve structure]
- [ ] [Another improvement task]
```

## ✅ Quality Checklist
- [ ] **Complete Directory Mapping** – all major directories identified and categorized
- [ ] **Clear Organization Pattern** – methodology clearly identified and documented
- [ ] **Dependency Analysis** – internal and external dependencies mapped
- [ ] **Best Practices Assessment** – compliance evaluated with specific examples
- [ ] **Actionable Recommendations** – specific improvements suggested with priorities
- [ ] **Consistent Naming** – naming patterns documented throughout analysis

## 🎯 Focus Areas
- **Structure Clarity** – easy to understand and navigate project organization
- **Scalability** – structure supports team growth and feature additions
- **Maintainability** – consistent patterns reduce cognitive load
- **Framework Alignment** – follows established conventions for the technology stack
- **Team Productivity** – structure supports efficient development workflow

## 💡 Analysis Tips
- Look for feature vs technical organization patterns
- Identify shared/common code locations and usage
- Check for configuration and build tool organization
- Note any custom or unique architectural decisions
- Consider how new team members would navigate the codebase
