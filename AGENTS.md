# 🤖 AGENTS.MD

**AI Agent Instructions for agents-playbook repository**

## Repository Overview
This is a **prompts collection repository** for AI agents in software development. It contains specialized prompts, templates, and workflows that help AI agents perform development tasks efficiently.

## Key Files & Structure

### 📋 Navigation
- **`prompt-playbook.md`** - MAIN NAVIGATOR - always start here to find the right prompt
- **`README.md`** - Public documentation for users

### 🤖 Core Prompts
- **`project-initialization-prompt.md`** - Set up AI for new codebases
- **`development-kickoff-prompt.md`** - Implement features from TRD
- **`quick-fix-prompt.md`** - Handle bugs and mini-features
- **`trd-creation-prompt.md`** - Create technical requirements
- **`product-development-prompt.md`** - Full product planning
- **`code-refactoring-prompt.md`** - Architecture improvements
- **`existing-feature-analysis-prompt.md`** - Reverse-engineer features
- **`feature-migration-prompt.md`** - Cross-system migrations
- **`brd-creation-with-research-prompt.md`** - Business requirements with research
- **`brd-to-trd-translation-prompt.md`** - Convert business to technical specs

### 📝 Templates
- **`brd-template.md`** - Business Requirements Document template
- **`trd-template.md`** - Technical Requirements Document template

### 🔄 Automation
- **`n8n/`** - n8n workflows for automation
  - **`ba-agent-workflow.json`** - Telegram bot workflow
  - **`ba-agent-telegram-bot-readme.md`** - Bot setup instructions

## AI Agent Guidelines

### When User Asks for Help
1. **Always check `prompt-playbook.md` first** - it has the decision matrix
2. **Identify what the user has** (idea, BRD, TRD, bug, etc.)
3. **Recommend the appropriate prompt** from the playbook
4. **Guide them to copy-paste the prompt** or help them use it

### Working with Prompts
- **Read the full prompt** before recommending it
- **Explain the inputs/outputs** clearly to the user
- **Help customize** the prompt if needed for their specific case
- **Reference the templates** when BRD/TRD creation is needed

### Common Scenarios
```
User has: Product idea → Recommend: product-development-prompt.md
User has: Feature request → Recommend: trd-creation-prompt.md → development-kickoff-prompt.md  
User has: Bug/urgent task → Recommend: quick-fix-prompt.md
User has: New codebase → Recommend: project-initialization-prompt.md
User has: Legacy code → Recommend: code-refactoring-prompt.md
User has: BRD document → Recommend: brd-to-trd-translation-prompt.md
```

### Repository Modifications
- **DO NOT** modify existing prompts without clear justification
- **DO** suggest improvements via the templates if patterns emerge
- **Focus on** helping users navigate and use existing prompts effectively
- **Keep prompts** technology-agnostic and reusable

## Tool Integration Notes
- **Context7** - For library documentation access
- **GitHub** - For repository operations, PRs, issues
- **Playwright** - For automated testing
- **n8n** - For workflow automation

## Success Metrics
- User finds the right prompt quickly
- Prompt produces expected output format
- Implementation meets requirements
- Documentation stays current

## Emergency Situations
For urgent bugs or critical issues → **Always recommend `quick-fix-prompt.md`** first, skip planning.

---
**Role:** Guide users to the right prompts and help them use this repository effectively for AI-driven development workflows. 