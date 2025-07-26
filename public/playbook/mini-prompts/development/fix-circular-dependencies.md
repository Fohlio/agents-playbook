# Fix Circular Dependencies Prompt

## 🎯 Goal
Eliminate circular dependencies through proper architectural restructuring—no hacks.

## 📥 Context (ask if missing)
1. **Dependency Graph** – visual map of circular imports
2. **Error Messages** – exact circular dependency warnings
3. **Module Structure** – current file organization and exports
4. **Business Logic** – what each module actually does

## 🚦 Skip if
- No circular dependencies detected, or dependencies are intentional design patterns.

## 🔍 Analysis Checklist
- **Map the Circle**
  - [ ] Trace complete dependency chain: A → B → C → A
  - [ ] Identify which imports cause the cycle
  - [ ] Understand WHY each dependency exists

- **Categorize Dependencies**
  - [ ] Type-only imports (interfaces, types)
  - [ ] Runtime imports (functions, classes)
  - [ ] Side-effect imports (initialization code)

## 🛠️ Fix Strategies (NO HACKS)

### 1. Extract Shared Types
- [ ] Create `types/` directory for shared interfaces
- [ ] Move common types to separate files
- [ ] Import types with `import type` syntax

### 2. Dependency Injection
- [ ] Pass dependencies as parameters instead of importing
- [ ] Use dependency injection containers
- [ ] Abstract dependencies behind interfaces

### 3. Extract Common Utilities
- [ ] Move shared utilities to `utils/` directory
- [ ] Create service layer for shared business logic
- [ ] Separate data models from business logic

### 4. Restructure Module Hierarchy
- [ ] Follow dependency direction (high-level → low-level)
- [ ] Group related functionality together
- [ ] Create clear module boundaries

## 🚫 FORBIDDEN APPROACHES
- ❌ Dynamic imports (`import()`) as circular fixes
- ❌ `@ts-ignore` to suppress warnings
- ❌ Moving imports inside functions as workaround
- ❌ Disabling ESLint circular dependency rules

## 📤 Output
**Files:** Restructured modules with proper separation

**Documentation:** `.agents-playbook/[feature-or-task-name]/circular-deps-fix.md`
1. **Original Problem** – dependency graph before
2. **Solution Strategy** – architectural changes made
3. **New Structure** – dependency graph after
4. **Validation** – tests confirm no new cycles 