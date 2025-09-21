import * as vscode from 'vscode';
import {
  ExtensionState,
  ValidationUIOptions,
  WorkflowStage,
  AgentResult
} from '../types';

interface ChatMessage {
  id: string;
  sender: 'user' | 'agent' | 'system';
  content: string;
  timestamp: Date;
  stageId?: string;
}

interface StageTab {
  stageId: string;
  stageName: string;
  status: 'active' | 'completed' | 'pending' | 'error';
  outputs: string[];
  agent?: string;
}

export class ModernValidationInterface {
  private currentPanel?: vscode.WebviewPanel;
  private chatHistory: ChatMessage[] = [];
  private stageTabs: StageTab[] = [];
  private activeOptions?: ValidationUIOptions;

  constructor(private extensionState: ExtensionState) {}

  async showValidation(options: ValidationUIOptions): Promise<void> {
    console.log(`Showing modern validation interface for stage: ${options.stage.stageId}`);

    this.activeOptions = options;
    this.updateStageTab(options.stage);
    this.addSystemMessage(`Stage "${options.stage.name}" completed and ready for review`);

    // Create or update webview panel
    if (this.currentPanel) {
      this.currentPanel.reveal();
      this.updateWebviewContent();
    } else {
      this.createWebviewPanel();
    }
  }

  private createWebviewPanel(): void {
    this.currentPanel = vscode.window.createWebviewPanel(
      'agentsPlaybookModernValidation',
      '🤖 Agents Playbook - Workflow Review',
      vscode.ViewColumn.One,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: []
      }
    );

    // Handle panel disposal
    this.currentPanel.onDidDispose(() => {
      this.currentPanel = undefined;
    });

    // Handle messages from webview
    this.currentPanel.webview.onDidReceiveMessage(
      message => this.handleWebviewMessage(message)
    );

    this.updateWebviewContent();
  }

  private updateWebviewContent(): void {
    if (!this.currentPanel) return;

    this.currentPanel.webview.html = this.getModernHTML();
  }

  private updateStageTab(stage: WorkflowStage): void {
    const existingTabIndex = this.stageTabs.findIndex(tab => tab.stageId === stage.stageId);

    const stageTab: StageTab = {
      stageId: stage.stageId,
      stageName: stage.name,
      status: this.getTabStatus(stage.status),
      outputs: stage.outputs || [],
      agent: this.extensionState.activeSession?.orchestrator.agentAssignments.get(stage.stageId)
    };

    if (existingTabIndex >= 0) {
      this.stageTabs[existingTabIndex] = stageTab;
    } else {
      this.stageTabs.push(stageTab);
    }
  }

  private getTabStatus(stageStatus: string): 'active' | 'completed' | 'pending' | 'error' {
    switch (stageStatus) {
      case 'completed': return 'completed';
      case 'error': return 'error';
      case 'validation':
      case 'in-progress': return 'active';
      default: return 'pending';
    }
  }

  private addSystemMessage(content: string): void {
    this.chatHistory.push({
      id: `system-${Date.now()}`,
      sender: 'system',
      content,
      timestamp: new Date()
    });
  }

  private addUserMessage(content: string): void {
    this.chatHistory.push({
      id: `user-${Date.now()}`,
      sender: 'user',
      content,
      timestamp: new Date()
    });
  }

  private addAgentMessage(content: string, stageId?: string): void {
    this.chatHistory.push({
      id: `agent-${Date.now()}`,
      sender: 'agent',
      content,
      timestamp: new Date(),
      stageId
    });
  }

  private async handleWebviewMessage(message: any): Promise<void> {
    switch (message.command) {
      case 'approve':
        await this.handleApproval(message.stageId);
        break;

      case 'reject':
        await this.handleRejection(message.stageId, message.reason);
        break;

      case 'requestChanges':
        await this.handleRequestChanges(message.stageId, message.feedback);
        break;

      case 'sendChatMessage':
        await this.handleChatMessage(message.content);
        break;

      case 'switchTab':
        this.handleTabSwitch(message.stageId);
        break;

      case 'downloadOutput':
        await this.handleDownloadOutput(message.stageId, message.outputIndex);
        break;

      default:
        console.warn('Unknown webview message command:', message.command);
    }
  }

  private async handleApproval(stageId: string): Promise<void> {
    if (this.activeOptions?.onApprove) {
      this.addUserMessage(`✅ Approved stage: ${this.getStageById(stageId)?.stageName}`);
      this.addSystemMessage('Stage approved. Proceeding to next stage...');
      this.activeOptions.onApprove();
      this.updateStageStatus(stageId, 'completed');
      this.updateWebviewContent();
    }
  }

  private async handleRejection(stageId: string, reason: string): Promise<void> {
    if (this.activeOptions?.onReject) {
      this.addUserMessage(`❌ Rejected stage: ${this.getStageById(stageId)?.stageName}`);
      this.addUserMessage(`Reason: ${reason}`);
      this.addSystemMessage('Stage rejected. Workflow stopped.');
      this.activeOptions.onReject(reason);
      this.updateStageStatus(stageId, 'error');
      this.updateWebviewContent();
    }
  }

  private async handleRequestChanges(stageId: string, feedback: string): Promise<void> {
    if (this.activeOptions?.onModify) {
      this.addUserMessage(`🔄 Requested changes for: ${this.getStageById(stageId)?.stageName}`);
      this.addUserMessage(`Feedback: ${feedback}`);
      this.addAgentMessage('I\'ll incorporate your feedback and re-execute this stage.', stageId);
      this.activeOptions.onModify(feedback);
      this.updateWebviewContent();
    }
  }

  private async handleChatMessage(content: string): Promise<void> {
    this.addUserMessage(content);

    // Simple auto-response based on content
    setTimeout(() => {
      const responses = [
        'I understand your feedback. Let me adjust the implementation accordingly.',
        'That\'s a great point. I\'ll incorporate that into the next stage.',
        'Thanks for the clarification. This will help improve the output quality.',
        'I\'ll make sure to address those concerns in the revision.'
      ];
      const response = responses[Math.floor(Math.random() * responses.length)];
      this.addAgentMessage(response);
      this.updateWebviewContent();
    }, 1000);
  }

  private handleTabSwitch(stageId: string): void {
    // Update active tab highlighting
    this.updateWebviewContent();
  }

  private async handleDownloadOutput(stageId: string, outputIndex: number): Promise<void> {
    const stage = this.getStageById(stageId);
    if (stage && stage.outputs[outputIndex]) {
      const output = stage.outputs[outputIndex];
      const formattedOutput = this.formatOutput(output);

      // Create temporary file for output
      const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
      if (workspaceFolder) {
        const fileName = `${stage.stageName}_output_${outputIndex + 1}.md`;
        const filePath = vscode.Uri.joinPath(workspaceFolder.uri, fileName);

        try {
          await vscode.workspace.fs.writeFile(filePath, Buffer.from(formattedOutput, 'utf8'));
          const document = await vscode.workspace.openTextDocument(filePath);
          await vscode.window.showTextDocument(document);

          this.addSystemMessage(`📄 Opened output document: ${fileName}`);
          this.updateWebviewContent();
        } catch (error) {
          vscode.window.showErrorMessage(`Failed to create output file: ${error}`);
        }
      }
    }
  }

  private getStageById(stageId: string): StageTab | undefined {
    return this.stageTabs.find(tab => tab.stageId === stageId);
  }

  private updateStageStatus(stageId: string, status: StageTab['status']): void {
    const stage = this.getStageById(stageId);
    if (stage) {
      stage.status = status;
    }
  }

  private getModernHTML(): string {
    const currentStage = this.activeOptions?.stage;

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Agents Playbook - Workflow Review</title>
    <style>
        ${this.getModernCSS()}
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <div class="header-title">
                <span class="icon">🤖</span>
                <h1>Agents Playbook</h1>
                <span class="subtitle">Multi-Agent Workflow Review</span>
            </div>
            <div class="header-actions">
                <button class="btn btn-secondary" onclick="exportProgress()">
                    📊 Export Progress
                </button>
            </div>
        </div>

        <div class="main-content">
            <!-- Stage Tabs -->
            <div class="tabs-container">
                <div class="tabs-header">
                    ${this.stageTabs.map(tab => `
                        <div class="tab ${tab.status} ${currentStage?.stageId === tab.stageId ? 'active' : ''}"
                             onclick="switchTab('${tab.stageId}')">
                            <span class="tab-icon">${this.getStatusIcon(tab.status)}</span>
                            <span class="tab-name">${tab.stageName}</span>
                            ${tab.agent ? `<span class="tab-agent">${tab.agent}</span>` : ''}
                        </div>
                    `).join('')}
                </div>

                <div class="tabs-content">
                    ${this.stageTabs.map(tab => `
                        <div class="tab-panel ${currentStage?.stageId === tab.stageId ? 'active' : ''}"
                             id="tab-${tab.stageId}">
                            <div class="stage-header">
                                <h2>${tab.stageName}</h2>
                                <div class="stage-meta">
                                    <span class="status-badge ${tab.status}">${tab.status}</span>
                                    ${tab.agent ? `<span class="agent-badge">Agent: ${tab.agent}</span>` : ''}
                                </div>
                            </div>

                            <div class="outputs-section">
                                <h3>Stage Outputs</h3>
                                ${tab.outputs.length > 0 ?
                                    tab.outputs.map((output, index) => `
                                        <div class="output-item">
                                            <div class="output-header">
                                                <span class="output-title">Output ${index + 1}</span>
                                                <button class="btn btn-small" onclick="downloadOutput('${tab.stageId}', ${index})">
                                                    📄 Open in Editor
                                                </button>
                                            </div>
                                            <div class="output-content">
                                                <pre>${this.escapeHtml(this.formatOutput(output).substring(0, 1000))}${this.formatOutput(output).length > 1000 ? '...' : ''}</pre>
                                            </div>
                                        </div>
                                    `).join('')
                                    : '<div class="no-outputs">No outputs available</div>'
                                }
                            </div>

                            ${currentStage?.stageId === tab.stageId ? `
                                <div class="validation-actions">
                                    <div class="action-group">
                                        <button class="btn btn-success" onclick="approveStage('${tab.stageId}')">
                                            ✅ Approve & Continue
                                        </button>
                                        <button class="btn btn-warning" onclick="requestChanges('${tab.stageId}')">
                                            🔄 Request Changes
                                        </button>
                                        <button class="btn btn-danger" onclick="rejectStage('${tab.stageId}')">
                                            ❌ Reject & Stop
                                        </button>
                                    </div>
                                </div>
                            ` : ''}
                        </div>
                    `).join('')}
                </div>
            </div>

            <!-- Chat Panel -->
            <div class="chat-panel">
                <div class="chat-header">
                    <h3>💬 Agent Communication</h3>
                    <span class="chat-status">Online</span>
                </div>

                <div class="chat-messages" id="chatMessages">
                    ${this.chatHistory.map(msg => `
                        <div class="message ${msg.sender}">
                            <div class="message-header">
                                <span class="sender">${this.getSenderIcon(msg.sender)} ${this.getSenderName(msg.sender)}</span>
                                <span class="timestamp">${this.formatTime(msg.timestamp)}</span>
                            </div>
                            <div class="message-content">${this.escapeHtml(msg.content)}</div>
                        </div>
                    `).join('')}
                </div>

                <div class="chat-input">
                    <div class="input-group">
                        <input type="text" id="chatInput" placeholder="Ask questions or provide feedback..." />
                        <button class="btn btn-primary" onclick="sendChatMessage()">Send</button>
                    </div>
                    <div class="quick-actions">
                        <button class="quick-btn" onclick="sendQuickMessage('Looks good overall')">👍 Looks good</button>
                        <button class="quick-btn" onclick="sendQuickMessage('Need more details')">❓ Need details</button>
                        <button class="quick-btn" onclick="sendQuickMessage('Please revise')">🔄 Please revise</button>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script>
        ${this.getModernJavaScript()}
    </script>
</body>
</html>`;
  }

  private getModernCSS(): string {
    return `
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: var(--vscode-font-family);
            font-size: var(--vscode-font-size);
            color: var(--vscode-foreground);
            background-color: var(--vscode-editor-background);
            height: 100vh;
            overflow: hidden;
        }

        .container {
            display: flex;
            flex-direction: column;
            height: 100vh;
        }

        /* Header */
        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 20px;
            background-color: var(--vscode-titleBar-activeBackground);
            border-bottom: 1px solid var(--vscode-panel-border);
        }

        .header-title {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .header-title .icon {
            font-size: 24px;
        }

        .header-title h1 {
            font-size: 18px;
            font-weight: 600;
        }

        .subtitle {
            font-size: 12px;
            opacity: 0.8;
        }

        /* Main Content */
        .main-content {
            display: flex;
            flex: 1;
            overflow: hidden;
        }

        /* Tabs */
        .tabs-container {
            flex: 2;
            display: flex;
            flex-direction: column;
            border-right: 1px solid var(--vscode-panel-border);
        }

        .tabs-header {
            display: flex;
            background-color: var(--vscode-tab-inactiveBackground);
            border-bottom: 1px solid var(--vscode-panel-border);
            overflow-x: auto;
        }

        .tab {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 12px 16px;
            cursor: pointer;
            border-right: 1px solid var(--vscode-panel-border);
            transition: background-color 0.2s;
            min-width: 200px;
        }

        .tab:hover {
            background-color: var(--vscode-tab-hoverBackground);
        }

        .tab.active {
            background-color: var(--vscode-tab-activeBackground);
            border-bottom: 2px solid var(--vscode-focusBorder);
        }

        .tab.completed {
            background-color: var(--vscode-testing-iconPassed);
            color: white;
        }

        .tab.error {
            background-color: var(--vscode-testing-iconFailed);
            color: white;
        }

        .tab-name {
            font-weight: 500;
        }

        .tab-agent {
            font-size: 11px;
            opacity: 0.7;
        }

        .tabs-content {
            flex: 1;
            overflow-y: auto;
        }

        .tab-panel {
            display: none;
            padding: 20px;
            height: 100%;
        }

        .tab-panel.active {
            display: block;
        }

        .stage-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
        }

        .stage-meta {
            display: flex;
            gap: 8px;
        }

        .status-badge, .agent-badge {
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: 500;
        }

        .status-badge.active {
            background-color: var(--vscode-charts-blue);
            color: white;
        }

        .status-badge.completed {
            background-color: var(--vscode-charts-green);
            color: white;
        }

        .status-badge.error {
            background-color: var(--vscode-charts-red);
            color: white;
        }

        .status-badge.pending {
            background-color: var(--vscode-charts-yellow);
            color: var(--vscode-editor-background);
        }

        .agent-badge {
            background-color: var(--vscode-badge-background);
            color: var(--vscode-badge-foreground);
        }

        /* Outputs */
        .outputs-section h3 {
            margin-bottom: 12px;
            color: var(--vscode-textPreformat-foreground);
        }

        .output-item {
            margin-bottom: 16px;
            border: 1px solid var(--vscode-panel-border);
            border-radius: 6px;
            overflow: hidden;
        }

        .output-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 12px;
            background-color: var(--vscode-editorGroupHeader-tabsBackground);
            border-bottom: 1px solid var(--vscode-panel-border);
        }

        .output-title {
            font-weight: 500;
        }

        .output-content {
            padding: 12px;
            background-color: var(--vscode-editor-background);
        }

        .output-content pre {
            font-family: var(--vscode-editor-font-family);
            font-size: var(--vscode-editor-font-size);
            white-space: pre-wrap;
            word-wrap: break-word;
        }

        .no-outputs {
            text-align: center;
            padding: 40px;
            color: var(--vscode-descriptionForeground);
            font-style: italic;
        }

        /* Validation Actions */
        .validation-actions {
            margin-top: 24px;
            padding-top: 20px;
            border-top: 1px solid var(--vscode-panel-border);
        }

        .action-group {
            display: flex;
            gap: 12px;
        }

        /* Chat Panel */
        .chat-panel {
            flex: 1;
            display: flex;
            flex-direction: column;
            background-color: var(--vscode-sideBar-background);
        }

        .chat-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 16px;
            background-color: var(--vscode-sideBarSectionHeader-background);
            border-bottom: 1px solid var(--vscode-panel-border);
        }

        .chat-status {
            padding: 2px 8px;
            background-color: var(--vscode-charts-green);
            color: white;
            border-radius: 12px;
            font-size: 11px;
        }

        .chat-messages {
            flex: 1;
            overflow-y: auto;
            padding: 16px;
        }

        .message {
            margin-bottom: 16px;
        }

        .message-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 4px;
        }

        .sender {
            font-weight: 500;
            font-size: 12px;
        }

        .timestamp {
            font-size: 11px;
            opacity: 0.6;
        }

        .message-content {
            padding: 8px 12px;
            border-radius: 8px;
            font-size: 14px;
        }

        .message.user .message-content {
            background-color: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            margin-left: 20px;
        }

        .message.agent .message-content {
            background-color: var(--vscode-inputValidation-infoBackground);
            border: 1px solid var(--vscode-inputValidation-infoBorder);
        }

        .message.system .message-content {
            background-color: var(--vscode-textBlockQuote-background);
            border-left: 3px solid var(--vscode-textBlockQuote-border);
            font-style: italic;
        }

        .chat-input {
            padding: 16px;
            border-top: 1px solid var(--vscode-panel-border);
        }

        .input-group {
            display: flex;
            gap: 8px;
            margin-bottom: 8px;
        }

        .input-group input {
            flex: 1;
            padding: 8px 12px;
            border: 1px solid var(--vscode-input-border);
            border-radius: 4px;
            background-color: var(--vscode-input-background);
            color: var(--vscode-input-foreground);
            font-size: 14px;
        }

        .quick-actions {
            display: flex;
            gap: 6px;
            flex-wrap: wrap;
        }

        .quick-btn {
            padding: 4px 8px;
            background-color: var(--vscode-button-secondaryBackground);
            color: var(--vscode-button-secondaryForeground);
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 11px;
        }

        .quick-btn:hover {
            background-color: var(--vscode-button-secondaryHoverBackground);
        }

        /* Buttons */
        .btn {
            padding: 8px 16px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 13px;
            font-weight: 500;
            transition: background-color 0.2s;
        }

        .btn-primary {
            background-color: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
        }

        .btn-primary:hover {
            background-color: var(--vscode-button-hoverBackground);
        }

        .btn-success {
            background-color: var(--vscode-charts-green);
            color: white;
        }

        .btn-warning {
            background-color: var(--vscode-charts-orange);
            color: white;
        }

        .btn-danger {
            background-color: var(--vscode-charts-red);
            color: white;
        }

        .btn-secondary {
            background-color: var(--vscode-button-secondaryBackground);
            color: var(--vscode-button-secondaryForeground);
        }

        .btn-small {
            padding: 4px 8px;
            font-size: 11px;
        }

        /* Scrollbars */
        ::-webkit-scrollbar {
            width: 8px;
            height: 8px;
        }

        ::-webkit-scrollbar-track {
            background: var(--vscode-scrollbarSlider-background);
        }

        ::-webkit-scrollbar-thumb {
            background: var(--vscode-scrollbarSlider-hoverBackground);
            border-radius: 4px;
        }
    `;
  }

  private getModernJavaScript(): string {
    return `
        const vscode = acquireVsCodeApi();

        function switchTab(stageId) {
            // Hide all tab panels
            document.querySelectorAll('.tab-panel').forEach(panel => {
                panel.classList.remove('active');
            });
            document.querySelectorAll('.tab').forEach(tab => {
                tab.classList.remove('active');
            });

            // Show selected tab
            document.getElementById('tab-' + stageId)?.classList.add('active');
            document.querySelector('[onclick*="' + stageId + '"]')?.classList.add('active');

            vscode.postMessage({
                command: 'switchTab',
                stageId: stageId
            });
        }

        function approveStage(stageId) {
            vscode.postMessage({
                command: 'approve',
                stageId: stageId
            });
        }

        function rejectStage(stageId) {
            const reason = prompt('Please provide a reason for rejection:');
            if (reason) {
                vscode.postMessage({
                    command: 'reject',
                    stageId: stageId,
                    reason: reason
                });
            }
        }

        function requestChanges(stageId) {
            const feedback = prompt('What changes would you like to see?');
            if (feedback) {
                vscode.postMessage({
                    command: 'requestChanges',
                    stageId: stageId,
                    feedback: feedback
                });
            }
        }

        function sendChatMessage() {
            const input = document.getElementById('chatInput');
            const content = input.value.trim();
            if (content) {
                vscode.postMessage({
                    command: 'sendChatMessage',
                    content: content
                });
                input.value = '';
            }
        }

        function sendQuickMessage(message) {
            vscode.postMessage({
                command: 'sendChatMessage',
                content: message
            });
        }

        function downloadOutput(stageId, outputIndex) {
            vscode.postMessage({
                command: 'downloadOutput',
                stageId: stageId,
                outputIndex: outputIndex
            });
        }

        function exportProgress() {
            vscode.postMessage({
                command: 'exportProgress'
            });
        }

        // Enter key support for chat
        document.addEventListener('DOMContentLoaded', () => {
            const chatInput = document.getElementById('chatInput');
            if (chatInput) {
                chatInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        sendChatMessage();
                    }
                });
            }

            // Auto-scroll chat to bottom
            const chatMessages = document.getElementById('chatMessages');
            if (chatMessages) {
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }
        });
    `;
  }

  private getStatusIcon(status: string): string {
    switch (status) {
      case 'completed': return '✅';
      case 'active': return '🔄';
      case 'error': return '❌';
      case 'pending': return '⏳';
      default: return '⚪';
    }
  }

  private getSenderIcon(sender: string): string {
    switch (sender) {
      case 'user': return '👤';
      case 'agent': return '🤖';
      case 'system': return '⚙️';
      default: return '💬';
    }
  }

  private getSenderName(sender: string): string {
    switch (sender) {
      case 'user': return 'You';
      case 'agent': return 'Agent';
      case 'system': return 'System';
      default: return 'Unknown';
    }
  }

  private formatTime(date: Date): string {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  private formatOutput(output: any): string {
    if (typeof output === 'string') {
      return output;
    }
    if (typeof output === 'object') {
      return JSON.stringify(output, null, 2);
    }
    return String(output);
  }

  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  dispose(): void {
    if (this.currentPanel) {
      this.currentPanel.dispose();
      this.currentPanel = undefined;
    }
  }
}