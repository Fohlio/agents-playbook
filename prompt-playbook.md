# Prompt Playbook

Collection of specialized prompts for AI-driven software development and product management tasks.

## 📋 Available Prompts

### 1. [Product Development from Scratch](product-development-prompt.md)
**Purpose**: Complete product development process from concept to first TRD  
**Use Case**: When you have a product idea and need comprehensive discovery, planning, and specification  
**Complexity**: High - requires extensive analysis and planning
**Output**: PRD summary, feature breakdown, testing strategy, MVP definition, and first TRD

### 2. [TRD Creation from Scratch](trd-creation-prompt.md)
**Purpose**: Create detailed Technical Requirements Document for specific features  
**Use Case**: When you have a clear feature idea and need to turn it into actionable technical requirements  
**Complexity**: Medium - focused technical analysis and specification
**Output**: Complete TRD following the [template](trd-template.md)

### 3. [BRD to TRD Translation](brd-to-trd-translation-prompt.md)
**Purpose**: Translate Business Requirements Document into Technical Requirements  
**Use Case**: When you have a BRD and need to analyze codebase and create corresponding TRD  
**Complexity**: Medium - requires codebase analysis and technical translation
**Output**: Comprehensive TRD based on existing BRD and focused codebase analysis

### 4. [Quick Bug Fixes & Mini-Features](quick-fix-prompt.md)
**Purpose**: Rapid resolution of bugs and implementation of small features  
**Use Case**: When you need to fix bugs or add small features without full documentation overhead  
**Complexity**: Simple to Medium - quick assessment and implementation
**Output**: Working solution with minimal documentation

### 5. [Development Kickoff](development-kickoff-prompt.md)
**Purpose**: Systematic development process from TRD to implementation  
**Use Case**: When you have a complete TRD and ready to begin development with automated testing and documentation  
**Complexity**: Variable - adapts based on implementation complexity assessment
**Output**: Working implementation with comprehensive tests and updated documentation

### 6. [N8N Workflow Creation](n8n-workflow-prompt.md)
**Purpose**: Create automated workflows using n8n platform  
**Use Case**: When you need to automate business processes, integrate systems, or create data pipelines  
**Complexity**: Medium - workflow design and configuration
**Output**: Ready-to-import n8n JSON workflow file

## 📝 Document Templates

### Business Requirements
- [BRD Template](brd-template.md) - Comprehensive business requirements document
- [BRD Basic Template](brd-basic-template.md) - Simplified business requirements template

### Technical Requirements  
- [TRD Template](trd-template.md) - Complete technical requirements document template

## 🤖 AI-Driven Development Guide

### Automation Levels
**High Automation**: Well-defined patterns, existing codebase extensions, simple fixes
- Use Quick Fix prompt for established patterns
- Leverage automated testing and validation
- Minimal human intervention required

**Medium Automation**: New features with known patterns, standard integrations
- Use TRD Creation → Development Kickoff flow
- Combine automated analysis with manual review
- Moderate complexity requiring planning

**Low Automation**: Architectural changes, new technology, complex business logic
- Use Product Development for comprehensive planning
- Require extensive analysis and human guidance
- High complexity with multiple unknowns

### Complexity Assessment Matrix
| Indicators | Simple | Standard | Complex |
|------------|--------|----------|---------|
| New Dependencies | None | Few | Many |
| Architecture Changes | None | Minor | Major |
| Integration Points | None/Existing | Some | Multiple/New |
| Business Logic | Straightforward | Moderate | Complex |

## 🎯 Enhanced Decision Matrix

| Scenario | Complexity | Urgency | Automation Level | Recommended Prompt | Why |
|----------|------------|---------|------------------|--------------------|-----|
| Production bug fix | Simple-Medium | Critical | High | [Quick Fix](quick-fix-prompt.md) | Rapid resolution with minimal risk |
| New product idea, unclear requirements | Complex | Low | Low | [Product Development](product-development-prompt.md) | Need comprehensive discovery and planning |
| Clear feature request, need technical spec | Standard | Normal | Medium | [TRD Creation](trd-creation-prompt.md) | Direct path to technical requirements |
| Have BRD, need technical implementation | Standard-Complex | Normal | Medium | [BRD to TRD Translation](brd-to-trd-translation-prompt.md) | Systematic translation with codebase analysis |
| Have TRD, ready to start development | Variable | Normal | High | [Development Kickoff](development-kickoff-prompt.md) | Automated implementation with quality assurance |
| Small enhancement or improvement | Simple | Normal | High | [Quick Fix](quick-fix-prompt.md) | Rapid implementation without overhead |
| Need to automate business processes | Medium | Normal | Medium | [N8N Workflow](n8n-workflow-prompt.md) | Create automated workflows and integrations |

## 🚨 Emergency Procedures

### Critical Production Issues
For critical bugs or system outages:
1. **Immediate assessment**: Use Quick Fix prompt with minimal planning
2. **Focus on impact**: Prioritize fixing user-facing issues
3. **Leverage automation**: Use existing patterns and automated testing
4. **Document later**: Focus on resolution first, documentation second

### Hotfix Process
- Skip extensive planning phases
- Use existing code patterns
- Implement minimal viable fix
- Plan proper solution for later if needed

## 🔄 Process Flow

```
New Product Idea → Product Development from Scratch → First TRD → Development Kickoff → Implementation

Feature Request → TRD Creation from Scratch → Development Kickoff → Implementation

Business Requirements → BRD to TRD Translation → Development Kickoff → Implementation

Bug/Small Feature → Quick Fix Process → Implementation (with complexity assessment)

Automation Need → N8N Workflow Creation → Automated Process
```

## 🛠️ Getting Started

### Step 1: Assess Your Situation
1. **What do you have?** (Product idea, BRD, TRD, bug report)
2. **What's the complexity?** (Use complexity assessment matrix)
3. **What's the urgency?** (Critical, normal, planned)
4. **What automation is possible?** (High, medium, low)

### Step 2: Choose Your Path
Use the enhanced decision matrix to select the appropriate prompt based on your assessment.

### Step 3: Follow the Process
Each prompt includes:
- Clear scope and complexity guidance
- Automation recommendations
- Quality assurance steps
- Integration with other prompts

### Step 4: Leverage AI Capabilities
- **Use automated codebase analysis** when available
- **Leverage existing patterns** and conventions
- **Automate testing and validation** wherever possible
- **Follow established workflows** for consistency

## 📊 Success Indicators

### For Simple Tasks
- ✅ Problem resolved quickly
- ✅ No regression issues
- ✅ Minimal manual testing required
- ✅ Automated validation passes

### For Standard Tasks  
- ✅ Requirements clearly defined
- ✅ Implementation follows existing patterns
- ✅ Comprehensive testing coverage
- ✅ Documentation updated appropriately

### For Complex Tasks
- ✅ Thorough analysis and planning completed
- ✅ Stakeholder alignment achieved
- ✅ Phased implementation strategy defined
- ✅ Risk mitigation strategies in place

---

*This playbook is designed for AI-driven development with emphasis on automation, pattern recognition, and efficient delivery. Each prompt adapts to different complexity levels while maintaining quality standards.*


