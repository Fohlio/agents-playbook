"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentsPlaybookExtension = void 0;
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
const orchestrator_agent_1 = require("./orchestrator/orchestrator-agent");
const context_isolation_manager_1 = require("./context/context-isolation-manager");
const workflow_progress_provider_1 = require("./ui/workflow-progress-provider");
const agent_status_provider_1 = require("./ui/agent-status-provider");
const modern_validation_interface_1 = require("./ui/modern-validation-interface");
const workflow_loader_1 = require("./workflow/workflow-loader");
const tasks_markdown_manager_1 = require("./tasks/tasks-markdown-manager");
class AgentsPlaybookExtension {
    constructor(context) {
        this.context = context;
        this.initializeExtensionState();
        this.workflowLoader = new workflow_loader_1.WorkflowLoader();
        this.tasksManager = new tasks_markdown_manager_1.TasksMarkdownManager();
    }
    async activate() {
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
        }
        catch (error) {
            console.error('Failed to activate Agents Playbook Extension:', error);
            vscode.window.showErrorMessage(`Failed to activate Agents Playbook Extension: ${error}`);
        }
    }
    initializeExtensionState() {
        this.extensionState = {
            config: this.loadConfiguration(),
            workflowDefinitions: new Map(),
            agentPool: new Map(),
            contextManager: new context_isolation_manager_1.ContextIsolationManager(),
            eventEmitter: new vscode.EventEmitter()
        };
    }
    loadConfiguration() {
        const config = vscode.workspace.getConfiguration('agents-playbook');
        return {
            orchestrator: {
                maxConcurrentAgents: config.get('orchestrator.maxConcurrentAgents', 3),
                defaultTokenBudget: config.get('orchestrator.defaultTokenBudget', 10000),
                autoValidation: config.get('orchestrator.autoValidation', false)
            },
            agents: {
                analysis: {
                    type: 'analysis',
                    maxTokens: config.get('agents.analysisAgent.maxTokens', 8000),
                    timeout: 300000,
                    capabilities: ['requirements-analysis', 'clarification']
                },
                design: {
                    type: 'design',
                    maxTokens: config.get('agents.designAgent.maxTokens', 10000),
                    timeout: 300000,
                    capabilities: ['architecture-design', 'technical-specification']
                },
                planning: {
                    type: 'planning',
                    maxTokens: 8000,
                    timeout: 300000,
                    capabilities: ['implementation-planning', 'task-breakdown']
                },
                implementation: {
                    type: 'implementation',
                    maxTokens: config.get('agents.implementationAgent.maxTokens', 15000),
                    timeout: 600000,
                    capabilities: ['code-generation', 'feature-implementation']
                },
                testing: {
                    type: 'testing',
                    maxTokens: 10000,
                    timeout: 300000,
                    capabilities: ['test-execution', 'validation']
                },
                refactoring: {
                    type: 'refactoring',
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
    async initializeComponents() {
        // Load workflow definitions
        await this.loadWorkflowDefinitions();
        // Initialize context isolation manager
        this.extensionState.contextManager = new context_isolation_manager_1.ContextIsolationManager();
        // Initialize UI components
        this.workflowProgressProvider = new workflow_progress_provider_1.WorkflowProgressProvider(this.extensionState);
        this.agentStatusProvider = new agent_status_provider_1.AgentStatusProvider(this.extensionState);
        this.modernValidationInterface = new modern_validation_interface_1.ModernValidationInterface(this.extensionState);
    }
    async loadWorkflowDefinitions() {
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
        }
        catch (error) {
            console.error('Failed to load workflow definitions:', error);
            vscode.window.showWarningMessage('Failed to load workflow definitions. Some features may not work.');
        }
    }
    registerCommands() {
        const commands = [
            vscode.commands.registerCommand('agents-playbook.startWorkflow', () => this.startWorkflow()),
            vscode.commands.registerCommand('agents-playbook.viewProgress', () => this.viewProgress()),
            vscode.commands.registerCommand('agents-playbook.validateStage', () => this.validateStage()),
            vscode.commands.registerCommand('agents-playbook.assignAgent', (stageId) => this.assignAgent(stageId)),
            vscode.commands.registerCommand('agents-playbook.handoffAgent', () => this.handoffAgent()),
            vscode.commands.registerCommand('agents-playbook.stopWorkflow', () => this.stopWorkflow()),
            vscode.commands.registerCommand('agents-playbook.showHelp', () => this.showHelp()),
            vscode.commands.registerCommand('agents-playbook.quickStart', () => this.quickStart())
        ];
        commands.forEach(command => this.context.subscriptions.push(command));
    }
    createUIComponents() {
        if (this.extensionState.config.ui.showProgressSidebar) {
            // Register tree data providers
            vscode.window.registerTreeDataProvider('agents-playbook.workflowProgress', this.workflowProgressProvider);
            vscode.window.registerTreeDataProvider('agents-playbook.agentStatus', this.agentStatusProvider);
        }
    }
    setupEventHandlers() {
        // Listen for workflow events
        this.extensionState.eventEmitter.event((event) => {
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
    handleWorkflowEvent(event) {
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
                    onReject: (reason) => this.rejectStage(stage.stageId, reason),
                    onModify: (changes) => this.modifyStage(stage.stageId, changes),
                    onSkip: (reason) => this.skipStage(stage.stageId, reason)
                };
                // Always use modern UI
                this.modernValidationInterface.showValidation(validationOptions);
                break;
            case 'handoff_initiated':
                this.handleHandoffEvent(event);
                break;
        }
    }
    handleHandoffEvent(event) {
        vscode.window.showInformationMessage(`Agent handoff: ${event.data.fromAgent} → ${event.data.toAgent}`, 'View Details').then(selection => {
            if (selection === 'View Details') {
                this.viewProgress();
            }
        });
    }
    // Command implementations
    async startWorkflow() {
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
            this.extensionState.orchestrator = new orchestrator_agent_1.OrchestratorAgent(this.extensionState.config, this.extensionState.contextManager, this.extensionState.eventEmitter);
            const session = await this.extensionState.orchestrator.executeWorkflow(selectedItem.workflowId);
            this.extensionState.activeSession = session;
            // Initialize Tasks.md tracking
            await this.tasksManager.initializeTasksFile(session);
            vscode.window.showInformationMessage(`Started workflow: ${selectedItem.label}`);
        }
        catch (error) {
            console.error('Failed to start workflow:', error);
            vscode.window.showErrorMessage(`Failed to start workflow: ${error}`);
        }
    }
    async viewProgress() {
        if (!this.extensionState.activeSession) {
            vscode.window.showWarningMessage('No active workflow session');
            return;
        }
        // Focus on the progress tree view
        vscode.commands.executeCommand('agents-playbook.workflowProgress.focus');
    }
    async validateStage() {
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
    approveStage(stageId) {
        console.log(`Approving stage: ${stageId}`);
        // Update stage status
        if (this.extensionState.activeSession?.currentStage?.stageId === stageId) {
            this.extensionState.activeSession.currentStage.status = 'completed';
            this.extensionState.activeSession.currentStage.validation = {
                ...this.extensionState.activeSession.currentStage.validation,
                requiresUserApproval: true,
                autoValidation: [],
                manualCheckpoints: [],
                approved: true
            };
        }
        // Update TASKS.md
        this.tasksManager.updateStageStatus(stageId, 'completed');
        // Resolve the orchestrator's validation promise
        if (this.extensionState.orchestrator) {
            this.extensionState.orchestrator.resolveStageValidation(stageId, true);
        }
    }
    rejectStage(stageId, reason) {
        console.log(`Rejecting stage: ${stageId}, reason: ${reason}`);
        if (this.extensionState.activeSession?.currentStage?.stageId === stageId) {
            this.extensionState.activeSession.currentStage.status = 'error';
            this.extensionState.activeSession.currentStage.validation = {
                ...this.extensionState.activeSession.currentStage.validation,
                requiresUserApproval: true,
                autoValidation: [],
                manualCheckpoints: [],
                approved: false,
                rejectionReason: reason
            };
        }
        this.tasksManager.updateStageStatus(stageId, 'error');
        // Resolve the orchestrator's validation promise with rejection
        if (this.extensionState.orchestrator) {
            this.extensionState.orchestrator.resolveStageValidation(stageId, false);
        }
    }
    modifyStage(stageId, changes) {
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
    skipStage(stageId, reason) {
        console.log(`Skipping stage: ${stageId}, reason: ${reason}`);
        if (this.extensionState.activeSession?.currentStage?.stageId === stageId) {
            this.extensionState.activeSession.currentStage.status = 'skipped';
        }
        this.tasksManager.updateStageStatus(stageId, 'skipped');
    }
    async showHelp() {
        vscode.window.showInformationMessage('Agents Playbook: Multi-Agent Workflow Extension', 'View Documentation').then(selection => {
            if (selection === 'View Documentation') {
                vscode.env.openExternal(vscode.Uri.parse('https://github.com/ivanbunin/agents-playbook'));
            }
        });
    }
    async quickStart() {
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
                    }
                    else {
                        vscode.window.showInformationMessage('Workflow is running but no current stage available');
                    }
                }
                else {
                    vscode.window.showInformationMessage('No active workflow. Start a new workflow first.');
                }
                break;
            case '⚙️ Configure Settings':
                vscode.commands.executeCommand('workbench.action.openSettings', 'agents-playbook');
                break;
        }
    }
    async assignAgent(stageId) {
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
        }
        catch (error) {
            console.error('Failed to assign agent:', error);
            vscode.window.showErrorMessage(`Failed to assign agent: ${error}`);
        }
    }
    async handoffAgent() {
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
        }
        catch (error) {
            console.error('Failed to handoff agent:', error);
            vscode.window.showErrorMessage(`Failed to handoff agent: ${error}`);
        }
    }
    async stopWorkflow() {
        if (!this.extensionState.activeSession) {
            vscode.window.showWarningMessage('No active workflow to stop');
            return;
        }
        const confirm = await vscode.window.showWarningMessage('Are you sure you want to stop the current workflow?', { modal: true }, 'Yes', 'No');
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
    dispose() {
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
exports.AgentsPlaybookExtension = AgentsPlaybookExtension;
// Extension activation function
function activate(context) {
    const extension = new AgentsPlaybookExtension(context);
    return extension.activate();
}
function deactivate() {
    // Extension cleanup is handled by the AgentsPlaybookExtension.dispose() method
}
//# sourceMappingURL=extension.js.map