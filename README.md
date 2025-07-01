# 🤖 AI Agents Playbook

**A collection of specialized prompts for AI agents in software development**

This repository contains a set of ready-to-use prompts that help AI agents (Claude, ChatGPT, etc.) effectively perform software development tasks — from product planning to code implementation.

## 🎯 What is this?

**AI Agents Playbook** is a structured methodology for working with AI in development, including:

- **10 specialized prompts** for different development stages
- **Ready-to-use templates** for documentation (BRD, TRD)
- **Step-by-step workflows** for process automation
- **Integrations** with GitHub, Context7, Playwright

## 🚀 Quick Start

### 1. Starting with a new project?
→ Use [**Project Initialization Kickoff**](kickoff/project-initialization-kickoff-prompt.md)

### 2. Have a product idea?
→ Use [**Product Development**](planning/product-development-prompt.md)

### 3. Need to implement a feature?
→ Create [**TRD**](planning/trd-creation-prompt.md) → run [**Development Kickoff**](kickoff/development-kickoff-prompt.md)

### 4. Urgent bug?
→ Use [**Quick Fix**](kickoff/quick-fix-kickoff-prompt.md)

## 📚 Key Files

| File | Description |
|------|-------------|
| **[prompt-playbook.md](prompt-playbook.md)** | 📋 Main navigator for all prompts |
| **[project-initialization-kickoff-prompt.md](kickoff/project-initialization-kickoff-prompt.md)** | 🆕 AI setup for new projects |
| **[development-kickoff-prompt.md](kickoff/development-kickoff-prompt.md)** | 🔨 Feature implementation from TRD |
| **[quick-fix-kickoff-prompt.md](kickoff/quick-fix-kickoff-prompt.md)** | ⚡ Quick fixes and mini-features |

## 🏗️ Repository Structure

```
agents-playbook/
├── prompt-playbook.md           # 📋 Main navigator
├── planning/                    # 📋 Planning prompts
├── kickoff/                     # 🚀 Implementation prompts
├── templates/                   # 📝 Document templates
└── n8n/                         # 🔄 n8n automation
    ├── ba-agent-workflow.json   # Telegram bot workflow
    └── ...
```

## 🔄 Common Scenarios

### New Project
```
1. Project Initialization → AGENTS.MD
2. Product Development → PRD + first TRD
3. Development Kickoff → working code
```

### New Feature
```
1. TRD Creation → technical specification
2. Development Kickoff → implementation
```

### Refactoring
```
1. Code Refactoring → analysis + options
2. Development Kickoff → new architecture
```

## 🎮 How to Use

### Option 1: Direct Copy-Paste
1. Open the needed prompt from `planning/` or `kickoff/` folder
2. Copy the prompt to your AI agent
3. Follow the prompt instructions

### Option 2: Via n8n (automation)
1. Import [ba-agent-workflow.json](n8n/ba-agent-workflow.json)
2. Set up Telegram bot
3. Work through chat

### Option 3: IDE Integration
1. Add prompts to your AI coding assistant
2. Use as custom instructions

## 🛠️ Tools

Prompts are optimized for working with:

- **Context7** — access to up-to-date library documentation
- **GitHub** — repository work, PRs, issues
- **Playwright** — automated testing

## 📊 Complexity Levels

| 🟢 Simple | 🟡 Standard | 🔴 Complex |
|-----------|-------------|------------|
| Quick Fix | TRD Creation | Product Development |
| - | Development Kickoff | Feature Migration |
| - | - | Code Refactoring |

## 📝 Templates

- **[BRD Template](templates/brd-template.md)** — Business Requirements
- **[TRD Template](templates/trd-template.md)** — Technical Requirements

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Create a Pull Request

## 📞 Support

If you have questions or suggestions:
- Create an [Issue](../../issues)
- Suggest improvements via [Pull Request](../../pulls)

---

**💡 Tip:** Start with [prompt-playbook.md](prompt-playbook.md) — it has a convenient navigator for all prompts and usage scenarios. 