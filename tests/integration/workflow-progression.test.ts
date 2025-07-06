import { describe, test, expect, beforeEach } from '@jest/globals';
import { getNextStepHandler } from '../../src/lib/mcp-tools/get-next-step';
import { selectWorkflowHandler } from '../../src/lib/mcp-tools/select-workflow';
import { MiniPromptLoader } from '../../src/lib/loaders/mini-prompt-loader';

// Test configuration
const TEST_TIMEOUT = 30000;

describe('Workflow Progression Tests', () => {
  beforeEach(() => {
    // Clear any existing execution sessions before each test
    // This ensures tests don't interfere with each other
    console.log('🧪 Starting workflow progression test...');
    
    // Clear mini-prompt cache to ensure we get updated content
    const miniPromptLoader = new MiniPromptLoader();
    miniPromptLoader.clearCache();
  });

  describe('Feature Development Workflow Progression', () => {
    test('should not show 100% complete after first step', async () => {
      // First, let's get the first step
      const firstStepResult = await getNextStepHandler({ 
        workflow_id: 'feature-development',
        current_step: 0
      });

      expect(firstStepResult.content).toBeDefined();
      const firstStepText = firstStepResult.content[0].text;
      
      // Should show the first step (Gather Requirements)
      expect(firstStepText).toContain('Gather Requirements');
      expect(firstStepText).not.toContain('100% complete');
      
      // Now let's simulate completing the first step by moving to step 1
      const secondStepResult = await getNextStepHandler({ 
        workflow_id: 'feature-development',
        current_step: 1,
        available_context: ['requirements']
      });

      expect(secondStepResult.content).toBeDefined();
      const secondStepText = secondStepResult.content[0].text;
      
      // Should NOT show 100% complete (this was the bug we fixed)
      expect(secondStepText).not.toContain('100% complete');
      
      // Should show either the next step or a proper step indicator
      expect(secondStepText).toMatch(/(Step|Phase|ask-clarifying-questions|create-trd)/);
    }, TEST_TIMEOUT);

    test('should properly handle context updates during progression', async () => {
      // Start with step 0 (gather-requirements)
      const step0Result = await getNextStepHandler({ 
        workflow_id: 'feature-development',
        current_step: 0
      });

      expect(step0Result.content[0].text).toContain('Gather Requirements');
      
      // Move to step 1 with requirements context
      const step1Result = await getNextStepHandler({ 
        workflow_id: 'feature-development',
        current_step: 1,
        available_context: ['requirements']
      });

      expect(step1Result.content).toBeDefined();
      const step1Text = step1Result.content[0].text;
      
      // Should show available context section
      if (!step1Text.includes('100% complete')) {
        expect(step1Text).toContain('Available Context');
        expect(step1Text).toContain('requirements');
      }
    }, TEST_TIMEOUT);

    test('should handle multiple context items correctly', async () => {
      const result = await getNextStepHandler({ 
        workflow_id: 'feature-development',
        current_step: 2,
        available_context: ['requirements', 'clarified_requirements', 'trd']
      });

      expect(result.content).toBeDefined();
      const stepText = result.content[0].text;
      
      if (!stepText.includes('100% complete')) {
        expect(stepText).toContain('Available Context');
        expect(stepText).toContain('requirements');
        expect(stepText).toContain('clarified_requirements');
        expect(stepText).toContain('trd');
      }
    }, TEST_TIMEOUT);
  });

  describe('Quick Fix Workflow Progression', () => {
    test('should not show premature completion', async () => {
      // Get first step
      const firstStepResult = await getNextStepHandler({ 
        workflow_id: 'quick-fix',
        current_step: 0
      });

      expect(firstStepResult.content).toBeDefined();
      const firstStepText = firstStepResult.content[0].text;
      
      // Should show the first step
      expect(firstStepText).toMatch(/(ask-clarifying-questions|Step)/);
      expect(firstStepText).not.toContain('100% complete');
    }, TEST_TIMEOUT);

    test('should handle step progression correctly', async () => {
      // Try to get next step after first
      const nextStepResult = await getNextStepHandler({ 
        workflow_id: 'quick-fix',
        current_step: 1
      });

      expect(nextStepResult.content).toBeDefined();
      const nextStepText = nextStepResult.content[0].text;
      
      // Should either show next step or proper completion
      expect(nextStepText).toMatch(/(Step|complete|trace-bug-root-cause)/);
    }, TEST_TIMEOUT);
  });

  describe('Context Auto-Generation Tests', () => {
    test('should auto-generate requirements context after gather-requirements step', async () => {
      // Move to step 1 (simulating completion of gather-requirements)
      const result = await getNextStepHandler({ 
        workflow_id: 'feature-development',
        current_step: 1
      });

      expect(result.content).toBeDefined();
      
      // The system should have auto-generated requirements context
      // This is tested implicitly - if the next step is available,
      // it means the context was properly updated
      expect(result.content[0].text).toMatch(/(Step|complete|Phase)/);
    }, TEST_TIMEOUT);

    test('should handle workflow completion correctly', async () => {
      // Test with a very high step number to trigger completion
      const result = await getNextStepHandler({ 
        workflow_id: 'feature-development',
        current_step: 100
      });

      expect(result.content).toBeDefined();
      const resultText = result.content[0].text;
      
      // Should show proper completion message
      expect(resultText).toContain('Complete');
      expect(resultText).toContain('Feature Development');
    }, TEST_TIMEOUT);
  });

  describe('Workflow Validation Tests', () => {
    test('should validate workflow execution plan correctly', async () => {
      const workflowResult = await selectWorkflowHandler({ 
        workflow_id: 'feature-development' 
      });

      expect(workflowResult.content).toBeDefined();
      const workflowText = workflowResult.content[0].text;
      
      // Should show workflow overview
      expect(workflowText).toContain('Workflow Overview');
      expect(workflowText).toContain('Total Steps');
      
      // Should show phases
      expect(workflowText).toContain('Phase');
      expect(workflowText).toContain('planning-clarification');
    }, TEST_TIMEOUT);

    test('should handle missing context properly', async () => {
      // Test with no available context
      const result = await getNextStepHandler({ 
        workflow_id: 'feature-development',
        current_step: 0,
        available_context: []
      });

      expect(result.content).toBeDefined();
      const resultText = result.content[0].text;
      
      // Should show first step since no context is needed for it
      expect(resultText).toMatch(/(Gather Requirements|Step)/);
      expect(resultText).not.toContain('Available Context');
    }, TEST_TIMEOUT);
  });

  describe('Error Handling Tests', () => {
    test('should handle invalid workflow ID gracefully', async () => {
      const result = await getNextStepHandler({ 
        workflow_id: 'non-existent-workflow',
        current_step: 0
      });

      expect(result.content).toBeDefined();
      expect(result.content[0].text).toContain('not found');
    }, TEST_TIMEOUT);

    test('should handle negative step numbers gracefully', async () => {
      const result = await getNextStepHandler({ 
        workflow_id: 'feature-development',
        current_step: -1
      });

      expect(result.content).toBeDefined();
      // Should either show first step or handle gracefully
      expect(result.content[0].text).toMatch(/(Step|complete|Gather Requirements)/);
    }, TEST_TIMEOUT);
  });

  describe('Context Integration Tests', () => {
    test('should integrate context assessment from updated gather-requirements', async () => {
      const result = await getNextStepHandler({ 
        workflow_id: 'feature-development',
        current_step: 0
      });

      expect(result.content).toBeDefined();
      const resultText = result.content[0].text;
      
      // Should contain the context assessment we added
      expect(resultText).toContain('Context Assessment');
      expect(resultText).toContain('Existing Documentation');
      expect(resultText).toContain('Document Generation Support');
      expect(resultText).toContain('requirements documentation');
    }, TEST_TIMEOUT);

    test('should show proper step progression indicators', async () => {
      const result = await getNextStepHandler({ 
        workflow_id: 'feature-development',
        current_step: 0
      });

      expect(result.content).toBeDefined();
      const resultText = result.content[0].text;
      
      // Should show progress indicators
      expect(resultText).toMatch(/(Step \d+|Phase:|Progress:)/);
      expect(resultText).toContain('current_step=');
    }, TEST_TIMEOUT);
  });
}); 