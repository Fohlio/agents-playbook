# AI Development Workflows Playbook

**YAML-based workflows** with **smart mini-prompts** for AI agents handling software development and product management tasks.

## 🎯 Quick Access via MCP Server

Use the **AI-powered semantic search** MCP server to find workflows instantly:
- **Search**: Describe your task in natural language
- **Quality Indicators**: 🎯✅👍🤔❓ show match quality  
- **Smart Execution**: Auto-skip steps based on context and prerequisites

## 📋 Available Workflows (9 Total)

| Workflow | Category | Complexity | Steps | Use Case |
|----------|----------|------------|-------|----------|
| [feature-development](#feature-development) | Development | Medium | 14 | Complete feature lifecycle |
| [product-development](#product-development) | Development | High | 15 | Product from idea to launch |
| [quick-fix](#quick-fix) | Development | Low | 4 | Bugs, hotfixes, urgent tasks |
| [code-refactoring](#code-refactoring) | Development | Medium-High | 8 | Architecture improvements |
| [trd-creation](#trd-creation) | Documentation | Medium | 7 | Technical requirements |
| [brd-creation](#brd-creation) | Documentation | Medium | 6 | Business requirements with research |
| [brd-to-trd-translation](#brd-to-trd-translation) | Documentation | Medium | 6 | Business → Technical translation |
| [project-initialization](#project-initialization) | Setup | Medium | 5 | New project context setup |
| [infrastructure-setup](#infrastructure-setup) | Operations | High | 12 | Complete infrastructure deployment |

## 🔧 Smart Mini-Prompts Architecture

### 25+ Specialized Mini-Prompts by Phase

#### 📋 Business Phase
- **gather-requirements** - Requirements collection and stakeholder analysis
- **document-decisions** - Decision documentation and architectural rationale
- **stakeholder-approval** - Stakeholder review, sign-off, and approval processes
- **create-trd** - Technical Requirements Document creation with TRD integration 

#### 🔍 Analysis Phase  
- **feature-analysis** - Feature scope, impact, and complexity analysis
- **architecture-analysis** - System architecture evaluation and planning
- **code-analysis** - Code quality, structure, and technical debt analysis
- **trace-bug-root-cause** - Bug investigation and root cause identification

#### 🎨 Development Phase
- **design-architecture** - Solution architecture and technical design
- **ask-clarifying-questions** - Requirements clarification and scope definition
- **code-review** - Code quality review and improvement recommendations
- **implement-feature** - Feature implementation guidance and best practices

#### 🚀 Operations Phase
- **configure-infrastructure** - Infrastructure setup and configuration management
- **deploy-application** - Application deployment procedures and automation
- **manage-secrets** - Security and secrets management best practices
- **monitor-system-health** - System monitoring, alerting, and observability
- **backup-recovery** - Data protection and disaster recovery procedures
- **setup-cicd-pipeline** - Continuous integration and deployment automation

#### 🧪 QA Phase
- **create-test-plan** - Test planning, strategy, and coverage analysis
- **execute-tests** - Test execution, automation, and validation
- **validate-requirements** - Requirements validation and acceptance criteria

#### 🔄 Migration Phase
- **api-migration** - API version migration and compatibility management
- **cloud-migration** - Cloud platform migration and infrastructure transition
- **data-transformation** - Data format and structure migration
- **database-migration** - Database schema and data migration procedures
- **platform-migration** - Platform and technology stack migration

## 🚀 Workflow Details

### Feature Development
**Complete feature development from requirements to deployment**
- **Phases**: Planning → Analysis → Design → Implementation → Testing → Deployment → Reflection
- **Smart Features**: Auto-skips architecture analysis for simple features
- **TRD Integration**: Creates comprehensive technical documentation
- **Best For**: New features, enhancements, complex development tasks

### Product Development  
**Comprehensive product development from idea to market launch**
- **Phases**: Planning → Analysis → Design → Implementation → Testing → Deployment → Reflection
- **Advanced Features**: Market analysis, user validation, stakeholder approval
- **Complexity**: High - requires extensive planning and validation
- **Best For**: New products, major feature releases, market launches

### Quick Fix
**Fast resolution for bugs, hotfixes, and urgent tasks**
- **Phases**: Planning → Analysis → Implementation → Testing
- **Smart Features**: Auto-skips testing for trivial changes, minimal overhead
- **Speed**: Optimized for emergency situations and simple fixes
- **Best For**: Production bugs, hotfixes, small urgent tasks

### Code Refactoring
**Systematic code improvement and architecture enhancement**
- **Phases**: Analysis → Design → Implementation → Testing → Documentation
- **Focus**: Architecture improvements, performance optimization, technical debt
- **Validation**: Backward compatibility and performance impact assessment
- **Best For**: Technical debt reduction, performance improvements, code modernization

### TRD Creation
**Technical Requirements Document creation from feature ideas**
- **Phases**: Planning → Analysis → Design → Documentation
- **Integration**: Built-in TRD mini-prompt for comprehensive documentation [[memory:2316971]]
- **Smart Features**: Auto-skips architecture analysis for simple features
- **Best For**: Feature planning, technical specification, development preparation

### BRD Creation
**Business Requirements Document with research and stakeholder input**
- **Phases**: Planning → Analysis → Documentation
- **Research**: Market analysis, competitive research, stakeholder input
- **Validation**: Business value assessment and stakeholder approval
- **Best For**: New initiatives, business planning, requirement gathering

### BRD to TRD Translation
**Convert business requirements to technical specifications**
- **Phases**: Analysis → Design → Documentation
- **Prerequisites**: Complete BRD document required
- **Output**: Comprehensive TRD with technical feasibility assessment
- **Best For**: Business → Technical handoffs, technical planning

### Project Initialization
**Set up new project context and AI agent documentation**
- **Phases**: Analysis → Planning → Design → Documentation
- **Output**: AGENTS.MD, project navigation, technology stack analysis
- **Smart Features**: Auto-skips steps when sufficient context exists
- **Best For**: New codebases, AI agent setup, project onboarding

### Infrastructure Setup
**Complete infrastructure deployment with monitoring and security**
- **Phases**: Planning → Analysis → Design → Implementation → Testing → Operations → Documentation
- **Advanced**: CI/CD pipelines, secrets management, backup procedures
- **Complexity**: High - comprehensive infrastructure management
- **Best For**: New environments, infrastructure migrations, DevOps setup

## 🎯 Decision Guide

### By Development Stage
| You Have | You Need | Recommended Workflow |
|----------|----------|---------------------|
| Bug/Issue | Quick resolution | **quick-fix** |
| Feature idea | Technical planning | **trd-creation** |
| Technical spec | Working feature | **feature-development** |
| Product idea | Market launch | **product-development** |
| Legacy code | Modern architecture | **code-refactoring** |
| Business requirements | Technical specification | **brd-to-trd-translation** |
| New project | AI setup | **project-initialization** |
| Infrastructure needs | Production environment | **infrastructure-setup** |

### By Complexity Level
| Complexity | Timeframe | Workflows |
|------------|-----------|-----------|
| **Simple** | Hours to 1 day | quick-fix |
| **Standard** | 1-5 days | trd-creation, brd-creation, project-initialization |
| **Complex** | 1-4 weeks | feature-development, code-refactoring, brd-to-trd-translation |
| **Advanced** | 1+ months | product-development, infrastructure-setup |

## 🧠 Smart Execution Features

### Intelligent Validation
- **Context Awareness**: Skips steps without required context
- **Prerequisites Check**: Validates dependencies before execution  
- **Auto-Skipping**: Bypasses optional steps based on conditions
- **Progress Tracking**: Real-time workflow progress monitoring

### Skip Conditions Examples
- **Architecture Analysis**: Skipped for simple features or when `no_architecture_impact` flag is set
- **Testing**: Skipped for trivial changes in quick-fix when `emergency_hotfix` condition is met
- **Stakeholder Approval**: Skipped for internal projects when `no_formal_approval_needed` is set

## 🔄 Common Workflow Flows

### Emergency Flow
```
Critical Bug → quick-fix → [Optional: feature-development for proper fix]
```

### Feature Development Flow  
```
Feature Idea → trd-creation → feature-development → [product-development for major features]
```

### Product Development Flow
```
Product Idea → brd-creation → product-development → infrastructure-setup
```

### New Project Flow
```
New Codebase → project-initialization → [Choose development workflow]
```

### Migration Flow
```
Legacy System → code-refactoring → feature-development → infrastructure-setup
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
- **Planning & Documentation**: trd-creation, brd-creation, brd-to-trd-translation
- **Development**: feature-development, quick-fix, code-refactoring
- **Product & Launch**: product-development
- **Setup & Operations**: project-initialization, infrastructure-setup

## 📊 Success Criteria

### For All Workflows
- ✅ Requirements clearly defined and documented
- ✅ All tests pass and quality gates met
- ✅ No regressions in existing functionality  
- ✅ Documentation updated and current
- ✅ Stakeholder approval obtained (where required)

### Workflow-Specific Success Metrics
- **Feature Development**: TRD created, feature deployed, requirements validated
- **Product Development**: Market launch successful, user adoption metrics positive
- **Quick Fix**: Issue resolved, no side effects, minimal disruption
- **Infrastructure**: Environment stable, monitoring active, security configured

---

**🚀 AI Agents Playbook** - Intelligent workflows for modern development teams

**Next Steps**: Use the MCP server for AI-powered workflow discovery, or browse individual workflows for manual execution. 