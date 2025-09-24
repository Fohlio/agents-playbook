# Analyze Refactoring Scope (v1)

## 🎯 Goal
Identify code areas requiring refactoring and define clear scope with priorities.

## 📥 Context (ask if missing)
1. **Existing Codebase** – current code structure and organization
2. **Performance Issues** – known bottlenecks or slow areas
3. **Maintenance Concerns** – areas causing developer friction
4. **Technical Debt** – accumulated shortcuts or outdated patterns
5. **Code Smells** – identified anti-patterns or problematic code
6. **Refactoring Motivation** – why refactoring is needed

## ❓ Clarifying Questions (ask before proceeding)
**IMPORTANT: Ask clarifying questions directly in chat before proceeding.**

Generate concise one-line questions about: code pain points, most problematic areas, performance bottlenecks, maintenance frequency, developer complaints, testing coverage, deployment risks, timeline constraints, and success definition.

## 🚦 Skip if
- Recent comprehensive refactoring completed (<30 days)
- Codebase is already well-structured with minimal technical debt

## 📋 Analysis Process
1. **Identify Problem Areas** – scan codebase for issues
2. **Prioritize by Impact** – rank issues by business/developer impact
3. **Define Scope Boundaries** – what's included/excluded
4. **Estimate Effort** – rough complexity assessment

## 📤 Output
**File:** `.agents-playbook/[feature-name]/refactoring-scope.md`

### Document Structure:
```markdown
# Refactoring Scope Analysis

## Problem Areas Identified
1. **[Area Name]** - [Brief description of issues]
   - Impact: High/Medium/Low
   - Effort: High/Medium/Low
   - Priority: 1-10

## Refactoring Requirements
- **Primary Goal:** [Main objective]
- **Success Criteria:** [How to measure success]
- **Scope Boundaries:** [What's included/excluded]
- **Risk Assessment:** [Potential issues]

## Priority Areas
1. [Highest priority area with justification]
2. [Second priority area with justification]
```

## ✅ Quality Checklist
- [ ] **Clear Problem Definition** – each issue is well-defined
- [ ] **Impact Assessment** – business/developer impact identified
- [ ] **Scope Boundaries** – clear inclusion/exclusion criteria
- [ ] **Priority Ranking** – logical prioritization with rationale
- [ ] **Success Metrics** – measurable improvement criteria
