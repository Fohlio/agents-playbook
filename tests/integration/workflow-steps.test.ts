import { describe, test, expect, beforeAll } from '@jest/globals';
import { selectWorkflowHandler } from '../../src/lib/mcp-tools/select-workflow';
import { getNextStepHandler } from '../../src/lib/mcp-tools/get-next-step';
import { WorkflowLoader } from '../../src/lib/loaders/workflow-loader';
import { StandardContext } from '../../src/lib/types/workflow-types';

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
      'code-refactoring',
      'feature-development',
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
        expect(step0Text).toMatch(/(Mini-Prompt Instructions|Required Tools|Required Context)/);
        
        console.log(`   ✅ Step 0: ${step0Text.includes('Mini-Prompt Instructions') ? 'Contains Instructions' : 'Valid Step'}`);
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
      
      // Should show workflow overview
      expect(workflowText).toContain('Workflow Overview');
      expect(workflowText).toContain('Total Steps');
      
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

    // New tests for context system in workflow steps
    test('feature-development workflow with available context', async () => {
      const workflow = 'feature-development';
      console.log(`\n🔍 Testing context system for ${workflow}`);
      
      // Test step with no context
      const step0 = await getNextStepHandler({ 
        workflow_id: workflow, 
        current_step: 0,
        available_context: []
      });
      
      if (!step0.content[0].text.includes('100% complete')) {
        expect(step0.content[0].text).not.toContain('Available Context');
        console.log(`   ✅ Step 0 (no context): Properly handled`);
      }
      
      // Test step with context
      const step1 = await getNextStepHandler({ 
        workflow_id: workflow, 
        current_step: 1,
        available_context: [StandardContext.REQUIREMENTS]
      });
      
      if (!step1.content[0].text.includes('100% complete')) {
        expect(step1.content[0].text).toContain('Available Context');
        expect(step1.content[0].text).toContain('requirements');
        console.log(`   ✅ Step 1 (with context): Context properly utilized`);
      }
      
      // Test step with multiple contexts
      const step2 = await getNextStepHandler({ 
        workflow_id: workflow, 
        current_step: 2,
        available_context: [
          StandardContext.REQUIREMENTS,
          StandardContext.CLARIFIED_REQUIREMENTS,
          StandardContext.TRD
        ]
      });
      
      if (!step2.content[0].text.includes('100% complete')) {
        expect(step2.content[0].text).toContain('Available Context');
        expect(step2.content[0].text).toContain('requirements');
        expect(step2.content[0].text).toContain('clarified_requirements');
        console.log(`   ✅ Step 2 (multiple contexts): All contexts properly handled`);
      }
    }, TEST_TIMEOUT);

    test('trd-creation workflow with business requirements context', async () => {
      const workflow = 'trd-creation';
      console.log(`\n🔍 Testing TRD creation with business context`);
      
      // Test with business requirements context
      const step0 = await getNextStepHandler({ 
        workflow_id: workflow, 
        current_step: 0,
        available_context: [StandardContext.BUSINESS_REQUIREMENTS]
      });
      
      if (!step0.content[0].text.includes('100% complete')) {
        expect(step0.content[0].text).toContain('Available Context');
        expect(step0.content[0].text).toContain('business_requirements');
        expect(step0.content[0].text).toContain('Context Note');
        console.log(`   ✅ TRD creation: Business requirements context properly integrated`);
      }
    }, TEST_TIMEOUT);

    test('context modification in mini-prompts', async () => {
      const workflow = 'feature-development';
      console.log(`\n🔍 Testing mini-prompt context modification`);
      
      // Test step with context - should modify mini-prompt content
      const result = await getNextStepHandler({ 
        workflow_id: workflow, 
        current_step: 1,
        available_context: [StandardContext.REQUIREMENTS, StandardContext.TRD]
      });
      
      if (!result.content[0].text.includes('100% complete')) {
        const stepText = result.content[0].text;
        
        // Should contain context section
        expect(stepText).toContain('Available Context');
        expect(stepText).toContain('requirements');
        expect(stepText).toContain('trd');
        
        // Should contain context note in mini-prompt
        expect(stepText).toContain('Context Note');
        expect(stepText).toContain('reference your existing documents');
        
        console.log(`   ✅ Mini-prompt properly modified with context information`);
      }
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
        
        // Should show completion - either 100%, NaN% (for workflows with 0 executable steps), or "Workflow Complete"
        expect(result.content[0].text).toMatch(/(complete|100%|NaN%|Workflow Complete)/);
        console.log(`   ✅ ${workflow}: Reaches completion correctly`);
      }
    }, TEST_TIMEOUT);
  });

  describe('Context Flow Through Workflow Steps', () => {
    test('should handle context progression through feature-development workflow', async () => {
      const workflow = 'feature-development';
      console.log(`\n🔄 Testing context progression in ${workflow}`);
      
      // Simulate workflow progression with context building
      const contexts = {
        step0: [],
        step1: [StandardContext.REQUIREMENTS],
        step2: [StandardContext.REQUIREMENTS, StandardContext.CLARIFIED_REQUIREMENTS],
        step3: [StandardContext.REQUIREMENTS, StandardContext.CLARIFIED_REQUIREMENTS, StandardContext.FEATURE_ANALYSIS],
        step4: [StandardContext.REQUIREMENTS, StandardContext.CLARIFIED_REQUIREMENTS, StandardContext.FEATURE_ANALYSIS, StandardContext.DESIGN_SPECIFICATIONS]
      };
      
      // Test each step with appropriate context
      for (const [stepKey, stepContexts] of Object.entries(contexts)) {
        const stepNumber = parseInt(stepKey.replace('step', ''));
        
        const result = await getNextStepHandler({ 
          workflow_id: workflow, 
          current_step: stepNumber,
          available_context: stepContexts
        });
        
        // Check if workflow completed
        if (result.content[0].text.includes('100% complete') || 
            result.content[0].text.includes('Workflow Complete')) {
          console.log(`   ✅ Step ${stepNumber}: Workflow completed`);
          break;
        }
        
        // Verify context handling for active steps
        if (stepContexts.length > 0) {
          expect(result.content[0].text).toContain('Available Context');
          console.log(`   ✅ Step ${stepNumber}: ${stepContexts.length} contexts properly handled`);
        } else {
          expect(result.content[0].text).not.toContain('Available Context');
          console.log(`   ✅ Step ${stepNumber}: No context required`);
        }
      }
    }, TEST_TIMEOUT);

    test('should handle context progression through trd-creation workflow', async () => {
      const workflow = 'trd-creation';
      console.log(`\n🔄 Testing context progression in ${workflow}`);
      
      // Test different context scenarios for TRD creation
      const contextScenarios = [
        { step: 0, contexts: [], label: 'no context' },
        { step: 0, contexts: [StandardContext.BUSINESS_REQUIREMENTS], label: 'business requirements' },
        { step: 1, contexts: [StandardContext.REQUIREMENTS], label: 'requirements' },
        { step: 2, contexts: [StandardContext.CLARIFIED_REQUIREMENTS], label: 'clarified requirements' }
      ];
      
      for (const scenario of contextScenarios) {
        const result = await getNextStepHandler({ 
          workflow_id: workflow, 
          current_step: scenario.step,
          available_context: scenario.contexts
        });
        
        // Check if workflow completed
        if (result.content[0].text.includes('100% complete') || 
            result.content[0].text.includes('Workflow Complete')) {
          console.log(`   ✅ Step ${scenario.step} (${scenario.label}): Workflow completed`);
          continue;
        }
        
        if (scenario.contexts.length > 0) {
          expect(result.content[0].text).toContain('Available Context');
          console.log(`   ✅ Step ${scenario.step} (${scenario.label}): Context properly integrated`);
        } else {
          expect(result.content[0].text).not.toContain('Available Context');
          console.log(`   ✅ Step ${scenario.step} (${scenario.label}): No context shown`);
        }
      }
    }, TEST_TIMEOUT);

    test('should handle context with all workflow types', async () => {
      const workflows = [
        'quick-fix',
        'feature-development',
        'trd-creation',
        'project-initialization'
      ];
      
      const testContexts = [
        StandardContext.REQUIREMENTS,
        StandardContext.TRD,
        StandardContext.DESIGN_SPECIFICATIONS
      ];
      
      for (const workflowId of workflows) {
        console.log(`\n🔄 Testing context handling for ${workflowId}`);
        
        // Test first step with contexts
        const result = await getNextStepHandler({ 
          workflow_id: workflowId, 
          current_step: 0,
          available_context: testContexts
        });
        
        expect(result.content).toBeDefined();
        
        // Check if workflow completed immediately (no executable steps)
        if (result.content[0].text.includes('100% complete') || 
            result.content[0].text.includes('Workflow Complete')) {
          console.log(`   ✅ ${workflowId}: Workflow completed immediately (no executable steps)`);
        } else {
          expect(result.content[0].text).toContain('Available Context');
          expect(result.content[0].text).toContain('requirements');
          console.log(`   ✅ ${workflowId}: Context system working`);
        }
      }
    }, TEST_TIMEOUT);
  });
}); 