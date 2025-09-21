# Cursor Extension Multi-Agent Orchestration Plan

## Executive Summary
Transform the agents-playbook MCP tool into a Cursor extension that enables multi-agent orchestration with isolated AI contexts, similar to Claude Code's agent system. Each workflow stage becomes a dedicated sub-agent with clean token context, managed through a Cursor UI interface.

## Architecture Overview

### System Components

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

## Core Features

### 1. Agent System Architecture

#### Orchestrator Agent
- **Role**: Main coordinator that manages workflow execution
- **Context**: Minimal - only workflow state and handoff information
- **Responsibilities**:
  - Parse YAML workflows into agent tasks
  - Assign sub-agents to workflow stages
  - Manage handoffs between agents
  - Track overall progress

#### Sub-Agents
- **Role**: Execute specific workflow stages
- **Context**: Isolated, task-specific context only
- **Types**:
  - **Analysis Agent**: Requirements gathering, clarification
  - **Design Agent**: Architecture, technical design
  - **Planning Agent**: Implementation planning, task breakdown
  - **Implementation Agent**: Code writing, feature development
  - **Testing Agent**: Test execution, validation
  - **Refactoring Agent**: Code improvement, optimization

### 2. Context Isolation Strategy

#### Token Context Management
```typescript
interface AgentContext {
  agentId: string;
  taskId: string;
  maxTokens: number;
  contextWindow: {
    systemPrompt: string;
    taskContext: string;
    relevantFiles: string[];
    previousHandoffs: HandoffSummary[];
  };
  isolation: {
    preventHistoryAccess: boolean;
    cleanSlate: boolean;
    maxContextSize: number;
  };
}
```

#### Context Isolation Implementation
- **New Chat Instance**: Each sub-agent starts with fresh Cursor AI chat
- **Selective Context Loading**: Only load relevant mini-prompts and context
- **Handoff Summaries**: Compressed context transfer between agents
- **No History Bleeding**: Previous agent conversations not accessible

### 3. Cursor UI Integration

#### Stage Validation Interface
```typescript
interface StageValidationPanel {
  currentStage: {
    workflowId: string;
    stageId: string;
    agentAssigned: string;
    status: 'pending' | 'in-progress' | 'validation' | 'completed';
  };
  validation: {
    requiresUserApproval: boolean;
    autoValidation: ValidationRule[];
    manualCheckpoints: Checkpoint[];
  };
  actions: {
    approve: () => void;
    reject: (reason: string) => void;
    modify: (changes: any) => void;
    skipStage: (reason: string) => void;
  };
}
```

#### UI Components
1. **Workflow Sidebar**
   - Visual workflow progress
   - Stage status indicators
   - Agent assignment display
   - Validation checkpoints

2. **Agent Status Panel**
   - Current active agent
   - Context size/tokens used
   - Task progress
   - Handoff queue

3. **Validation Modal**
   - Stage output review
   - Approval/rejection controls
   - Modification interface
   - Skip options

### 4. Task Management System

#### Tasks.md Integration
```markdown
# Project Tasks - [Workflow Name]

## Orchestrator Assignment
- Workflow: feature-development
- Started: [timestamp]
- Status: In Progress

## Stage Assignments

### ✅ Analysis Stage
- Agent: analysis-agent-001
- Started: [timestamp]
- Completed: [timestamp]
- Output: requirements.md
- Token Usage: 4,521

### 🔄 Design Stage
- Agent: design-agent-002
- Started: [timestamp]
- Status: In Progress
- Expected Output: design.md
- Token Usage: 2,103 (ongoing)

### ⏳ Implementation Stage
- Agent: [Pending Assignment]
- Prerequisites: Design approval
- Estimated Tokens: 8,000-12,000
```

## Implementation Plan

### Phase 1: Core Extension Framework (Week 1-2)

#### 1.1 Extension Scaffold
```typescript
// src/extension.ts
export class AgentsPlaybookExtension {
  private orchestrator: OrchestratorAgent;
  private agentPool: Map<string, SubAgent>;
  private contextManager: ContextIsolationManager;
  private validationUI: ValidationInterface;

  async activate(context: vscode.ExtensionContext) {
    // Initialize components
    this.initializeOrchestrator();
    this.registerCommands();
    this.createUIComponents();
    this.setupContextIsolation();
  }
}
```

#### 1.2 Command Registration
- `agents-playbook.startWorkflow`: Initialize workflow with orchestrator
- `agents-playbook.assignAgent`: Assign sub-agent to stage
- `agents-playbook.validateStage`: Open validation UI
- `agents-playbook.viewProgress`: Show workflow progress
- `agents-playbook.handoff`: Execute agent handoff

### Phase 2: Agent System (Week 2-3)

#### 2.1 Orchestrator Implementation
```typescript
class OrchestratorAgent {
  private workflow: WorkflowConfig;
  private stageQueue: StageQueue;
  private agentAssignments: Map<string, string>;

  async executeWorkflow(workflowId: string) {
    // Load workflow
    this.workflow = await this.loadWorkflow(workflowId);

    // Parse into stages
    const stages = this.parseWorkflowStages();

    // Create execution plan
    const plan = this.createExecutionPlan(stages);

    // Start orchestration
    await this.orchestrate(plan);
  }

  private async orchestrate(plan: ExecutionPlan) {
    for (const stage of plan.stages) {
      // Assign sub-agent
      const agent = await this.assignAgent(stage);

      // Create isolated context
      const context = await this.prepareContext(stage);

      // Execute stage
      await agent.execute(context);

      // Validate results
      await this.validateStage(stage);

      // Handoff to next
      await this.handoff(stage);
    }
  }
}
```

#### 2.2 Sub-Agent Template
```typescript
abstract class SubAgent {
  protected agentId: string;
  protected context: IsolatedContext;
  protected maxTokens: number;

  async execute(context: IsolatedContext): Promise<AgentResult> {
    // Load mini-prompt
    const prompt = await this.loadMiniPrompt();

    // Prepare isolated context
    const isolatedPrompt = this.preparePrompt(prompt, context);

    // Execute in new Cursor chat
    const result = await this.executeInCursor(isolatedPrompt);

    // Generate handoff
    return this.prepareHandoff(result);
  }

  abstract loadMiniPrompt(): Promise<MiniPrompt>;
  abstract validateOutput(): Promise<boolean>;
}
```

### Phase 3: Context Isolation (Week 3-4)

#### 3.1 Context Manager
```typescript
class ContextIsolationManager {
  private contextStores: Map<string, ContextStore>;

  async createIsolatedContext(
    agentId: string,
    stage: WorkflowStage
  ): Promise<IsolatedContext> {
    return {
      agentId,
      taskContext: this.extractTaskContext(stage),
      relevantFiles: await this.gatherRelevantFiles(stage),
      handoffSummary: this.getHandoffSummary(stage.previousStage),
      maxTokens: this.calculateTokenBudget(stage),
      systemPrompt: this.generateSystemPrompt(stage)
    };
  }

  async compressHandoff(
    fullContext: any,
    targetTokens: number
  ): Promise<HandoffSummary> {
    // Compress context for handoff
    return {
      keyDecisions: this.extractKeyDecisions(fullContext),
      outputs: this.summarizeOutputs(fullContext),
      nextSteps: this.identifyNextSteps(fullContext),
      tokenCount: targetTokens
    };
  }
}
```

#### 3.2 Cursor Integration
```typescript
class CursorChatManager {
  async createNewChat(agentId: string): Promise<ChatSession> {
    // Create new Cursor chat instance
    const chat = await vscode.commands.executeCommand(
      'cursor.newChat',
      { cleanSlate: true }
    );

    return new ChatSession(chat, agentId);
  }

  async executeInChat(
    session: ChatSession,
    prompt: string
  ): Promise<string> {
    // Send prompt to isolated chat
    return await session.sendMessage(prompt);
  }
}
```

### Phase 4: UI Implementation (Week 4-5)

#### 4.1 Validation Interface
```typescript
class ValidationInterface {
  private webview: vscode.WebviewPanel;

  async showValidation(stage: StageResult) {
    this.webview = vscode.window.createWebviewPanel(
      'stageValidation',
      `Validate: ${stage.name}`,
      vscode.ViewColumn.Two,
      { enableScripts: true }
    );

    this.webview.webview.html = this.getValidationHTML(stage);

    // Handle messages from webview
    this.webview.webview.onDidReceiveMessage(
      message => this.handleValidation(message)
    );
  }

  private getValidationHTML(stage: StageResult): string {
    return `
      <!DOCTYPE html>
      <html>
        <body>
          <h2>Stage: ${stage.name}</h2>
          <div class="agent-info">
            Agent: ${stage.agentId}<br>
            Tokens Used: ${stage.tokensUsed}<br>
            Status: ${stage.status}
          </div>
          <div class="output">
            <h3>Output</h3>
            <pre>${stage.output}</pre>
          </div>
          <div class="actions">
            <button onclick="approve()">✅ Approve</button>
            <button onclick="reject()">❌ Reject</button>
            <button onclick="modify()">✏️ Modify</button>
            <button onclick="skip()">⏭️ Skip</button>
          </div>
        </body>
      </html>
    `;
  }
}
```

#### 4.2 Progress Sidebar
```typescript
class WorkflowProgressProvider implements vscode.TreeDataProvider<WorkflowNode> {
  getTreeItem(element: WorkflowNode): vscode.TreeItem {
    const item = new vscode.TreeItem(
      element.label,
      element.collapsibleState
    );

    // Set icon based on status
    item.iconPath = this.getIcon(element.status);

    // Add context value for commands
    item.contextValue = element.type;

    return item;
  }

  getChildren(element?: WorkflowNode): WorkflowNode[] {
    if (!element) {
      return this.getWorkflowNodes();
    }
    return this.getStageNodes(element);
  }
}
```

## Technical Implementation Details

### API Endpoints Required
```typescript
// Extension API
interface ExtensionAPI {
  // Workflow Management
  startWorkflow(workflowId: string): Promise<string>;
  getWorkflowStatus(sessionId: string): Promise<WorkflowStatus>;

  // Agent Management
  assignAgent(stageId: string, agentType: string): Promise<string>;
  getAgentStatus(agentId: string): Promise<AgentStatus>;

  // Validation
  validateStage(stageId: string): Promise<ValidationResult>;
  approveStage(stageId: string): Promise<void>;
  rejectStage(stageId: string, reason: string): Promise<void>;

  // Context Management
  getContext(agentId: string): Promise<IsolatedContext>;
  handoff(fromAgent: string, toAgent: string): Promise<HandoffResult>;
}
```

### Configuration Schema
```json
{
  "agents-playbook.orchestrator": {
    "maxConcurrentAgents": 3,
    "defaultTokenBudget": 10000,
    "autoValidation": false
  },
  "agents-playbook.agents": {
    "analysisAgent": {
      "maxTokens": 8000,
      "timeout": 300000
    },
    "designAgent": {
      "maxTokens": 10000,
      "timeout": 300000
    },
    "implementationAgent": {
      "maxTokens": 15000,
      "timeout": 600000
    }
  },
  "agents-playbook.ui": {
    "showProgressSidebar": true,
    "autoOpenValidation": true,
    "compactMode": false
  }
}
```

## Migration Strategy

### From MCP to Extension
1. **Preserve YAML Workflows**: Keep existing workflow definitions
2. **Convert MCP Tools**: Transform to extension commands
3. **Enhance Mini-Prompts**: Add agent-specific instructions
4. **Add Validation Points**: Insert UI checkpoints

### Backward Compatibility
- Maintain MCP server for non-Cursor users
- Export/import workflow sessions
- Support both modes simultaneously

## Success Metrics
- **Context Isolation**: <5% token overlap between agents
- **Task Completion**: 95% successful stage completions
- **Token Efficiency**: 30% reduction vs single context
- **User Satisfaction**: Validation approval rate >90%
- **Performance**: <2s stage handoff time

## Risk Mitigation
- **Context Loss**: Store compressed handoffs in tasks.md
- **Agent Failure**: Fallback to orchestrator intervention
- **Token Overflow**: Dynamic token budget adjustment
- **Validation Bottleneck**: Async validation queue

## Next Steps
1. Review and approve architecture with cursor-extension-developer
2. Set up extension scaffold and basic structure
3. Implement orchestrator agent
4. Create first sub-agent (analysis)
5. Build validation UI
6. Test with simple workflow
7. Iterate and expand agent pool