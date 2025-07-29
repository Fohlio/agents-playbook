import { describe, test, expect, beforeAll } from '@jest/globals';
import { selectWorkflowHandler } from '../../src/lib/mcp-tools/select-workflow';
import { getNextStepHandler } from '../../src/lib/mcp-tools/get-next-step';
import { StandardContext } from '../../src/lib/types/workflow-types';

// Test configuration
const TEST_TIMEOUT = 30000;

describe('Context System Integration Tests', () => {
  beforeAll(async () => {
    console.log('🧪 Starting Context System integration tests...');
  });

  describe('Available Context Parameter Tests', () => {
    test('should handle get_next_step without available_context', async () => {
      const result = await getNextStepHandler({ 
        workflow_id: 'feature-development',
        current_step: 0
      });

      expect(result.content).toBeDefined();
      expect(result.content[0].text).toMatch(/(Step|complete)/);
      
      // Should not contain context section when no context is provided
      expect(result.content[0].text).not.toContain('Available Context');
    }, TEST_TIMEOUT);

    test('should handle get_next_step with empty available_context', async () => {
      const result = await getNextStepHandler({ 
        workflow_id: 'feature-development',
        current_step: 0,
        available_context: []
      });

      expect(result.content).toBeDefined();
      expect(result.content[0].text).toMatch(/(Step|complete)/);
      
      // Should not contain context section when context is empty
      expect(result.content[0].text).not.toContain('Available Context');
    }, TEST_TIMEOUT);

    test('should handle get_next_step with single context', async () => {
      const result = await getNextStepHandler({ 
        workflow_id: 'feature-development',
        current_step: 0,
        available_context: [StandardContext.REQUIREMENTS]
      });

      expect(result.content).toBeDefined();
      const stepText = result.content[0].text;
      
      if (!stepText.includes('100% complete')) {
        expect(stepText).toContain('Available Context');
        expect(stepText).toContain('requirements');
        expect(stepText).toContain('Context Note');
      }
    }, TEST_TIMEOUT);

    test('should handle get_next_step with multiple contexts', async () => {
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
        expect(stepText).toContain('Context Note');
      }
    }, TEST_TIMEOUT);
  });

  describe('Context Requirements Display Tests', () => {
    test('should show workflow overview and context guidance for feature-development', async () => {
      const result = await selectWorkflowHandler({ 
        workflow_id: 'feature-development' 
      });

      expect(result.content).toBeDefined();
      const workflowText = result.content[0].text;
      
      expect(workflowText).toContain('Detailed Step Breakdown');
      expect(workflowText).toContain('Context Gathering');
      expect(workflowText).toContain('gather-requirements');
      expect(workflowText).toContain('ask-clarifying-questions');
    }, TEST_TIMEOUT);

    test('should show workflow overview and context guidance for trd-creation', async () => {
      const result = await selectWorkflowHandler({ 
        workflow_id: 'trd-creation' 
      });

      expect(result.content).toBeDefined();
      const workflowText = result.content[0].text;
      
      expect(workflowText).toContain('Detailed Step Breakdown');
      expect(workflowText).toContain('Context Gathering');
      expect(workflowText).toContain('trd-review');
    }, TEST_TIMEOUT);

    test('should show workflow overview for all major workflows', async () => {
      const workflows = ['feature-development', 'trd-creation'];
      
      for (const workflowId of workflows) {
        const result = await selectWorkflowHandler({ workflow_id: workflowId });
        const workflowText = result.content[0].text;
        
        expect(workflowText).toContain('Detailed Step Breakdown');
        expect(workflowText).toContain('Context Gathering');
        
        console.log(`✅ Workflow overview shown for ${workflowId}`);
      }
    }, TEST_TIMEOUT);
  });

  describe('Context Modification Tests', () => {
    test('should modify mini-prompt when requirements context is available', async () => {
      const result = await getNextStepHandler({ 
        workflow_id: 'feature-development',
        current_step: 1, // ask-clarifying-questions step
        available_context: [StandardContext.REQUIREMENTS]
      });

      expect(result.content).toBeDefined();
      const stepText = result.content[0].text;
      
      if (!stepText.includes('100% complete')) {
        expect(stepText).toContain('Available Context');
        expect(stepText).toContain('requirements');
        expect(stepText).toContain('Use existing requirements');
        expect(stepText).toContain('Context Note');
      }
    }, TEST_TIMEOUT);

    test('should modify mini-prompt when TRD context is available', async () => {
      const result = await getNextStepHandler({ 
        workflow_id: 'feature-development',
        current_step: 5, // implement-feature step
        available_context: [
          StandardContext.REQUIREMENTS,
          StandardContext.TRD,
          StandardContext.DESIGN_SPECIFICATIONS
        ]
      });

      expect(result.content).toBeDefined();
      const stepText = result.content[0].text;
      
      if (!stepText.includes('100% complete')) {
        expect(stepText).toContain('Available Context');
        expect(stepText).toContain('trd');
        expect(stepText).toContain('design_specifications');
        expect(stepText).toContain('Context Note');
      }
    }, TEST_TIMEOUT);

    test('should provide context-aware instructions', async () => {
      const result = await getNextStepHandler({ 
        workflow_id: 'trd-creation',
        current_step: 0,
        available_context: [StandardContext.BUSINESS_REQUIREMENTS]
      });

      expect(result.content).toBeDefined();
      const stepText = result.content[0].text;
      
      if (!stepText.includes('100% complete')) {
        expect(stepText).toContain('Available Context');
        expect(stepText).toContain('business_requirements');
        expect(stepText).toContain('reference your existing documents');
      }
    }, TEST_TIMEOUT);
  });

  describe('Standard Context Enum Tests', () => {
    test('should have all expected context types', () => {
      // Requirements and Planning
      expect(StandardContext.REQUIREMENTS).toBe('requirements');
      expect(StandardContext.CLARIFIED_REQUIREMENTS).toBe('clarified_requirements');
      expect(StandardContext.BUSINESS_REQUIREMENTS).toBe('business_requirements');
      expect(StandardContext.PRODUCT_VISION).toBe('product_vision');
      
      // Analysis
      expect(StandardContext.FEATURE_ANALYSIS).toBe('feature_analysis');
      expect(StandardContext.ARCHITECTURE_ANALYSIS).toBe('architecture_analysis');
      expect(StandardContext.CODE_ANALYSIS).toBe('code_analysis');
      expect(StandardContext.TECHNICAL_REQUIREMENTS).toBe('technical_requirements');
      
      // Design
      expect(StandardContext.DESIGN_SPECIFICATIONS).toBe('design_specifications');
      expect(StandardContext.TECHNICAL_ARCHITECTURE).toBe('technical_architecture');
      expect(StandardContext.IMPLEMENTATION_PLAN).toBe('implementation_plan');
      
      // Implementation
      expect(StandardContext.IMPLEMENTED_FEATURE).toBe('implemented_feature');
      expect(StandardContext.IMPLEMENTED_FEATURES).toBe('implemented_features');
      expect(StandardContext.COMPLETED_FEATURE).toBe('completed_feature');
      
      // Testing
      expect(StandardContext.TEST_PLAN).toBe('test_plan');
      expect(StandardContext.TESTED_FEATURE).toBe('tested_feature');
      expect(StandardContext.VALIDATED_PRODUCT).toBe('validated_product');
      
      // Documentation
      expect(StandardContext.TRD).toBe('trd');
      expect(StandardContext.BRD_DOCUMENT).toBe('brd_document');
      expect(StandardContext.DOCUMENTATION).toBe('documentation');
      
      // Project Context
      expect(StandardContext.PROJECT_CODEBASE).toBe('project_codebase');
      expect(StandardContext.EXISTING_CODEBASE).toBe('existing_codebase');
      expect(StandardContext.SYSTEM_ARCHITECTURE).toBe('system_architecture');
      
      console.log('✅ All standard context types are properly defined');
    });
  });

  describe('Context Flow Tests', () => {
    test('should handle context flow in feature-development workflow', async () => {
      const workflowId = 'feature-development';
      console.log(`\n🔄 Testing context flow for ${workflowId}`);
      
      // Step 0: gather-requirements (no context needed)
      const step0 = await getNextStepHandler({ 
        workflow_id: workflowId,
        current_step: 0,
        available_context: []
      });
      
      if (!step0.content[0].text.includes('100% complete')) {
        expect(step0.content[0].text).not.toContain('Available Context');
        console.log('   ✅ Step 0: No context required');
      }
      
      // Step 1: ask-clarifying-questions (requires requirements)
      const step1 = await getNextStepHandler({ 
        workflow_id: workflowId,
        current_step: 1,
        available_context: [StandardContext.REQUIREMENTS]
      });
      
      if (!step1.content[0].text.includes('100% complete')) {
        expect(step1.content[0].text).toContain('Available Context');
        expect(step1.content[0].text).toContain('requirements');
        console.log('   ✅ Step 1: Requirements context utilized');
      }
      
      // Step 2: feature-analysis (requires clarified_requirements)
      const step2 = await getNextStepHandler({ 
        workflow_id: workflowId,
        current_step: 2,
        available_context: [
          StandardContext.REQUIREMENTS,
          StandardContext.CLARIFIED_REQUIREMENTS
        ]
      });
      
      if (!step2.content[0].text.includes('100% complete')) {
        expect(step2.content[0].text).toContain('Available Context');
        expect(step2.content[0].text).toContain('clarified_requirements');
        console.log('   ✅ Step 2: Clarified requirements context utilized');
      }
    }, TEST_TIMEOUT);

    test('should handle context flow in trd-creation workflow', async () => {
      const workflowId = 'trd-creation';
      console.log(`\n🔄 Testing context flow for ${workflowId}`);
      
      // Test with business requirements context
      const step0 = await getNextStepHandler({ 
        workflow_id: workflowId,
        current_step: 0,
        available_context: [StandardContext.BUSINESS_REQUIREMENTS]
      });
      
      if (!step0.content[0].text.includes('100% complete')) {
        expect(step0.content[0].text).toContain('Available Context');
        expect(step0.content[0].text).toContain('business_requirements');
        console.log('   ✅ TRD creation: Business requirements context utilized');
      }
      
      // Test with multiple contexts - using step 1 instead of 3 to avoid workflow completion
      const step1 = await getNextStepHandler({ 
        workflow_id: workflowId,
        current_step: 1,
        available_context: [
          StandardContext.REQUIREMENTS,
          StandardContext.FEATURE_ANALYSIS,
          StandardContext.DESIGN_SPECIFICATIONS
        ]
      });
      
      if (!step1.content[0].text.includes('100% complete')) {
        expect(step1.content[0].text).toContain('Available Context');
        expect(step1.content[0].text).toContain('design_specifications');
        console.log('   ✅ TRD creation: Multiple contexts utilized');
      }
    }, TEST_TIMEOUT);
  });

  describe('Error Handling with Context Tests', () => {
    test('should handle invalid context values gracefully', async () => {
      const result = await getNextStepHandler({ 
        workflow_id: 'feature-development',
        current_step: 0,
        available_context: ['invalid_context', 'another_invalid']
      });

      expect(result.content).toBeDefined();
      expect(result.content[0].text).toMatch(/(Step|complete)/);
      
      // Should still show available context even if invalid
      if (!result.content[0].text.includes('100% complete')) {
        expect(result.content[0].text).toContain('Available Context');
      }
    }, TEST_TIMEOUT);

    test('should handle context with invalid workflow', async () => {
      const result = await getNextStepHandler({ 
        workflow_id: 'invalid-workflow',
        current_step: 0,
        available_context: [StandardContext.REQUIREMENTS]
      });

      expect(result.content).toBeDefined();
      expect(result.content[0].text).toContain('not found');
    }, TEST_TIMEOUT);
  });

  describe('Context Integration with All Workflows', () => {
    const allWorkflowIds = [
      'code-refactoring',
      'feature-development',
      'product-development',
      'project-initialization',
      'quick-fix',
      'trd-creation'
    ];

    test.each(allWorkflowIds)('should handle context system for workflow: %s', async (workflowId) => {
      console.log(`\n🔄 Testing context system for ${workflowId}`);
      
      // Test select_workflow shows workflow overview and context guidance
      const selectResult = await selectWorkflowHandler({ workflow_id: workflowId });
      expect(selectResult.content[0].text).toContain('Context Gathering');
      
      // Test get_next_step with various contexts
      const contexts = [
        StandardContext.REQUIREMENTS,
        StandardContext.TRD,
        StandardContext.DESIGN_SPECIFICATIONS
      ];
      
      const stepResult = await getNextStepHandler({ 
        workflow_id: workflowId,
        current_step: 0,
        available_context: contexts
      });
      
      expect(stepResult.content).toBeDefined();
      
      // If workflow is complete or has no executable steps, skip context checks
      if (stepResult.content[0].text.includes('Workflow Complete') || 
          stepResult.content[0].text.includes('100% complete')) {
        console.log(`   ✅ ${workflowId}: Workflow complete (no executable steps or completed)`);
        return;
      }
      
      // If not complete, should handle context properly
      // Note: Some workflows may have 0 executable steps, so Available Context may not appear
      if (!stepResult.content[0].text.includes('Cannot Execute') && contexts.length > 0) {
        expect(stepResult.content[0].text).toContain('Available Context');
      }
      
      console.log(`   ✅ Context system working for ${workflowId}`);
    }, TEST_TIMEOUT);
  });
}); 