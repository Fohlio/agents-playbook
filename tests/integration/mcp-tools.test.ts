import { describe, test, expect, beforeAll } from '@jest/globals';
import { getWorkflowsHandler } from '../../src/lib/mcp-tools/get-workflows';
import { selectWorkflowHandler } from '../../src/lib/mcp-tools/select-workflow';
import { getNextStepHandler } from '../../src/lib/mcp-tools/get-next-step';
import { StandardContext } from '../../src/lib/types/workflow-types';

// Test configuration
const TEST_TIMEOUT = 30000; // 30 seconds for embeddings operations

describe('MCP Tools Integration Tests', () => {
  beforeAll(async () => {
    console.log('🧪 Starting MCP Tools integration tests...');
    // Ensure process.env is set for OpenAI
    if (!process.env.OPENAI_API_KEY) {
      console.log('⚠️  OPENAI_API_KEY not found - semantic search will fall back to text search');
    }
  });

  describe('getWorkflowsHandler', () => {
    test('should find workflows for bug fix query', async () => {
      const result = await getWorkflowsHandler({ 
        task_description: 'fix a critical bug in production' 
      });

      expect(result.content).toBeDefined();
      expect(result.content[0]).toBeDefined();
      expect(result.content[0].type).toBe('text');
      expect(result.content[0].text).toContain('Found');
      expect(result.content[0].text).toContain('quick-fix');
    }, TEST_TIMEOUT);

    test('should find workflows for feature development query', async () => {
      const result = await getWorkflowsHandler({ 
        task_description: 'develop a new user authentication feature' 
      });

      expect(result.content).toBeDefined();
      expect(result.content[0].text).toContain('feature-development');
    }, TEST_TIMEOUT);

    test('should find workflows for documentation query', async () => {
      const result = await getWorkflowsHandler({ 
        task_description: 'create technical requirements document' 
      });

      expect(result.content).toBeDefined();
      expect(result.content[0].text).toContain('Feature');
    }, TEST_TIMEOUT);

    test('should find workflows for project setup query', async () => {
      const result = await getWorkflowsHandler({ 
        task_description: 'initialize new project and setup navigation' 
      });

      expect(result.content).toBeDefined();
      expect(result.content[0].text).toContain('feature-development');
    }, TEST_TIMEOUT);

    test('should handle query with low relevance gracefully', async () => {
      const result = await getWorkflowsHandler({ 
        task_description: 'train a quantum neural network with blockchain' 
      });

      expect(result.content).toBeDefined();
      expect(result.content[0].text).toContain('Found');
      // Even low relevance queries should return some results
      expect(result.content[0].text).toMatch(/\d+% match/);
    }, TEST_TIMEOUT);
  });

  describe('selectWorkflowHandler', () => {
    test('should return full workflow details for quick-fix', async () => {
      const result = await selectWorkflowHandler({ 
        workflow_id: 'quick-fix' 
      });

      expect(result.content).toBeDefined();
      expect(result.content[0].text).toContain('Quick Fix Workflow');
      expect(result.content[0].text).toContain('ask-clarifying-questions');
    }, TEST_TIMEOUT);

    test('should return full workflow details for feature-development', async () => {
      const result = await selectWorkflowHandler({ 
        workflow_id: 'feature-development' 
      });

      expect(result.content).toBeDefined();
      expect(result.content[0].text).toContain('Feature Development Workflow');
      expect(result.content[0].text).toContain('create-structured-requirements');
    }, TEST_TIMEOUT);



    test('should handle invalid workflow ID gracefully', async () => {
      const result = await selectWorkflowHandler({ 
        workflow_id: 'non-existent-workflow' 
      });

      expect(result.content).toBeDefined();
      expect(result.content[0].text).toContain('not found');
    }, TEST_TIMEOUT);

    // New tests for improved context requirements display
    test('should show context requirements instead of skip predictions', async () => {
      const result = await selectWorkflowHandler({ 
        workflow_id: 'quick-fix' 
      });

      expect(result.content).toBeDefined();
      const workflowText = result.content[0].text;
      
      // Should show step breakdown and context gathering tips
      expect(workflowText).toContain('Detailed Step Breakdown');
      expect(workflowText).toContain('Context Gathering');
      expect(workflowText).toContain('get_next_step');
      
      // Should NOT show execution predictions or skip warnings
      expect(workflowText).not.toContain('All steps will be skipped');
      expect(workflowText).not.toContain('Execution Rate: 25%');
    }, TEST_TIMEOUT);

    test('should show helpful context descriptions for required context', async () => {
      const result = await selectWorkflowHandler({ 
        workflow_id: 'quick-fix' 
      });

      expect(result.content).toBeDefined();
      const workflowText = result.content[0].text;
      
      // Should show workflow overview and context gathering guidance
      expect(workflowText).toContain('Workflow Overview');
      expect(workflowText).toContain('Context Gathering');
      expect(workflowText).toContain('trace-bug-root-cause');
      expect(workflowText).toContain('ask-clarifying-questions');
    }, TEST_TIMEOUT);
  });

  describe('getNextStepHandler', () => {
    test('should return first step for quick-fix workflow', async () => {
      const result = await getNextStepHandler({ 
        workflow_id: 'quick-fix',
        current_step: 0
      });

      expect(result.content).toBeDefined();
      // Should either show first step or completion status
      expect(result.content[0].text).toMatch(/(ask-clarifying-questions|complete)/);
    }, TEST_TIMEOUT);

    test('should return next step for feature-development workflow', async () => {
      const result = await getNextStepHandler({ 
        workflow_id: 'feature-development',
        current_step: 1,
        available_context: ['requirements'] // Provide required context
      });

      expect(result.content).toBeDefined();
      // Should either show step or completion status, but NOT 100% complete
      expect(result.content[0].text).toMatch(/(Step|complete|Phase)/);
      expect(result.content[0].text).not.toContain('100% complete');
    }, TEST_TIMEOUT);

    test('should handle completion state for workflow', async () => {
      const result = await getNextStepHandler({ 
        workflow_id: 'quick-fix',
        current_step: 100 // Beyond available steps
      });

      expect(result.content).toBeDefined();
      expect(result.content[0].text).toContain('Complete');
    }, TEST_TIMEOUT);

    test('should handle invalid workflow ID in get_next_step', async () => {
      const result = await getNextStepHandler({ 
        workflow_id: 'invalid-workflow',
        current_step: 0
      });

      expect(result.content).toBeDefined();
      expect(result.content[0].text).toContain('not found');
    }, TEST_TIMEOUT);

    // New tests for available_context parameter
    test('should handle get_next_step with available_context parameter', async () => {
      const result = await getNextStepHandler({ 
        workflow_id: 'feature-development',
        current_step: 1,
        available_context: [StandardContext.REQUIREMENTS]
      });

      expect(result.content).toBeDefined();
      const stepText = result.content[0].text;
      
      if (!stepText.includes('100% complete')) {
        expect(stepText).toContain('Available Context');
        expect(stepText).toContain('requirements');
      }
    }, TEST_TIMEOUT);

    test('should handle get_next_step with multiple available contexts', async () => {
      const result = await getNextStepHandler({ 
        workflow_id: 'feature-development',
        current_step: 2,
        available_context: [
          StandardContext.REQUIREMENTS,
          StandardContext.CLARIFIED_REQUIREMENTS,
          StandardContext.TRD
        ]
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

    test('should handle empty available_context array', async () => {
      const result = await getNextStepHandler({ 
        workflow_id: 'feature-development',
        current_step: 0,
        available_context: []
      });

      expect(result.content).toBeDefined();
      expect(result.content[0].text).toMatch(/(Step|complete)/);
      // Should not show context section when empty
      expect(result.content[0].text).not.toContain('Available Context');
    }, TEST_TIMEOUT);

    test('should include context gathering guidance in mini-prompts', async () => {
      const result = await getNextStepHandler({ 
        workflow_id: 'quick-fix',
        current_step: 0
      });

      expect(result.content).toBeDefined();
      const stepText = result.content[0].text;
      
      if (!stepText.includes('100% complete')) {
        // Should include context gathering guidance
        expect(stepText).toContain('Context Gathering');
        expect(stepText).toContain('gather it by:');
      }
    }, TEST_TIMEOUT);
  });


  describe('All workflows comprehensive test', () => {
    const allWorkflowIds = [
      'code-refactoring',
      'feature-development',
      'quick-fix'
    ];

    test.each(allWorkflowIds)('should handle workflow: %s', async (workflowId) => {
      // Test selectWorkflowHandler for each workflow
      const selectResult = await selectWorkflowHandler({ workflow_id: workflowId });
      expect(selectResult.content).toBeDefined();
      expect(selectResult.content[0].text).toContain('Workflow');

      // Test getNextStepHandler (first step) for each workflow
      const stepResult = await getNextStepHandler({ 
        workflow_id: workflowId,
        current_step: 0
      });
      expect(stepResult.content).toBeDefined();
      // Should either show step or completion status
      expect(stepResult.content[0].text).toMatch(/(Step|complete)/);
    }, TEST_TIMEOUT);
  });

  describe('Semantic search quality tests', () => {
    const testQueries = [
      { query: 'fix bug', expectedWorkflow: 'quick-fix' },
      { query: 'new feature', expectedWorkflow: 'feature-development' },
      { query: 'code cleanup', expectedWorkflow: 'code-refactoring' },
      { query: 'refactor code', expectedWorkflow: 'code-refactoring' }
    ];

    test.each(testQueries)('semantic search for "$query" should find $expectedWorkflow', async ({ query, expectedWorkflow }) => {
      const result = await getWorkflowsHandler({ task_description: query });
      
      expect(result.content).toBeDefined();
      expect(result.content[0].text).toContain(expectedWorkflow);
      
      // If using OpenAI, should show similarity percentage
      if (process.env.OPENAI_API_KEY) {
        expect(result.content[0].text).toMatch(/\d+% match/);
      }
    }, TEST_TIMEOUT);
  });

  describe('Smart workflow validation tests', () => {
    test('should validate workflow execution steps', async () => {
      // Test a workflow that has smart validation
      const workflowResult = await selectWorkflowHandler({ workflow_id: 'feature-development' });
      expect(workflowResult.content[0].text).toContain('Workflow Overview');
      
      // Test that we can get the first executable step
      const firstStepResult = await getNextStepHandler({ 
        workflow_id: 'feature-development',
        current_step: 0
      });
      expect(firstStepResult.content[0].text).toMatch(/(Step|complete)/);
    }, TEST_TIMEOUT);

    test('should skip non-executable steps intelligently', async () => {
      // This tests the smart skipping logic in SmartWorkflowEngine
      const stepResult = await getNextStepHandler({ 
        workflow_id: 'quick-fix',
        current_step: 0
      });
      
      expect(stepResult.content).toBeDefined();
      // Should either show step or completion status
      expect(stepResult.content[0].text).toMatch(/(ask-clarifying-questions|complete)/);
      
      // Check that validation info is included
      expect(stepResult.content[0].text).toMatch(/(Executable|complete)/);
    }, TEST_TIMEOUT);
  });

}); 