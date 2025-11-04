import { prisma } from '@/lib/db/client';

/**
 * ExecutionPlanBuilder - Dynamically builds workflow execution plans with automatic prompts
 *
 * Architecture:
 * 1. Fetches workflow with stages and mini-prompts from database
 * 2. Fetches automatic system prompts (Memory Board, Internal Agents Chat)
 * 3. Iterates through stages and injects automatic prompts based on settings:
 *    - Adds Internal Agents Chat AFTER each mini-prompt if workflow.includeMultiAgentChat = true
 *    - Adds Memory Board AT END of each stage if stage.withReview = true
 * 4. Returns execution plan with sequential step indices (0-based)
 *
 * This allows MCP tools (select_workflow, get_next_step) to return complete execution plans
 * with automatic prompts included, without storing them in the database.
 *
 * Example execution order for a stage with 2 mini-prompts:
 * - Step 0: Mini-prompt 1
 * - Step 1: Internal Agents Chat (if enabled)
 * - Step 2: Mini-prompt 2
 * - Step 3: Internal Agents Chat (if enabled)
 * - Step 4: Memory Board (if withReview = true)
 */

/**
 * Execution Plan Item - represents a step in the workflow execution
 */
export interface ExecutionPlanItem {
  index: number;
  type: 'stage' | 'mini-prompt' | 'auto-prompt';
  stageIndex?: number;
  stageName?: string;
  name: string;
  description?: string;
  content?: string;
  isAutoAttached?: boolean;
  autoPromptType?: 'memory-board' | 'multi-agent-chat';
}

/**
 * Execution Plan - complete workflow with all steps including auto-prompts
 */
export interface ExecutionPlan {
  workflowId: string;
  workflowName: string;
  includeMultiAgentChat: boolean;
  totalSteps: number;
  items: ExecutionPlanItem[];
}

/**
 * Builds execution plan for a workflow with automatic prompts injected
 */
export class ExecutionPlanBuilder {
  /**
   * Build complete execution plan for a workflow
   */
  async buildExecutionPlan(workflowId: string): Promise<ExecutionPlan | null> {
    // Fetch workflow with stages and mini-prompts
    const workflow = await prisma.workflow.findUnique({
      where: { id: workflowId },
      include: {
        stages: {
          orderBy: { order: 'asc' },
          include: {
            miniPrompts: {
              orderBy: { order: 'asc' },
              include: {
                miniPrompt: true
              }
            }
          }
        }
      }
    });

    if (!workflow) return null;

    // Fetch automatic system prompts
    const [memoryBoardPrompt, multiAgentChatPrompt] = await Promise.all([
      this.getAutomaticPrompt('memory-board'),
      this.getAutomaticPrompt('multi-agent-chat')
    ]);

    const items: ExecutionPlanItem[] = [];
    let stepIndex = 0;

    // Iterate through stages
    for (let stageIdx = 0; stageIdx < workflow.stages.length; stageIdx++) {
      const stage = workflow.stages[stageIdx];

      // Add mini-prompts for this stage
      for (const stageMiniPrompt of stage.miniPrompts) {
        items.push({
          index: stepIndex++,
          type: 'mini-prompt',
          stageIndex: stageIdx,
          stageName: stage.name,
          name: stageMiniPrompt.miniPrompt.name,
          description: stageMiniPrompt.miniPrompt.description || undefined,
          content: stageMiniPrompt.miniPrompt.content,
        });

        // Add Internal Agents Chat after each mini-prompt if enabled
        if (workflow.includeMultiAgentChat && multiAgentChatPrompt) {
          items.push({
            index: stepIndex++,
            type: 'auto-prompt',
            stageIndex: stageIdx,
            stageName: stage.name,
            name: multiAgentChatPrompt.name,
            description: multiAgentChatPrompt.description || undefined,
            content: multiAgentChatPrompt.content,
            isAutoAttached: true,
            autoPromptType: 'multi-agent-chat'
          });
        }
      }

      // Add Memory Board at end of stage if withReview is true
      if (stage.withReview && memoryBoardPrompt) {
        items.push({
          index: stepIndex++,
          type: 'auto-prompt',
          stageIndex: stageIdx,
          stageName: stage.name,
          name: memoryBoardPrompt.name,
          description: memoryBoardPrompt.description || undefined,
          content: memoryBoardPrompt.content,
          isAutoAttached: true,
          autoPromptType: 'memory-board'
        });
      }
    }

    return {
      workflowId: workflow.id,
      workflowName: workflow.name,
      includeMultiAgentChat: workflow.includeMultiAgentChat,
      totalSteps: items.length,
      items
    };
  }

  /**
   * Get automatic system prompt by type
   */
  private async getAutomaticPrompt(type: 'memory-board' | 'multi-agent-chat') {
    const promptName = type === 'memory-board'
      ? 'Handoff Memory Board'
      : 'Internal Agents Chat';

    return prisma.miniPrompt.findFirst({
      where: {
        name: promptName,
        isSystemMiniPrompt: true
      }
    });
  }

  /**
   * Format execution plan as markdown for MCP response
   */
  formatExecutionPlan(plan: ExecutionPlan): string {
    let output = `# Execution Plan: ${plan.workflowName}\n\n`;
    output += `**Total Steps:** ${plan.totalSteps}\n`;
    output += `**Multi-Agent Chat:** ${plan.includeMultiAgentChat ? 'Enabled' : 'Disabled'}\n\n`;
    output += `---\n\n`;

    let currentStage = -1;

    for (const item of plan.items) {
      // Add stage header when stage changes
      if (item.stageIndex !== undefined && item.stageIndex !== currentStage) {
        currentStage = item.stageIndex;
        output += `## Stage ${currentStage + 1}: ${item.stageName}\n\n`;
      }

      // Format item
      if (item.type === 'auto-prompt') {
        const icon = item.autoPromptType === 'memory-board' ? '📋' : '🤖';
        const badge = item.autoPromptType === 'memory-board' ? '[REVIEW]' : '[AUTO]';
        output += `### ${item.index + 1}. ${icon} ${item.name} ${badge}\n\n`;
        output += `> **Auto-attached prompt** - ${item.description || 'No description'}\n\n`;
      } else {
        output += `### ${item.index + 1}. ${item.name}\n\n`;
        if (item.description) {
          output += `${item.description}\n\n`;
        }
      }
    }

    return output;
  }

  /**
   * Get specific step from execution plan
   */
  async getStep(workflowId: string, stepIndex: number): Promise<ExecutionPlanItem | null> {
    const plan = await this.buildExecutionPlan(workflowId);
    if (!plan) return null;

    return plan.items[stepIndex] || null;
  }
}

export const executionPlanBuilder = new ExecutionPlanBuilder();
