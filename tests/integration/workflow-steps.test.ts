import { describe, test, expect, beforeAll } from '@jest/globals';
import { selectWorkflowHandler } from '../../src/lib/mcp-tools/select-workflow';
import { getNextStepHandler } from '../../src/lib/mcp-tools/get-next-step';
import { WorkflowLoader } from '../../src/lib/loaders/workflow-loader';

// Test configuration
const TEST_TIMEOUT = 30000;

describe('Workflow Steps Integration Tests', () => {
  let workflowLoader: WorkflowLoader;

  beforeAll(async () => {
    console.log('🧪 Starting Workflow Steps integration tests...');
    workflowLoader = new WorkflowLoader();
  });

  describe('All workflow steps progression', () => {
    const allWorkflowIds = [
      'brd-creation',
      'brd-to-trd-translation', 
      'code-refactoring',
      'feature-development',
      'infrastructure-setup',
      'product-development',
      'project-initialization',
      'quick-fix',
      'trd-creation'
    ];

    test.each(allWorkflowIds)('should progress through all steps in workflow: %s', async (workflowId) => {
      console.log(`\n🔄 Testing workflow progression: ${workflowId}`);
      
      // First get workflow details to understand the structure
      const workflowResult = await selectWorkflowHandler({ workflow_id: workflowId });
      expect(workflowResult.content).toBeDefined();
      
      const workflowText = workflowResult.content[0].text;
      expect(workflowText).toContain('Workflow');
      
      // Extract total steps count from execution plan
      const totalStepsMatch = workflowText.match(/Total Steps:\s*(\d+)/);
      const totalSteps = totalStepsMatch ? parseInt(totalStepsMatch[1]) : 0;
      
      console.log(`   📊 Total steps in ${workflowId}: ${totalSteps}`);
      
      if (totalSteps === 0) {
        console.log(`   ⚠️  No steps found in ${workflowId}`);
        return;
      }

      // Track step progression
      let currentStep = 0;
      let stepsProcessed = 0;
      let completedSteps: string[] = [];
      let skippedSteps: string[] = [];
      
      // Progress through all steps
      while (currentStep < totalSteps + 5) { // +5 to ensure we hit completion
        const stepResult = await getNextStepHandler({ 
          workflow_id: workflowId,
          current_step: currentStep
        });
        
        expect(stepResult.content).toBeDefined();
        const stepText = stepResult.content[0].text;
        
        // Check if workflow is completed
        if (stepText.includes('100% complete') || stepText.includes('All steps completed')) {
          console.log(`   ✅ Workflow ${workflowId} completed at step ${currentStep}`);
          break;
        }
        
        // Extract step information
        const stepMatch = stepText.match(/Step (\d+)(?:\/(\d+))?/);
        if (stepMatch) {
          const stepNumber = parseInt(stepMatch[1]);
          const stepTotal = stepMatch[2] ? parseInt(stepMatch[2]) : totalSteps;
          
          console.log(`   🔄 Step ${stepNumber}/${stepTotal} for ${workflowId}`);
          
          // Check if step is executable or skipped
          if (stepText.includes('Executable: Yes')) {
            completedSteps.push(`Step ${stepNumber}`);
          } else if (stepText.includes('Skipped:') || stepText.includes('Missing')) {
            skippedSteps.push(`Step ${stepNumber}`);
          }
          
          stepsProcessed++;
        }
        
        // Verify step contains required elements
        expect(stepText).toMatch(/(Step \d+|100% complete|All steps completed)/);
        
        currentStep++;
        
        // Safety break to prevent infinite loops
        if (currentStep > totalSteps + 10) {
          console.log(`   ⚠️  Safety break triggered for ${workflowId} at step ${currentStep}`);
          break;
        }
      }
      
      console.log(`   📋 ${workflowId} Summary:`);
      console.log(`      - Steps processed: ${stepsProcessed}`);
      console.log(`      - Completed steps: ${completedSteps.length}`);
      console.log(`      - Skipped steps: ${skippedSteps.length}`);
      
      // Verify we processed some steps
      expect(stepsProcessed).toBeGreaterThan(0);
      
    }, TEST_TIMEOUT);
  });

  describe('Individual workflow step validation', () => {
    test('quick-fix workflow step details', async () => {
      const workflow = 'quick-fix';
      console.log(`\n🔍 Detailed step analysis for ${workflow}`);
      
      // Get first step details
      const step0 = await getNextStepHandler({ workflow_id: workflow, current_step: 0 });
      const step0Text = step0.content[0].text;
      
      if (!step0Text.includes('100% complete')) {
        // Should contain step information
        expect(step0Text).toMatch(/(ask-clarifying-questions|Step)/);
        expect(step0Text).toMatch(/(Executable|Prerequisites)/);
        
        console.log(`   ✅ Step 0: ${step0Text.includes('Executable: Yes') ? 'Executable' : 'Skipped'}`);
      }
      
      // Test step 1
      const step1 = await getNextStepHandler({ workflow_id: workflow, current_step: 1 });
      expect(step1.content[0].text).toMatch(/(Step|complete)/);
      
      console.log(`   📊 Quick-fix workflow properly handles step progression`);
    }, TEST_TIMEOUT);

    test('feature-development workflow step details', async () => {
      const workflow = 'feature-development';
      console.log(`\n🔍 Detailed step analysis for ${workflow}`);
      
      // Get workflow execution plan
      const workflowDetails = await selectWorkflowHandler({ workflow_id: workflow });
      const workflowText = workflowDetails.content[0].text;
      
      // Should show execution plan
      expect(workflowText).toContain('Execution Plan');
      expect(workflowText).toContain('Total Steps');
      expect(workflowText).toContain('Executable Steps');
      
      // Test first few steps
      for (let i = 0; i < 3; i++) {
        const stepResult = await getNextStepHandler({ 
          workflow_id: workflow, 
          current_step: i 
        });
        expect(stepResult.content[0].text).toMatch(/(Step|complete)/);
        
        console.log(`   📝 Step ${i}: ${stepResult.content[0].text.includes('100% complete') ? 'Complete' : 'Valid'}`);
      }
    }, TEST_TIMEOUT);

    test('project-initialization workflow step details', async () => {
      const workflow = 'project-initialization';
      console.log(`\n🔍 Detailed step analysis for ${workflow}`);
      
      // Should handle project initialization steps
      const step0 = await getNextStepHandler({ workflow_id: workflow, current_step: 0 });
      const stepText = step0.content[0].text;
      
      if (!stepText.includes('100% complete')) {
        expect(stepText).toMatch(/(create-project-navigation|Step)/);
      }
      
      console.log(`   🚀 Project initialization workflow properly configured`);
    }, TEST_TIMEOUT);
  });

  describe('Edge cases and error handling', () => {
    test('should handle large step numbers gracefully', async () => {
      const workflow = 'quick-fix';
      
      // Test with step number way beyond workflow length
      const result = await getNextStepHandler({ 
        workflow_id: workflow, 
        current_step: 999 
      });
      
      expect(result.content[0].text).toMatch(/(complete|100%)/);
      console.log(`   ✅ Handles large step numbers correctly`);
    }, TEST_TIMEOUT);

    test('should handle negative step numbers', async () => {
      const workflow = 'quick-fix';
      
      // Test with negative step number (should treat as 0)
      const result = await getNextStepHandler({ 
        workflow_id: workflow, 
        current_step: -1 
      });
      
      expect(result.content).toBeDefined();
      // Should either show first step or completion
      expect(result.content[0].text).toMatch(/(Step|complete)/);
      console.log(`   ✅ Handles negative step numbers correctly`);
    }, TEST_TIMEOUT);

    test('should validate step content structure', async () => {
      const workflows = ['quick-fix', 'feature-development', 'trd-creation'];
      
      for (const workflow of workflows) {
        const step0 = await getNextStepHandler({ 
          workflow_id: workflow, 
          current_step: 0 
        });
        
        const stepText = step0.content[0].text;
        
        // Every step should have structured content
        if (!stepText.includes('100% complete')) {
          // Should contain either step info or be a valid completion message
          expect(stepText).toMatch(/(Step \d+|Mini-prompt|Executable|Prerequisites)/);
        }
        
        console.log(`   ✅ ${workflow}: Step content structure valid`);
      }
    }, TEST_TIMEOUT);
  });

  describe('Workflow completion verification', () => {
    test('should reach completion state for all workflows', async () => {
      const workflows = [
        'quick-fix', 
        'feature-development', 
        'project-initialization', 
        'trd-creation'
      ];
      
      for (const workflow of workflows) {
        console.log(`\n🎯 Testing completion for ${workflow}`);
        
        // Get workflow details to understand total steps
        const workflowDetails = await selectWorkflowHandler({ workflow_id: workflow });
        const workflowText = workflowDetails.content[0].text;
        
        const totalStepsMatch = workflowText.match(/Total Steps:\s*(\d+)/);
        const totalSteps = totalStepsMatch ? parseInt(totalStepsMatch[1]) : 5;
        
        // Test completion at totalSteps + buffer
        const completionStep = totalSteps + 2;
        const result = await getNextStepHandler({ 
          workflow_id: workflow, 
          current_step: completionStep 
        });
        
        expect(result.content[0].text).toMatch(/(complete|100%)/);
        console.log(`   ✅ ${workflow}: Reaches completion correctly`);
      }
    }, TEST_TIMEOUT);
  });
}); 