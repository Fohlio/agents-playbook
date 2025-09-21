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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowLoader = void 0;
const vscode = __importStar(require("vscode"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const yaml = __importStar(require("js-yaml"));
const gray_matter_1 = __importDefault(require("gray-matter"));
class WorkflowLoader {
    async loadWorkflows(workflowsPath) {
        const workflows = new Map();
        try {
            if (!fs.existsSync(workflowsPath)) {
                console.warn(`Workflows directory not found: ${workflowsPath}`);
                return workflows;
            }
            const files = fs.readdirSync(workflowsPath).filter(file => file.endsWith('.yml') || file.endsWith('.yaml'));
            for (const file of files) {
                try {
                    const filePath = path.join(workflowsPath, file);
                    const workflow = await this.loadWorkflowFile(filePath);
                    if (workflow) {
                        const workflowId = path.basename(file, path.extname(file));
                        workflows.set(workflowId, workflow);
                        console.log(`Loaded workflow: ${workflowId}`);
                    }
                }
                catch (error) {
                    console.error(`Failed to load workflow file ${file}:`, error);
                }
            }
            console.log(`Loaded ${workflows.size} workflows from ${workflowsPath}`);
            return workflows;
        }
        catch (error) {
            console.error(`Failed to load workflows from ${workflowsPath}:`, error);
            return workflows;
        }
    }
    async loadWorkflowFile(filePath) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            // Parse YAML with frontmatter support
            const parsed = (0, gray_matter_1.default)(content);
            const workflowData = parsed.data && parsed.data.name ? parsed.data : yaml.load(content);
            if (!workflowData || !workflowData.name) {
                console.warn(`Invalid workflow file: ${filePath} (missing name)`);
                return null;
            }
            // Convert to our WorkflowConfig format
            const workflow = {
                name: workflowData.name,
                description: workflowData.description || '',
                phases: this.convertPhases(workflowData.phases || []),
                skipConditions: workflowData.skipConditions || [],
                validationRules: workflowData.validationRules || []
            };
            return workflow;
        }
        catch (error) {
            console.error(`Failed to parse workflow file ${filePath}:`, error);
            return null;
        }
    }
    convertPhases(phases) {
        return phases.map(phase => ({
            phase: phase.phase || phase.name,
            description: phase.description || '',
            required: phase.required !== false,
            steps: this.convertSteps(phase.steps || [])
        }));
    }
    convertSteps(steps) {
        return steps.map(step => ({
            id: step.id,
            miniPrompt: step.miniPrompt || step.mini_prompt || '',
            required: step.required !== false,
            prerequisites: {
                requiredContext: step.prerequisites?.requiredContext || step.prerequisites?.required_context || [],
                optionalContext: step.prerequisites?.optionalContext || step.prerequisites?.optional_context || []
            },
            dependencies: step.dependencies || [],
            outputs: step.outputs || []
        }));
    }
    async loadMiniPrompt(miniPromptPath) {
        try {
            const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
            if (!workspaceFolder) {
                throw new Error('No workspace folder found');
            }
            const fullPath = path.join(workspaceFolder.uri.fsPath, 'public', 'playbook', 'mini-prompts', `${miniPromptPath}.md`);
            if (!fs.existsSync(fullPath)) {
                console.warn(`Mini-prompt file not found: ${fullPath}`);
                return this.getDefaultMiniPrompt(miniPromptPath);
            }
            return fs.readFileSync(fullPath, 'utf8');
        }
        catch (error) {
            console.error(`Failed to load mini-prompt ${miniPromptPath}:`, error);
            return this.getDefaultMiniPrompt(miniPromptPath);
        }
    }
    getDefaultMiniPrompt(miniPromptPath) {
        // Return a default mini-prompt based on the path
        const parts = miniPromptPath.split('/');
        const category = parts[0] || 'general';
        const task = parts[1] || 'task';
        return `
# ${task.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}

## Objective
Complete the ${task} task as part of the ${category} phase.

## Process
1. Analyze the provided context and requirements
2. Execute the task according to best practices
3. Provide clear, structured outputs
4. Prepare context for the next stage

## Output Format
Provide the deliverables specified for this stage in a clear, organized format.

## Success Criteria
- Task completed according to requirements
- Outputs are clear and actionable
- Next stage can proceed with provided context
`;
    }
    async validateWorkflow(workflow) {
        const errors = [];
        // Basic validation
        if (!workflow.name) {
            errors.push('Workflow name is required');
        }
        if (!workflow.phases || workflow.phases.length === 0) {
            errors.push('Workflow must have at least one phase');
        }
        // Validate phases
        for (const phase of workflow.phases) {
            if (!phase.phase) {
                errors.push(`Phase missing name`);
            }
            if (!phase.steps || phase.steps.length === 0) {
                errors.push(`Phase ${phase.phase} must have at least one step`);
            }
            // Validate steps
            for (const step of phase.steps) {
                if (!step.id) {
                    errors.push(`Step in phase ${phase.phase} missing ID`);
                }
                if (!step.miniPrompt) {
                    errors.push(`Step ${step.id} missing mini-prompt path`);
                }
                // Validate dependencies
                if (step.dependencies) {
                    for (const dep of step.dependencies) {
                        const depExists = workflow.phases.some(p => p.steps.some(s => s.id === dep));
                        if (!depExists) {
                            errors.push(`Step ${step.id} depends on non-existent step ${dep}`);
                        }
                    }
                }
            }
        }
        return {
            valid: errors.length === 0,
            errors
        };
    }
    async getAvailableWorkflows() {
        try {
            const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
            if (!workspaceFolder) {
                return [];
            }
            const workflowsPath = path.join(workspaceFolder.uri.fsPath, 'public', 'playbook', 'workflows');
            const workflows = await this.loadWorkflows(workflowsPath);
            return Array.from(workflows.entries()).map(([id, workflow]) => ({
                id,
                name: workflow.name,
                description: workflow.description
            }));
        }
        catch (error) {
            console.error('Failed to get available workflows:', error);
            return [];
        }
    }
}
exports.WorkflowLoader = WorkflowLoader;
//# sourceMappingURL=workflow-loader.js.map