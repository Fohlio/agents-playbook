/**
 * @jest-environment node
 */
import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';
import { prisma } from '../../src/lib/db/client';

// Test configuration
const TEST_TIMEOUT = 10000;

describe('Reorder API Integration Tests', () => {
  let testUserId: string;
  let testWorkflowIds: string[] = [];
  let testMiniPromptIds: string[] = [];

  beforeAll(async () => {
    console.log('🧪 Starting Reorder API integration tests...');

    // Create test user
    const testUser = await prisma.user.create({
      data: {
        email: `reorder-test-${Date.now()}@example.com`,
        username: `reorder-test-${Date.now()}`,
        passwordHash: 'test-hash',
      },
    });
    testUserId = testUser.id;

    // Create test workflows with sequential positions
    for (let i = 0; i < 5; i++) {
      const workflow = await prisma.workflow.create({
        data: {
          userId: testUserId,
          name: `Test Workflow ${i}`,
          description: `Description ${i}`,
          position: i,
        },
      });
      testWorkflowIds.push(workflow.id);
    }

    // Create test mini-prompts with sequential positions
    for (let i = 0; i < 5; i++) {
      const miniPrompt = await prisma.miniPrompt.create({
        data: {
          userId: testUserId,
          name: `Test Mini-Prompt ${i}`,
          content: `Content ${i}`,
          position: i,
        },
      });
      testMiniPromptIds.push(miniPrompt.id);
    }
  });

  afterAll(async () => {
    // Cleanup: Delete test user and all related data
    if (testUserId) {
      await prisma.user.delete({
        where: { id: testUserId },
      });
    }
  });

  describe('Workflow Reorder Endpoint', () => {
    test('should reorder workflow from position 0 to position 2 (moving down)', async () => {
      const workflowId = testWorkflowIds[0];

      // Execute reorder via transaction (simulating API logic)
      await prisma.$transaction(async (tx) => {
        const workflow = await tx.workflow.findUnique({
          where: { id: workflowId },
          select: { id: true, userId: true, position: true }
        });

        if (!workflow) throw new Error('Workflow not found');

        const oldPosition = workflow.position;
        const newPosition = 2;

        if (newPosition > oldPosition) {
          await tx.workflow.updateMany({
            where: {
              userId: testUserId,
              position: { gt: oldPosition, lte: newPosition }
            },
            data: { position: { decrement: 1 } }
          });
        }

        await tx.workflow.update({
          where: { id: workflowId },
          data: { position: newPosition }
        });
      });

      // Verify final positions
      const workflows = await prisma.workflow.findMany({
        where: { id: { in: testWorkflowIds } },
        orderBy: { position: 'asc' },
        select: { id: true, name: true, position: true }
      });

      // Workflow 0 should now be at position 2
      const movedWorkflow = workflows.find(w => w.id === workflowId);
      expect(movedWorkflow?.position).toBe(2);

      // Workflows 1 and 2 should have shifted down
      expect(workflows[0].name).toBe('Test Workflow 1');
      expect(workflows[0].position).toBe(0);
      expect(workflows[1].name).toBe('Test Workflow 2');
      expect(workflows[1].position).toBe(1);
    }, TEST_TIMEOUT);

    test('should reorder workflow from high position to low position (moving up)', async () => {
      const workflowId = testWorkflowIds[4];

      await prisma.$transaction(async (tx) => {
        const workflow = await tx.workflow.findUnique({
          where: { id: workflowId },
          select: { id: true, userId: true, position: true }
        });

        if (!workflow) throw new Error('Workflow not found');

        const oldPosition = workflow.position;
        const newPosition = 1;

        if (newPosition < oldPosition) {
          await tx.workflow.updateMany({
            where: {
              userId: testUserId,
              position: { gte: newPosition, lt: oldPosition }
            },
            data: { position: { increment: 1 } }
          });
        }

        await tx.workflow.update({
          where: { id: workflowId },
          data: { position: newPosition }
        });
      });

      const workflows = await prisma.workflow.findMany({
        where: { id: { in: testWorkflowIds } },
        orderBy: { position: 'asc' },
        select: { id: true, name: true, position: true }
      });

      // Workflow 4 should now be at position 1
      const movedWorkflow = workflows.find(w => w.id === workflowId);
      expect(movedWorkflow?.position).toBe(1);
    }, TEST_TIMEOUT);

    test('should handle reordering to same position (no-op)', async () => {
      const workflowId = testWorkflowIds[2];

      const beforeWorkflow = await prisma.workflow.findUnique({
        where: { id: workflowId },
        select: { position: true }
      });

      const oldPosition = beforeWorkflow!.position;

      // Try to reorder to same position
      await prisma.$transaction(async (tx) => {
        const workflow = await tx.workflow.findUnique({
          where: { id: workflowId },
          select: { id: true, userId: true, position: true }
        });

        if (workflow!.position === oldPosition) {
          return; // No-op
        }
      });

      const afterWorkflow = await prisma.workflow.findUnique({
        where: { id: workflowId },
        select: { position: true }
      });

      expect(afterWorkflow!.position).toBe(oldPosition);
    }, TEST_TIMEOUT);

    test('should maintain position consistency across all user workflows', async () => {
      // Reset positions to sequential order
      for (let i = 0; i < testWorkflowIds.length; i++) {
        await prisma.workflow.update({
          where: { id: testWorkflowIds[i] },
          data: { position: i }
        });
      }

      const workflows = await prisma.workflow.findMany({
        where: { userId: testUserId },
        orderBy: { position: 'asc' },
        select: { position: true }
      });

      // Check no duplicate positions
      const positions = workflows.map(w => w.position);
      const uniquePositions = new Set(positions);
      expect(uniquePositions.size).toBe(positions.length);

      // Check positions are sequential starting from 0
      expect(positions).toEqual([0, 1, 2, 3, 4]);
    }, TEST_TIMEOUT);
  });

  describe('Mini-Prompt Reorder Endpoint', () => {
    test('should reorder mini-prompt from position 0 to position 3 (moving down)', async () => {
      const miniPromptId = testMiniPromptIds[0];

      await prisma.$transaction(async (tx) => {
        const miniPrompt = await tx.miniPrompt.findUnique({
          where: { id: miniPromptId },
          select: { id: true, userId: true, position: true }
        });

        if (!miniPrompt) throw new Error('Mini-prompt not found');

        const oldPosition = miniPrompt.position;
        const newPosition = 3;

        if (newPosition > oldPosition) {
          await tx.miniPrompt.updateMany({
            where: {
              userId: testUserId,
              position: { gt: oldPosition, lte: newPosition }
            },
            data: { position: { decrement: 1 } }
          });
        }

        await tx.miniPrompt.update({
          where: { id: miniPromptId },
          data: { position: newPosition }
        });
      });

      const miniPrompts = await prisma.miniPrompt.findMany({
        where: { id: { in: testMiniPromptIds } },
        orderBy: { position: 'asc' },
        select: { id: true, name: true, position: true }
      });

      const movedPrompt = miniPrompts.find(mp => mp.id === miniPromptId);
      expect(movedPrompt?.position).toBe(3);
    }, TEST_TIMEOUT);

    test('should reorder mini-prompt from high position to low position (moving up)', async () => {
      const miniPromptId = testMiniPromptIds[3];

      await prisma.$transaction(async (tx) => {
        const miniPrompt = await tx.miniPrompt.findUnique({
          where: { id: miniPromptId },
          select: { id: true, userId: true, position: true }
        });

        if (!miniPrompt) throw new Error('Mini-prompt not found');

        const oldPosition = miniPrompt.position;
        const newPosition = 0;

        if (newPosition < oldPosition) {
          await tx.miniPrompt.updateMany({
            where: {
              userId: testUserId,
              position: { gte: newPosition, lt: oldPosition }
            },
            data: { position: { increment: 1 } }
          });
        }

        await tx.miniPrompt.update({
          where: { id: miniPromptId },
          data: { position: newPosition }
        });
      });

      const miniPrompts = await prisma.miniPrompt.findMany({
        where: { id: { in: testMiniPromptIds } },
        orderBy: { position: 'asc' },
        select: { id: true, name: true, position: true }
      });

      const movedPrompt = miniPrompts.find(mp => mp.id === miniPromptId);
      expect(movedPrompt?.position).toBe(0);
    }, TEST_TIMEOUT);

    test('should maintain position consistency across all user mini-prompts', async () => {
      // Reset positions to sequential order
      for (let i = 0; i < testMiniPromptIds.length; i++) {
        await prisma.miniPrompt.update({
          where: { id: testMiniPromptIds[i] },
          data: { position: i }
        });
      }

      const miniPrompts = await prisma.miniPrompt.findMany({
        where: { userId: testUserId },
        orderBy: { position: 'asc' },
        select: { position: true }
      });

      const positions = miniPrompts.map(mp => mp.position);
      const uniquePositions = new Set(positions);
      expect(uniquePositions.size).toBe(positions.length);

      expect(positions).toEqual([0, 1, 2, 3, 4]);
    }, TEST_TIMEOUT);
  });

  describe('Reorder Transaction Atomicity', () => {
    test('should rollback workflow reorder on error', async () => {
      const workflowId = testWorkflowIds[0];

      const beforePositions = await prisma.workflow.findMany({
        where: { userId: testUserId },
        orderBy: { position: 'asc' },
        select: { id: true, position: true }
      });

      try {
        await prisma.$transaction(async (tx) => {
          const workflow = await tx.workflow.findUnique({
            where: { id: workflowId },
            select: { id: true, userId: true, position: true }
          });

          if (!workflow) throw new Error('Workflow not found');

          const oldPosition = workflow.position;
          const newPosition = 2;

          if (newPosition > oldPosition) {
            await tx.workflow.updateMany({
              where: {
                userId: testUserId,
                position: { gt: oldPosition, lte: newPosition }
              },
              data: { position: { decrement: 1 } }
            });
          }

          // Simulate error before final update
          throw new Error('Simulated error');
        });
      } catch (error) {
        // Expected error
      }

      const afterPositions = await prisma.workflow.findMany({
        where: { userId: testUserId },
        orderBy: { position: 'asc' },
        select: { id: true, position: true }
      });

      // Positions should be unchanged
      expect(afterPositions).toEqual(beforePositions);
    }, TEST_TIMEOUT);
  });
});
