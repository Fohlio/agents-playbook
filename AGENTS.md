# 🤖 AGENTS.MD

**AI Agent Instructions for agents-playbook repository**

## Repository Overview
This is a **production-ready workflow automation repository** for AI agents in software development. It provides **YAML-based workflows**, **modular mini-prompts**, **AI-powered semantic search**, and **agent handoff system** to help AI agents perform development tasks efficiently with seamless context transfer.

## Key Files & Structure

### 📋 Navigation & Discovery
- **`playbook/prompt-playbook.md`** - MAIN NAVIGATOR - complete workflow guide and decision matrix
- **`README.md`** - Public documentation and MCP server setup guide
- **MCP Server** - AI-powered workflow discovery
  - **Production**: https://agents-playbook.vercel.app/api/mcp
  - **Local Dev**: http://localhost:3000/api/mcp

### 🎯 Core Architecture

#### 🔧 YAML Workflows (`playbook/workflows/`)
- **feature-development.yml** - Complete feature development lifecycle (14 steps)
- **product-development.yml** - Product from idea to launch (15 steps) 
- **quick-fix.yml** - Bug fixes and hotfixes (4 steps)
- **code-refactoring.yml** - Code architecture improvements (8 steps)
- **fix-tests.yml** - Systematic test failure diagnosis and repair with refactoring integration (8 steps)
- **fix-circular-dependencies.yml** - Comprehensive circular dependency resolution with architectural refactoring (7 steps)
- **unit-test-coverage.yml** - Comprehensive unit test coverage improvement (7 steps)
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
- `implement-feature.md` - Feature implementation guidance
- `fix-circular-dependencies.md` - Circular dependency resolution

**Review Phase** (`review/`)
- `code-review.md` - Code quality assessment and improvement recommendations
- `trd-review.md` - Technical requirements document review and validation
- `deliverable-review.md` - Universal deliverable quality assessment

**QA Phase** (`qa/`)
- `create-test-plan.md` - Test planning and strategy
- `execute-tests.md` - Test execution and validation
- `validate-requirements.md` - Requirements validation and acceptance
- `analyze-test-failures.md` - Test failure analysis and diagnosis
- `analyze-test-coverage.md` - Test coverage analysis and improvement
- `fix-test-issues.md` - Test issue resolution and fixes
- `write-unit-tests.md` - Unit test creation and implementation

**Handoff System**
- `handoff-memory-board.md` - Agent context transfer and communication system



## AI Agent Guidelines

### When User Asks for Help

#### 1. Use MCP Server (Recommended)
```bash
# Start development server
npm run dev

# Test with MCP Inspector
DANGEROUSLY_OMIT_AUTH=true npx @modelcontextprotocol/inspector@latest http://localhost:3000/api/mcp
# OR for production testing:
# DANGEROUSLY_OMIT_AUTH=true npx @modelcontextprotocol/inspector@latest https://agents-playbook.vercel.app/api/mcp
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

#### Test Issues
```
Tests Failing → fix-tests workflow (with refactoring integration)
Flaky Tests → fix-tests workflow (with refactoring integration)
Low Test Coverage → unit-test-coverage workflow
Need Unit Tests → unit-test-coverage workflow
Quality Gates → unit-test-coverage workflow
```

#### Circular Dependencies & Architecture
```
Circular Dependencies → fix-circular-dependencies workflow
Module Dependency Cycles → fix-circular-dependencies workflow
Import/Export Issues → fix-circular-dependencies workflow
Architectural Debt → fix-circular-dependencies workflow → code-refactoring
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
Legacy Code Without Tests → unit-test-coverage → code-refactoring
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
- "tests failing" → fix-tests (🎯 91%)
- "circular dependencies" → fix-circular-dependencies (🎯 95%)
- "import export issues" → fix-circular-dependencies (🎯 87%)
- "module dependency cycles" → fix-circular-dependencies (🎯 93%)
- "implement new feature" → feature-development (🎯 92%)
- "improve test coverage" → unit-test-coverage (🎯 94%)
- "write unit tests" → unit-test-coverage (🎯 91%)
- "create technical documentation" → trd-creation (🎯 94%)
- "setup new project" → project-initialization (🎯 91%)

## Technical Integration

### Development & Testing
```bash
# Generate embeddings for semantic search
npm run build:embeddings

# Run comprehensive test suite (49+ tests)
npm run test:integration

# Start development server
npm run dev
```

### MCP Server Integration
- **Production Ready**: Comprehensive test coverage and validation
- **Smart Validation**: Automatic step skipping based on context
- **Error Handling**: Graceful fallbacks and error recovery
- **Performance**: Fast semantic search with OpenAI embeddings (falls back to text search)
- **Refactoring Integration**: Built-in refactoring proposal and approval workflow

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
- Refactoring integration improves code quality systematically
- Documentation stays current and accurate
- Test coverage remains comprehensive (50+ tests passing)

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