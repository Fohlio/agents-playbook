# TRD Template • AI Edition

## Purpose
Create consistent, lightweight technical requirements. Fill in each section concisely.

---
# 🧠 Vision
> One‑sentence problem + outcome.

---
# 📋 Dependencies
- **System**: services / APIs / migrations
- **Code**: package@minVersion, breaking changes
- **Business**: prerequisite features, data, roles

---
# 🧭 User Flow (Happy Path)
1. **Actor** performs *action* → system validates
2. **System** processes & saves → returns result
3. **Actor** sees outcome (alt flows optional)

---
# 🚨 Errors & Edge Cases
- *Error*: condition → UX → system response
- *Edge*: description → expected behavior
- *Fallback*: failure → fallback logic

---
# ⚙️ Architecture & Data
## Entities
| Field | Type | Notes |
|-------|------|-------|
| id    | UUID | PK    |

## Components
- ServiceName — responsibility

---
# 🔌 API (optional)
`GET /api/resource`
Req { param:type }
Resp { field:type }
Errors: 4xx/5xx JSON

---
# 🎯 Business Logic
- **Trigger**: when condition
- **Process**: validation, sorting, limits
- **Outcome**: updates / events

---
# 🧱 UI (optional)
- *Screen*: purpose
  - Element — action & validation

---
# 🔒 Security
- Auth method
- PII handling
- Audit events

---
# 🧪 Testing
- Unit: target %
- Integration: endpoints, DB
- E2E: critical journeys

---
# 📦 Implementation Status
| Item | Status | Notes |

---
# ✅ Acceptance Criteria
| AC | Description | Status |

---
# 🚀 Deployment & Rollback
- Migration steps
- Feature flag / rollback plan

---
# 📊 Monitoring
- Metrics: business & tech
- Alerts: threshold

---
# 🔄 Maintenance
- Docs to update
- Support guides