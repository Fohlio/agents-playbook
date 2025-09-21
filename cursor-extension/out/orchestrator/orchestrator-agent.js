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
exports.OrchestratorAgent = void 0;
const vscode = __importStar(require("vscode"));
const types_1 = require("../types");
const sub_agent_factory_1 = require("../agents/sub-agent-factory");
const workflow_parser_1 = require("../workflow/workflow-parser");
class OrchestratorAgent {
    constructor(config, contextManager, eventEmitter) {
        this.config = config;
        this.contextManager = contextManager;
        this.eventEmitter = eventEmitter;
        this.stageValidationResolvers = new Map();
        this.orchestratorId = `orchestrator-${Date.now()}`;
        this.agentFactory = new sub_agent_factory_1.SubAgentFactory(config, contextManager);
        this.workflowParser = new workflow_parser_1.WorkflowParser();
    }
    async executeWorkflow(workflowId) {
        console.log(`Orchestrator ${this.orchestratorId} starting workflow: ${workflowId}`);
        // Get initial user requirements
        const userRequirements = await this.getUserRequirements(workflowId);
        if (!userRequirements) {
            throw new Error('Workflow cancelled - no requirements provided');
        }
        try {
            // Load workflow configuration
            const workflowConfig = await this.loadWorkflowConfig(workflowId);
            // Parse workflow into execution plan
            const executionPlan = await this.createExecutionPlan(workflowConfig);
            // Initialize orchestrator context
            this.context = {
                orchestratorId: this.orchestratorId,
                workflowConfig,
                executionPlan,
                currentStep: 0,
                totalSteps: executionPlan.totalSteps,
                agentAssignments: new Map(),
                stageQueue: [],
                handoffQueue: []
            };
            // Create workflow session with user requirements
            this.activeSession = {
                sessionId: `session-${Date.now()}`,
                workflowId,
                startTime: new Date(),
                status: types_1.WorkflowStatus.RUNNING,
                completedStages: [],
                activeAgents: new Map(),
                orchestrator: this.context,
                userRequirements // Store user requirements
            };
            // Parse stages from workflow config
            const stages = this.parseWorkflowStages(workflowConfig);
            this.context.stageQueue = stages;
            // Start orchestration
            await this.orchestrate();
            return this.activeSession;
        }
        catch (error) {
            console.error(`Failed to execute workflow ${workflowId}:`, error);
            throw error;
        }
    }
    async loadWorkflowConfig(workflowId) {
        // In a real implementation, this would load from the workspace
        // For now, we'll create a simplified config
        return {
            name: `Workflow ${workflowId}`,
            description: `Executing workflow ${workflowId}`,
            phases: [
                {
                    phase: 'analysis',
                    description: 'Requirements analysis',
                    required: true,
                    steps: [
                        {
                            id: 'create-structured-requirements',
                            miniPrompt: 'analysis/create-structured-requirements',
                            required: true,
                            prerequisites: {
                                requiredContext: [],
                                optionalContext: ['product_roadmap', 'user_feedback']
                            },
                            outputs: ['structured_requirements']
                        }
                    ]
                }
            ]
        };
    }
    async createExecutionPlan(workflow) {
        const totalSteps = workflow.phases.reduce((sum, phase) => sum + phase.steps.length, 0);
        return {
            workflowId: workflow.name,
            totalSteps,
            executableSteps: totalSteps, // Simplified - would check prerequisites
            skippedSteps: [],
            executionRate: 100,
            phases: workflow.phases.map(phase => ({
                name: phase.phase,
                totalSteps: phase.steps.length,
                executableSteps: phase.steps.length,
                skippedSteps: [],
                steps: phase.steps.map(step => ({
                    id: step.id,
                    title: step.miniPrompt,
                    willExecute: true,
                    validation: {} // Simplified
                }))
            }))
        };
    }
    parseWorkflowStages(workflow) {
        const stages = [];
        for (const phase of workflow.phases) {
            for (const step of phase.steps) {
                stages.push({
                    stageId: step.id,
                    name: step.miniPrompt.split('/').pop() || step.id,
                    phase: phase.phase,
                    miniPromptPath: step.miniPrompt,
                    status: types_1.StageStatus.PENDING,
                    prerequisites: {
                        requiredContext: step.prerequisites.requiredContext,
                        optionalContext: step.prerequisites.optionalContext,
                        dependencies: step.dependencies || []
                    },
                    dependencies: step.dependencies || []
                });
            }
        }
        return stages;
    }
    async orchestrate() {
        if (!this.activeSession) {
            throw new Error('No active session for orchestration');
        }
        console.log(`Starting orchestration of ${this.context.stageQueue.length} stages`);
        for (const stage of this.context.stageQueue) {
            try {
                // Set current stage
                this.activeSession.currentStage = stage;
                // Check if we can execute this stage
                if (!await this.canExecuteStage(stage)) {
                    console.log(`Skipping stage ${stage.stageId} - prerequisites not met`);
                    stage.status = types_1.StageStatus.SKIPPED;
                    continue;
                }
                // Assign and execute stage
                await this.executeStage(stage);
                // Move to completed stages
                this.activeSession.completedStages.push(stage);
                // Emit stage completion event
                this.emitEvent('stage_completed', {
                    stageId: stage.stageId,
                    result: 'success'
                });
            }
            catch (error) {
                console.error(`Failed to execute stage ${stage.stageId}:`, error);
                stage.status = types_1.StageStatus.ERROR;
                // Decide whether to continue or abort
                const shouldContinue = await this.handleStageError(stage, error);
                if (!shouldContinue) {
                    break;
                }
            }
        }
        // Mark workflow as completed
        if (this.activeSession) {
            this.activeSession.status = types_1.WorkflowStatus.COMPLETED;
        }
    }
    async canExecuteStage(stage) {
        // Check dependencies
        for (const depId of stage.dependencies) {
            const dependency = this.activeSession?.completedStages.find(s => s.stageId === depId);
            if (!dependency || dependency.status !== types_1.StageStatus.COMPLETED) {
                return false;
            }
        }
        // Check required context
        // This would check against available context in a real implementation
        return true;
    }
    async executeStage(stage) {
        console.log(`Executing stage: ${stage.stageId}`);
        // Update stage status
        stage.status = types_1.StageStatus.IN_PROGRESS;
        stage.startTime = new Date();
        // Emit stage started event
        this.emitEvent('stage_started', {
            stageId: stage.stageId,
            stageName: stage.name
        });
        // Assign agent to stage
        const agentId = await this.assignAgent(stage);
        // Execute stage with assigned agent
        const agent = this.agentFactory.getAgent(agentId);
        if (!agent) {
            throw new Error(`Agent ${agentId} not found`);
        }
        // Create isolated context for the agent
        const isolatedContext = await this.contextManager.createIsolatedContext(agentId, stage, this.activeSession?.userRequirements);
        // Execute the stage
        const result = await agent.execute(isolatedContext);
        if (!result.success) {
            throw new Error(`Agent execution failed: ${result.errors?.join(', ')}`);
        }
        // Update stage with results
        stage.status = types_1.StageStatus.VALIDATION;
        stage.outputs = result.outputs ? Array.from(result.outputs.values()) : [];
        stage.endTime = new Date();
        // Request user validation
        const validated = await this.validateStage(stage);
        if (!validated) {
            throw new Error('Stage validation rejected by user');
        }
    }
    async assignAgent(stage) {
        console.log(`Assigning agent for stage: ${stage.stageId}`);
        // Determine agent type based on stage phase
        const agentType = this.getAgentTypeForPhase(stage.phase);
        // Create or get agent
        const agent = await this.agentFactory.createAgent(agentType);
        // Track assignment
        this.context.agentAssignments.set(stage.stageId, agent.agentId);
        // Add to active agents
        if (this.activeSession) {
            this.activeSession.activeAgents.set(agent.agentId, {
                agentId: agent.agentId,
                taskId: stage.stageId,
                workflowId: this.activeSession.workflowId,
                stageId: stage.stageId,
                maxTokens: this.config.agents[agentType].maxTokens,
                contextWindow: {
                    systemPrompt: '',
                    taskContext: '',
                    relevantFiles: [],
                    previousHandoffs: []
                },
                isolation: {
                    preventHistoryAccess: true,
                    cleanSlate: true,
                    maxContextSize: this.config.agents[agentType].maxTokens
                }
            });
        }
        // Emit agent assignment event
        this.emitEvent('agent_assigned', {
            stageId: stage.stageId,
            agentId: agent.agentId,
            agentType
        });
        return agent.agentId;
    }
    getAgentTypeForPhase(phase) {
        switch (phase) {
            case 'analysis':
                return types_1.AgentType.ANALYSIS;
            case 'design-architecture':
            case 'design':
                return types_1.AgentType.DESIGN;
            case 'planning':
                return types_1.AgentType.PLANNING;
            case 'implementation':
                return types_1.AgentType.IMPLEMENTATION;
            case 'testing-review':
            case 'testing':
                return types_1.AgentType.TESTING;
            case 'refactoring':
                return types_1.AgentType.REFACTORING;
            default:
                return types_1.AgentType.ANALYSIS; // Default fallback
        }
    }
    async validateStage(stage) {
        console.log(`Validating stage: ${stage.stageId}`);
        // Show validation UI to user through event system
        this.emitEvent('validation_required', {
            stageId: stage.stageId,
            stage
        });
        // Return promise that will be resolved by the validation UI
        return new Promise((resolve) => {
            this.stageValidationResolvers.set(stage.stageId, resolve);
        });
    }
    // Methods for UI to resolve validation
    resolveStageValidation(stageId, approved) {
        const resolver = this.stageValidationResolvers.get(stageId);
        if (resolver) {
            resolver(approved);
            this.stageValidationResolvers.delete(stageId);
        }
    }
    async handoff(fromStage, toStage) {
        console.log(`Orchestrating handoff from ${fromStage} to ${toStage}`);
        const fromAgent = this.context.agentAssignments.get(fromStage);
        const toAgent = this.context.agentAssignments.get(toStage);
        if (!fromAgent || !toAgent) {
            throw new Error(`Invalid handoff: missing agents for ${fromStage} -> ${toStage}`);
        }
        // Create handoff request
        const handoffRequest = {
            fromStage,
            toStage,
            fromAgent,
            toAgent,
            context: this.activeSession?.activeAgents.get(fromAgent),
            priority: 1
        };
        this.context.handoffQueue.push(handoffRequest);
        // Emit handoff event
        this.emitEvent('handoff_initiated', {
            fromStage,
            toStage,
            fromAgent,
            toAgent
        });
        // Process handoff (simplified)
        await this.processHandoff(handoffRequest);
    }
    async processHandoff(request) {
        // In a real implementation, this would:
        // 1. Compress context from source agent
        // 2. Transfer compressed context to target agent
        // 3. Initialize target agent with new context
        // 4. Clean up source agent context
        console.log(`Processing handoff: ${request.fromAgent} -> ${request.toAgent}`);
        // For now, just log the handoff
        const handoffSummary = await this.contextManager.compressHandoff(request.context, 1000 // Target 1000 tokens for handoff
        );
        console.log('Handoff completed:', handoffSummary);
    }
    async getUserRequirements(workflowId) {
        const requirements = await vscode.window.showInputBox({
            prompt: `What would you like to build? (Workflow: ${workflowId})`,
            placeHolder: 'Describe your requirements, feature, or issue to fix...',
            ignoreFocusOut: true
        });
        return requirements;
    }
    async handleStageError(stage, error) {
        console.error(`Stage ${stage.stageId} failed:`, error);
        // Show error to user and ask if they want to continue
        const choice = await vscode.window.showErrorMessage(`Stage "${stage.name}" failed: ${error.message}`, 'Continue', 'Abort Workflow');
        return choice === 'Continue';
    }
    emitEvent(type, data) {
        const event = {
            type,
            workflowId: this.activeSession?.workflowId || '',
            data,
            timestamp: new Date()
        };
        this.eventEmitter.fire(event);
    }
    dispose() {
        console.log(`Disposing orchestrator: ${this.orchestratorId}`);
        // Cleanup agents
        this.agentFactory.dispose();
        // Clear session
        this.activeSession = undefined;
    }
}
exports.OrchestratorAgent = OrchestratorAgent;
//# sourceMappingURL=orchestrator-agent.js.map