# Prompt • Project Initialization Kickoff (Optimized)

## 🎯 Role
Tech Lead or AI Agent performing complete project initialization and audit.

## Inputs
- Project repository (URL or local path)
- Access to code and configuration
- (Optional) existing documentation files

## Expected Outputs
1. **docs/project-navigation.md** — structured project guide
2. **AGENTS.md** and **CLAUDE.md** — instructions for AI agents in project root
3. **Technology table** with versions
4. **Legacy code analysis** with clarifying questions
5. **Complete catalog** of current documentation (with link to prompt-playbook.md)

## ⚙️ Workflow

### 1️⃣ **🎯 IMPORTANT: Ask specific clarifying questions with proposed answer options** about audit purpose, project state, documentation priorities, and any other topics you deem important for successful task completion

### 2️⃣ Codebase Discovery
- Scan entire project (ignore .git, node_modules, __pycache__)
- Identify entry points (main.py, index.js, package.json, requirements.txt, etc.)
- Record dependency managers and key configs
- Recognize frameworks and architectural patterns (Django, FastAPI, React, Express, etc.)
- Collect documentation links (README.md, docs/, Wiki)

### 3️⃣ Tech Stack Map
Create table:

| Component | Technology | Version | Notes |
|-----------|------------|---------|-------|
| Backend   | [detected] | [ver]   | [patterns/notes] |
| Frontend  | [detected] | [ver]   | [patterns/notes] |
| Database  | [detected] | [ver]   | [connection info] |
| Runtime   | [detected] | [ver]   | [requirements] |

### 4️⃣ Architecture Review
- Identify key modules and connections between them
- Outline API boundaries and data flows
- Determine architectural style (monolith, MVC, microservices, etc.)
- Note anything non-standard or complex
- Mark potential legacy areas for review

### 5️⃣ Legacy Check
**If legacy is detected — ask clarifying questions:**
- How long will these components be supported?
- Are there migration plans or constraints?
- Which parts of code should agents not modify?
- What standards need to be followed?
- Are there outdated dependencies?

### 6️⃣ Create PROJECT-NAVIGATION.md

```markdown
# 🗂️ Project Navigation Guide

## 📌 Overview
[Brief system description]

## 📁 Structure
```
[Directory tree with explanations]
```

## 🚀 How to Run
- **Development**: [steps]
- **Production**: [deployment]
- **Testing**: [test execution]

## ⚙️ Key Components
| Component | Path | Purpose | Dependencies |
|-----------|------|---------|---------------|
| [name]    | [path] | [purpose] | [deps] |

## 🛠️ Dev Workflow
1. Setup
2. Coding
3. Testing
4. Deployment

## ⚠️ Notes
- [Legacy areas]
- [Coding style]
- [Critical do's & don'ts]
```

### 7️⃣ Create AGENTS.md and CLAUDE.md

```markdown
# 🤖 AI Agents Setup

## 📚 Docs
- [Project Navigation](docs/project-navigation.md)
- [Prompt Playbook](/prompt-playbook.md)

## 🚀 Quick Start
1. Study `project-navigation.md`
2. Check stack and dependencies
3. Follow workflow
4. Use correct prompts from playbook

## 🎯 Typical Flows
- **New feature** → TRD → Dev
- **Bug** → Quick Fix
- **Legacy** → Feature Audit

## ⚠️ Guidelines
- What not to touch
- Code standards
- Agent constraints

## ✅ Success Criteria
- ✅ Project fully described and documented
- ✅ Clear navigator and structure
- ✅ AI instruction in root
- ✅ Legacy questions resolved
- ✅ Everything connected with links

## 🆘 Fallback
**If project is too complex or confusing:**
Create basic AGENTS.md and CLAUDE.md with:
- Link to playbook
- Note about high complexity modules
- Recommendation to run "Existing Feature Analysis" first

