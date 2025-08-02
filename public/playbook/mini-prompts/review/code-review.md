# Code Review Prompt (v3) - Critical Review

## 🎯 Goal
**CRITICALLY** audit the finished code for quality, security, performance, and standards. Be thorough, demanding, and uncompromising—catch everything before it goes to production.

## 📥 Context (ask if missing)
1. **Code Branch / PR** – where's the diff?
2. **Requirements / Specs** – doc or ticket link.
3. **Known Constraints** – perf targets, security mandates, style guide, etc.
4. **Deadline** – when do devs need feedback?

## 🚦 Skip if
- Only trivial config tweaks **or** review already done.

## 🔍 Critical Review Checklist
- **Functional** ⚡ STRICT
  - [ ] Implements ALL requirements completely
  - [ ] Handles ALL edge cases (empty inputs, max limits, failures)
  - [ ] No silent failures or incomplete logic

- **Security** 🔒 NON-NEGOTIABLE  
  - [ ] Input validation on EVERY parameter
  - [ ] SQL injection protection with prepared statements
  - [ ] XSS prevention with proper escaping
  - [ ] No hardcoded secrets, proper env/vault usage
  - [ ] Authorization checks at every entry point
  - [ ] Error messages don't leak sensitive info

- **Performance** ⚡ CRITICAL
  - [ ] No N+1 database queries 
  - [ ] Proper indexing for database operations
  - [ ] Memory leaks checked (especially in loops)
  - [ ] Async operations where appropriate
  - [ ] No blocking operations on main thread

- **Quality** 📐 MANDATORY
  - [ ] Code follows project patterns consistently
  - [ ] No duplication (DRY principle enforced)
  - [ ] Functions under 50 lines, classes under 300
  - [ ] Clear naming (no abbreviations or unclear terms)
  - [ ] No commented-out code or debug statements

- **Error Handling** 🚨 COMPREHENSIVE
  - [ ] Every external call wrapped in try/catch
  - [ ] Meaningful error messages for debugging
  - [ ] Proper logging levels (error/warn/info)
  - [ ] Graceful degradation for non-critical failures

- **Testing** 🧪 THOROUGH
  - [ ] Unit test coverage > 80% for new code
  - [ ] Integration tests for API endpoints
  - [ ] Negative test cases included
  - [ ] Tests are fast (<5s total) and deterministic  

## 🪞 Self-Reflection Analysis
**MANDATORY FIRST STEP:** Before reviewing others' code, critically assess your own implementation decisions:

### Implementation Self-Assessment
- **Decision Quality**: Were my technical choices optimal? What alternatives existed?
- **Code Quality**: Could my solution be simpler, more maintainable, or more performant?
- **Edge Cases**: What scenarios might I have missed or not properly handled?
- **Future Impact**: How will my implementation affect maintainability and scalability?
- **Learning**: What would I do differently with current knowledge?

### Honest Self-Evaluation
1. What am I most uncertain about in my implementation?
2. If I started over today, what would I change?
3. What could go wrong with this in production?
4. How would a new team member understand my code?

## 📤 Critical Review Output

**Verdict:** 
- 🚦 **APPROVED** - Production ready
- 🔶 **APPROVED WITH CHANGES** - Minor fixes needed
- 🛑 **REJECTED** - Critical issues found

**Critical Issues:**
- [List any 🔴 Critical or 🟠 High severity issues that block merge]

**Other Issues:**
- [🟡 Medium and 🔵 Low issues that should be addressed]

**Recommendations:**
- [Specific actions needed before/after merge] 