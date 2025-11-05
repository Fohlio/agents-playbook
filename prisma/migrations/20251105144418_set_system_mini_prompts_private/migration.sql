-- Set all system mini-prompts to PRIVATE visibility
-- This ensures system mini-prompts are not exposed in public discovery or MCP tools
-- Automatic mini-prompts (Memory Board, Internal Agents Chat) also set to PRIVATE

UPDATE "mini_prompts"
SET visibility = 'PRIVATE'
WHERE is_system_mini_prompt = true OR is_automatic = true;
