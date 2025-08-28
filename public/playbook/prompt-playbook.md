# AI Development Workflows Playbook

**YAML-based workflows** with **smart mini-prompts** for AI agents handling software development and product management tasks.

## 🎯 Quick Access via MCP Server

Use the **AI-powered semantic search** MCP server to find workflows instantly:
- **Search**: Describe your task in natural language
- **Quality Indicators**: 🎯✅👍🤔❓ show match quality  
- **Smart Execution**: Auto-skip steps based on context and prerequisites

## 📋 Available Workflows (4 Total)

| Workflow | Category | Complexity | Steps | Use Case |
|----------|----------|------------|-------|----------|
| [feature-development](#feature-development) | Development | Medium | 14 | Complete feature lifecycle |
| [quick-fix](#quick-fix) | Development | Low | 4 | Bugs, hotfixes, urgent tasks |
| [code-refactoring](#code-refactoring) | Development | Medium-High | 8 | Architecture improvements |
| [feature-brainstorming](#feature-brainstorming) | Planning | Medium | 5 | Feature discovery and planning |

## 🔧 Smart Mini-Prompts Architecture

### 12+ Specialized Mini-Prompts by Phase

#### 📋 Business Phase
- **create-structured-requirements** - Structured requirements creation and analysis
- **create-implementation-plan** - Implementation planning and task breakdown
- **feature-brainstorming** - Feature ideation and opportunity discovery
- **feature-compilation** - Feature compilation and prioritization
- **create-feature-document** - Feature documentation and specification
- **user-interest-discovery** - User interest research and validation

#### 🔍 Analysis Phase  
- **code-analysis** - Code quality, structure, and technical debt analysis
- **trace-bug-root-cause** - Bug investigation and root cause identification
- **codebase-opportunity-analysis** - Codebase analysis for enhancement opportunities
- **trend-research** - Technology and market trend research
- **specific-feature-analysis** - Detailed feature analysis and impact assessment

#### 🎨 Development Phase
- **design-architecture** - Solution architecture and technical design
- **ask-clarifying-questions** - Requirements clarification and scope definition
- **implement-feature** - Feature implementation guidance and best practices

#### 🧪 QA Phase
- **execute-tests** - Test execution, automation, and validation

#### 📝 Review Phase
- **deliverable-review** - Universal deliverable quality assessment



## 🚀 Workflow Details

### Feature Development
**Complete feature development from requirements to deployment**
- **Phases**: Planning → Design → Implementation → Testing
- **Smart Features**: Auto-skips architecture analysis for simple features
- **Documentation**: Creates comprehensive technical documentation
- **Best For**: New features, enhancements, complex development tasks

### Quick Fix
**Fast resolution for bugs, hotfixes, and urgent tasks**
- **Phases**: Planning → Analysis → Implementation → Testing
- **Smart Features**: Auto-skips testing for trivial changes, minimal overhead
- **Speed**: Optimized for emergency situations and simple fixes
- **Best For**: Production bugs, hotfixes, small urgent tasks

### Code Refactoring
**Systematic code improvement and architecture enhancement**
- **Phases**: Planning → Analysis → Implementation → Testing
- **Focus**: Architecture improvements, performance optimization, technical debt
- **Validation**: Backward compatibility and performance impact assessment
- **Best For**: Technical debt reduction, performance improvements, code modernization

### Feature Brainstorming
**Discover and plan new features through comprehensive analysis**
- **Phases**: Analysis → Research → Brainstorming → Documentation
- **Features**: Codebase analysis, trend research, user interest discovery
- **Output**: Feature compilation and detailed feature documents
- **Best For**: Feature planning, product roadmap development, enhancement discovery



## 🎯 Decision Guide

### By Development Stage
| You Have | You Need | Recommended Workflow |
|----------|----------|---------------------|
| Bug/Issue | Quick resolution | **quick-fix** |
| Feature idea | Feature planning | **feature-brainstorming** |
| Technical spec | Working feature | **feature-development** |
| Legacy code | Modern architecture | **code-refactoring** |

### By Complexity Level
| Complexity | Timeframe | Workflows |
|------------|-----------|-----------|
| **Simple** | Hours to 1 day | quick-fix |
| **Standard** | 1-5 days | feature-brainstorming |
| **Complex** | 1-4 weeks | feature-development, code-refactoring |

## 🧠 Smart Execution Features

### Intelligent Validation
- **Context Awareness**: Skips steps without required context
- **Prerequisites Check**: Validates dependencies before execution  
- **Auto-Skipping**: Bypasses optional steps based on conditions
- **Progress Tracking**: Real-time workflow progress monitoring

### Skip Conditions Examples
- **Architecture Analysis**: Skipped for simple features or when `no_architecture_impact` flag is set
- **Testing**: Skipped for trivial changes in quick-fix when `emergency_hotfix` condition is met
- **Requirements Validation**: Skipped for internal projects when `no_formal_validation_needed` is set

## 🔄 Common Workflow Flows

### Emergency Flow
```
Critical Bug → quick-fix → [Optional: feature-development for proper fix]
```

### Feature Development Flow  
```
Feature Idea → feature-brainstorming → feature-development
```

### Enhancement Discovery Flow
```
Existing Codebase → feature-brainstorming → feature-development
```

### Migration Flow
```
Legacy System → code-refactoring → feature-development
```

## 🚀 Getting Started

### 1. Use MCP Server (Recommended)
- Connect to semantic search MCP server
- Describe your task in natural language
- Get workflow recommendations with quality scores
- Follow guided step-by-step execution

### 2. Local Usage
- Copy `playbook/` directory to your project  
- Browse workflows in `playbook/workflows/`
- Use mini-prompts from `playbook/mini-prompts/`
- Customize for your team's needs

### 3. Direct Navigation
- **Feature Planning**: feature-brainstorming
- **Development**: feature-development, quick-fix, code-refactoring

## 📊 Success Criteria

### For All Workflows
- ✅ Requirements clearly defined and documented
- ✅ All tests pass and quality gates met
- ✅ No regressions in existing functionality  
- ✅ Documentation updated and current
- ✅ Requirements validation completed (where required)

### Workflow-Specific Success Metrics
- **Feature Development**: Technical documentation created, feature deployed, requirements satisfied
- **Feature Brainstorming**: Feature opportunities identified, feature documents created, roadmap defined
- **Quick Fix**: Issue resolved, no side effects, minimal disruption
- **Code Refactoring**: Architecture improved, performance enhanced, technical debt reduced


---

**🚀 AI Agents Playbook** - Intelligent workflows for modern development teams

**Next Steps**: Use the MCP server for AI-powered workflow discovery, or browse individual workflows for manual execution. 