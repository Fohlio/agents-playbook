# TRD • Mini-Prompts Architecture for Workflow System

## 📋 Overview
**Project**: Refactor AI Workflow System to use composable mini-prompts  
**Repository**: `agents-playbook`  
**Complexity**: Standard (6/10)  
**Status**: 🔄 **PLANNING**
**Goal**: Create smart workflow system with dynamic step validation and skipping

## 🎯 Problem Statement

### Current Issues
- **Navigation Confusion**: Users get lost in 8-11 step workflows
- **No Reusability**: Similar steps repeated across workflows
- **Maintenance Overhead**: Changes require updating multiple files
- **Poor UX**: "Step 1 of 1" parsing errors, unclear progress
- **No Intelligence**: Can't skip irrelevant steps based on context

### Root Cause
Monolithic workflow files without smart validation or context awareness.

## 💡 Proposed Solution: Three-Level Smart Architecture

### Core Concept
**Workflow** = High-level task configuration (stored in database)  
**Phases** = Logical groupings of related work  
**Steps** = Atomic mini-prompts with validation and prerequisites  
**Smart Skipping** = Auto-skip steps when prerequisites missing

> **Alternative to Multi-Agent Systems**: One intelligent agent with different tasks and tools per step

### Architecture Design

```
📋 WORKFLOWS (Database-stored configs)
├── quick-fix.yaml
├── feature-development.yaml  
├── feature-analysis.yaml
├── feature-migration.yaml
├── code-refactoring.yaml
├── trd-creation.yaml
├── brd-creation.yaml
├── product-development.yaml
└── project-initialization.yaml

🔄 PHASES (Logical groupings)  
├── planning-clarification.md
├── analysis.md
├── design-architecture.md  
├── implementation.md
├── testing-validation.md
├── deployment-operations.md
└── completion-reflection.md

⚡ STEPS (Mini-prompts with validation)
├── development/
│   ├── ask-clarifying-questions.md
│   ├── design-architecture.md
│   ├── implement-feature.md
│   └── code-review.md
├── analysis/
│   ├── trace-bug-root-cause.md
│   ├── feature-analysis.md
│   ├── code-analysis.md
│   └── architecture-analysis.md  
├── qa/
│   ├── create-test-plan.md
│   ├── execute-tests.md
│   └── validate-requirements.md
├── business/
│   ├── gather-requirements.md
│   └── document-decisions.md
├── operations/
│   ├── deploy-with-monitoring.md
│   ├── setup-alerts.md
│   └── rollback-plan.md
└── migration/
    ├── assess-migration-scope.md
    ├── create-migration-plan.md
    ├── data-migration.md
    └── validate-migration.md
```

## 🔧 Technical Implementation

### Step Format with Prerequisites
```markdown
# Step • Trace Bug Root Cause

## Purpose
Identify the exact source of the reported issue through systematic analysis.

## Prerequisites
**Required MCP Servers**: 
- None (uses standard coding agent tools)

**Required Context**:
- Bug symptoms and reproduction steps (from previous step)
- Error logs or stack traces (if available)

**Optional Context**:
- Existing test suite
- Performance monitoring data

## Validation Logic
```javascript
canExecute() {
  return hasContext('bug_symptoms') &&
         hasContext('reproduction_steps');
}
```

## Process
1. **Reproduce the issue** - Follow reported steps exactly
2. **Analyze logs** - Check error logs and stack traces  
3. **Trace code flow** - Map user action to code execution
4. **Document findings** - Create clear root cause analysis

## Inputs
- Bug symptoms (from previous step)
- Reproduction steps
- Error messages/logs

## Outputs  
- Root cause analysis
- Code location of issue
- Impact assessment
- Fix complexity estimate

## Success Criteria
- Root cause clearly identified with evidence
- Code location pinpointed
- Impact and fix scope understood

## Skip Conditions
- No bug symptoms from previous step
- Issue already has documented root cause
```

### Additional Examples

```markdown
# Step • AI Browser Testing

## Purpose
Automatically test web application features using browser automation.

## Prerequisites
**Required MCP Servers**: 
- `playwright` (browser automation)

**Required Context**:
- Implemented feature or fix
- Application URL and access credentials

**Optional Context**:
- Existing test scenarios
- User acceptance criteria

## Validation Logic
```javascript
canExecute() {
  return hasMCPServer('playwright') &&
         hasContext('implemented_feature') &&
         hasContext('application_url');
}
```

## Skip Conditions
- Playwright MCP server not available
- No web application to test
- Application not accessible

# Step • Research New Libraries

## Purpose
Research and evaluate new libraries using up-to-date documentation.

## Prerequisites
**Required MCP Servers**: 
- `context7` (library documentation)

**Required Context**:
- Technology requirements from clarification
- Project constraints and preferences

**Optional Context**:
- Existing technology stack
- Performance requirements

## Validation Logic
```javascript
canExecute() {
  return hasMCPServer('context7') &&
         hasContext('technology_requirements');
}
```

## Skip Conditions
- context7 MCP server not available
- No new libraries mentioned in requirements
- Technology stack already defined
```

### Phase Format
```markdown
# Phase • Analysis

## Purpose
Systematically analyze the problem space to understand current state and requirements.

## Steps Sequence
1. **trace-bug-root-cause** [if: bug_report_workflow]
2. **feature-analysis** [if: existing_feature_involved]  
3. **code-analysis** [if: code_refactoring_needed]
4. **architecture-analysis** [if: system_design_changes]
5. **performance-analysis** [if: performance_concerns]
6. **security-review** [if: security_implications]

## Phase Prerequisites
- Problem statement from Planning phase
- Access to relevant codebase/documentation

## Phase Success Criteria
- Current state fully understood
- Problem scope clearly defined
- Technical constraints identified
- Solution approach outlined

## Skip Conditions
- Analysis already completed
- Problem is trivial/well-understood
- Emergency fix required (skip to Implementation)
```

### Workflow Format with Smart Validation
```yaml
# workflows/quick-fix.yaml
name: "Quick Bug Fix"
description: "Rapid resolution of production issues"
complexity: "Simple"
category: "maintenance"

phases:
  - name: "planning-clarification"
    required: true
    steps:
      - id: "ask-clarifying-questions"
        mini_prompt: "development/ask-clarifying-questions"
        required: true
        prerequisites:
          mcp_servers: []
          context: ["task_description"]
          
  - name: "analysis"  
    required: true
    steps:
      - id: "trace-root-cause"
        mini_prompt: "analysis/trace-bug-root-cause"
        prerequisites:
          mcp_servers: []
          context: ["bug_symptoms", "reproduction_steps"]
          optional: ["error_logs", "monitoring_data"]
        
  - name: "implementation"
    required: true  
    steps:
      - id: "implement-fix"
        mini_prompt: "development/implement-feature"
        prerequisites:
          mcp_servers: []
          context: ["root_cause_analysis"]
          
  - name: "testing-validation"
    required: false
    steps:
      - id: "execute-tests"
        mini_prompt: "qa/execute-tests"  
        prerequisites:
          mcp_servers: []
          context: ["implemented_fix"]
          optional: ["test_suite"]
        skip_if_missing: ["test_suite"]
        
      - id: "ai-browser-testing"
        mini_prompt: "qa/ai-browser-testing"
        prerequisites:
          mcp_servers: ["playwright"]
          context: ["implemented_fix", "application_url"]
        skip_if_missing: ["playwright"]
        
  - name: "deployment-operations"
    required: false
    steps:
      - id: "deploy-with-monitoring"
        mini_prompt: "operations/deploy-with-monitoring"
        prerequisites:
          mcp_servers: []
          context: ["validated_fix"]
          optional: ["deployment_config", "monitoring_setup"]
        skip_if_missing: ["deployment_config"]

execution_strategy: "smart_skip"
estimated_duration: "0.5-2 days"

# workflows/feature-analysis.yaml  
name: "Feature Analysis"
description: "Deep analysis of existing feature for understanding or migration"
complexity: "Standard" 
category: "analysis"

phases:
  - name: "planning-clarification"
    required: true
    steps:
      - id: "ask-questions"
        mini_prompt: "development/ask-clarifying-questions"
        context: "Focus on: analysis purpose, feature boundaries, constraints"
        prerequisites:
          mcp_servers: []
          context: ["task_description"]
          
      - id: "research-libraries"
        mini_prompt: "planning/research-new-libraries"
        prerequisites:
          mcp_servers: ["context7"]
          context: ["clarified_requirements"]
          optional: ["technology_preferences"]
        skip_if_missing: ["new_libraries_mentioned"]
        
  - name: "analysis"
    required: true
    steps:
      - id: "feature-analysis"
        mini_prompt: "analysis/feature-analysis"
        prerequisites:
          mcp_servers: []
          context: ["feature_scope"]
          optional: ["library_research_results"]
          
      - id: "architecture-analysis"  
        mini_prompt: "analysis/architecture-analysis"
        prerequisites:
          mcp_servers: []
          context: ["feature_analysis_results"]
          optional: ["library_compatibility_data"]
          
      - id: "dependency-analysis"
        mini_prompt: "analysis/dependency-analysis"
        prerequisites:
          mcp_servers: ["context7"]
          context: ["architecture_analysis"]
          optional: ["external_libraries"]
        skip_if_missing: ["external_dependencies"]
        
  - name: "completion-reflection"
    required: true
    steps:
      - id: "document-findings"
        mini_prompt: "business/document-decisions"
        context: "Create TRD with comprehensive analysis results"
        prerequisites:
          mcp_servers: []
          context: ["analysis_results", "architecture_findings"]
          optional: ["dependency_analysis", "library_recommendations"]
```

### Enhanced MCP Tools with Smart Validation

```typescript
interface StepValidation {
  hasRequiredMCP: boolean;
  hasRequiredContext: boolean; 
  hasOptionalContext: string[];
  canExecute: boolean;
  skipReasons: string[];
}

interface WorkflowStep {
  id: string;
  miniPrompt: MiniPrompt;
  phase: string;
  stepNumber: number;
  totalSteps: number;
  validation: StepValidation;
  prerequisites: {
    mcp_servers: string[];
    context: string[];
    optional: string[];
  };
  skipIfMissing: string[];
}

// Enhanced get_next_step with smart validation
get_next_step(workflow_id, current_step) → {
  workflow: "Feature Analysis",
  currentPhase: {
    name: "Analysis", 
    stepInPhase: 2,
    totalInPhase: 2
  },
  currentStep: {
    stepNumber: 3,
    totalSteps: 4, // After smart skipping
    miniPrompt: {
      title: "Architecture Analysis",
      purpose: "Analyze system architecture and dependencies",
      process: ["Map component relationships", "Identify bottlenecks", "Document patterns"],
      prerequisites: {
        mcp_servers: [],
        context: ["feature_analysis_results"],
        optional: ["library_compatibility_data"]
      }
    },
    validation: {
      hasRequiredMCP: true,
      hasRequiredContext: true,
      hasOptionalContext: [],
      canExecute: true,
      skipReasons: []
    },
    progress: "75% complete (Step 3/4)",
    note: "Skipped 2 steps: research-libraries (no new libs), dependency-analysis (no context7)"
  },
  skippedSteps: [
    {id: "research-libraries", reason: "No new libraries mentioned in requirements"},
    {id: "dependency-analysis", reason: "context7 MCP server not available"}
  ]
}
```

### Smart Validation Engine

```typescript
class WorkflowValidator {
  validateStep(step: WorkflowStep, context: ExecutionContext): StepValidation {
    const validation = {
      hasRequiredMCP: this.checkMCPServers(step.prerequisites.mcp_servers),
      hasRequiredContext: this.checkContext(step.prerequisites.context, context),
      hasOptionalContext: this.getAvailableOptional(step.prerequisites.optional, context),
      canExecute: false,
      skipReasons: []
    };
    
    // Check if can execute
    validation.canExecute = validation.hasRequiredMCP && 
                           validation.hasRequiredContext;
    
    // Check skip conditions
    const missing = step.skipIfMissing.filter(item => 
      !context.hasContext(item) && !this.hasMCPServer(item)
    );
    
    if (missing.length > 0) {
      validation.canExecute = false;
      validation.skipReasons = missing.map(item => `Missing: ${item}`);
    }
    
    return validation;
  }
  
  checkMCPServers(requiredServers: string[]): boolean {
    return requiredServers.every(server => this.mcpRegistry.isAvailable(server));
  }
  
  checkContext(requiredContext: string[], context: ExecutionContext): boolean {
    return requiredContext.every(ctx => context.hasContext(ctx));
  }
  
  getAvailableOptional(optionalItems: string[], context: ExecutionContext): string[] {
    return optionalItems.filter(item => context.hasContext(item));
  }
  
  getNextExecutableStep(workflow: Workflow, currentStep: number): WorkflowStep | null {
    for (let i = currentStep + 1; i < workflow.steps.length; i++) {
      const step = workflow.steps[i];
      const validation = this.validateStep(step, this.context);
      
      if (validation.canExecute) {
        return { ...step, validation };
      }
      
      // Log skipped step with detailed reason
      this.logSkippedStep(step, validation.skipReasons);
    }
    
    return null; // Workflow complete
  }
}
```

## 👥 User Flow with Smart Skipping

### Discovery Flow
```
1. User: "I need to fix a bug"  
   ↓
2. System: Search finds "Quick Bug Fix" workflow
   ↓
3. System: Validates all steps, plans execution path
   ↓  
4. User: select_workflow("quick-fix")
   ↓
5. System: "Starting 3-step workflow (5 steps total, 2 auto-skipped)"
```

### Execution Flow with Validation
```
Phase 1: Planning & Clarification
├── Step 1: Ask Clarifying Questions ✅
│   ├── MCP: ✅ None required  
│   ├── Context: ✅ Task description provided
│   └── Ready to execute
└── Step 2: Research New Libraries ⏭️ SKIPPED
    ├── MCP: ❌ context7 not available
    ├── Reason: No context7 MCP server
    └── Auto-skip enabled

Phase 2: Analysis  
├── Step 3: Feature Analysis ✅
│   ├── MCP: ✅ None required
│   ├── Context: ✅ Feature scope from Step 1
│   └── Ready to execute
├── Step 4: Architecture Analysis ✅
│   ├── MCP: ✅ None required  
│   ├── Context: ✅ Feature analysis results from Step 3
│   └── Ready to execute
└── Step 5: Dependency Analysis ⏭️ SKIPPED
    ├── MCP: ❌ context7 not available
    ├── Reason: External dependencies require context7
    └── Auto-skip enabled

Phase 3: Testing & Validation
├── Step 6: Execute Tests ✅
│   ├── MCP: ✅ None required
│   ├── Context: ✅ Implementation results available
│   └── Ready to execute
└── Step 7: AI Browser Testing ⏭️ SKIPPED
    ├── MCP: ❌ playwright not available  
    ├── Reason: Browser automation requires playwright
    └── Auto-skip enabled

Final: 4 executable steps out of 7 total (57% execution rate)
Smart skipping saved time on 3 irrelevant/impossible steps
```

### Enhanced Navigation Experience
```
## Feature Analysis - Step 3 of 4 (Phase 2: Analysis)

### 🏗️ Architecture Analysis

**Purpose**: Analyze system architecture and dependencies

**Prerequisites Status**:
✅ MCP Servers: None required (standard coding tools)
✅ Context: Feature analysis results (from Step 2)
⚪ Optional: Library compatibility data (not available)

**Your Task**:
1. **Map component relationships** - Identify how components interact
2. **Identify bottlenecks** - Find performance and scalability issues  
3. **Document patterns** - Record architectural decisions and patterns

**Available Context**: Feature scope, component boundaries
**Expected Output**: Architecture analysis with recommendations

**Progress**: 75% complete (Step 3/4)
**Note**: Auto-skipped 2 steps (no new libraries, no context7 MCP)
**Next**: Use `get_next_step` with current_step=3 to continue
```

## 🎯 Benefits

### Smart Workflow Execution
- **Context Awareness**: Only shows relevant steps
- **Resource Validation**: Checks tools/docs before execution
- **Auto-Skipping**: Gracefully handles missing prerequisites  
- **Single Agent**: One intelligent agent vs complex multi-agent setup

### User Experience
- **Faster Completion**: Skip irrelevant steps automatically
- **Clear Validation**: Know exactly what's needed for each step
- **Better Context**: Understand why steps are skipped
- **Realistic Progress**: Accurate completion estimates

### System Intelligence
- **Dynamic Adaptation**: Workflow changes based on available resources
- **Prerequisite Tracking**: Smart dependency management
- **Validation Engine**: Robust step execution planning
- **Database Storage**: Workflow configs stored and versioned

## 📊 Implementation Plan

### Phase 1: Core Architecture (2-3 days)
- [ ] Design three-level hierarchy schemas
- [ ] Create validation engine with prerequisite checking
- [ ] Implement smart step skipping logic
- [ ] Create 7 core phases:
  - [ ] planning-clarification.md
  - [ ] analysis.md  
  - [ ] design-architecture.md
  - [ ] implementation.md
  - [ ] testing-validation.md
  - [ ] deployment-operations.md
  - [ ] completion-reflection.md

### Phase 2: Mini-Prompts with Validation (2-3 days)
- [ ] Create 25+ mini-prompts with prerequisites:
  - [ ] **Development**: ask-clarifying-questions, design-architecture, implement-feature, code-review
  - [ ] **Analysis**: trace-bug-root-cause, feature-analysis, code-analysis, architecture-analysis, performance-analysis, security-review
  - [ ] **QA**: create-test-plan, execute-tests, validate-requirements
  - [ ] **Business**: gather-requirements, document-decisions
  - [ ] **Operations**: deploy-with-monitoring, setup-alerts, rollback-plan
  - [ ] **Migration**: assess-migration-scope, create-migration-plan, data-migration, validate-migration

### Phase 3: Workflow Migration (2-3 days)
- [ ] Convert all 10 existing workflows with smart validation:
  - [ ] quick-fix.yaml (3-5 executable steps)
  - [ ] feature-analysis.yaml (4-6 executable steps)
  - [ ] feature-migration.yaml (6-8 executable steps) 
  - [ ] code-refactoring.yaml (5-7 executable steps)
  - [ ] feature-development.yaml (6-9 executable steps)
  - [ ] trd-creation.yaml (4-6 executable steps)
  - [ ] brd-creation.yaml (3-5 executable steps)
  - [ ] brd-to-trd-translation.yaml (3-4 executable steps)
  - [ ] product-development.yaml (8-12 executable steps)
  - [ ] project-initialization.yaml (5-8 executable steps)
- [ ] Update MCP tools for validation and smart skipping
- [ ] Add database storage for workflow configurations
- [ ] Generate embeddings for new structure

## 🧪 Success Metrics

### Smart Execution
- **Skip Accuracy**: 95%+ of auto-skipped steps are actually unnecessary
- **Validation Accuracy**: Prerequisites correctly identify executable steps
- **Completion Rate**: Higher workflow completion due to realistic scope
- **Time Efficiency**: 30%+ faster execution through smart skipping

### User Experience  
- **Navigation Clarity**: Users understand current step and why others skipped
- **Progress Accuracy**: Realistic completion estimates based on executable steps
- **Context Understanding**: Clear prerequisite validation and skip reasons

### Technical Goals
- **Modularity**: 90%+ step reuse across workflows
- **Intelligence**: Dynamic adaptation based on available resources
- **Reliability**: Robust validation prevents execution failures
- **Scalability**: Easy addition of new steps and validation rules

## 📋 Business Case Coverage

### All Existing Workflows Enhanced with Smart Validation
✅ **Quick Fix** → 3-5 executable steps (auto-skip testing/deployment if not available)  
✅ **Feature Analysis** → 4-6 executable steps (smart component analysis)  
✅ **Feature Migration** → 6-8 executable steps (adaptive migration scope)  
✅ **Code Refactoring** → 5-7 executable steps (context-aware refactoring)  
✅ **Feature Development** → 6-9 executable steps (full development lifecycle)  
✅ **TRD Creation** → 4-6 executable steps (technical documentation)  
✅ **BRD Creation** → 3-5 executable steps (business documentation)  
✅ **BRD to TRD Translation** → 3-4 executable steps (document conversion)  
✅ **Product Development** → 8-12 executable steps (comprehensive planning)  
✅ **Project Initialization** → 5-8 executable steps (project setup)  

### New Capabilities
- **Smart Adaptation**: Workflows automatically adjust to available resources
- **Prerequisite Intelligence**: Only execute steps that can actually be completed
- **Context Awareness**: Steps understand their environment and dependencies
- **Single Agent Architecture**: Alternative to complex multi-agent systems

---
**Status**: Ready for implementation  
**Priority**: High (Core UX improvement + Smart execution)  
**Estimated Timeline**: 6-9 days total  
**Success Definition**: Intelligent, adaptive workflow system with smart validation and skipping 