# Design Document

## Overview

Transform the agents-playbook MCP server into a comprehensive Cursor IDE extension that orchestrates sub-agents workflows. The system will maintain the existing YAML workflow structure and mini-prompts while adding agent management, context isolation, and validation interfaces. The extension targets developers who need to execute complex, multi-phase development workflows with specialized agent assistance.

## Architecture

### Frontend Architecture

- **Extension Framework**: Cursor Extension API (VSCode compatible)
- **UI Components**: React-based webviews for workflow management and validation interfaces
- **State Management**: Extension context with workspace state persistence
- **Real-time Updates**: Event-driven architecture for agent communication and progress tracking
- **Navigation**: Command palette integration and dedicated sidebar panel

### Backend Architecture

- **API Style**: Internal extension commands and providers with message passing between agents
- **Data Store**: Extension context storage with workspace-specific persistence
- **Agent Management**: Sub-agent lifecycle management with isolated execution contexts
- **Communication Protocol**: Structured message passing with validation and error handling
- **Workflow Engine**: Enhanced workflow parser with sub-agent task generation

### Data Flow

```
User Input → Extension Commands → Orchestrator Agent → Task Generation → Sub-Agent Creation →
Isolated Execution → Progress Updates → Validation Interface → User Approval → Next Phase
```

## Components and Interfaces

### Extension Manifest Structure

```json
{
  "name": "agents-playbook",
  "version": "1.0.0",
  "engines": {
    "vscode": "^1.74.0"
  },
  "categories": ["Other"],
  "activationEvents": [
    "onCommand:agents-playbook.startWorkflow",
    "onCommand:agents-playbook.manageAgents",
    "workspaceContains:.agents-playbook"
  ],
  "contributes": {
    "commands": [
      {
        "command": "agents-playbook.startWorkflow",
        "title": "Start Workflow",
        "category": "Agents Playbook"
      },
      {
        "command": "agents-playbook.manageAgents",
        "title": "Manage Sub-Agents",
        "category": "Agents Playbook"
      },
      {
        "command": "agents-playbook.validateStage",
        "title": "Validate Stage",
        "category": "Agents Playbook"
      }
    ],
    "views": {
      "explorer": [
        {
          "id": "agentsPlaybookView",
          "name": "Agents Playbook",
          "when": "workspaceContains:.agents-playbook"
        }
      ]
    },
    "configuration": {
      "title": "Agents Playbook",
      "properties": {
        "agentsPlaybook.maxConcurrentAgents": {
          "type": "number",
          "default": 3,
          "description": "Maximum number of concurrent sub-agents"
        },
        "agentsPlaybook.autoValidation": {
          "type": "boolean",
          "default": false,
          "description": "Enable automatic stage validation"
        }
      }
    }
  }
}
```

### Data Models

```typescript
// Core agent types
interface OrchestratorAgent {
  id: string;
  workflowId: string;
  status: 'active' | 'waiting' | 'completed' | 'error';
  currentPhase: string;
  createdAt: Date;
  context: WorkflowContext;
}

interface ImplementerAgent {
  id: string;
  orchestratorId: string;
  phaseId: string;
  taskId: string;
  status: 'pending' | 'active' | 'completed' | 'error' | 'validating';
  context: TaskContext;
  isolation: ContextIsolation;
  createdAt: Date;
  completedAt?: Date;
}

// Workflow transformation types
interface SubAgentTask {
  id: string;
  phaseId: string;
  title: string;
  description: string;
  miniPromptPath: string;
  prerequisites: TaskPrerequisites;
  deliverables: string[];
  acceptanceCriteria: string[];
  contextRequirements: ContextRequirement[];
  estimatedDuration: string;
}

interface TaskContext {
  projectRoot: string;
  relevantFiles: string[];
  requirements: Record<string, any>;
  designSpecs: Record<string, any>;
  implementationPlan: Record<string, any>;
  previousPhaseOutputs: Record<string, any>;
  constraints: string[];
}

interface ContextIsolation {
  allowedFiles: string[];
  blockedFiles: string[];
  readOnlyFiles: string[];
  exposedMemory: string[];
  blockedMemory: string[];
}

// Communication protocol
interface AgentMessage {
  id: string;
  from: string;
  to: string;
  type: 'task_assignment' | 'progress_update' | 'completion' | 'error' | 'validation_request';
  payload: Record<string, any>;
  timestamp: Date;
  correlationId?: string;
}

interface ValidationRequest {
  agentId: string;
  phaseId: string;
  deliverables: Deliverable[];
  completionStatus: CompletionStatus;
  qualityMetrics: QualityMetric[];
  nextSteps: string[];
}

interface Deliverable {
  name: string;
  type: 'file' | 'documentation' | 'specification' | 'implementation';
  path: string;
  description: string;
  validated: boolean;
  validationNotes?: string;
}
```

### Extension API Endpoints

**Internal Command Structure:**
- `agents-playbook.workflow.start` — Initialize orchestrator and begin workflow execution
- `agents-playbook.workflow.pause` — Pause workflow execution and preserve state
- `agents-playbook.workflow.resume` — Resume paused workflow from saved state
- `agents-playbook.agent.create` — Create new implementer agent with isolated context
- `agents-playbook.agent.assign` — Assign task to implementer agent
- `agents-playbook.agent.monitor` — Monitor agent progress and status
- `agents-playbook.stage.validate` — Present validation interface for stage completion
- `agents-playbook.stage.approve` — Approve stage and proceed to next phase
- `agents-playbook.context.isolate` — Create isolated context for sub-agent
- `agents-playbook.communication.send` — Send structured message between agents

## Error Handling

### Extension Error Handling

- **Agent Creation Failures**: Retry with exponential backoff, fallback to synchronous execution
- **Context Isolation Errors**: Alert user and request manual context definition
- **Communication Failures**: Queue messages and retry, escalate to user after 3 attempts
- **Validation Interface Errors**: Preserve state and allow manual validation bypass

### Workflow Engine Error Handling

- **YAML Parsing Errors**: Display detailed error message with line numbers and suggestions
- **Mini-prompt Loading Failures**: Fallback to generic prompt templates
- **Task Generation Errors**: Log errors and skip problematic stages with user notification
- **Dependency Resolution Failures**: Present dependency graph and allow manual resolution

### Agent Communication Error Handling

- **Message Delivery Failures**: Implement dead letter queue and admin notifications
- **Context Sync Errors**: Force context refresh and validate integrity
- **Isolation Breach Attempts**: Log security events and reinforce isolation boundaries
- **Timeout Handling**: Implement configurable timeouts with graceful degradation

## Testing Strategy

### Unit Tests

- Workflow parser and YAML configuration validation
- Agent context isolation and memory management
- Message passing and communication protocol
- Task generation and dependency resolution

### Integration Tests

- End-to-end workflow execution with multiple sub-agents
- Context isolation verification across agent boundaries
- Validation interface integration with Cursor UI
- State persistence and recovery scenarios

### E2E Tests

- Complete workflow execution from start to finish
- Multi-agent coordination and handoff scenarios
- User interaction flows through validation interfaces
- Error recovery and graceful degradation

### Performance Tests

- Agent creation and context isolation overhead
- Memory usage with multiple concurrent agents
- Message passing throughput and latency
- Large workflow parsing and execution

## Security Considerations

- **Context Isolation**: Strict enforcement of agent context boundaries
- **File Access Control**: Granular permissions for agent file access
- **Memory Isolation**: Prevent cross-agent memory contamination
- **Communication Security**: Validate all inter-agent messages
- **Workspace Protection**: Prevent agents from accessing unauthorized workspace areas

## Implementation Notes

### Agent Lifecycle Management

- Implement proper agent disposal and cleanup
- Use weak references to prevent memory leaks
- Batch agent operations for performance
- Implement agent health monitoring and recovery

### Context Isolation Strategy

- Sandbox file system access per agent
- Isolate extension context storage
- Implement context validation and integrity checks
- Use immutable data structures for shared state

### Validation Interface Design

- Modal dialogs for critical validation steps
- Embedded webviews for complex deliverable review
- Progress indicators for long-running validations
- Keyboard shortcuts for common approval actions

## Migration Strategy

### Phase 1: Core Extension Structure
- Set up extension framework and basic UI
- Implement workflow parser and configuration loading
- Create basic agent management infrastructure

### Phase 2: Agent System Implementation
- Implement orchestrator and implementer agent types
- Build context isolation system
- Create communication protocol and message passing

### Phase 3: Validation and UI Integration
- Build validation interfaces and approval workflows
- Integrate with Cursor IDE UI components
- Implement progress tracking and monitoring

### Phase 4: Advanced Features and Polish
- Add error recovery and graceful degradation
- Implement performance optimizations
- Add comprehensive testing and debugging tools

## Validation

- Confirm alignment with approved requirements (agent orchestration, context isolation, validation interfaces)
- Confirm error handling, testing, and security considerations are comprehensive
- Confirm migration strategy provides clear path from MCP to extension
- Record explicit user approval before proceeding to implementation planning