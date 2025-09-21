import * as vscode from 'vscode';
import {
  ExtensionState,
  AgentStatus,
  AgentType
} from '../types';

export class AgentStatusProvider implements vscode.TreeDataProvider<AgentNode> {
  private _onDidChangeTreeData: vscode.EventEmitter<AgentNode | undefined | null | void> = new vscode.EventEmitter<AgentNode | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<AgentNode | undefined | null | void> = this._onDidChangeTreeData.event;

  constructor(private extensionState: ExtensionState) {}

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: AgentNode): vscode.TreeItem {
    const item = new vscode.TreeItem(element.label, element.collapsibleState);

    // Set icon based on agent type and status
    item.iconPath = this.getIconForAgent(element.agentType, element.status);

    // Set context value for commands
    item.contextValue = element.contextValue;

    // Set description
    item.description = element.description;

    // Set tooltip
    item.tooltip = element.tooltip;

    return item;
  }

  getChildren(element?: AgentNode): Thenable<AgentNode[]> {
    if (!this.extensionState.activeSession) {
      return Promise.resolve([]);
    }

    if (!element) {
      // Root level - show agent summary and active agents
      return Promise.resolve(this.getAgentNodes());
    }

    return Promise.resolve([]);
  }

  private getAgentNodes(): AgentNode[] {
    const nodes: AgentNode[] = [];

    // Add orchestrator node
    if (this.extensionState.orchestrator) {
      nodes.push(this.createOrchestratorNode());
    }

    // Add active agents
    if (this.extensionState.activeSession) {
      for (const [agentId, context] of this.extensionState.activeSession.activeAgents.entries()) {
        const agent = this.extensionState.agentPool.get(agentId);
        if (agent) {
          nodes.push(this.createAgentNode(agent, context));
        }
      }
    }

    // Add agent pool summary
    nodes.push(this.createAgentPoolSummaryNode());

    return nodes;
  }

  private createOrchestratorNode(): AgentNode {
    const orchestrator = this.extensionState.orchestrator!;
    const session = this.extensionState.activeSession!;

    return {
      label: 'Orchestrator',
      collapsibleState: vscode.TreeItemCollapsibleState.None,
      contextValue: 'orchestrator',
      agentType: 'orchestrator' as any,
      status: session.status as any,
      description: `${session.completedStages.length}/${orchestrator.context.totalSteps} stages`,
      tooltip: `Orchestrator: ${orchestrator.orchestratorId}\nWorkflow: ${session.workflowId}\nStatus: ${session.status}\nProgress: ${session.completedStages.length}/${orchestrator.context.totalSteps}`
    };
  }

  private createAgentNode(agent: any, context: any): AgentNode {
    const tokensUsed = this.getTokensUsedForAgent(agent.agentId);
    const tokenUtilization = Math.round((tokensUsed / context.maxTokens) * 100);

    return {
      label: `${agent.type} Agent`,
      collapsibleState: vscode.TreeItemCollapsibleState.None,
      contextValue: 'agent',
      agentType: agent.type,
      status: agent.status || AgentStatus.IDLE,
      description: `${tokenUtilization}% tokens`,
      tooltip: this.getAgentTooltip(agent, context, tokensUsed)
    };
  }

  private createAgentPoolSummaryNode(): AgentNode {
    const totalAgents = this.extensionState.agentPool.size;
    const activeAgents = this.extensionState.activeSession?.activeAgents.size || 0;

    return {
      label: 'Agent Pool',
      collapsibleState: vscode.TreeItemCollapsibleState.None,
      contextValue: 'pool',
      agentType: 'pool' as any,
      status: totalAgents > 0 ? 'active' : 'idle',
      description: `${activeAgents}/${totalAgents} active`,
      tooltip: `Total Agents: ${totalAgents}\nActive Agents: ${activeAgents}\nMax Concurrent: ${this.extensionState.config.orchestrator.maxConcurrentAgents}`
    };
  }

  private getTokensUsedForAgent(agentId: string): number {
    // In a real implementation, this would track actual token usage
    // For now, return a simulated value
    return Math.floor(Math.random() * 5000);
  }

  private getAgentTooltip(agent: any, context: any, tokensUsed: number): string {
    let tooltip = `Agent ID: ${agent.agentId}\nType: ${agent.type}\nStatus: ${agent.status}`;

    tooltip += `\nTask: ${context.taskId}`;
    tooltip += `\nTokens Used: ${tokensUsed}/${context.maxTokens}`;

    if (agent.currentTask) {
      tooltip += `\nCurrent Task: ${agent.currentTask}`;
    }

    if (agent.startTime) {
      const duration = Date.now() - agent.startTime.getTime();
      tooltip += `\nRunning for: ${Math.round(duration / 1000)}s`;
    }

    return tooltip;
  }

  private getIconForAgent(agentType: AgentType | string, status: AgentStatus | string): vscode.ThemeIcon {
    // Choose icon based on agent type
    let iconName = 'person';

    switch (agentType) {
      case AgentType.ANALYSIS:
      case 'analysis':
        iconName = 'search';
        break;
      case AgentType.DESIGN:
      case 'design':
        iconName = 'symbol-structure';
        break;
      case AgentType.PLANNING:
      case 'planning':
        iconName = 'list-ordered';
        break;
      case AgentType.IMPLEMENTATION:
      case 'implementation':
        iconName = 'code';
        break;
      case AgentType.TESTING:
      case 'testing':
        iconName = 'beaker';
        break;
      case AgentType.REFACTORING:
      case 'refactoring':
        iconName = 'tools';
        break;
      case 'orchestrator':
        iconName = 'organization';
        break;
      case 'pool':
        iconName = 'people';
        break;
    }

    // Choose color based on status
    let color: vscode.ThemeColor | undefined;

    switch (status) {
      case AgentStatus.EXECUTING:
      case 'executing':
      case 'running':
        color = new vscode.ThemeColor('testing.iconQueued');
        break;
      case AgentStatus.COMPLETED:
      case 'completed':
        color = new vscode.ThemeColor('testing.iconPassed');
        break;
      case AgentStatus.ERROR:
      case 'error':
        color = new vscode.ThemeColor('testing.iconFailed');
        break;
      case AgentStatus.WAITING_VALIDATION:
      case 'waiting_validation':
        color = new vscode.ThemeColor('testing.iconQueued');
        break;
      case AgentStatus.IDLE:
      case 'idle':
      default:
        color = new vscode.ThemeColor('testing.iconUnset');
        break;
    }

    return new vscode.ThemeIcon(iconName, color);
  }
}

export interface AgentNode {
  label: string;
  collapsibleState: vscode.TreeItemCollapsibleState;
  contextValue: string;
  agentType: AgentType | string;
  status: AgentStatus | string;
  description?: string;
  tooltip?: string;
}