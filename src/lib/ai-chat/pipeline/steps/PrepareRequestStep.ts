/**
 * Prepare Request Step
 *
 * Prepares the OpenAI API request with tools and parameters
 */

import { workflowTools } from '@/lib/ai-tools/workflow-tools';
import type { PipelineContext, PipelineStep } from '../types';

export class PrepareRequestStep implements PipelineStep {
  name = 'PrepareRequest';

  async execute(context: PipelineContext): Promise<PipelineContext> {
    // Get workflow-specific tools
    const tools = workflowTools;

    console.log(`[PrepareRequest] Loaded ${Object.keys(tools).length} tools`);

    return {
      ...context,
      tools,
    };
  }
}
