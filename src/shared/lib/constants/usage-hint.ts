/**
 * Usage hint for AI agents
 * 
 * This hint tells users how to use a workflow/prompt with their AI assistant.
 * The [workflow-name] placeholder should be replaced with the actual workflow name.
 */
export const USAGE_HINT_TEMPLATE = "use agents-playbook and select [workflow-name], validate every step with me";

/**
 * Get the usage hint with the workflow name filled in
 */
export function getUsageHint(workflowName: string): string {
  return USAGE_HINT_TEMPLATE.replace("[workflow-name]", workflowName);
}

