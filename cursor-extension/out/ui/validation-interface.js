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
exports.ValidationInterface = void 0;
const vscode = __importStar(require("vscode"));
class ValidationInterface {
    constructor(extensionState) {
        this.extensionState = extensionState;
    }
    async showValidation(options) {
        console.log(`Showing validation interface for stage: ${options.stage.stageId}`);
        // Create or reveal webview panel
        if (this.currentPanel) {
            this.currentPanel.reveal();
        }
        else {
            this.currentPanel = vscode.window.createWebviewPanel('agentsPlaybookValidation', 'Stage Validation', vscode.ViewColumn.Two, {
                enableScripts: true,
                retainContextWhenHidden: true
            });
            // Handle panel disposal
            this.currentPanel.onDidDispose(() => {
                this.currentPanel = undefined;
            });
            // Handle messages from webview
            this.currentPanel.webview.onDidReceiveMessage(message => this.handleWebviewMessage(message, options));
        }
        // Update webview content
        this.currentPanel.webview.html = this.getValidationHTML(options);
    }
    async handleWebviewMessage(message, options) {
        switch (message.command) {
            case 'approve':
                await this.handleApproval(options);
                break;
            case 'reject':
                await this.handleRejection(options, message.reason);
                break;
            case 'modify':
                await this.handleModification(options, message.changes);
                break;
            case 'skip':
                await this.handleSkip(options, message.reason);
                break;
            case 'refresh':
                await this.refreshValidation(options);
                break;
            default:
                console.warn('Unknown webview message command:', message.command);
        }
    }
    async handleApproval(options) {
        try {
            if (options.onApprove) {
                options.onApprove();
                vscode.window.showInformationMessage(`Stage "${options.stage.name}" approved`);
                this.closeValidation();
            }
            else {
                console.warn('No onApprove callback provided');
                vscode.window.showWarningMessage('Stage approval not configured');
            }
        }
        catch (error) {
            vscode.window.showErrorMessage(`Failed to approve stage: ${error}`);
        }
    }
    async handleRejection(options, reason) {
        try {
            if (options.onReject) {
                options.onReject(reason);
                vscode.window.showWarningMessage(`Stage "${options.stage.name}" rejected: ${reason}`);
                this.closeValidation();
            }
            else {
                console.warn('No onReject callback provided');
                vscode.window.showWarningMessage('Stage rejection not configured');
            }
        }
        catch (error) {
            vscode.window.showErrorMessage(`Failed to reject stage: ${error}`);
        }
    }
    async handleModification(options, changes) {
        try {
            if (options.onModify) {
                options.onModify(changes);
                vscode.window.showInformationMessage(`Stage "${options.stage.name}" modified`);
                // Keep validation open for further modifications
            }
            else {
                console.warn('No onModify callback provided');
                vscode.window.showWarningMessage('Stage modification not configured');
            }
        }
        catch (error) {
            vscode.window.showErrorMessage(`Failed to modify stage: ${error}`);
        }
    }
    async handleSkip(options, reason) {
        try {
            if (options.onSkip) {
                options.onSkip(reason);
                vscode.window.showInformationMessage(`Stage "${options.stage.name}" skipped: ${reason}`);
                this.closeValidation();
            }
            else {
                console.warn('No onSkip callback provided');
                vscode.window.showWarningMessage('Stage skip not configured');
            }
        }
        catch (error) {
            vscode.window.showErrorMessage(`Failed to skip stage: ${error}`);
        }
    }
    async refreshValidation(options) {
        if (this.currentPanel) {
            this.currentPanel.webview.html = this.getValidationHTML(options);
        }
    }
    closeValidation() {
        if (this.currentPanel) {
            this.currentPanel.dispose();
            this.currentPanel = undefined;
        }
    }
    getValidationHTML(options) {
        const stage = options.stage;
        const result = options.result;
        const assignedAgent = this.extensionState.activeSession?.orchestrator.agentAssignments.get(stage.stageId);
        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Stage Validation</title>
    <style>
        body {
            font-family: var(--vscode-font-family);
            font-size: var(--vscode-font-size);
            color: var(--vscode-foreground);
            background-color: var(--vscode-editor-background);
            padding: 20px;
            margin: 0;
        }

        .header {
            border-bottom: 1px solid var(--vscode-panel-border);
            padding-bottom: 15px;
            margin-bottom: 20px;
        }

        .stage-title {
            font-size: 1.5em;
            font-weight: bold;
            margin-bottom: 10px;
        }

        .stage-info {
            display: grid;
            grid-template-columns: auto 1fr;
            gap: 10px;
            margin-bottom: 15px;
            font-size: 0.9em;
        }

        .label {
            font-weight: bold;
            color: var(--vscode-descriptionForeground);
        }

        .section {
            margin-bottom: 25px;
        }

        .section-title {
            font-size: 1.2em;
            font-weight: bold;
            margin-bottom: 10px;
            border-bottom: 1px solid var(--vscode-panel-border);
            padding-bottom: 5px;
        }

        .output-container {
            background-color: var(--vscode-textCodeBlock-background);
            border: 1px solid var(--vscode-panel-border);
            border-radius: 4px;
            padding: 15px;
            margin: 10px 0;
            max-height: 300px;
            overflow-y: auto;
        }

        .output-item {
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 1px solid var(--vscode-panel-border);
        }

        .output-item:last-child {
            border-bottom: none;
            margin-bottom: 0;
            padding-bottom: 0;
        }

        .output-key {
            font-weight: bold;
            color: var(--vscode-symbolIcon-keywordForeground);
            margin-bottom: 5px;
        }

        .output-value {
            font-family: var(--vscode-editor-font-family);
            white-space: pre-wrap;
            background-color: var(--vscode-editor-background);
            padding: 8px;
            border-radius: 3px;
            border: 1px solid var(--vscode-input-border);
        }

        .actions {
            display: flex;
            gap: 10px;
            padding: 20px 0;
            border-top: 1px solid var(--vscode-panel-border);
            margin-top: 20px;
        }

        .btn {
            padding: 8px 16px;
            border: 1px solid var(--vscode-button-border);
            border-radius: 4px;
            cursor: pointer;
            font-size: 0.9em;
            transition: background-color 0.2s;
        }

        .btn-primary {
            background-color: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
        }

        .btn-primary:hover {
            background-color: var(--vscode-button-hoverBackground);
        }

        .btn-secondary {
            background-color: var(--vscode-button-secondaryBackground);
            color: var(--vscode-button-secondaryForeground);
        }

        .btn-secondary:hover {
            background-color: var(--vscode-button-secondaryHoverBackground);
        }

        .btn-danger {
            background-color: var(--vscode-inputValidation-errorBackground);
            color: var(--vscode-inputValidation-errorForeground);
            border-color: var(--vscode-inputValidation-errorBorder);
        }

        .input-group {
            margin: 10px 0;
        }

        .input-group label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
        }

        .input-group textarea {
            width: 100%;
            min-height: 60px;
            padding: 8px;
            border: 1px solid var(--vscode-input-border);
            border-radius: 4px;
            background-color: var(--vscode-input-background);
            color: var(--vscode-input-foreground);
            resize: vertical;
        }

        .status-badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 0.8em;
            font-weight: bold;
        }

        .status-pending { background-color: #f39c12; color: white; }
        .status-in-progress { background-color: #3498db; color: white; }
        .status-validation { background-color: #9b59b6; color: white; }
        .status-completed { background-color: #27ae60; color: white; }
        .status-error { background-color: #e74c3c; color: white; }
        .status-skipped { background-color: #95a5a6; color: white; }

        .hidden {
            display: none;
        }

        .checklist {
            list-style-type: none;
            padding: 0;
        }

        .checklist li {
            padding: 5px 0;
        }

        .checklist input[type="checkbox"] {
            margin-right: 8px;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="stage-title">${stage.name}</div>
        <div class="stage-info">
            <span class="label">Stage ID:</span>
            <span>${stage.stageId}</span>

            <span class="label">Phase:</span>
            <span>${stage.phase}</span>

            <span class="label">Status:</span>
            <span class="status-badge status-${stage.status}">${stage.status}</span>

            <span class="label">Mini-prompt:</span>
            <span>${stage.miniPromptPath}</span>

            ${assignedAgent ? `
            <span class="label">Assigned Agent:</span>
            <span>${assignedAgent}</span>
            ` : ''}

            ${stage.startTime ? `
            <span class="label">Started:</span>
            <span>${stage.startTime.toLocaleString()}</span>
            ` : ''}

            ${stage.endTime ? `
            <span class="label">Completed:</span>
            <span>${stage.endTime.toLocaleString()}</span>
            ` : ''}
        </div>
    </div>

    ${stage.outputs && stage.outputs.length > 0 ? `
    <div class="section">
        <div class="section-title">Stage Outputs</div>
        <div class="output-container">
            ${stage.outputs.map((output, index) => `
                <div class="output-item">
                    <div class="output-key">Output ${index + 1}</div>
                    <div class="output-value">${this.formatOutputValue(output)}</div>
                </div>
            `).join('')}
        </div>
    </div>
    ` : `
    <div class="section">
        <div class="section-title">Stage Outputs</div>
        <p>No outputs available yet.</p>
    </div>
    `}

    ${result ? `
    <div class="section">
        <div class="section-title">Execution Results</div>
        <div class="stage-info">
            <span class="label">Success:</span>
            <span>${result.success ? '✅ Yes' : '❌ No'}</span>

            <span class="label">Tokens Used:</span>
            <span>${result.tokensUsed}</span>

            <span class="label">Execution Time:</span>
            <span>${Math.round(result.executionTime / 1000)}s</span>

            ${result.errors && result.errors.length > 0 ? `
            <span class="label">Errors:</span>
            <span style="color: var(--vscode-errorForeground);">${result.errors.join(', ')}</span>
            ` : ''}
        </div>
    </div>
    ` : ''}

    ${stage.validation?.manualCheckpoints ? `
    <div class="section">
        <div class="section-title">Validation Checklist</div>
        <ul class="checklist">
            ${stage.validation.manualCheckpoints.map((checkpoint, index) => `
                <li>
                    <input type="checkbox" id="checkpoint-${index}" ${checkpoint.checked ? 'checked' : ''}>
                    <label for="checkpoint-${index}">${checkpoint.description}</label>
                </li>
            `).join('')}
        </ul>
    </div>
    ` : ''}

    <div class="section">
        <div class="section-title">Validation Actions</div>

        <div class="actions">
            <button class="btn btn-primary" onclick="approveStage()">
                ✅ Approve
            </button>

            <button class="btn btn-secondary" onclick="toggleRejectForm()">
                ❌ Reject
            </button>

            <button class="btn btn-secondary" onclick="toggleModifyForm()">
                ✏️ Modify
            </button>

            <button class="btn btn-secondary" onclick="toggleSkipForm()">
                ⏭️ Skip
            </button>

            <button class="btn btn-secondary" onclick="refreshValidation()">
                🔄 Refresh
            </button>
        </div>

        <div id="reject-form" class="hidden">
            <div class="input-group">
                <label for="reject-reason">Rejection Reason:</label>
                <textarea id="reject-reason" placeholder="Explain why this stage is being rejected..."></textarea>
            </div>
            <button class="btn btn-danger" onclick="rejectStage()">Confirm Rejection</button>
            <button class="btn btn-secondary" onclick="toggleRejectForm()">Cancel</button>
        </div>

        <div id="modify-form" class="hidden">
            <div class="input-group">
                <label for="modify-changes">Modifications:</label>
                <textarea id="modify-changes" placeholder="Describe the modifications needed..."></textarea>
            </div>
            <button class="btn btn-primary" onclick="modifyStage()">Apply Modifications</button>
            <button class="btn btn-secondary" onclick="toggleModifyForm()">Cancel</button>
        </div>

        <div id="skip-form" class="hidden">
            <div class="input-group">
                <label for="skip-reason">Skip Reason:</label>
                <textarea id="skip-reason" placeholder="Explain why this stage is being skipped..."></textarea>
            </div>
            <button class="btn btn-secondary" onclick="skipStage()">Confirm Skip</button>
            <button class="btn btn-secondary" onclick="toggleSkipForm()">Cancel</button>
        </div>
    </div>

    <script>
        const vscode = acquireVsCodeApi();

        function approveStage() {
            vscode.postMessage({ command: 'approve' });
        }

        function rejectStage() {
            const reason = document.getElementById('reject-reason').value;
            if (!reason.trim()) {
                alert('Please provide a rejection reason');
                return;
            }
            vscode.postMessage({ command: 'reject', reason });
        }

        function modifyStage() {
            const changes = document.getElementById('modify-changes').value;
            if (!changes.trim()) {
                alert('Please describe the modifications needed');
                return;
            }
            vscode.postMessage({ command: 'modify', changes });
        }

        function skipStage() {
            const reason = document.getElementById('skip-reason').value;
            if (!reason.trim()) {
                alert('Please provide a skip reason');
                return;
            }
            vscode.postMessage({ command: 'skip', reason });
        }

        function refreshValidation() {
            vscode.postMessage({ command: 'refresh' });
        }

        function toggleRejectForm() {
            const form = document.getElementById('reject-form');
            form.classList.toggle('hidden');
            if (!form.classList.contains('hidden')) {
                document.getElementById('reject-reason').focus();
            }
        }

        function toggleModifyForm() {
            const form = document.getElementById('modify-form');
            form.classList.toggle('hidden');
            if (!form.classList.contains('hidden')) {
                document.getElementById('modify-changes').focus();
            }
        }

        function toggleSkipForm() {
            const form = document.getElementById('skip-form');
            form.classList.toggle('hidden');
            if (!form.classList.contains('hidden')) {
                document.getElementById('skip-reason').focus();
            }
        }
    </script>
</body>
</html>
    `;
    }
    formatOutputValue(value) {
        if (typeof value === 'string') {
            return value;
        }
        if (typeof value === 'object') {
            return JSON.stringify(value, null, 2);
        }
        return String(value);
    }
    dispose() {
        if (this.currentPanel) {
            this.currentPanel.dispose();
        }
    }
}
exports.ValidationInterface = ValidationInterface;
//# sourceMappingURL=validation-interface.js.map