# AI Development Prompts Playbook

Specialized prompts for AI agents handling software development and product management tasks.

## 📋 Available Prompts

| # | Prompt | Complexity | Use Case | Output |
|---|--------|------------|----------|---------|
| 1 | [Product Development](product-development-prompt.md) | High | Product idea → comprehensive planning | PRD, feature breakdown, MVP, first TRD |
| 2 | [TRD Creation](trd-creation-prompt.md) | Medium | Feature idea → technical spec | Complete TRD |
| 3 | [BRD to TRD Translation](brd-to-trd-translation-prompt.md) | Medium | BRD + codebase → technical requirements | TRD from business requirements |
| 4 | [Quick Fix](quick-fix-prompt.md) | Simple-Medium | Bug fixes, mini-features | Working solution, minimal docs |
| 5 | [Development Kickoff](development-kickoff-prompt.md) | Variable | TRD → implementation | Working code, tests, docs |
| 6 | [Existing Feature Analysis](existing-feature-analysis-prompt.md) | Medium-High | Reverse-engineer feature | "As-is" TRD |
| 7 | [Feature Migration](feature-migration-prompt.md) | High | Cross-system migration | "To-be" TRD + migration plan |
| 8 | [BRD with Research](brd-creation-with-research-prompt.md) | Medium-High | External research → BRD | Complete BRD with research |
| 9 | [Code Refactoring](code-refactoring-prompt.md) | Medium-High | Code → scalable architecture | Analysis + 3 refactoring options |

## 📝 Templates
- [BRD Template](brd-template.md) • [TRD Template](trd-template.md)

## 🤖 Complexity Assessment
| Simple | Standard | Complex |
|--------|----------|---------|
| Few files, known patterns | Multi-component, some new patterns | Architectural changes, unknowns |
| Quick Fix → Implementation | TRD Creation → Dev Kickoff | Product Development → Planning |

## 🎯 Quick Decision Guide

| What You Have | What You Need | Use This Prompt |
|---------------|---------------|-----------------|
| Product idea | Full planning | [Product Development](product-development-prompt.md) |
| Feature idea | Technical spec | [TRD Creation](trd-creation-prompt.md) |
| BRD document | Technical implementation | [BRD to TRD Translation](brd-to-trd-translation-prompt.md) |
| TRD document | Working code | [Development Kickoff](development-kickoff-prompt.md) |
| Bug/small task | Quick fix | [Quick Fix](quick-fix-prompt.md) |
| Existing feature | Documentation | [Existing Feature Analysis](existing-feature-analysis-prompt.md) |
| Feature to migrate | Migration plan | [Feature Migration](feature-migration-prompt.md) |
| Research need | Complete BRD | [BRD with Research](brd-creation-with-research-prompt.md) |
| Legacy code | Modern architecture | [Code Refactoring](code-refactoring-prompt.md) |

## 🚨 Emergency: Use [Quick Fix](quick-fix-prompt.md)
Skip planning • Fix fast • Document later

## 🔄 Common Flows
```
Product Idea → Product Development → TRD → Dev Kickoff → Done
Feature Request → TRD Creation → Dev Kickoff → Done  
BRD → BRD to TRD → Dev Kickoff → Done
Bug/Task → Quick Fix → Done
Code Issues → Code Refactoring → Dev Kickoff → Done
```

## 🛠️ Quick Start
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


