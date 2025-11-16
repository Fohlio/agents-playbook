import { prisma } from '@/lib/db/client';
import { jsonValueToStringArray } from '@/lib/utils/prisma-json';
import type { JsonValue } from '@prisma/client/runtime/library';

/**
 * ExecutionPlanBuilder - Dynamically builds workflow execution plans with automatic prompts
 *
 * Architecture:
 * 1. Fetches workflow with stages and mini-prompts from database (including itemOrder)
 * 2. Fetches automatic system prompts (Memory Board, Internal Agents Chat)
 * 3. For each stage:
 *    - If itemOrder exists: Uses custom order from itemOrder (respects drag-and-drop reordering)
 *    - If itemOrder doesn't exist: Uses default order (mini-prompts by order field, then auto-prompts)
 *    - Normalizes auto-prompt IDs in itemOrder to handle stage ID changes
 * 4. Returns execution plan with sequential step indices (0-based)
 *
 * This allows MCP tools (select_workflow, get_next_step) to return complete execution plans
 * with automatic prompts included, respecting user-defined order from drag-and-drop.
 *
 * Example execution order for a stage with 2 mini-prompts (default order):
 * - Step 0: Mini-prompt 1
 * - Step 1: Internal Agents Chat (if enabled)
 * - Step 2: Mini-prompt 2
 * - Step 3: Internal Agents Chat (if enabled)
 * - Step 4: Memory Board (if withReview = true)
 *
 * If itemOrder is set (e.g., via drag-and-drop), items appear in that exact order instead.
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
      const stageItems = this.buildStageItems(
        stage,
        stageIdx,
        memoryBoardPrompt,
        multiAgentChatPrompt
      );
      
      // Add items from this stage to the overall plan
      for (const item of stageItems) {
        items.push({
          ...item,
          index: stepIndex++,
        });
      }
    }

    // Check if any stage has multi-agent chat enabled (per-stage setting)
    const hasMultiAgentChat = workflow.stages.some(stage => stage.includeMultiAgentChat);

    return {
      workflowId: workflow.id,
      workflowName: workflow.name,
      includeMultiAgentChat: hasMultiAgentChat || workflow.includeMultiAgentChat,
      totalSteps: items.length,
      items
    };
  }

  /**
   * Build items for a single stage, respecting itemOrder if it exists
   */
  private buildStageItems(
    stage: {
      id: string;
      name: string;
      itemOrder: JsonValue | null;
      includeMultiAgentChat: boolean;
      withReview: boolean;
      miniPrompts: Array<{
        miniPromptId: string;
        miniPrompt: {
          name: string;
          description: string | null;
          content: string;
        };
      }>;
    },
    stageIndex: number,
    memoryBoardPrompt: { name: string; description: string | null; content: string } | null,
    multiAgentChatPrompt: { name: string; description: string | null; content: string } | null
  ): Omit<ExecutionPlanItem, 'index'>[] {
    const stageItemOrder = jsonValueToStringArray(stage.itemOrder);
    const multiAgentChatId = `multi-agent-chat-${stage.id}`;
    const memoryBoardId = `memory-board-${stage.id}`;

    // Build map of all available items
    const itemsMap = new Map<string, Omit<ExecutionPlanItem, 'index'>>();

    // Add mini-prompts to map
    for (const stageMiniPrompt of stage.miniPrompts) {
      itemsMap.set(stageMiniPrompt.miniPromptId, {
        type: 'mini-prompt',
        stageIndex,
        stageName: stage.name,
        name: stageMiniPrompt.miniPrompt.name,
        description: stageMiniPrompt.miniPrompt.description || undefined,
        content: stageMiniPrompt.miniPrompt.content,
      });
    }

    // Check if auto-prompts are in stored order (normalize old stage IDs)
    const hasMultiAgentChatInOrder = stageItemOrder?.some((id) =>
      typeof id === 'string' && id.startsWith('multi-agent-chat-')
    ) ?? false;
    const hasMemoryBoardInOrder = stageItemOrder?.some((id) =>
      typeof id === 'string' && id.startsWith('memory-board-')
    ) ?? false;

    // Add multi-agent chat if enabled OR if it's in stored order
    if ((stage.includeMultiAgentChat || hasMultiAgentChatInOrder) && multiAgentChatPrompt) {
      itemsMap.set(multiAgentChatId, {
        type: 'auto-prompt',
        stageIndex,
        stageName: stage.name,
        name: multiAgentChatPrompt.name,
        description: multiAgentChatPrompt.description || undefined,
        content: multiAgentChatPrompt.content,
        isAutoAttached: true,
        autoPromptType: 'multi-agent-chat',
      });
    }

    // Add memory board if enabled OR if it's in stored order
    if ((stage.withReview || hasMemoryBoardInOrder) && memoryBoardPrompt) {
      itemsMap.set(memoryBoardId, {
        type: 'auto-prompt',
        stageIndex,
        stageName: stage.name,
        name: memoryBoardPrompt.name,
        description: memoryBoardPrompt.description || undefined,
        content: memoryBoardPrompt.content,
        isAutoAttached: true,
        autoPromptType: 'memory-board',
      });
    }

    // If itemOrder exists, use it to order items
    if (stageItemOrder && stageItemOrder.length > 0) {
      // Normalize auto-prompt IDs to use current stage ID
      const normalizedOrder = stageItemOrder.map((id): string => {
        if (typeof id !== 'string') return id as string;
        
        if (id.startsWith('multi-agent-chat-')) {
          return multiAgentChatId;
        }
        
        if (id.startsWith('memory-board-')) {
          return memoryBoardId;
        }
        
        return id;
      });

      // Filter to only include items that exist in itemsMap, preserving order
      const orderedIds = normalizedOrder.filter((id) => itemsMap.has(id));
      
      // Find items that exist but aren't in the order (new items)
      const itemsInOrder = new Set(orderedIds);
      const newItemIds = Array.from(itemsMap.keys()).filter((id) => !itemsInOrder.has(id));

      // Build final order: stored order + new items at the end
      const finalOrder = [...orderedIds, ...newItemIds];

      return finalOrder.map((id) => itemsMap.get(id)!);
    }

    // Default order: mini-prompts, then multi-agent chats, then memory board
    const result: Omit<ExecutionPlanItem, 'index'>[] = [];

    // Add mini-prompts
    for (const stageMiniPrompt of stage.miniPrompts) {
      result.push({
        type: 'mini-prompt',
        stageIndex,
        stageName: stage.name,
        name: stageMiniPrompt.miniPrompt.name,
        description: stageMiniPrompt.miniPrompt.description || undefined,
        content: stageMiniPrompt.miniPrompt.content,
      });

      // Add Internal Agents Chat after each mini-prompt if enabled
      if (stage.includeMultiAgentChat && multiAgentChatPrompt) {
        result.push({
          type: 'auto-prompt',
          stageIndex,
          stageName: stage.name,
          name: multiAgentChatPrompt.name,
          description: multiAgentChatPrompt.description || undefined,
          content: multiAgentChatPrompt.content,
          isAutoAttached: true,
          autoPromptType: 'multi-agent-chat',
        });
      }
    }

    // Add Memory Board at end if enabled
    if (stage.withReview && memoryBoardPrompt) {
      result.push({
        type: 'auto-prompt',
        stageIndex,
        stageName: stage.name,
        name: memoryBoardPrompt.name,
        description: memoryBoardPrompt.description || undefined,
        content: memoryBoardPrompt.content,
        isAutoAttached: true,
        autoPromptType: 'memory-board',
      });
    }

    return result;
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
