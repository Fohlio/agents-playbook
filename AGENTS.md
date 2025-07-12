# 🤖 AGENTS.MD

**AI Agent Instructions for agents-playbook repository**

## Repository Overview
This is a **production-ready workflow automation repository** for AI agents in software development. It provides **YAML-based workflows**, **modular mini-prompts**, and **AI-powered semantic search** to help AI agents perform development tasks efficiently.

## Key Files & Structure

### 📋 Navigation & Discovery
- **`playbook/prompt-playbook.md`** - MAIN NAVIGATOR - complete workflow guide and decision matrix
- **`README.md`** - Public documentation and MCP server setup guide
- **MCP Server** - http://localhost:3000/api/mcp - AI-powered workflow discovery

### 🎯 Core Architecture

#### 🔧 YAML Workflows (`playbook/workflows/`)
- **feature-development.yml** - Complete feature development lifecycle (14 steps)
- **product-development.yml** - Product from idea to launch (15 steps) 
- **quick-fix.yml** - Bug fixes and hotfixes (4 steps)
- **code-refactoring.yml** - Code architecture improvements (8 steps)
- **trd-creation.yml** - Technical Requirements Document creation (7 steps)
- **project-initialization.yml** - New project setup (5 steps)

#### 🧱 Mini-Prompts Library (`playbook/mini-prompts/`)

**Business Phase** (`business/`)
- `gather-requirements.md` - Requirements collection and analysis
- `document-decisions.md` - Decision documentation and rationale

**Analysis Phase** (`analysis/`)
- `feature-analysis.md` - Feature scope and impact analysis
- `architecture-analysis.md` - System architecture evaluation
- `code-analysis.md` - Code quality and structure analysis
- `trace-bug-root-cause.md` - Bug investigation and root cause analysis

**Development Phase** (`development/`)
- `design-architecture.md` - Solution architecture and design
- `ask-clarifying-questions.md` - Requirements clarification
- `code-review.md` - Code quality review and feedback
- `implement-feature.md` - Feature implementation guidance

**Operations Phase** (`operations/`)
- `deploy-application.md` - Application deployment procedures
- `monitor-system-health.md` - System monitoring and alerting

**QA Phase** (`qa/`)
- `create-test-plan.md` - Test planning and strategy
- `execute-tests.md` - Test execution and validation
- `validate-requirements.md` - Requirements validation and acceptance



## AI Agent Guidelines

### When User Asks for Help

#### 1. Use MCP Server (Recommended)
```bash
# Start development server
npm run dev

# Test with MCP Inspector
DANGEROUSLY_OMIT_AUTH=true npx @modelcontextprotocol/inspector@latest http://localhost:3000/api/mcp
```

**MCP Tools Available:**
- `get_available_workflows` - AI semantic search for workflows
- `select_workflow` - Get complete workflow with smart execution plan
- `get_next_step` - Navigate step-by-step with intelligent validation

#### 2. Manual Navigation
1. **Always check `playbook/prompt-playbook.md` first** - complete decision matrix
2. **Identify what the user has** (bug, feature idea, BRD, TRD, etc.)
3. **Use semantic search** or decision guide to find the right workflow
4. **Include TRD integration** in development workflows [[memory:2316971]]
5. **Guide through smart execution** with context-aware step skipping

### Working with YAML Workflows

#### Smart Execution Features
- **Context Awareness**: System skips steps without required context
- **Prerequisites Validation**: Checks dependencies before execution
- **Auto-Skipping**: Bypasses optional steps based on conditions
- **Progress Tracking**: Real-time workflow progress monitoring

#### Prerequisites and Skip Conditions
- **Required Context**: Must have specific context to execute step
- **Optional Context**: Enhances step execution but not required
- **Skip Conditions**: Flags that cause steps to be automatically skipped
- **Dependencies**: Other steps that must complete first

### Common Scenarios & Workflow Selection

#### Emergency/Urgent Tasks
```
Critical Bug/Hotfix → quick-fix workflow
```

#### Feature Development
```
Feature Idea → trd-creation → feature-development (with TRD integration [[memory:2316971]])
Existing Requirements → feature-development
```

#### Product Development
```
Product Idea → product-development
```

#### New Projects
```
New Codebase → project-initialization → [choose development workflow]
```

#### Legacy Systems
```
Legacy Code → code-refactoring → feature-development
```

### Semantic Search Usage

#### Quality Indicators
- 🎯 **High Match** (80%+): Perfect workflow for the task
- ✅ **Good Match** (60-79%): Strong alignment with requirements  
- 👍 **Decent Match** (40-59%): Reasonable workflow option
- 🤔 **Okay Match** (20-39%): Partial alignment, consider alternatives
- ❓ **Poor Match** (<20%): Likely not the right workflow

#### Search Examples
- "fix critical production bug" → quick-fix (🎯 89%)
- "implement new feature" → feature-development (🎯 92%)
- "create technical documentation" → trd-creation (🎯 94%)
- "setup new project" → project-initialization (🎯 91%)

## Technical Integration

### Development & Testing
```bash
# Generate embeddings for semantic search
npm run build:embeddings

# Run comprehensive test suite (47 tests)
npm run test:integration

# Start development server
npm run dev
```

### MCP Server Integration
- **Production Ready**: Comprehensive test coverage and validation
- **Smart Validation**: Automatic step skipping based on context
- **Error Handling**: Graceful fallbacks and error recovery
- **Performance**: Fast semantic search with OpenAI embeddings

### Tool Integration Notes
- **Context7** - For library documentation access
- **GitHub/GitLab** - For repository operations, PRs, issues
- **Playwright** - For automated testing and validation
- **OpenAI** - For semantic search embeddings (falls back to text search)

## Repository Modifications

### Guidelines for Updates
- **DO NOT** modify existing mini-prompts without clear justification
- **DO** suggest improvements via new mini-prompts if patterns emerge
- **Focus on** helping users navigate and use existing workflows effectively
- **Keep workflows** technology-agnostic and reusable
- **Maintain** YAML structure and smart validation features

### Contributing New Content
- **New Workflows**: Follow YAML structure in `playbook/workflows/`
- **New Mini-Prompts**: Use existing phase categories in `playbook/mini-prompts/`
- **Testing**: Add integration tests for new workflows
- **Documentation**: Update decision guides and navigation

## Success Metrics
- User finds the right workflow quickly using semantic search
- Workflow produces expected output with smart execution
- Implementation meets requirements with proper validation
- Documentation stays current and accurate
- Test coverage remains comprehensive (47 tests passing)

## Emergency Situations
For urgent bugs or critical issues:
1. **Use `quick-fix` workflow immediately** - optimized for speed
2. **Skip optional steps** - system automatically handles this
3. **Follow up** with `feature-development` for proper implementation if needed
4. **Always validate** with QA mini-prompts after deployment

## Advanced Features

### Smart Step Skipping Examples
- **Architecture Analysis**: Auto-skipped for simple features
- **Testing**: Auto-skipped for trivial changes in emergency situations
- **Stakeholder Approval**: Auto-skipped for internal projects
- **Complex Setup**: Auto-skipped when prerequisites are missing

### Integration with TRD Process
All development workflows integrate with TRD creation [[memory:2316971]] for proper documentation and technical requirements management.

---
**Role:** Guide users to optimal workflows using AI-powered search and smart execution. Leverage the comprehensive YAML workflow system with mini-prompts for maximum efficiency and quality. 