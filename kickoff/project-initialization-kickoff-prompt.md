# Prompt • Project Initialization Kickoff (Context Engineering Enhanced)

## 🎯 Role
Tech Lead or AI Agent performing complete project initialization and context engineering setup.

## Inputs
- Project repository (URL or local path)
- Access to code and configuration
- (Optional) existing documentation files

## Expected Outputs
1. **docs/project-navigation.md** — comprehensive project guide with context engineering elements, tech stack, legacy analysis, project rules, standards, validation criteria, and documentation catalog
2. **AGENTS.md** and **CLAUDE.md** — instructions for AI agents in project root (with references to project-navigation.md)
3. **docs/examples/** folder — code patterns and context examples

## ⚙️ Context Engineering Workflow

### 1️⃣ **🎯 IMPORTANT: Ask specific clarifying questions with proposed answer options** 
Ask about audit purpose, project state, documentation priorities, and any other topics you deem important for successful task completion.

### 2️⃣ **Context Engineering Setup Phase** 
**Ask user for context gathering:**

**Code Examples & Patterns:**
- "What code examples should I collect for future AI agents?"
- "Are there specific patterns or conventions I should document?"
- "What are examples of good vs bad code in this project?"
- "What testing patterns should AI agents follow?"

**Project Rules & Standards:**
- "What are the non-negotiable coding standards?"
- "What should AI agents never modify or touch?"
- "What are the performance/security requirements?"
- "What deployment/testing processes must be followed?"

**Validation Requirements:**
- "What commands must pass before considering work complete?"
- "What linting/testing standards apply?"
- "How should code quality be measured?"

**Context Confidence:**
- "What areas of the codebase are well-documented vs unclear?"
- "What would help an AI agent understand this project faster?"

### 3️⃣ Codebase Discovery
- Scan entire project (ignore .git, node_modules, __pycache__)
- Identify entry points (main.py, index.js, package.json, requirements.txt, etc.)
- Record dependency managers and key configs
- Recognize frameworks and architectural patterns (Django, FastAPI, React, Express, etc.)
- Collect documentation links (README.md, docs/, Wiki)
- **NEW**: Identify code patterns and examples for context library

### 4️⃣ Context Pattern Analysis
- Find repeating architectural patterns
- Identify testing approaches and conventions
- Document API/database interaction patterns
- Collect examples of error handling
- Note performance and security patterns

### 5️⃣ Create docs/examples/ Structure
```
docs/examples/
├── README.md              # What each example demonstrates
├── architecture/          # Architectural patterns
│   ├── api-patterns.md   # API design patterns
│   ├── data-flow.md      # Data flow examples
│   └── integration.md    # Integration patterns
├── code-patterns/         # Code implementation patterns
│   ├── error-handling.js # Error handling examples
│   ├── testing.js        # Testing patterns
│   └── validation.py     # Input validation patterns
├── good-examples/         # What TO do
└── anti-patterns/         # What NOT to do
```

### 6️⃣ Legacy Check & Context Assessment
**If legacy is detected — ask clarifying questions:**
- How long will these components be supported?
- Are there migration plans or constraints?
- Which parts of code should agents not modify?
- What standards need to be followed?
- Are there outdated dependencies?
- **NEW**: What context would help understand legacy decisions?

### 7️⃣ Create Comprehensive PROJECT-NAVIGATION.md

```markdown
# 🗂️ Project Navigation Guide (Context Engineering Enhanced)

## 📌 Overview
[Brief system description]

## 🎯 Context Engineering Resources
- **Code Examples**: [docs/examples/](docs/examples/)
- **AI Agent Rules**: [AGENTS.md](../AGENTS.md)
- **Prompt Playbook**: [prompt-playbook.md](../prompt-playbook.md)

## 📁 Project Structure
```
[Directory tree with explanations and confidence scores]
```

## ⚙️ Technology Stack (Enhanced)
| Component | Technology | Version | Confidence | Context Notes | Status |
|-----------|------------|---------|------------|---------------|--------|
| Backend   | [detected] | [ver]   | [1-10]     | [patterns/examples] | [Active/Legacy] |
| Frontend  | [detected] | [ver]   | [1-10]     | [patterns/examples] | [Active/Legacy] |
| Database  | [detected] | [ver]   | [1-10]     | [connection/examples] | [Active/Legacy] |
| Runtime   | [detected] | [ver]   | [1-10]     | [requirements/examples] | [Active/Legacy] |

## 🚀 How to Run
- **Development**: [steps] - Confidence: [score]/10
- **Production**: [deployment] - Confidence: [score]/10
- **Testing**: [test execution] - Confidence: [score]/10

## 🏗️ Key Components (Context-Rich)
| Component | Path | Purpose | Dependencies | Examples | Confidence |
|-----------|------|---------|---------------|----------|------------|
| [name]    | [path] | [purpose] | [deps] | [docs/examples/ref] | [score]/10 |

## 🛠️ Development Workflow with Context
1. **Setup** - [link to docs/examples/]
2. **Coding** - [follow patterns in docs/examples/]
3. **Testing** - [validation commands]
4. **Deployment** - [process with confidence checks]

## 🎨 Context Patterns & Standards
- **Architecture**: See [docs/examples/architecture/]
- **Code Style**: See [docs/examples/code-patterns/]
- **Testing**: See [docs/examples/testing/]
- **Integration**: See [docs/examples/integration/]

## 🔄 Validation Commands
Commands that MUST pass before considering work complete:
- `[test command]` - [description]
- `[lint command]` - [description]  
- `[build command]` - [description]
- `[custom validations]` - [description]

## 🚨 Project Rules & Standards

### Code Standards
- [User-defined standards from setup phase]
- Confidence level requirements (≥7/10 for production)
- Quality gates that must pass

### What AI Agents Should Never Touch
- [Critical systems user identifies]
- [Legacy areas with constraints]
- [Security-sensitive components]

### Context Confidence Scoring
Rate understanding 1-10 for each area:
- Architecture: [score]/10
- Business Logic: [score]/10
- Testing: [score]/10
- Deployment: [score]/10

## 🔧 Legacy Code Analysis
[If legacy detected, include detailed analysis]

### Legacy Components
| Component | Status | Constraints | Migration Plan | Risk Level |
|-----------|--------|-------------|----------------|------------|
| [component] | [legacy/deprecated] | [restrictions] | [timeline] | [1-10] |

### Legacy Context
- **Historical Decisions**: [why certain approaches were taken]
- **Technical Debt**: [areas needing improvement]
- **Support Timeline**: [how long legacy will be maintained]
- **Migration Strategy**: [approach for modernization]

## 📚 Documentation Catalog

### Current Documentation
| Document | Location | Status | Confidence | Last Updated |
|----------|----------|--------|------------|--------------|
| [doc name] | [path/url] | [current/outdated] | [score]/10 | [date] |

### Documentation Gaps
- [ ] [Missing documentation area] - Priority: [High/Medium/Low]
- [ ] [Outdated documentation] - Priority: [High/Medium/Low]

### Recommended Documentation Flow
- **New Feature**: Use [prompt-playbook.md](../prompt-playbook.md)
- **Bug Fix**: Quick Fix → Documentation update
- **Architecture Change**: TRD Creation → Implementation → Update navigation

## 🔍 Confidence Assessment
**Overall project understanding**: [X]/10

### Areas needing more context:
- [ ] [Area 1] - Current confidence: [score]/10 - Action: [specific research needed]
- [ ] [Area 2] - Current confidence: [score]/10 - Action: [specific research needed]

## 🔄 Context Improvement Plan
To improve context for future AI agents:
1. **Add Examples**: Populate [docs/examples/] with project patterns
2. **Document Decisions**: Record architectural choices and rationale
3. **Improve Validation**: Enhance testing and quality commands
4. **Update Confidence**: Regular assessment and improvement
5. **Pattern Recognition**: Identify and codify successful approaches

## 🎯 Quick Start for AI Agents
1. **Read this entire navigation guide**
2. **Review [docs/examples/] for patterns**
3. **Check [prompt-playbook.md](../prompt-playbook.md) for workflows**
4. **Validate understanding** before proceeding (confidence ≥7/10)
5. **Follow validation commands** for all implementations

---
**🚀 Ready to start?** Check [prompt-playbook.md](../prompt-playbook.md) for the right workflow for your task.
```

### 8️⃣ Create Enhanced AGENTS.md and CLAUDE.md

```markdown
# 🤖 AI Agents Setup (Context Engineering Enhanced)

## 📚 Primary Resource
**[📖 Project Navigation Guide](docs/project-navigation.md)** - Your complete context source

## 🎯 Context Engineering Workflow
1. **Read Context First**: Study [docs/project-navigation.md](docs/project-navigation.md) completely
2. **Review Examples**: Check [docs/examples/](docs/examples/) for patterns
3. **Check Confidence**: Assess understanding before acting (≥7/10 required)
4. **Follow Patterns**: Use examples for implementation guidance
5. **Validate**: Run required commands before considering work complete

## 🚀 Quick Start
1. **MANDATORY**: Read [docs/project-navigation.md](docs/project-navigation.md) first
2. **Select Workflow**: Use [prompt-playbook.md](prompt-playbook.md) to choose the right prompt
3. **Gather Context**: Reference examples and patterns from navigation guide
4. **Implement**: Follow established patterns and validation requirements
5. **Validate**: Ensure all quality gates pass

## 🎯 Typical Flows (Context-Enhanced)
- **New feature** → Review examples → TRD → Dev → Validate
- **Bug fix** → Check patterns → Quick Fix → Validate
- **Architecture change** → Legacy analysis → Refactoring → Validate

## ⚠️ Critical Context Engineering Rules
- **Never proceed with confidence <7/10**
- **Always reference [docs/examples/] for patterns**
- **Run all validation commands from navigation guide**
- **Update examples when discovering new successful patterns**
- **Follow project rules from navigation guide**

## ✅ Success Criteria
- ✅ [docs/project-navigation.md](docs/project-navigation.md) read and understood
- ✅ Confidence ≥7/10 for implementation area
- ✅ Examples and patterns referenced appropriately  
- ✅ Validation commands pass
- ✅ Context updated if new patterns discovered

## 🆘 When Stuck
1. **Low Confidence?** → Re-read [docs/project-navigation.md](docs/project-navigation.md)
2. **No Examples?** → Check [docs/examples/] or create new pattern
3. **Validation Failing?** → Review project standards in navigation guide
4. **Unclear Workflow?** → Consult [prompt-playbook.md](prompt-playbook.md)

---
**Remember**: Context engineering ensures consistent, high-quality implementations. The navigation guide is your foundation for success.
```

### 9️⃣ Validation & Confidence Assessment

**Before completing initialization:**

1. **Context Quality Check**:
   - [ ] docs/examples/ folder contains relevant patterns
   - [ ] project-navigation.md has complete tech stack, rules, legacy analysis, and documentation catalog
   - [ ] Confidence scores >7 for all major components
   - [ ] Validation commands documented and tested

2. **Self-Correction Loop**:
   - If confidence <7 → gather more context → iterate
   - If validation fails → improve documentation → retest
   - If unclear → ask specific questions → clarify

3. **Final Validation**:
   - [ ] Another AI agent could understand this project using only project-navigation.md
   - [ ] All context engineering elements in place
   - [ ] Clear path from project setup to development

## 🆘 Enhanced Fallback
**If project is too complex or confusing:**
- Create basic project-navigation.md with confidence scoring
- Note complexity areas with low confidence scores
- Document what context is missing
- Recommend running "Existing Feature Analysis" for unclear areas
- Set up basic docs/examples/ structure for future enhancement
- Include clear action plan for improving context confidence

