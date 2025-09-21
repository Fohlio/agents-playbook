import * as vscode from 'vscode';
import {
  ExtensionState,
  WorkflowSession,
  WorkflowStage,
  StageStatus
} from '../types';

export class WorkflowProgressProvider implements vscode.TreeDataProvider<WorkflowNode> {
  private _onDidChangeTreeData: vscode.EventEmitter<WorkflowNode | undefined | null | void> = new vscode.EventEmitter<WorkflowNode | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<WorkflowNode | undefined | null | void> = this._onDidChangeTreeData.event;

  constructor(private extensionState: ExtensionState) {}

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: WorkflowNode): vscode.TreeItem {
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

  getChildren(element?: WorkflowNode): Thenable<WorkflowNode[]> {
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
      return Promise.resolve(this.getStageNodes(element.phase!));
    }

    return Promise.resolve([]);
  }

  private getWorkflowNodes(): WorkflowNode[] {
    const session = this.extensionState.activeSession!;

    const workflowNode: WorkflowNode = {
      label: session.orchestrator.workflowConfig.name,
      collapsibleState: vscode.TreeItemCollapsibleState.Expanded,
      contextValue: 'workflow',
      status: session.status as unknown as StageStatus,
      description: this.getProgressDescription(session),
      tooltip: `Workflow: ${session.workflowId}\nStarted: ${session.startTime.toLocaleString()}\nStatus: ${session.status}`
    };

    return [workflowNode];
  }

  private getPhaseNodes(): WorkflowNode[] {
    const session = this.extensionState.activeSession!;
    const phases = session.orchestrator.workflowConfig.phases;

    return phases.map(phase => {
      const phaseStages = this.getStagesForPhase(phase.phase);
      const completedStages = phaseStages.filter(stage => stage.status === StageStatus.COMPLETED);
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

  private getStageNodes(phase: string): WorkflowNode[] {
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

  private getStagesForPhase(phase: string): WorkflowStage[] {
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
    const uniqueStages = phaseStages.filter((stage, index, self) =>
      index === self.findIndex(s => s.stageId === stage.stageId)
    );

    return uniqueStages;
  }

  private getPhaseStatus(stages: WorkflowStage[]): StageStatus {
    if (stages.length === 0) return StageStatus.PENDING;

    const hasError = stages.some(stage => stage.status === StageStatus.ERROR);
    if (hasError) return StageStatus.ERROR;

    const allCompleted = stages.every(stage =>
      stage.status === StageStatus.COMPLETED || stage.status === StageStatus.SKIPPED
    );
    if (allCompleted) return StageStatus.COMPLETED;

    const hasInProgress = stages.some(stage =>
      stage.status === StageStatus.IN_PROGRESS || stage.status === StageStatus.VALIDATION
    );
    if (hasInProgress) return StageStatus.IN_PROGRESS;

    return StageStatus.PENDING;
  }

  private getProgressDescription(session: WorkflowSession): string {
    const totalStages = session.orchestrator.executionPlan.totalSteps;
    const completedStages = session.completedStages.length;
    const percentage = totalStages > 0 ? Math.round((completedStages / totalStages) * 100) : 0;

    return `${percentage}% (${completedStages}/${totalStages})`;
  }

  private getStageDescription(stage: WorkflowStage): string {
    switch (stage.status) {
      case StageStatus.COMPLETED:
        return '✓ Completed';
      case StageStatus.IN_PROGRESS:
        return '⏳ In Progress';
      case StageStatus.VALIDATION:
        return '🔍 Validating';
      case StageStatus.ERROR:
        return '❌ Error';
      case StageStatus.SKIPPED:
        return '⏭️ Skipped';
      case StageStatus.PENDING:
      default:
        return '⌛ Pending';
    }
  }

  private getStageTooltip(stage: WorkflowStage, assignedAgent?: string): string {
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

  private getIconForStatus(status: StageStatus | string): vscode.ThemeIcon {
    switch (status) {
      case StageStatus.COMPLETED:
        return new vscode.ThemeIcon('check', new vscode.ThemeColor('testing.iconPassed'));
      case StageStatus.IN_PROGRESS:
        return new vscode.ThemeIcon('loading~spin', new vscode.ThemeColor('testing.iconQueued'));
      case StageStatus.VALIDATION:
        return new vscode.ThemeIcon('eye', new vscode.ThemeColor('testing.iconQueued'));
      case StageStatus.ERROR:
        return new vscode.ThemeIcon('error', new vscode.ThemeColor('testing.iconFailed'));
      case StageStatus.SKIPPED:
        return new vscode.ThemeIcon('debug-step-over', new vscode.ThemeColor('testing.iconSkipped'));
      case StageStatus.PENDING:
      default:
        return new vscode.ThemeIcon('circle-outline', new vscode.ThemeColor('testing.iconUnset'));
    }
  }
}

export interface WorkflowNode {
  label: string;
  collapsibleState: vscode.TreeItemCollapsibleState;
  contextValue: string;
  status: StageStatus | string;
  description?: string;
  tooltip?: string;
  phase?: string;
  stageId?: string;
}