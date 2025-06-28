# 🧠 Vision

[Describe the high-level goal and value proposition of the feature. What problem does it solve and how does it benefit users?]

---

# 📋 Prerequisites & Dependencies

### System Dependencies
- [Required services/systems that must be running]
- [External APIs or integrations needed]
- [Database schema changes required]

### Code Dependencies  
- [Libraries/packages that need to be installed]
- [Minimum version requirements]
- [Breaking changes from dependencies]

### Business Dependencies
- [Other features that must be completed first]
- [Data that must be available]
- [User permissions/roles that must exist]

---

# 🧭 User Flow (Happy Path)

1. **[User Role]** [performs initial action]:

   - [key action details]
   - [important parameters or options]
   - [validation or configuration steps]

2. **[User Role]** [continues with next action]:

   - **[Action Type 1]** - [description of what happens]
   - **[Action Type 2]** - [alternative flow or method]
   - **[Action Type 3]** - [edge case or special handling]

3. **System** [automated processing or response]

4. **[End User]** [receives result or experiences outcome]:

   - [condition] → [expected system behavior]
   - [natural integration or display]
   - [follow-up actions available]

---

# 🚨 Error Handling & Edge Cases

### Error Scenarios
- **[Error Type 1]**: [condition] → [user experience] → [system behavior]
- **[Error Type 2]**: [condition] → [user experience] → [system behavior]
- **[Error Type 3]**: [condition] → [user experience] → [system behavior]

### Edge Cases
- [Edge case 1]: [description] → [expected behavior]
- [Edge case 2]: [description] → [expected behavior]
- [Data boundary conditions]: [min/max values, empty states, etc.]

### Fallback Mechanisms
- [Primary failure] → [fallback approach]
- [Service unavailable] → [graceful degradation]
- [Timeout scenarios] → [retry logic/user communication]

---

# ⚙️ Architecture & Data Design

### [Entity Name]

```
[Entity/Model Definition]
- [field1]: [type] - [description]
- [field2]: [type] - [description]
- [field3]: [type] - [description]
- [relationship]: [relationship type] to [RelatedEntity]
- [timestamps]: [creation/modification tracking]
- [indexes]: [performance optimization fields]
```

### [Related Entity]

```
[Related Entity Definition]
- [field1]: [type] - [description]
- [foreignKey]: [type] - [reference to main entity]
- [statusField]: [type] - [tracking field]
- [constraints]: [unique/required fields]
```

### Components & Services

- `[ServiceName]` — [service responsibility description]
- `[ComponentName]` — [component responsibility and integration point]
- [Processing Logic]: `[Handler1]`, `[Handler2]`, `[Handler3]`

---

# 🔌 API Design (if applicable)

### Endpoints
```
[HTTP METHOD] /api/[resource]/[action]
Request: {
  [param1]: [type] - [description]
  [param2]: [type] - [description]
}
Response: {
  [field1]: [type] - [description]
  [field2]: [type] - [description]
}
Error Responses: [400, 401, 403, 404, 500] with descriptive messages
```

### Authentication & Authorization
- [Auth method]: [description]
- [Required permissions]: [list of permissions]
- [Rate limiting]: [limits and windows]

---

# 🎯 Business Logic

### Core Behavior

- [When/where feature is triggered] ([trigger condition])
- [What data is processed] with [validation criteria] ([filter logic])
- [How data is prioritized] ([sorting logic])
- [Limitations] ([limits or constraints])
- [Follow-up actions] ([automatic updates or state changes])

### Business Rules

```
[Rule Set]
- [Rule 1]: [condition] → [outcome]
- [Rule 2]: [condition] → [outcome]
- [Rule 3]: [condition] → [outcome]
- [Sorting]: [primary criteria], [secondary criteria]
```

---

# 🧱 User Interface

### [Interface Name 1]

- [ ] [Core functionality description]
- [ ] [Action/button] with [comprehensive details]
- [ ] Fields: [field1], [field2], [field3], [field4]
- [ ] [Number] types of [operations]:
  - **"[Operation 1]"** ([scope/audience description])
  - **"[Operation 2]"** ([scope/audience description])
  - **"[Operation 3]"** ([scope/audience description])
- [ ] [Validation/protection] against [potential issues]
- [ ] [Help/documentation] for users
- [ ] [Standard operations] (create, read, update, delete)

### [Interface Name 2]

- [ ] [Integration behavior] for [specific conditions]
- [ ] [Filtering mechanism] by [criteria1] and [criteria2]
- [ ] [Display ordering] ([preference logic])
- [ ] [User experience description]
- [ ] [Automated updates] mechanism

---

# 🔒 Security Considerations

### Data Protection
- [PII handling]: [encryption, anonymization, retention]
- [Input validation]: [sanitization, injection prevention]
- [Output encoding]: [XSS prevention, data leakage]

### Access Control
- [Authentication requirements]
- [Authorization matrix]: [roles vs permissions]
- [Session management]: [timeout, invalidation]

### Audit & Compliance
- [Logging requirements]: [what to log, retention period]
- [Compliance standards]: [GDPR, HIPAA, SOC2, etc.]
- [Data residency]: [geographic restrictions]

---

# 🧪 Testing Strategy

### Unit Testing
- [ ] [Component 1] with [coverage target]%
- [ ] [Component 2] with [edge cases]
- [ ] [Service layer] with [mocking strategy]

### Integration Testing  
- [ ] [API endpoints] with [authentication flows]
- [ ] [Database operations] with [transaction testing]
- [ ] [External service integration] with [error simulation]

### E2E Testing if feasible
- [ ] [Critical user journey 1]
- [ ] [Critical user journey 2]
- [ ] [Error scenarios and recovery]

### AI testing via playwright if feasible
- [ ] [Critical user journey 1]
- [ ] [Critical user journey 2]
- [ ] [Error scenarios and recovery]

### Performance Testing
- [ ] [Load testing]: [concurrent users, response time targets]
- [ ] [Stress testing]: [breaking point identification]
- [ ] [Database performance]: [query optimization validation]

---

# 📦 Implementation Status

| Key      | Status  | Description                              |
| -------- | ------- | ---------------------------------------- |
| [FEAT]-1 | ❌ TODO | [Data layer] with [design requirements]  |
| [FEAT]-2 | ❌ TODO | [User interface] with [key features]     |
| [FEAT]-3 | ❌ TODO | [Core logic] with [business rules]       |
| [FEAT]-4 | ❌ TODO | [Integration] ([scope and method])       |
| [FEAT]-5 | ❌ TODO | [Advanced features] with [special logic] |
| [FEAT]-6 | ❌ TODO | [Automation] implementation              |

---

# ✅ Acceptance Criteria

| AC-ID | Condition                                                   | Status  |
| ----- | ----------------------------------------------------------- | ------- |
| AC-1  | [User] can [perform core action] with [specific capability] | ❌ TODO |
| AC-2  | [User] can [perform variations] with [safety mechanism]     | ❌ TODO |
| AC-3  | When [trigger occurs] [user] receives [expected behavior]   | ❌ TODO |
| AC-4  | After [event] [item] automatically [changes state]          | ❌ TODO |
| AC-5  | System prevents [unwanted behavior] in [specific scenario]  | ❌ TODO |
| AC-6  | [Items] are shown only when [criteria] are met              | ❌ TODO |
| AC-7  | [Items] are ordered by [logic] ([business reasoning])       | ❌ TODO |

---

# 🚀 Deployment & Migration

### Deployment Strategy
- [Deployment method]: [blue-green, rolling, canary]
- [Environment promotion]: [dev → staging → prod]
- [Rollback plan]: [conditions and process]

### Data Migration (if applicable)
- [Migration scripts]: [description and validation]
- [Data backup]: [strategy and recovery testing]
- [Downtime estimation]: [maintenance windows]

### Feature Flags
- [Flag strategy]: [gradual rollout, A/B testing]
- [Monitoring triggers]: [automatic rollback conditions]

---

# 📊 Monitoring & Observability

### Metrics & KPIs
- [Business metrics]: [conversion rates, usage patterns]
- [Technical metrics]: [response time, error rate, throughput]
- [Infrastructure metrics]: [CPU, memory, disk usage]

### Alerting
- [Critical alerts]: [conditions and escalation]
- [Warning alerts]: [early indicators]
- [Dashboard requirements]: [real-time monitoring]

### Logging
- [Structured logging]: [format and fields]
- [Log retention]: [duration and archival]
- [Correlation IDs]: [request tracing]

---

# 🔧 Technical Considerations

### [Safety/Security Feature]

- [Method/process] ensures [data integrity requirement]
- [Bulk operations] use [safety mechanisms]
- [Multiple operation types] for different scenarios

### [Performance Considerations]

- [Feature] operates only when [optimization condition]
- [Priority/ordering] logic in [system component]
- [Filtering approach] for [performance reason]
- [Automatic updates] when [trigger condition]
- [Sorting strategy] with [fallback approach]

### [User Experience]

- [Complete functionality] coverage
- [Built-in guidance] for users
- [Multiple interaction] methods with [different behaviors]
- [Access control] by [authorization method]

### [Data Integrity]

- During [operation]: [field] automatically [behavior]
- During [display]: [validation] prevents [edge cases]
- [Redundant safety]: [primary approach] with fallback to [secondary approach]

---

# 🔄 Future Considerations

[Describe potential future enhancements, scalability considerations, or related features that might be built later.]

### Scalability Roadmap
- [Performance targets]: [users, transactions, data volume]
- [Architecture evolution]: [microservices, caching, CDN]
- [Technology upgrades]: [planned migrations, version updates]

### Maintenance & Support
- [Documentation updates]: [API docs, runbooks]
- [Training requirements]: [team onboarding, knowledge transfer]
- [Support procedures]: [escalation, troubleshooting guides]
