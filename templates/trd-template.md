# TRD Template

## Purpose
Create consistent, context-rich technical requirements with validation and confidence scoring.

---
# 🎯 Context Engineering Elements

## 🔍 Confidence Level Assessment
Rate your confidence 1-10 for each major section. <7 = gather more context before proceeding.

| Section | Confidence (1-10) | Context Sources | Notes |
|---------|-------------------|-----------------|-------|
| Business Logic | [score] | [research sources] | [confidence rationale] |
| Architecture | [score] | [codebase patterns, examples] | [architectural decisions] |
| Data Model | [score] | [existing schemas, patterns] | [data design rationale] |
| API Design | [score] | [existing APIs, conventions] | [interface decisions] |
| Testing | [score] | [testing patterns, coverage] | [test strategy rationale] |
| Security | [score] | [security patterns, requirements] | [security considerations] |

**Overall Confidence**: [X]/10

## 📚 Research Context & Patterns
**Codebase Analysis:**
- Similar features referenced: [list with links]
- Architectural patterns followed: [from examples/ folder]
- Code conventions applied: [specific patterns]
- Integration patterns used: [existing approaches]

**External Documentation:**
- API documentation consulted: [links]
- Library/framework docs: [specific sections]
- Best practices referenced: [sources]

**Project Context:**
- Rules and standards followed: [from project-navigation.md]
- Validation requirements met: [specific commands]
- Security/performance standards: [requirements]

## 🔄 Validation Commands
Commands that MUST pass before considering this TRD implementation complete:

**Required Validations:**
- [ ] `npm test` (or project-specific test command)
- [ ] `npm run lint` (or project-specific linting)
- [ ] `npm run build` (or project-specific build)
- [ ] [Custom validation commands from project-navigation.md]

**Quality Gates:**
- [ ] Code coverage > [X]% for new features
- [ ] Performance benchmarks met
- [ ] Security scan passes
- [ ] Documentation updated

## 🔄 Iteration & Context Tracking
**Version History:**
- V1: [date] - Initial draft - Overall confidence: [X]/10
- V2: [date] - Added context from [sources] - Confidence: [X]/10
- V3: [date] - Validated with [methods] - Final confidence: [X]/10

**Context Gathering Log:**
- [timestamp]: Researched [topic] → found [insights] → confidence +[X]
- [timestamp]: Validated [assumption] → [result] → confidence +/-[X]
- [timestamp]: Asked for clarification on [topic] → [response] → confidence +[X]

---
# 🧠 Vision
> One‑sentence problem + outcome.

**Context Confidence**: [score]/10
**Pattern Reference**: [similar features in codebase]

---
# 📋 Dependencies
- **System**: services / APIs / migrations
- **Code**: package@minVersion, breaking changes
- **Business**: prerequisite features, data, roles
- **Context**: examples/patterns referenced

**Dependency Confidence**: [score]/10
**Validation**: All dependencies verified and accessible

---
# 🧭 User Flow (Happy Path)
1. **Actor** performs *action* → system validates
2. **System** processes & saves → returns result
3. **Actor** sees outcome (alt flows optional)

**Flow Confidence**: [score]/10
**Pattern Reference**: [similar flows in examples/]

---
# 🚨 Errors & Edge Cases
- *Error*: condition → UX → system response
- *Edge*: description → expected behavior
- *Fallback*: failure → fallback logic

**Error Handling Confidence**: [score]/10
**Pattern Reference**: [error handling examples from examples/]

---
# ⚙️ Architecture & Data

## Context & Patterns
**Architectural Style**: [following project patterns from examples/architecture/]
**Integration Approach**: [based on examples/integration/]

## Entities
| Field | Type | Notes | Confidence |
|-------|------|-------|------------|
| id    | UUID | PK    | [score]/10 |

**Data Model Confidence**: [score]/10
**Pattern Reference**: [existing data patterns]

## Components
- ServiceName — responsibility
  - **Pattern Reference**: [similar components in codebase]
  - **Confidence**: [score]/10

---
# 🔌 API (optional)
`GET /api/resource`
Req { param:type }
Resp { field:type }
Errors: 4xx/5xx JSON

**API Design Confidence**: [score]/10
**Pattern Reference**: [existing API patterns from examples/]

---
# 🎯 Business Logic
- **Trigger**: when condition
- **Process**: validation, sorting, limits
- **Outcome**: updates / events

**Business Logic Confidence**: [score]/10
**Validation**: Logic verified against business requirements

---
# 🧱 UI (optional)
- *Screen*: purpose
  - Element — action & validation

**UI Confidence**: [score]/10
**Pattern Reference**: [UI patterns from examples/]

---
# 🔒 Security
- Auth method
- PII handling
- Audit events

**Security Confidence**: [score]/10
**Standards Met**: [project security requirements from project-navigation.md]
**Pattern Reference**: [security patterns from examples/]

---
# 🧪 Testing
- Unit: target % (from project standards)
- Integration: endpoints, DB
- E2E: critical journeys

**Testing Confidence**: [score]/10
**Pattern Reference**: [testing patterns from examples/testing/]
**Validation Commands**: [specific test commands that must pass]

---
# 📦 Implementation Status
| Item | Status | Confidence | Context Notes |
|------|--------|------------|---------------|
| [component] | [status] | [score]/10 | [patterns followed] |

---
# ✅ Acceptance Criteria
| AC | Description | Validation Method | Status |
|----|-------------|-------------------|--------|
| AC1 | [criteria] | [how to verify] | [status] |

**Acceptance Confidence**: [score]/10

---
# 🚀 Deployment & Rollback
- Migration steps
- Feature flag / rollback plan

**Deployment Confidence**: [score]/10
**Pattern Reference**: [deployment patterns from project]

---
# 📊 Monitoring
- Metrics: business & tech
- Alerts: threshold

**Monitoring Confidence**: [score]/10

---
# 🔄 Maintenance
- Docs to update
- Support guides

---
# 🎯 Context Engineering Quality Check

## Pre-Implementation Validation
Before starting implementation, verify:
- [ ] Overall confidence ≥7/10 (if <7, gather more context)
- [ ] All patterns from examples/ folder considered
- [ ] Project standards from project-navigation.md followed
- [ ] Validation commands identified and tested
- [ ] Similar features in codebase analyzed

## Implementation Validation
During implementation, ensure:
- [ ] All validation commands pass
- [ ] Code follows patterns from examples/
- [ ] Tests match testing patterns from examples/testing/
- [ ] Security follows patterns from examples/security/

## Post-Implementation
After implementation:
- [ ] Update confidence scores based on actual implementation
- [ ] Add successful patterns to examples/ folder
- [ ] Update project-navigation.md with new learnings
- [ ] Document any deviations from planned approach

## Self-Correction Protocol
If validation fails or confidence drops:
1. **Identify Gap**: What context/knowledge is missing?
2. **Research**: Gather additional context from codebase/docs
3. **Update**: Revise TRD with new understanding
4. **Re-validate**: Check confidence scores and validation commands
5. **Iterate**: Repeat until confidence ≥7/10 and validation passes

---
**Context Engineering Reminder**: This TRD should provide complete context for implementation. Another developer should be able to implement this feature successfully using only this document and the referenced examples/patterns.