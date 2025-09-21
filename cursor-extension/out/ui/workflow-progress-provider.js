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
exports.WorkflowProgressProvider = void 0;
const vscode = __importStar(require("vscode"));
const types_1 = require("../types");
class WorkflowProgressProvider {
    constructor(extensionState) {
        this.extensionState = extensionState;
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
    }
    refresh() {
        this._onDidChangeTreeData.fire();
    }
    getTreeItem(element) {
        const item = new vscode.TreeItem(element.label, element.collapsibleState);
        // Set icon based on status
        item.iconPath = this.getIconForStatus(element.status);
        // Set context value for commands
        item.contextValue = element.contextValue;
        // Set description
        item.description = element.description;
        // Set tooltip
        item.tooltip = element.tooltip;
        return item;
    }
    getChildren(element) {
        if (!this.extensionState.activeSession) {
            return Promise.resolve([]);
        }
        if (!element) {
            // Root level - show workflow info
            return Promise.resolve(this.getWorkflowNodes());
        }
        if (element.contextValue === 'workflow') {
            // Show phases
            return Promise.resolve(this.getPhaseNodes());
        }
        if (element.contextValue === 'phase') {
            // Show stages for this phase
            return Promise.resolve(this.getStageNodes(element.phase));
        }
        return Promise.resolve([]);
    }
    getWorkflowNodes() {
        const session = this.extensionState.activeSession;
        const workflowNode = {
            label: session.orchestrator.workflowConfig.name,
            collapsibleState: vscode.TreeItemCollapsibleState.Expanded,
            contextValue: 'workflow',
            status: session.status,
            description: this.getProgressDescription(session),
            tooltip: `Workflow: ${session.workflowId}\nStarted: ${session.startTime.toLocaleString()}\nStatus: ${session.status}`
        };
        return [workflowNode];
    }
    getPhaseNodes() {
        const session = this.extensionState.activeSession;
        const phases = session.orchestrator.workflowConfig.phases;
        return phases.map(phase => {
            const phaseStages = this.getStagesForPhase(phase.phase);
            const completedStages = phaseStages.filter(stage => stage.status === types_1.StageStatus.COMPLETED);
            const status = this.getPhaseStatus(phaseStages);
            return {
                label: phase.phase,
                collapsibleState: vscode.TreeItemCollapsibleState.Expanded,
                contextValue: 'phase',
                phase: phase.phase,
                status,
                description: `${completedStages.length}/${phaseStages.length}`,
                tooltip: `Phase: ${phase.phase}\nDescription: ${phase.description}\nCompleted: ${completedStages.length}/${phaseStages.length}`
            };
        });
    }
    getStageNodes(phase) {
        const stages = this.getStagesForPhase(phase);
        return stages.map(stage => {
            const assignedAgent = this.extensionState.activeSession?.orchestrator.agentAssignments.get(stage.stageId);
            return {
                label: stage.name,
                collapsibleState: vscode.TreeItemCollapsibleState.None,
                contextValue: 'stage',
                stageId: stage.stageId,
                status: stage.status,
                description: this.getStageDescription(stage),
                tooltip: this.getStageTooltip(stage, assignedAgent)
            };
        });
    }
    getStagesForPhase(phase) {
        if (!this.extensionState.activeSession) {
            return [];
        }
        // Get all stages (completed + current + queued)
        const allStages = [
            ...this.extensionState.activeSession.completedStages,
            ...(this.extensionState.activeSession.currentStage ? [this.extensionState.activeSession.currentStage] : []),
            ...this.extensionState.activeSession.orchestrator.stageQueue
        ];
        // Filter by phase and remove duplicates
        const phaseStages = allStages.filter(stage => stage.phase === phase);
        const uniqueStages = phaseStages.filter((stage, index, self) => index === self.findIndex(s => s.stageId === stage.stageId));
        return uniqueStages;
    }
    getPhaseStatus(stages) {
        if (stages.length === 0)
            return types_1.StageStatus.PENDING;
        const hasError = stages.some(stage => stage.status === types_1.StageStatus.ERROR);
        if (hasError)
            return types_1.StageStatus.ERROR;
        const allCompleted = stages.every(stage => stage.status === types_1.StageStatus.COMPLETED || stage.status === types_1.StageStatus.SKIPPED);
        if (allCompleted)
            return types_1.StageStatus.COMPLETED;
        const hasInProgress = stages.some(stage => stage.status === types_1.StageStatus.IN_PROGRESS || stage.status === types_1.StageStatus.VALIDATION);
        if (hasInProgress)
            return types_1.StageStatus.IN_PROGRESS;
        return types_1.StageStatus.PENDING;
    }
    getProgressDescription(session) {
        const totalStages = session.orchestrator.executionPlan.totalSteps;
        const completedStages = session.completedStages.length;
        const percentage = totalStages > 0 ? Math.round((completedStages / totalStages) * 100) : 0;
        return `${percentage}% (${completedStages}/${totalStages})`;
    }
    getStageDescription(stage) {
        switch (stage.status) {
            case types_1.StageStatus.COMPLETED:
                return '✓ Completed';
            case types_1.StageStatus.IN_PROGRESS:
                return '⏳ In Progress';
            case types_1.StageStatus.VALIDATION:
                return '🔍 Validating';
            case types_1.StageStatus.ERROR:
                return '❌ Error';
            case types_1.StageStatus.SKIPPED:
                return '⏭️ Skipped';
            case types_1.StageStatus.PENDING:
            default:
                return '⌛ Pending';
        }
    }
    getStageTooltip(stage, assignedAgent) {
        let tooltip = `Stage: ${stage.name}\nPhase: ${stage.phase}\nStatus: ${stage.status}`;
        if (assignedAgent) {
            tooltip += `\nAssigned Agent: ${assignedAgent}`;
        }
        if (stage.startTime) {
            tooltip += `\nStarted: ${stage.startTime.toLocaleString()}`;
        }
        if (stage.endTime) {
            tooltip += `\nCompleted: ${stage.endTime.toLocaleString()}`;
        }
        if (stage.dependencies.length > 0) {
            tooltip += `\nDependencies: ${stage.dependencies.join(', ')}`;
        }
        return tooltip;
    }
    getIconForStatus(status) {
        switch (status) {
            case types_1.StageStatus.COMPLETED:
                return new vscode.ThemeIcon('check', new vscode.ThemeColor('testing.iconPassed'));
            case types_1.StageStatus.IN_PROGRESS:
                return new vscode.ThemeIcon('loading~spin', new vscode.ThemeColor('testing.iconQueued'));
            case types_1.StageStatus.VALIDATION:
                return new vscode.ThemeIcon('eye', new vscode.ThemeColor('testing.iconQueued'));
            case types_1.StageStatus.ERROR:
                return new vscode.ThemeIcon('error', new vscode.ThemeColor('testing.iconFailed'));
            case types_1.StageStatus.SKIPPED:
                return new vscode.ThemeIcon('debug-step-over', new vscode.ThemeColor('testing.iconSkipped'));
            case types_1.StageStatus.PENDING:
            default:
                return new vscode.ThemeIcon('circle-outline', new vscode.ThemeColor('testing.iconUnset'));
        }
    }
}
exports.WorkflowProgressProvider = WorkflowProgressProvider;
//# sourceMappingURL=workflow-progress-provider.js.map