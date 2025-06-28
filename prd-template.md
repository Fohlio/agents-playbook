# 🧠 Vision

[Describe the high-level goal and value proposition of the feature. What problem does it solve and how does it benefit users?]

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
