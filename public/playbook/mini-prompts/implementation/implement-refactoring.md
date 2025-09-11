# Implement Refactoring (v1)

## 🎯 Goal
Execute systematic code refactoring based on defined scope and requirements.

## 📥 Context (ask if missing)
1. **Refactoring Requirements** – defined scope and priorities
2. **Design Specifications** – architectural decisions (if complex refactoring)
3. **Migration Strategy** – how to handle data/API changes
4. **Backward Compatibility** – compatibility requirements
5. **Existing Codebase** – current code structure
6. **Scope Definition** – boundaries and priorities

## 🚦 Skip if
- No code changes needed (requirements clarification only)
- Refactoring scope is empty or invalid

## 📋 Refactoring Process
1. **Create Safety Net** – backup current state, create feature branch
2. **Start with High-Priority Areas** – tackle most critical issues first  
3. **Refactor Incrementally** – small, testable changes
4. **Validate Each Change** – run tests after each significant modification
5. **Update Dependencies** – fix broken imports/references
6. **Clean Up** – remove unused code, update documentation

## 🔧 Implementation Strategy
- **Extract Methods/Functions** for complex logic
- **Rename Variables/Functions** for clarity
- **Consolidate Duplicate Code** into reusable components
- **Improve Code Structure** following best practices
- **Optimize Performance** where identified
- **Update Error Handling** and logging

## 📤 Output
**File:** `.agents-playbook/[feature-name]/refactoring-implementation.md`

### Documentation:
```markdown
# Refactoring Implementation Report

## Changes Made
1. **[Component/File]** - [Description of changes]
   - Before: [Brief description of old state]
   - After: [Brief description of new state]
   - Impact: [Expected improvement]

## Files Modified
- [List of modified files with brief change description]

## Testing Status
- [Unit tests status]
- [Integration tests status]
- [Manual testing notes]

## Next Steps
- [Any remaining work or follow-up needed]
```

## ⚠️ Safety Practices
- **Always create backup branch** before starting
- **Run tests frequently** during refactoring
- **Commit small, logical changes** for easy rollback
- **Verify functionality** remains unchanged
- **Update documentation** as needed

## ✅ Completion Checklist
- [ ] **Safety net created** – backup branch exists
- [ ] **Code refactored** – all scope items addressed
- [ ] **Tests passing** – functionality verified
- [ ] **Dependencies updated** – no broken references
- [ ] **Documentation updated** – changes documented
- [ ] **Clean commit history** – logical, small commits
