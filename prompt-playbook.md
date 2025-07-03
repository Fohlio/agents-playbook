# AI Development Prompts Playbook

Specialized prompts for AI agents handling software development and product management tasks.

## 📋 Planning Prompts

| # | Prompt | Complexity | Use Case | Output |
|---|--------|------------|----------|---------|
| 0 | [Product Development](planning/product-development-prompt.md) | High | Product idea → comprehensive planning | PRD, feature breakdown, MVP, first TRD |
| 1 | [TRD Creation](planning/trd-creation-prompt.md) | Medium | Feature idea → technical spec | Complete TRD |
| 2 | [BRD to TRD Translation](planning/brd-to-trd-translation-prompt.md) | Medium | BRD + codebase → technical requirements | TRD from business requirements |
| 3 | [Existing Feature Analysis](planning/existing-feature-analysis-prompt.md) | Medium-High | Reverse-engineer feature | "As-is" TRD |
| 4 | [Feature Migration](planning/feature-migration-prompt.md) | High | Cross-system migration | "To-be" TRD + migration plan |
| 5 | [BRD with Research](planning/brd-creation-with-research-prompt.md) | Medium-High | External research → BRD | Complete BRD with research |
| 6 | [Code Refactoring](planning/code-refactoring-prompt.md) | Medium-High | Code → scalable architecture | Analysis + 3 refactoring options |

## 🚀 Kickoff Prompts

| # | Prompt | Complexity | Use Case | Output |
|---|--------|------------|----------|---------|
| 7 | [Project Initialization Kickoff](kickoff/project-initialization-kickoff-prompt.md) | Medium | New codebase → AI setup | AGENTS.MD, navigation, stack analysis |
| 8 | [Quick Fix / Mini Feature Kickoff](kickoff/quick-fix-kickoff-prompt.md) | Simple-Medium | Bug fixes, mini-features | Working solution, minimal docs |
| 9 | [Development Kickoff](kickoff/development-kickoff-prompt.md) | Variable | TRD → implementation | Working code, tests, docs |

## 🧪 QA Prompts

| # | Prompt | Complexity | Use Case | Output |
|---|--------|------------|----------|---------|
| 10 | [QA Validation & Testing](qa/qa-validation-prompt.md) | Medium | Feature/fix → comprehensive testing | Test cases, validation report, automated tests |

## 📝 Templates
- [BRD Template](templates/brd-template.md) • [TRD Template](templates/trd-template.md)

## 🤖 Complexity Assessment
| Simple | Standard | Complex |
|--------|----------|---------|
| Few files, known patterns | Multi-component, some new patterns | Architectural changes, unknowns |
| Quick Fix → Implementation | TRD Creation → Dev Kickoff | Product Development → Planning |

## 🎯 Quick Decision Guide

### Planning Phase
| What You Have | What You Need | Use This Prompt |
|---------------|---------------|-----------------|
| Product idea | Full planning | [Product Development](planning/product-development-prompt.md) |
| Feature idea | Technical spec | [TRD Creation](planning/trd-creation-prompt.md) |
| BRD document | Technical implementation | [BRD to TRD Translation](planning/brd-to-trd-translation-prompt.md) |
| Existing feature | Documentation | [Existing Feature Analysis](planning/existing-feature-analysis-prompt.md) |
| Feature to migrate | Migration plan | [Feature Migration](planning/feature-migration-prompt.md) |
| Research need | Complete BRD | [BRD with Research](planning/brd-creation-with-research-prompt.md) |
| Legacy code | Modern architecture | [Code Refactoring](planning/code-refactoring-prompt.md) |

### Kickoff Phase
| What You Have | What You Need | Use This Prompt |
|---------------|---------------|-----------------|
| New codebase | AI agent setup | [Project Initialization Kickoff](kickoff/project-initialization-kickoff-prompt.md) |
| TRD document | Working code | [Development Kickoff](kickoff/development-kickoff-prompt.md) |
| Bug/small task | Quick fix | [Quick Fix / Mini Feature Kickoff](kickoff/quick-fix-kickoff-prompt.md) |

## 🚨 Emergency: Use [Quick Fix / Mini Feature Kickoff](kickoff/quick-fix-kickoff-prompt.md)
Skip planning • Fix fast • Document later

## 🔄 Common Flows
```
New Project → Project Initialization → [Choose other prompts] → QA Validation → Done
Product Idea → Product Development → TRD → Dev Kickoff → QA Validation → Done
Feature Request → TRD Creation → Dev Kickoff → QA Validation → Done  
BRD → BRD to TRD → Dev Kickoff → QA Validation → Done
Bug/Task → Quick Fix Kickoff → QA Validation → Done
Code Issues → Code Refactoring → Dev Kickoff → QA Validation → Done
```

## 🛠️ Quick Start
0. **New to codebase?** → Run [Project Initialization Kickoff](kickoff/project-initialization-kickoff-prompt.md) first
1. **Identify what you have** (idea, BRD, TRD, bug, etc.)
2. **Check decision guide** above
3. **Run the recommended prompt**
4. **Follow the output workflow**

## 📊 Success Criteria
- ✅ Requirements met
- ✅ Tests pass  
- ✅ No regressions
- ✅ Docs updated

---
**AI-Optimized:** Structured prompts for automated development workflows. Use with AI coding assistants for best results.


