import * as vscode from 'vscode';
import * as path from 'path';
import {
  ContextIsolationManager as IContextIsolationManager,
  IsolatedContext,
  ContextStore,
  WorkflowStage,
  HandoffSummary
} from '../types';

export class ContextIsolationManager implements IContextIsolationManager {
  private contextStores: Map<string, ContextStore> = new Map();
  private compressionRatio = 0.1; // Compress to 10% of original size

  async createIsolatedContext(agentId: string, stage: WorkflowStage, userRequirements?: string): Promise<IsolatedContext> {
    console.log(`Creating isolated context for agent ${agentId}, stage ${stage.stageId}`);

    try {
      // Extract task context from stage
      const taskContext = this.extractTaskContext(stage);

      // Gather relevant files for the stage
      const relevantFiles = await this.gatherRelevantFiles(stage);

      // Get handoff summary from previous stages
      const handoffSummary = await this.getHandoffSummary(stage);

      // Calculate token budget
      const maxTokens = this.calculateTokenBudget(stage);

      // Generate system prompt for the stage
      const systemPrompt = this.generateSystemPrompt(stage);

      // Calculate context size
      const contextSize = this.calculateContextSize(taskContext, relevantFiles, handoffSummary);

      // Get workspace root
      const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;

      const isolatedContext: IsolatedContext = {
        agentId,
        taskContext,
        relevantFiles,
        handoffSummary,
        maxTokens,
        systemPrompt,
        contextSize,
        userRequirements,
        workspaceRoot
      };

      // Store context for later retrieval
      await this.storeContext(agentId, isolatedContext);

      return isolatedContext;

    } catch (error) {
      console.error(`Failed to create isolated context for agent ${agentId}:`, error);
      throw error;
    }
  }

  private extractTaskContext(stage: WorkflowStage): string {
    // Extract meaningful context from the stage definition
    let context = `Stage: ${stage.name}\n`;
    context += `Phase: ${stage.phase}\n`;
    context += `Description: Execute ${stage.miniPromptPath} for this workflow stage\n`;

    // Add prerequisites context
    if (stage.prerequisites.requiredContext.length > 0) {
      context += `Required Context: ${stage.prerequisites.requiredContext.join(', ')}\n`;
    }

    if (stage.prerequisites.optionalContext.length > 0) {
      context += `Optional Context: ${stage.prerequisites.optionalContext.join(', ')}\n`;
    }

    // Add dependency information
    if (stage.dependencies.length > 0) {
      context += `Dependencies: ${stage.dependencies.join(', ')}\n`;
    }

    return context;
  }

  private async gatherRelevantFiles(stage: WorkflowStage): Promise<string[]> {
    const relevantFiles: string[] = [];

    try {
      const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
      if (!workspaceFolder) {
        return relevantFiles;
      }

      // Add mini-prompt file path
      const miniPromptPath = path.join(
        workspaceFolder.uri.fsPath,
        'public',
        'playbook',
        'mini-prompts',
        `${stage.miniPromptPath}.md`
      );
      relevantFiles.push(miniPromptPath);

      // Add phase-specific files based on stage type
      switch (stage.phase) {
        case 'analysis':
          relevantFiles.push(...await this.findFilesForAnalysis());
          break;
        case 'design-architecture':
          relevantFiles.push(...await this.findFilesForDesign());
          break;
        case 'planning':
          relevantFiles.push(...await this.findFilesForPlanning());
          break;
        case 'implementation':
          relevantFiles.push(...await this.findFilesForImplementation());
          break;
        case 'testing-review':
          relevantFiles.push(...await this.findFilesForTesting());
          break;
      }

      // Filter out files that don't exist
      const existingFiles: string[] = [];
      for (const file of relevantFiles) {
        try {
          await vscode.workspace.fs.stat(vscode.Uri.file(file));
          existingFiles.push(file);
        } catch {
          // File doesn't exist, skip it
        }
      }

      return existingFiles;

    } catch (error) {
      console.error('Failed to gather relevant files:', error);
      return [];
    }
  }

  private async findFilesForAnalysis(): Promise<string[]> {
    // Find files relevant for analysis phase
    const patterns = ['**/*.md', '**/requirements*.txt', '**/README*', '**/package.json'];
    return this.findFilesByPatterns(patterns);
  }

  private async findFilesForDesign(): Promise<string[]> {
    // Find files relevant for design phase
    const patterns = ['**/*.md', '**/architecture*.md', '**/design*.md', '**/*.json'];
    return this.findFilesByPatterns(patterns);
  }

  private async findFilesForPlanning(): Promise<string[]> {
    // Find files relevant for planning phase
    const patterns = ['**/*.md', '**/plan*.md', '**/tasks*.md', '**/TODO*'];
    return this.findFilesByPatterns(patterns);
  }

  private async findFilesForImplementation(): Promise<string[]> {
    // Find files relevant for implementation phase
    const patterns = ['**/*.ts', '**/*.js', '**/*.json', '**/*.md'];
    return this.findFilesByPatterns(patterns);
  }

  private async findFilesForTesting(): Promise<string[]> {
    // Find files relevant for testing phase
    const patterns = ['**/*.test.*', '**/*.spec.*', '**/test/**', '**/tests/**'];
    return this.findFilesByPatterns(patterns);
  }

  private async findFilesByPatterns(patterns: string[]): Promise<string[]> {
    const files: string[] = [];

    for (const pattern of patterns) {
      try {
        const foundFiles = await vscode.workspace.findFiles(pattern, '**/node_modules/**', 10);
        files.push(...foundFiles.map(uri => uri.fsPath));
      } catch (error) {
        console.warn(`Failed to find files with pattern ${pattern}:`, error);
      }
    }

    return files;
  }

  private async getHandoffSummary(stage: WorkflowStage): Promise<HandoffSummary | undefined> {
    // For the first stage, there's no handoff
    if (!stage.dependencies || stage.dependencies.length === 0) {
      return undefined;
    }

    // In a real implementation, this would retrieve handoff data from previous stages
    // For now, return a mock handoff summary
    return {
      fromAgent: 'previous-agent',
      toAgent: 'current-agent',
      timestamp: new Date(),
      keyDecisions: ['Previous stage completed successfully'],
      outputs: ['Output from previous stage'],
      nextSteps: ['Continue with current stage'],
      tokenCount: 500,
      compressedContext: 'Previous stage context summary'
    };
  }

  private calculateTokenBudget(stage: WorkflowStage): number {
    // Calculate token budget based on stage complexity and type
    const baseTokens = 8000;

    switch (stage.phase) {
      case 'analysis':
        return baseTokens;
      case 'design-architecture':
        return baseTokens + 2000;
      case 'planning':
        return baseTokens;
      case 'implementation':
        return baseTokens + 7000; // Implementation typically needs more tokens
      case 'testing-review':
        return baseTokens + 2000;
      default:
        return baseTokens;
    }
  }

  private generateSystemPrompt(stage: WorkflowStage): string {
    const basePrompt = `
You are an AI agent specialized in ${stage.phase} tasks within a multi-agent workflow system.

## Context Isolation Rules
- You have NO access to previous conversation history
- Work ONLY with the provided context and files
- Do NOT reference any previous interactions or conversations
- Focus solely on the current task and stage

## Your Role
Execute the ${stage.name} task according to the mini-prompt guidelines.

## Stage Information
- Stage ID: ${stage.stageId}
- Phase: ${stage.phase}
- Mini-prompt: ${stage.miniPromptPath}

## Constraints
- Stay within the allocated token budget
- Provide clear, actionable outputs
- Follow the structure defined in the mini-prompt
- Prepare context for the next stage if applicable

## Success Criteria
Complete the stage requirements and provide outputs that enable the next stage to proceed.
`;

    return basePrompt;
  }

  private calculateContextSize(taskContext: string, relevantFiles: string[], handoffSummary?: HandoffSummary): number {
    let size = taskContext.length;

    // Estimate file sizes (in a real implementation, you'd read the files)
    size += relevantFiles.length * 1000; // Estimate 1KB per file

    if (handoffSummary) {
      size += handoffSummary.compressedContext.length;
    }

    return size;
  }

  private async storeContext(agentId: string, context: IsolatedContext): Promise<void> {
    const contextStore: ContextStore = {
      storeId: `store-${agentId}-${Date.now()}`,
      agentId,
      context,
      createdAt: new Date(),
      lastAccessed: new Date(),
      tokenUsage: 0
    };

    this.contextStores.set(agentId, contextStore);
  }

  async compressHandoff(fullContext: any, targetTokens: number): Promise<HandoffSummary> {
    console.log(`Compressing handoff context to ${targetTokens} tokens`);

    try {
      // Extract key information from the full context
      const keyDecisions = this.extractKeyDecisions(fullContext);
      const outputs = this.extractOutputs(fullContext);
      const nextSteps = this.identifyNextSteps(fullContext);

      // Create compressed context
      const compressedContext = this.createCompressedContext(
        keyDecisions,
        outputs,
        nextSteps,
        targetTokens
      );

      return {
        fromAgent: fullContext.agentId || 'unknown',
        toAgent: 'next-agent',
        timestamp: new Date(),
        keyDecisions,
        outputs,
        nextSteps,
        tokenCount: this.estimateTokenCount(compressedContext),
        compressedContext
      };

    } catch (error) {
      console.error('Failed to compress handoff context:', error);
      throw error;
    }
  }

  private extractKeyDecisions(context: any): string[] {
    if (context.outputs && context.outputs instanceof Map) {
      const decisions: string[] = [];

      for (const [key, value] of context.outputs.entries()) {
        if (typeof value === 'object' && value.decisions) {
          decisions.push(...value.decisions);
        }
      }

      return decisions.slice(0, 5); // Limit to top 5 decisions
    }

    return ['Context decisions extracted'];
  }

  private extractOutputs(context: any): string[] {
    if (context.outputs && context.outputs instanceof Map) {
      return Array.from(context.outputs.keys() as Iterable<string>).slice(0, 10); // Limit to 10 outputs
    }

    return ['Context outputs extracted'];
  }

  private identifyNextSteps(context: any): string[] {
    // Generic next steps based on common workflow patterns
    return [
      'Review and validate outputs from previous stage',
      'Use outputs as input for current stage',
      'Ensure continuity with workflow objectives'
    ];
  }

  private createCompressedContext(
    keyDecisions: string[],
    outputs: string[],
    nextSteps: string[],
    targetTokens: number
  ): string {
    let context = `## Handoff Summary

### Key Decisions
${keyDecisions.map(d => `- ${d}`).join('\n')}

### Outputs Produced
${outputs.map(o => `- ${o}`).join('\n')}

### Next Steps
${nextSteps.map(s => `- ${s}`).join('\n')}
`;

    // Trim context to fit target tokens (rough estimation: 4 chars per token)
    const maxChars = targetTokens * 4;
    if (context.length > maxChars) {
      context = context.substring(0, maxChars - 50) + '\n\n... (truncated)';
    }

    return context;
  }

  private estimateTokenCount(text: string): number {
    // Rough estimation: 4 characters per token
    return Math.ceil(text.length / 4);
  }

  async getContextStore(agentId: string): Promise<ContextStore> {
    const store = this.contextStores.get(agentId);
    if (!store) {
      throw new Error(`Context store not found for agent ${agentId}`);
    }

    // Update last accessed
    store.lastAccessed = new Date();
    return store;
  }

  async cleanupContext(agentId: string): Promise<void> {
    console.log(`Cleaning up context for agent ${agentId}`);

    const store = this.contextStores.get(agentId);
    if (store) {
      this.contextStores.delete(agentId);
      console.log(`Context store removed for agent ${agentId}`);
    }
  }

  // Utility methods for context management
  getActiveContexts(): string[] {
    return Array.from(this.contextStores.keys());
  }

  getContextStats(): { totalContexts: number; totalTokensUsed: number } {
    const totalContexts = this.contextStores.size;
    const totalTokensUsed = Array.from(this.contextStores.values())
      .reduce((sum, store) => sum + store.tokenUsage, 0);

    return { totalContexts, totalTokensUsed };
  }

  async cleanupExpiredContexts(maxAge: number = 3600000): Promise<void> {
    // Clean up contexts older than maxAge milliseconds (default: 1 hour)
    const now = Date.now();
    const expired: string[] = [];

    for (const [agentId, store] of this.contextStores.entries()) {
      if (now - store.lastAccessed.getTime() > maxAge) {
        expired.push(agentId);
      }
    }

    for (const agentId of expired) {
      await this.cleanupContext(agentId);
    }

    if (expired.length > 0) {
      console.log(`Cleaned up ${expired.length} expired contexts`);
    }
  }
}