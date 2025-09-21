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
exports.TasksMarkdownManager = void 0;
const vscode = __importStar(require("vscode"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const types_1 = require("../types");
class TasksMarkdownManager {
    async initializeTasksFile(session) {
        try {
            const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
            if (!workspaceFolder) {
                throw new Error('No workspace folder found');
            }
            this.tasksFilePath = path.join(workspaceFolder.uri.fsPath, 'TASKS.md');
            const tasksData = {
                workflowName: session.orchestrator.workflowConfig.name,
                startedAt: session.startTime,
                status: session.status,
                orchestrator: {
                    workflowId: session.workflowId,
                    status: session.status
                },
                stageAssignments: [],
                userRequirements: session.userRequirements || 'No requirements specified'
            };
            // Initialize stage assignments from orchestrator context
            for (const stage of session.orchestrator.stageQueue) {
                tasksData.stageAssignments.push({
                    stageId: stage.stageId,
                    stageName: stage.name,
                    status: stage.status,
                    expectedOutput: stage.outputs ? stage.outputs.join(', ') : undefined
                });
            }
            await this.writeTasksFile(tasksData);
            console.log(`Initialized TASKS.md at: ${this.tasksFilePath}`);
        }
        catch (error) {
            console.error('Failed to initialize TASKS.md:', error);
            throw error;
        }
    }
    async updateStageAssignment(stageId, agentId) {
        try {
            const tasksData = await this.readTasksFile();
            if (!tasksData) {
                console.warn('No TASKS.md file found for update');
                return;
            }
            const stageAssignment = tasksData.stageAssignments.find(s => s.stageId === stageId);
            if (stageAssignment) {
                stageAssignment.agentId = agentId;
                stageAssignment.startedAt = new Date();
                stageAssignment.status = types_1.StageStatus.IN_PROGRESS;
            }
            await this.writeTasksFile(tasksData);
            console.log(`Updated stage assignment: ${stageId} -> ${agentId}`);
        }
        catch (error) {
            console.error(`Failed to update stage assignment for ${stageId}:`, error);
        }
    }
    async updateStageStatus(stageId, status, actualOutput) {
        try {
            const tasksData = await this.readTasksFile();
            if (!tasksData) {
                console.warn('No TASKS.md file found for update');
                return;
            }
            const stageAssignment = tasksData.stageAssignments.find(s => s.stageId === stageId);
            if (stageAssignment) {
                stageAssignment.status = status;
                if (status === types_1.StageStatus.COMPLETED || status === types_1.StageStatus.ERROR || status === types_1.StageStatus.SKIPPED) {
                    stageAssignment.completedAt = new Date();
                }
                if (actualOutput) {
                    stageAssignment.actualOutput = actualOutput;
                }
            }
            await this.writeTasksFile(tasksData);
            console.log(`Updated stage status: ${stageId} -> ${status}`);
        }
        catch (error) {
            console.error(`Failed to update stage status for ${stageId}:`, error);
        }
    }
    async updateTokenUsage(stageId, tokenUsage) {
        try {
            const tasksData = await this.readTasksFile();
            if (!tasksData) {
                console.warn('No TASKS.md file found for update');
                return;
            }
            const stageAssignment = tasksData.stageAssignments.find(s => s.stageId === stageId);
            if (stageAssignment) {
                stageAssignment.tokenUsage = tokenUsage;
            }
            await this.writeTasksFile(tasksData);
        }
        catch (error) {
            console.error(`Failed to update token usage for ${stageId}:`, error);
        }
    }
    async updateWorkflowStatus(status) {
        try {
            const tasksData = await this.readTasksFile();
            if (!tasksData) {
                console.warn('No TASKS.md file found for update');
                return;
            }
            tasksData.status = status;
            tasksData.orchestrator.status = status;
            await this.writeTasksFile(tasksData);
            console.log(`Updated workflow status: ${status}`);
        }
        catch (error) {
            console.error(`Failed to update workflow status:`, error);
        }
    }
    async readTasksFile() {
        try {
            if (!this.tasksFilePath || !fs.existsSync(this.tasksFilePath)) {
                return null;
            }
            const content = fs.readFileSync(this.tasksFilePath, 'utf8');
            return this.parseTasksMarkdown(content);
        }
        catch (error) {
            console.error('Failed to read TASKS.md:', error);
            return null;
        }
    }
    parseTasksMarkdown(content) {
        // Parse the markdown content to extract task data
        // This is a simplified parser - in a real implementation, you'd use a proper markdown parser
        const lines = content.split('\n');
        const tasksData = {
            workflowName: '',
            startedAt: new Date(),
            status: 'pending',
            orchestrator: {
                workflowId: '',
                status: 'pending'
            },
            stageAssignments: []
        };
        let currentSection = '';
        let currentStage = {};
        for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('# Project Tasks -')) {
                tasksData.workflowName = trimmed.replace('# Project Tasks - ', '');
            }
            else if (trimmed.startsWith('- Workflow:')) {
                tasksData.orchestrator.workflowId = trimmed.replace('- Workflow: ', '');
            }
            else if (trimmed.startsWith('- Started:')) {
                const dateStr = trimmed.replace('- Started: ', '');
                tasksData.startedAt = new Date(dateStr);
            }
            else if (trimmed.startsWith('- Status:')) {
                tasksData.status = trimmed.replace('- Status: ', '');
            }
            else if (trimmed.startsWith('### ')) {
                // Stage section
                if (currentStage.stageId) {
                    tasksData.stageAssignments.push(currentStage);
                }
                currentStage = {
                    stageName: trimmed.replace('### ', '').replace(/^[✅🔄⏳❌⏭️⌛]\s*/, ''),
                    status: this.parseStatusFromHeader(trimmed)
                };
            }
            else if (trimmed.startsWith('- Agent:')) {
                currentStage.agentId = trimmed.replace('- Agent: ', '');
            }
            else if (trimmed.startsWith('- Started:')) {
                const dateStr = trimmed.replace('- Started: ', '');
                currentStage.startedAt = new Date(dateStr);
            }
            else if (trimmed.startsWith('- Completed:')) {
                const dateStr = trimmed.replace('- Completed: ', '');
                currentStage.completedAt = new Date(dateStr);
            }
            else if (trimmed.startsWith('- Expected Output:')) {
                currentStage.expectedOutput = trimmed.replace('- Expected Output: ', '');
            }
            else if (trimmed.startsWith('- Actual Output:')) {
                currentStage.actualOutput = trimmed.replace('- Actual Output: ', '');
            }
            else if (trimmed.startsWith('- Token Usage:')) {
                const tokenStr = trimmed.replace('- Token Usage: ', '').replace(/[^\d]/g, '');
                currentStage.tokenUsage = parseInt(tokenStr) || 0;
            }
        }
        // Add the last stage
        if (currentStage.stageId) {
            tasksData.stageAssignments.push(currentStage);
        }
        return tasksData;
    }
    parseStatusFromHeader(header) {
        if (header.includes('✅'))
            return types_1.StageStatus.COMPLETED;
        if (header.includes('🔄'))
            return types_1.StageStatus.IN_PROGRESS;
        if (header.includes('❌'))
            return types_1.StageStatus.ERROR;
        if (header.includes('⏭️'))
            return types_1.StageStatus.SKIPPED;
        if (header.includes('🔍'))
            return types_1.StageStatus.VALIDATION;
        return types_1.StageStatus.PENDING;
    }
    async writeTasksFile(tasksData) {
        try {
            if (!this.tasksFilePath) {
                throw new Error('Tasks file path not initialized');
            }
            const content = this.generateTasksMarkdown(tasksData);
            fs.writeFileSync(this.tasksFilePath, content, 'utf8');
        }
        catch (error) {
            console.error('Failed to write TASKS.md:', error);
            throw error;
        }
    }
    generateTasksMarkdown(tasksData) {
        const formatDate = (date) => date.toISOString().replace('T', ' ').substring(0, 19);
        let content = `# Project Tasks - ${tasksData.workflowName}\n\n`;
        // User Requirements
        content += `## 📝 User Requirements\n\n`;
        content += `${tasksData.userRequirements || 'No requirements specified'}\n\n`;
        content += `---\n\n`;
        // Orchestrator Assignment
        content += `## 🤖 Orchestrator Assignment\n`;
        content += `- Workflow: ${tasksData.orchestrator.workflowId}\n`;
        content += `- Started: ${formatDate(tasksData.startedAt)}\n`;
        content += `- Status: ${tasksData.status}\n\n`;
        // Stage Assignments
        content += `## 📋 Stage Assignments\n\n`;
        for (const stage of tasksData.stageAssignments) {
            const statusIcon = this.getStatusIcon(stage.status);
            content += `### ${statusIcon} ${stage.stageName}\n`;
            if (stage.agentId) {
                content += `- Agent: ${stage.agentId}\n`;
            }
            else {
                content += `- Agent: [Pending Assignment]\n`;
            }
            if (stage.startedAt) {
                content += `- Started: ${formatDate(stage.startedAt)}\n`;
            }
            if (stage.completedAt) {
                content += `- Completed: ${formatDate(stage.completedAt)}\n`;
            }
            if (stage.status === types_1.StageStatus.PENDING && stage.expectedOutput) {
                content += `- Expected Output: ${stage.expectedOutput}\n`;
            }
            if (stage.actualOutput) {
                content += `- Actual Output: ${stage.actualOutput}\n`;
            }
            if (stage.tokenUsage) {
                content += `- Token Usage: ${stage.tokenUsage.toLocaleString()}\n`;
            }
            content += `- Status: ${stage.status}\n\n`;
        }
        // Workflow Summary
        const completedStages = tasksData.stageAssignments.filter(s => s.status === types_1.StageStatus.COMPLETED).length;
        const totalStages = tasksData.stageAssignments.length;
        const totalTokens = tasksData.stageAssignments.reduce((sum, s) => sum + (s.tokenUsage || 0), 0);
        content += `## Workflow Summary\n\n`;
        content += `- Progress: ${completedStages}/${totalStages} stages completed\n`;
        content += `- Total Token Usage: ${totalTokens.toLocaleString()}\n`;
        content += `- Last Updated: ${formatDate(new Date())}\n\n`;
        content += `---\n`;
        content += `*Generated by Agents Playbook Extension*\n`;
        return content;
    }
    getStatusIcon(status) {
        switch (status) {
            case types_1.StageStatus.COMPLETED:
                return '✅';
            case types_1.StageStatus.IN_PROGRESS:
                return '🔄';
            case types_1.StageStatus.VALIDATION:
                return '🔍';
            case types_1.StageStatus.ERROR:
                return '❌';
            case types_1.StageStatus.SKIPPED:
                return '⏭️';
            case types_1.StageStatus.PENDING:
            default:
                return '⏳';
        }
    }
    async openTasksFile() {
        try {
            if (!this.tasksFilePath || !fs.existsSync(this.tasksFilePath)) {
                vscode.window.showWarningMessage('No TASKS.md file found');
                return;
            }
            const document = await vscode.workspace.openTextDocument(this.tasksFilePath);
            await vscode.window.showTextDocument(document);
        }
        catch (error) {
            console.error('Failed to open TASKS.md:', error);
            vscode.window.showErrorMessage(`Failed to open TASKS.md: ${error}`);
        }
    }
    async getTasksSummary() {
        try {
            const tasksData = await this.readTasksFile();
            if (!tasksData) {
                return { totalStages: 0, completedStages: 0, totalTokenUsage: 0, activeAgents: [] };
            }
            const completedStages = tasksData.stageAssignments.filter(s => s.status === types_1.StageStatus.COMPLETED).length;
            const totalTokenUsage = tasksData.stageAssignments.reduce((sum, s) => sum + (s.tokenUsage || 0), 0);
            const activeAgents = tasksData.stageAssignments
                .filter(s => s.status === types_1.StageStatus.IN_PROGRESS && s.agentId)
                .map(s => s.agentId)
                .filter((value, index, self) => self.indexOf(value) === index); // Remove duplicates
            return {
                totalStages: tasksData.stageAssignments.length,
                completedStages,
                totalTokenUsage,
                activeAgents
            };
        }
        catch (error) {
            console.error('Failed to get tasks summary:', error);
            return { totalStages: 0, completedStages: 0, totalTokenUsage: 0, activeAgents: [] };
        }
    }
}
exports.TasksMarkdownManager = TasksMarkdownManager;
//# sourceMappingURL=tasks-markdown-manager.js.map