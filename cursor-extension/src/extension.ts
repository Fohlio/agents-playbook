import * as vscode from 'vscode';
import * as path from 'path';
import {
  ExtensionState,
  WorkflowSession,
  WorkflowEvent,
  ExtensionConfig,
  WorkflowConfig,
  StageStatus
} from './types';
import { OrchestratorAgent } from './orchestrator/orchestrator-agent';
import { ContextIsolationManager } from './context/context-isolation-manager';
import { WorkflowProgressProvider } from './ui/workflow-progress-provider';
import { AgentStatusProvider } from './ui/agent-status-provider';
import { ModernValidationInterface } from './ui/modern-validation-interface';
import { WorkflowLoader } from './workflow/workflow-loader';
import { TasksMarkdownManager } from './tasks/tasks-markdown-manager';

export class AgentsPlaybookExtension {
  private extensionState!: ExtensionState;
  private workflowProgressProvider!: WorkflowProgressProvider;
  private agentStatusProvider!: AgentStatusProvider;
  private modernValidationInterface!: ModernValidationInterface;
  private workflowLoader: WorkflowLoader;
  private tasksManager: TasksMarkdownManager;

  constructor(private context: vscode.ExtensionContext) {
    this.initializeExtensionState();
    this.workflowLoader = new WorkflowLoader();
    this.tasksManager = new TasksMarkdownManager();
  }

  async activate(): Promise<void> {
    console.log('Activating Agents Playbook Extension...');

    try {
      // Initialize components
      await this.initializeComponents();

      // Register commands
      this.registerCommands();

      // Create UI components
      this.createUIComponents();

      // Setup event handlers
      this.setupEventHandlers();

      console.log('Agents Playbook Extension activated successfully');
    } catch (error) {
      console.error('Failed to activate Agents Playbook Extension:', error);
      vscode.window.showErrorMessage(`Failed to activate Agents Playbook Extension: ${error}`);
    }
  }

  private initializeExtensionState(): void {
    this.extensionState = {
      config: this.loadConfiguration(),
      workflowDefinitions: new Map(),
      agentPool: new Map(),
      contextManager: new ContextIsolationManager(),
      eventEmitter: new vscode.EventEmitter<WorkflowEvent>()
    };
  }

  private loadConfiguration(): ExtensionConfig {
    const config = vscode.workspace.getConfiguration('agents-playbook');

    return {
      orchestrator: {
        maxConcurrentAgents: config.get('orchestrator.maxConcurrentAgents', 3),
        defaultTokenBudget: config.get('orchestrator.defaultTokenBudget', 10000),
        autoValidation: config.get('orchestrator.autoValidation', false)
      },
      agents: {
        analysis: {
          type: 'analysis' as any,
          maxTokens: config.get('agents.analysisAgent.maxTokens', 8000),
          timeout: 300000,
          capabilities: ['requirements-analysis', 'clarification']
        },
        design: {
          type: 'design' as any,
          maxTokens: config.get('agents.designAgent.maxTokens', 10000),
          timeout: 300000,
          capabilities: ['architecture-design', 'technical-specification']
        },
        planning: {
          type: 'planning' as any,
          maxTokens: 8000,
          timeout: 300000,
          capabilities: ['implementation-planning', 'task-breakdown']
        },
        implementation: {
          type: 'implementation' as any,
          maxTokens: config.get('agents.implementationAgent.maxTokens', 15000),
          timeout: 600000,
          capabilities: ['code-generation', 'feature-implementation']
        },
        testing: {
          type: 'testing' as any,
          maxTokens: 10000,
          timeout: 300000,
          capabilities: ['test-execution', 'validation']
        },
        refactoring: {
          type: 'refactoring' as any,
          maxTokens: 12000,
          timeout: 300000,
          capabilities: ['code-improvement', 'optimization']
        }
      },
      ui: {
        showProgressSidebar: config.get('ui.showProgressSidebar', true),
        autoOpenValidation: config.get('ui.autoOpenValidation', true),
        compactMode: config.get('ui.compactMode', false)
      }
    };
  }

  private async initializeComponents(): Promise<void> {
    // Load workflow definitions
    await this.loadWorkflowDefinitions();

    // Initialize context isolation manager
    this.extensionState.contextManager = new ContextIsolationManager();

    // Initialize UI components
    this.workflowProgressProvider = new WorkflowProgressProvider(this.extensionState);
    this.agentStatusProvider = new AgentStatusProvider(this.extensionState);
    this.modernValidationInterface = new ModernValidationInterface(this.extensionState);
  }

  private async loadWorkflowDefinitions(): Promise<void> {
    try {
      const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
      if (!workspaceFolder) {
        console.warn('No workspace folder found, using extension default workflows');
        return;
      }

      const workflowsPath = path.join(workspaceFolder.uri.fsPath, 'public', 'playbook', 'workflows');
      const workflows = await this.workflowLoader.loadWorkflows(workflowsPath);

      for (const [id, workflow] of workflows) {
        this.extensionState.workflowDefinitions.set(id, workflow);
      }

      console.log(`Loaded ${workflows.size} workflow definitions`);
    } catch (error) {
      console.error('Failed to load workflow definitions:', error);
      vscode.window.showWarningMessage('Failed to load workflow definitions. Some features may not work.');
    }
  }

  private registerCommands(): void {
    const commands = [
      vscode.commands.registerCommand('agents-playbook.startWorkflow', () => this.startWorkflow()),
      vscode.commands.registerCommand('agents-playbook.viewProgress', () => this.viewProgress()),
      vscode.commands.registerCommand('agents-playbook.validateStage', () => this.validateStage()),
      vscode.commands.registerCommand('agents-playbook.assignAgent', (stageId: string) => this.assignAgent(stageId)),
      vscode.commands.registerCommand('agents-playbook.handoffAgent', () => this.handoffAgent()),
      vscode.commands.registerCommand('agents-playbook.stopWorkflow', () => this.stopWorkflow()),
      vscode.commands.registerCommand('agents-playbook.showHelp', () => this.showHelp()),
      vscode.commands.registerCommand('agents-playbook.quickStart', () => this.quickStart())
    ];

    commands.forEach(command => this.context.subscriptions.push(command));
  }

  private createUIComponents(): void {
    if (this.extensionState.config.ui.showProgressSidebar) {
      // Register tree data providers
      vscode.window.registerTreeDataProvider('agents-playbook.workflowProgress', this.workflowProgressProvider);
      vscode.window.registerTreeDataProvider('agents-playbook.agentStatus', this.agentStatusProvider);
    }
  }

  private setupEventHandlers(): void {
    // Listen for workflow events
    this.extensionState.eventEmitter.event((event: WorkflowEvent) => {
      this.handleWorkflowEvent(event);
    });

    // Listen for configuration changes
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration('agents-playbook')) {
        this.extensionState.config = this.loadConfiguration();
        console.log('Configuration updated');
      }
    });
  }

  private handleWorkflowEvent(event: WorkflowEvent): void {
    switch (event.type) {
      case 'stage_started':
        this.workflowProgressProvider.refresh();
        break;
      case 'stage_completed':
        this.workflowProgressProvider.refresh();
        if (this.extensionState.config.ui.autoOpenValidation) {
          this.validateStage();
        }
        break;
      case 'agent_assigned':
        this.agentStatusProvider.refresh();
        break;
      case 'validation_required':
        // Convert event data to proper validation options with callbacks
        const stage = event.data.stage;
        const validationOptions = {
          stage,
          result: undefined,
          onApprove: () => this.approveStage(stage.stageId),
          onReject: (reason: string) => this.rejectStage(stage.stageId, reason),
          onModify: (changes: any) => this.modifyStage(stage.stageId, changes),
          onSkip: (reason: string) => this.skipStage(stage.stageId, reason)
        };

        // Always use modern UI
        this.modernValidationInterface.showValidation(validationOptions);
        break;
      case 'handoff_initiated':
        this.handleHandoffEvent(event);
        break;
    }
  }

  private handleHandoffEvent(event: WorkflowEvent): void {
    vscode.window.showInformationMessage(
      `Agent handoff: ${event.data.fromAgent} → ${event.data.toAgent}`,
      'View Details'
    ).then(selection => {
      if (selection === 'View Details') {
        this.viewProgress();
      }
    });
  }

  // Command implementations
  private async startWorkflow(): Promise<void> {
    try {
      // Show workflow selection quick pick
      const workflowItems = Array.from(this.extensionState.workflowDefinitions.entries()).map(([id, workflow]) => ({
        label: workflow.name,
        description: workflow.description,
        workflowId: id
      }));

      const selectedItem = await vscode.window.showQuickPick(workflowItems, {
        placeHolder: 'Select a workflow to start',
        canPickMany: false
      });

      if (!selectedItem) {
        return;
      }

      // Set context for UI visibility
      vscode.commands.executeCommand('setContext', 'agents-playbook:workflowActive', true);

      // Create orchestrator and start workflow
      this.extensionState.orchestrator = new OrchestratorAgent(
        this.extensionState.config,
        this.extensionState.contextManager,
        this.extensionState.eventEmitter
      );

      const session = await this.extensionState.orchestrator.executeWorkflow(selectedItem.workflowId);
      this.extensionState.activeSession = session;

      // Initialize Tasks.md tracking
      await this.tasksManager.initializeTasksFile(session);

      vscode.window.showInformationMessage(`Started workflow: ${selectedItem.label}`);

    } catch (error) {
      console.error('Failed to start workflow:', error);
      vscode.window.showErrorMessage(`Failed to start workflow: ${error}`);
    }
  }

  private async viewProgress(): Promise<void> {
    if (!this.extensionState.activeSession) {
      vscode.window.showWarningMessage('No active workflow session');
      return;
    }

    // Focus on the progress tree view
    vscode.commands.executeCommand('agents-playbook.workflowProgress.focus');
  }

  private async validateStage(): Promise<void> {
    if (!this.extensionState.activeSession?.currentStage) {
      vscode.window.showWarningMessage('No stage to validate');
      return;
    }

    const stage = this.extensionState.activeSession.currentStage;

    // Show modern validation interface
    await this.modernValidationInterface.showValidation({
      stage,
      result: undefined,
      onApprove: () => this.approveStage(stage.stageId),
      onReject: (reason) => this.rejectStage(stage.stageId, reason),
      onModify: (changes) => this.modifyStage(stage.stageId, changes),
      onSkip: (reason) => this.skipStage(stage.stageId, reason)
    });
  }

  private approveStage(stageId: string): void {
    console.log(`Approving stage: ${stageId}`);
    // Update stage status
    if (this.extensionState.activeSession?.currentStage?.stageId === stageId) {
      this.extensionState.activeSession.currentStage.status = 'completed' as any;
      this.extensionState.activeSession.currentStage.validation = {
        ...this.extensionState.activeSession.currentStage.validation,
        requiresUserApproval: true,
        autoValidation: [],
        manualCheckpoints: [],
        approved: true
      };
    }
    // Update TASKS.md
    this.tasksManager.updateStageStatus(stageId, 'completed' as any);

    // Resolve the orchestrator's validation promise
    if (this.extensionState.orchestrator) {
      this.extensionState.orchestrator.resolveStageValidation(stageId, true);
    }
  }

  private rejectStage(stageId: string, reason: string): void {
    console.log(`Rejecting stage: ${stageId}, reason: ${reason}`);
    if (this.extensionState.activeSession?.currentStage?.stageId === stageId) {
      this.extensionState.activeSession.currentStage.status = 'error' as any;
      this.extensionState.activeSession.currentStage.validation = {
        ...this.extensionState.activeSession.currentStage.validation,
        requiresUserApproval: true,
        autoValidation: [],
        manualCheckpoints: [],
        approved: false,
        rejectionReason: reason
      };
    }
    this.tasksManager.updateStageStatus(stageId, 'error' as any);

    // Resolve the orchestrator's validation promise with rejection
    if (this.extensionState.orchestrator) {
      this.extensionState.orchestrator.resolveStageValidation(stageId, false);
    }
  }

  private modifyStage(stageId: string, changes: any): void {
    console.log(`Modifying stage: ${stageId}`, changes);
    // Re-execute stage with modifications
    if (this.extensionState.activeSession?.currentStage?.stageId === stageId) {
      this.extensionState.activeSession.currentStage.validation = {
        ...this.extensionState.activeSession.currentStage.validation,
        requiresUserApproval: true,
        autoValidation: [],
        manualCheckpoints: [],
        userFeedback: changes
      };
    }
  }

  private skipStage(stageId: string, reason: string): void {
    console.log(`Skipping stage: ${stageId}, reason: ${reason}`);
    if (this.extensionState.activeSession?.currentStage?.stageId === stageId) {
      this.extensionState.activeSession.currentStage.status = 'skipped' as any;
    }
    this.tasksManager.updateStageStatus(stageId, 'skipped' as any);
  }

  private async showHelp(): Promise<void> {
    vscode.window.showInformationMessage(
      'Agents Playbook: Multi-Agent Workflow Extension',
      'View Documentation'
    ).then(selection => {
      if (selection === 'View Documentation') {
        vscode.env.openExternal(vscode.Uri.parse('https://github.com/ivanbunin/agents-playbook'));
      }
    });
  }

  private async quickStart(): Promise<void> {
    const actions = [
      '🚀 Start New Workflow',
      '📊 View Active Workflow',
      '⚙️ Configure Settings'
    ];

    const selection = await vscode.window.showQuickPick(actions, {
      placeHolder: 'What would you like to do?',
      canPickMany: false
    });

    switch (selection) {
      case '🚀 Start New Workflow':
        await this.startWorkflow();
        break;
      case '📊 View Active Workflow':
        if (this.extensionState.activeSession) {
          // Open the modern validation interface to show current workflow
          const stage = this.extensionState.activeSession.currentStage;
          if (stage) {
            await this.modernValidationInterface.showValidation({
              stage,
              result: undefined,
              onApprove: () => this.approveStage(stage.stageId),
              onReject: (reason) => this.rejectStage(stage.stageId, reason),
              onModify: (changes) => this.modifyStage(stage.stageId, changes),
              onSkip: (reason) => this.skipStage(stage.stageId, reason)
            });
          } else {
            vscode.window.showInformationMessage('Workflow is running but no current stage available');
          }
        } else {
          vscode.window.showInformationMessage('No active workflow. Start a new workflow first.');
        }
        break;
      case '⚙️ Configure Settings':
        vscode.commands.executeCommand('workbench.action.openSettings', 'agents-playbook');
        break;
    }
  }

  private async assignAgent(stageId?: string): Promise<void> {
    if (!this.extensionState.activeSession) {
      vscode.window.showWarningMessage('No active workflow session');
      return;
    }

    if (!this.extensionState.orchestrator) {
      vscode.window.showErrorMessage('No orchestrator available');
      return;
    }

    const stage = stageId
      ? this.extensionState.activeSession.completedStages.find(s => s.stageId === stageId) ||
        (this.extensionState.activeSession.currentStage?.stageId === stageId ? this.extensionState.activeSession.currentStage : null)
      : this.extensionState.activeSession.currentStage;

    if (!stage) {
      vscode.window.showWarningMessage('No stage found to assign agent');
      return;
    }

    try {
      const agentId = await this.extensionState.orchestrator.assignAgent(stage);
      vscode.window.showInformationMessage(`Assigned agent ${agentId} to stage ${stage.name}`);

      // Update Tasks.md
      await this.tasksManager.updateStageAssignment(stage.stageId, agentId);

    } catch (error) {
      console.error('Failed to assign agent:', error);
      vscode.window.showErrorMessage(`Failed to assign agent: ${error}`);
    }
  }

  private async handoffAgent(): Promise<void> {
    if (!this.extensionState.orchestrator || !this.extensionState.activeSession) {
      vscode.window.showWarningMessage('No active workflow or orchestrator');
      return;
    }

    try {
      // Implementation would depend on the current stage and next stage
      const currentStage = this.extensionState.activeSession.currentStage;
      if (!currentStage) {
        vscode.window.showWarningMessage('No current stage for handoff');
        return;
      }

      // This is a simplified handoff - in reality, we'd need to determine the next stage
      await this.extensionState.orchestrator.handoff(currentStage.stageId, 'next-stage');

    } catch (error) {
      console.error('Failed to handoff agent:', error);
      vscode.window.showErrorMessage(`Failed to handoff agent: ${error}`);
    }
  }

  private async stopWorkflow(): Promise<void> {
    if (!this.extensionState.activeSession) {
      vscode.window.showWarningMessage('No active workflow to stop');
      return;
    }

    const confirm = await vscode.window.showWarningMessage(
      'Are you sure you want to stop the current workflow?',
      { modal: true },
      'Yes', 'No'
    );

    if (confirm === 'Yes') {
      // Cleanup orchestrator and agents
      if (this.extensionState.orchestrator) {
        this.extensionState.orchestrator.dispose();
        this.extensionState.orchestrator = undefined;
      }

      // Clear active session
      this.extensionState.activeSession = undefined;

      // Update context
      vscode.commands.executeCommand('setContext', 'agents-playbook:workflowActive', false);

      vscode.window.showInformationMessage('Workflow stopped');

      // Refresh UI
      this.workflowProgressProvider.refresh();
      this.agentStatusProvider.refresh();
    }
  }

  // Duplicate functions removed - using the earlier implementations

  dispose(): void {
    // Cleanup resources
    if (this.extensionState.orchestrator) {
      this.extensionState.orchestrator.dispose();
    }

    // Dispose agents
    for (const agent of this.extensionState.agentPool.values()) {
      agent.dispose();
    }

    // Dispose event emitter
    this.extensionState.eventEmitter.dispose();
  }
}

// Extension activation function
export function activate(context: vscode.ExtensionContext) {
  const extension = new AgentsPlaybookExtension(context);
  return extension.activate();
}

export function deactivate() {
  // Extension cleanup is handled by the AgentsPlaybookExtension.dispose() method
}