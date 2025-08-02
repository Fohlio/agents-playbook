# Update Review Prompt

## 🎯 Goal
Quick final check that updates are safe for production.

## 📥 Context (ask if missing)
1. **Test Results** – did tests pass after updates?
2. **Updated Dependencies** – what was changed

## 🚦 Skip if
- Only patch updates **or** all tests passed cleanly.

## 🪞 Self-Reflection Analysis
**MANDATORY FIRST STEP:** Before reviewing updates, critically assess your own work:

### Update Self-Assessment
- **Update Strategy**: Were my update choices safe and well-planned?
- **Risk Management**: Did I properly assess compatibility and breaking changes?
- **Testing**: Is my testing approach sufficient for the changes made?

### Quick Self-Check
1. What am I most concerned about with these updates?
2. What could go wrong in production after these updates?
3. Did I test the most critical functionality adequately?

## 🔍 Checklist
- [ ] All tests still pass
- [ ] App builds and starts successfully  
- [ ] No new security vulnerabilities: `npm audit`
- [ ] Performance seems normal (no obvious slowdowns)
- [ ] Breaking changes properly handled

## 📤 Output
1. **Status**: ✅ Ready for production or ❌ Needs fixes
2. **Issues found**: Any remaining problems
3. **Recommendation**: Deploy, rollback, or fix first

## ➡️ Response Flow
```mermaid
flowchart LR
    U[Test Results] --> A[Quick check]
    A --> B{All good?}
    B -- Yes --> C[Approve]
    B -- No --> D[Fix needed]
```