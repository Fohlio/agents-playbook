# Agents Playbook - Multi-Agent Orchestrator for Cursor

A sophisticated Cursor extension that transforms workflow automation into multi-agent orchestration with isolated AI contexts.

## Overview

This extension implements the vision from the [agents-playbook repository](../README.md) by creating a multi-agent system where:

- **Orchestrator Agent** manages workflow execution and coordinates sub-agents
- **Sub-Agents** execute specific workflow stages with completely isolated AI contexts
- **Context Isolation** ensures each agent has clean token contexts with no history bleeding
- **Cursor UI Integration** provides validation interfaces and progress tracking
- **Tasks.md Integration** tracks agent assignments and workflow progress

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                  Cursor Extension                    │
├─────────────────────────────────────────────────────┤
│  ┌───────────────┐         ┌───────────────┐       │
│  │  Orchestrator │◄────────┤ Stage Manager │       │
│  │     Agent     │         │      UI       │       │
│  └───────┬───────┘         └───────────────┘       │
│          │                                          │
│  ┌───────▼────────────────────────────────┐        │
│  │        Sub-Agent Pool                   │        │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐│        │
│  │  │Analysis  │ │ Design   │ │Implement.││        │
│  │  │Sub-Agent │ │Sub-Agent │ │Sub-Agent ││        │
│  │  └──────────┘ └──────────┘ └──────────┘│        │
│  └──────────────────────────────────────────┘       │
│                                                     │
│  ┌─────────────────────────────────────────┐       │
│  │     Context Isolation Manager           │       │
│  │  ┌────────┐ ┌────────┐ ┌────────┐     │       │
│  │  │Context │ │Context │ │Context │     │       │
│  │  │Store 1 │ │Store 2 │ │Store 3 │     │       │
│  │  └────────┘ └────────┘ └────────┘     │       │
│  └─────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────┘
```

## Key Features

### 🤖 Multi-Agent System
- **Orchestrator Agent**: Coordinates workflow execution and manages agent assignments
- **Specialized Sub-Agents**: Analysis, Design, Planning, Implementation, Testing, Refactoring
- **Agent Pool Management**: Dynamic agent creation and lifecycle management

### 🔒 Context Isolation
- **Clean AI Contexts**: Each agent starts with a fresh, isolated AI context
- **No Token History Bleeding**: Previous conversations are completely isolated
- **Compressed Handoffs**: Essential context transferred between agents in compressed form
- **Token Budget Management**: Per-agent token limits and usage tracking

### 🎯 Workflow Integration
- **YAML Workflow Support**: Uses existing agents-playbook YAML workflow definitions
- **Mini-Prompt Loading**: Loads stage-specific prompts for each agent
- **Smart Execution**: Automatic step skipping based on prerequisites and conditions
- **Dependency Management**: Ensures proper stage execution order

### 📊 UI Components
- **Workflow Progress Sidebar**: Visual representation of workflow stages and completion
- **Agent Status Panel**: Real-time agent monitoring and resource usage
- **Validation Interface**: Stage-by-stage validation with approval/rejection controls
- **Tasks.md Integration**: Automatic progress tracking in markdown format

## Getting Started

### Prerequisites
- Cursor IDE with extension support
- Workspace with agents-playbook workflow definitions

### Installation
1. Clone or copy the extension to your development environment
2. Install dependencies: `npm install`
3. Compile the extension: `npm run compile`
4. Open the extension in Cursor's Extension Development Host

### Usage

#### 1. Start a Workflow
- Open Command Palette (`Cmd+Shift+P`)
- Run: "Agents Playbook: Start Workflow"
- Select from available workflows in your workspace

#### 2. Monitor Progress
- View the "Workflow Progress" panel in the Explorer sidebar
- Monitor agent assignments and stage completion
- Track token usage and execution time

#### 3. Validate Stages
- Extension automatically opens validation UI for each completed stage
- Review agent outputs and approve/reject/modify as needed
- Or manually trigger: "Agents Playbook: Validate Current Stage"

#### 4. Track in Tasks.md
- TASKS.md file is automatically created and updated
- Shows agent assignments, completion times, and token usage
- Provides audit trail for the entire workflow execution

## Configuration

Configure the extension through VS Code settings:

```json
{
  "agents-playbook.orchestrator.maxConcurrentAgents": 3,
  "agents-playbook.orchestrator.defaultTokenBudget": 10000,
  "agents-playbook.agents.analysisAgent.maxTokens": 8000,
  "agents-playbook.agents.implementationAgent.maxTokens": 15000,
  "agents-playbook.ui.showProgressSidebar": true,
  "agents-playbook.ui.autoOpenValidation": true
}
```

## Agent Types

### Analysis Agent
- **Purpose**: Requirements gathering, clarification, scope definition
- **Context**: Minimal requirements and product context
- **Outputs**: Structured requirements, user stories, acceptance criteria

### Design Agent
- **Purpose**: Technical architecture and design specifications
- **Context**: Requirements from analysis phase
- **Outputs**: System architecture, technical specifications, design decisions

### Planning Agent
- **Purpose**: Implementation planning and task breakdown
- **Context**: Requirements and design specifications
- **Outputs**: Implementation plan, task breakdown, resource planning

### Implementation Agent
- **Purpose**: Code generation and feature development
- **Context**: Design specifications and implementation plan
- **Outputs**: Working code, documentation, implementation notes

### Testing Agent
- **Purpose**: Quality assurance and validation
- **Context**: Implementation outputs and requirements
- **Outputs**: Test results, quality assessment, validation reports

### Refactoring Agent
- **Purpose**: Code optimization and quality improvement
- **Context**: Existing code and quality metrics
- **Outputs**: Improved code, performance optimizations, quality reports

## Context Isolation Strategy

### Token Context Management
Each agent receives:
- **System Prompt**: Role-specific instructions and constraints
- **Task Context**: Current stage requirements and objectives
- **Relevant Files**: Filtered file list based on stage needs
- **Handoff Summary**: Compressed context from previous stages (max 1000 tokens)

### Isolation Guarantees
- **No History Access**: Agents cannot access previous conversation history
- **Clean Slate Execution**: Each agent starts with fresh AI context
- **Controlled Context Size**: Token budgets enforced per agent
- **Selective Information Transfer**: Only essential context passed between agents

## Workflow File Structure

The extension expects workflows in the standard agents-playbook format:

```
workspace/
├── public/
│   └── playbook/
│       ├── workflows/
│       │   ├── feature-development.yml
│       │   ├── quick-fix.yml
│       │   └── code-refactoring.yml
│       └── mini-prompts/
│           ├── analysis/
│           ├── design-architecture/
│           ├── planning/
│           ├── implementation/
│           └── testing-review/
└── TASKS.md (auto-generated)
```

## Commands

- `agents-playbook.startWorkflow`: Start a new workflow execution
- `agents-playbook.viewProgress`: Open workflow progress view
- `agents-playbook.validateStage`: Open stage validation interface
- `agents-playbook.assignAgent`: Manually assign agent to stage
- `agents-playbook.handoffAgent`: Trigger agent handoff
- `agents-playbook.stopWorkflow`: Stop current workflow execution

## Development

### Building
```bash
npm install
npm run compile
```

### Testing
```bash
npm run test
```

### Debugging
Use VS Code's Extension Development Host for debugging:
1. Open the extension project in VS Code
2. Press F5 to launch Extension Development Host
3. Test the extension in the new window

## Technical Implementation

### Core Components
- **Extension.ts**: Main extension entry point and command registration
- **OrchestratorAgent**: Workflow coordination and agent management
- **SubAgentBase**: Abstract base class for all specialized agents
- **ContextIsolationManager**: Handles context creation and isolation
- **ValidationInterface**: WebView-based validation UI
- **TasksMarkdownManager**: TASKS.md file management and tracking

### Key Design Patterns
- **Factory Pattern**: Agent creation and type management
- **Observer Pattern**: Event-driven workflow state updates
- **Strategy Pattern**: Different validation and execution strategies
- **Isolation Pattern**: Context separation and handoff protocols

## Limitations & Future Enhancements

### Current Limitations
- Mock implementation for Cursor AI integration (needs real Cursor API)
- Simplified workflow loading (could support more complex YAML features)
- Basic validation UI (could be enhanced with more sophisticated controls)

### Planned Enhancements
- Direct Cursor AI API integration for true context isolation
- Enhanced workflow editor with visual workflow design
- Advanced agent debugging and introspection tools
- Integration with external AI providers (OpenAI, Anthropic, etc.)
- Workflow templates and sharing capabilities

## Contributing

This extension is part of the broader agents-playbook project. See the main repository for contribution guidelines and project roadmap.

## License

MIT License - see the main agents-playbook repository for details.