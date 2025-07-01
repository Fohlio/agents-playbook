# 🤖 AI Agents Playbook

**A collection of specialized prompts for AI agents in software development**

This repository contains ready-to-use prompts that help AI agents (Claude, ChatGPT, etc.) effectively perform software development tasks — from product planning to code implementation.

## 🚀 Quick Setup in Your Project

### 1. Install the Playbook
```bash
# Copy all files to your project
cp -r agents-playbook/ your-project/docs/agents-playbook/
```

### 2. Initialize with AI
1. Add **@project-initialization-kickoff-prompt.md** to your AI chat
2. Ask for project initialization

### 3. Setup Tools
- Add **MCP Playwright** and **Context7** to your AI
- Add to `.cursor/rules`: 
  ```
  Use @prompt-playbook.md to select the proper flow if not guided
  ```

## 🎯 What You Get

- **10 specialized prompts** for different development stages
- **Ready-to-use templates** (BRD, TRD)
- **Step-by-step workflows** for automation
- **Tool integrations** (GitHub, Context7, Playwright)

## 📚 Main Flows

| Scenario | Start With |
|----------|------------|
| 🆕 **New project** | [Project Initialization](kickoff/project-initialization-kickoff-prompt.md) |
| 💡 **Product idea** | [Product Development](planning/product-development-prompt.md) |
| ⚡ **Feature/bug** | [Quick Fix](kickoff/quick-fix-kickoff-prompt.md) |
| 🏗️ **Major feature** | [TRD Creation](planning/trd-creation-prompt.md) → [Development Kickoff](kickoff/development-kickoff-prompt.md) |

## 🏗️ Repository Structure

```
agents-playbook/
├── prompt-playbook.md           # 📋 Main navigator
├── planning/                    # 📋 Planning prompts
├── kickoff/                     # 🚀 Implementation prompts
├── templates/                   # 📝 Document templates
└── n8n/                         # 🔄 n8n automation
```

## 🛠️ Usage Options

### Option 1: IDE Integration (Recommended)
1. Copy to `docs/agents-playbook/`
2. Use `@prompt-playbook.md` in AI chat
3. Follow guided workflows

### Option 2: Direct Copy-Paste
1. Open needed prompt from folders
2. Copy to your AI agent
3. Follow instructions

### Option 3: n8n Automation
1. Import [ba-agent-workflow.json](n8n/ba-agent-workflow.json)
2. Set up Telegram bot

## 📊 Complexity Guide

| 🟢 Simple | 🟡 Standard | 🔴 Complex |
|-----------|-------------|------------|
| Quick Fix | TRD Creation | Product Development |
| | Development Kickoff | Feature Migration |
| | | Code Refactoring |

## 📝 Templates

- **[BRD Template](templates/brd-template.md)** — Business Requirements
- **[TRD Template](templates/trd-template.md)** — Technical Requirements

## 🚧 Roadmap

Планируется добавление:
- **n8n промпт-темплейты** для автоматизации workflow
- **Готовые шаблоны** для популярных фреймворков (Django, React, FastAPI)
- **Специализированные промпты** для DevOps, тестирования, документации
- **Интеграции** с другими no-code платформами

---

**💡 Start here:** [prompt-playbook.md](prompt-playbook.md) — main navigator for all prompts and scenarios. 