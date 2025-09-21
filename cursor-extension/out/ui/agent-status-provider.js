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
exports.AgentStatusProvider = void 0;
const vscode = __importStar(require("vscode"));
const types_1 = require("../types");
class AgentStatusProvider {
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
    getChildren(element) {
        if (!this.extensionState.activeSession) {
            return Promise.resolve([]);
        }
        if (!element) {
            // Root level - show agent summary and active agents
            return Promise.resolve(this.getAgentNodes());
        }
        return Promise.resolve([]);
    }
    getAgentNodes() {
        const nodes = [];
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
    createOrchestratorNode() {
        const orchestrator = this.extensionState.orchestrator;
        const session = this.extensionState.activeSession;
        return {
            label: 'Orchestrator',
            collapsibleState: vscode.TreeItemCollapsibleState.None,
            contextValue: 'orchestrator',
            agentType: 'orchestrator',
            status: session.status,
            description: `${session.completedStages.length}/${orchestrator.context.totalSteps} stages`,
            tooltip: `Orchestrator: ${orchestrator.orchestratorId}\nWorkflow: ${session.workflowId}\nStatus: ${session.status}\nProgress: ${session.completedStages.length}/${orchestrator.context.totalSteps}`
        };
    }
    createAgentNode(agent, context) {
        const tokensUsed = this.getTokensUsedForAgent(agent.agentId);
        const tokenUtilization = Math.round((tokensUsed / context.maxTokens) * 100);
        return {
            label: `${agent.type} Agent`,
            collapsibleState: vscode.TreeItemCollapsibleState.None,
            contextValue: 'agent',
            agentType: agent.type,
            status: agent.status || types_1.AgentStatus.IDLE,
            description: `${tokenUtilization}% tokens`,
            tooltip: this.getAgentTooltip(agent, context, tokensUsed)
        };
    }
    createAgentPoolSummaryNode() {
        const totalAgents = this.extensionState.agentPool.size;
        const activeAgents = this.extensionState.activeSession?.activeAgents.size || 0;
        return {
            label: 'Agent Pool',
            collapsibleState: vscode.TreeItemCollapsibleState.None,
            contextValue: 'pool',
            agentType: 'pool',
            status: totalAgents > 0 ? 'active' : 'idle',
            description: `${activeAgents}/${totalAgents} active`,
            tooltip: `Total Agents: ${totalAgents}\nActive Agents: ${activeAgents}\nMax Concurrent: ${this.extensionState.config.orchestrator.maxConcurrentAgents}`
        };
    }
    getTokensUsedForAgent(agentId) {
        // In a real implementation, this would track actual token usage
        // For now, return a simulated value
        return Math.floor(Math.random() * 5000);
    }
    getAgentTooltip(agent, context, tokensUsed) {
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
    getIconForAgent(agentType, status) {
        // Choose icon based on agent type
        let iconName = 'person';
        switch (agentType) {
            case types_1.AgentType.ANALYSIS:
            case 'analysis':
                iconName = 'search';
                break;
            case types_1.AgentType.DESIGN:
            case 'design':
                iconName = 'symbol-structure';
                break;
            case types_1.AgentType.PLANNING:
            case 'planning':
                iconName = 'list-ordered';
                break;
            case types_1.AgentType.IMPLEMENTATION:
            case 'implementation':
                iconName = 'code';
                break;
            case types_1.AgentType.TESTING:
            case 'testing':
                iconName = 'beaker';
                break;
            case types_1.AgentType.REFACTORING:
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
        let color;
        switch (status) {
            case types_1.AgentStatus.EXECUTING:
            case 'executing':
            case 'running':
                color = new vscode.ThemeColor('testing.iconQueued');
                break;
            case types_1.AgentStatus.COMPLETED:
            case 'completed':
                color = new vscode.ThemeColor('testing.iconPassed');
                break;
            case types_1.AgentStatus.ERROR:
            case 'error':
                color = new vscode.ThemeColor('testing.iconFailed');
                break;
            case types_1.AgentStatus.WAITING_VALIDATION:
            case 'waiting_validation':
                color = new vscode.ThemeColor('testing.iconQueued');
                break;
            case types_1.AgentStatus.IDLE:
            case 'idle':
            default:
                color = new vscode.ThemeColor('testing.iconUnset');
                break;
        }
        return new vscode.ThemeIcon(iconName, color);
    }
}
exports.AgentStatusProvider = AgentStatusProvider;
//# sourceMappingURL=agent-status-provider.js.map