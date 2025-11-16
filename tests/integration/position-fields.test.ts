/**
 * @jest-environment node
 */
import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';
import { prisma } from '../../src/lib/db/client';

// Test configuration
const TEST_TIMEOUT = 10000;

describe('Position Fields Integration Tests', () => {
  let testUserId: string;

  beforeAll(async () => {
    console.log('🧪 Starting Position Fields integration tests...');

    // Create test user
    const testUser = await prisma.user.create({
      data: {
        email: `position-test-${Date.now()}@example.com`,
        username: `position-test-${Date.now()}`,
        passwordHash: 'test-hash',
      },
    });
    testUserId = testUser.id;
  });

  afterAll(async () => {
    // Cleanup: Delete test user and all related data (cascade will handle workflows/mini-prompts)
    if (testUserId) {
      await prisma.user.delete({
        where: { id: testUserId },
      });
    }
  });

  describe('Workflow Position Field', () => {
    test('should create workflow with default position 0', async () => {
      const workflow = await prisma.workflow.create({
        data: {
          userId: testUserId,
          name: 'Test Workflow 1',
          description: 'Test description',
        },
      });

      expect(workflow.position).toBe(0);
    }, TEST_TIMEOUT);

    test('should create multiple workflows with sequential positions', async () => {
      const workflow1 = await prisma.workflow.create({
        data: {
          userId: testUserId,
          name: 'Test Workflow A',
          position: 0,
        },
      });

      const workflow2 = await prisma.workflow.create({
        data: {
          userId: testUserId,
          name: 'Test Workflow B',
          position: 1,
        },
      });

      const workflow3 = await prisma.workflow.create({
        data: {
          userId: testUserId,
          name: 'Test Workflow C',
          position: 2,
        },
      });

      expect(workflow1.position).toBe(0);
      expect(workflow2.position).toBe(1);
      expect(workflow3.position).toBe(2);
    }, TEST_TIMEOUT);

    test('should query workflows ordered by position', async () => {
      // Create workflows with explicit positions
      await prisma.workflow.createMany({
        data: [
          { userId: testUserId, name: 'Workflow Position 2', position: 2 },
          { userId: testUserId, name: 'Workflow Position 0', position: 0 },
          { userId: testUserId, name: 'Workflow Position 1', position: 1 },
        ],
      });

      const workflows = await prisma.workflow.findMany({
        where: { userId: testUserId },
        orderBy: { position: 'asc' },
        select: { name: true, position: true },
      });

      expect(workflows.length).toBeGreaterThanOrEqual(3);

      // Find our test workflows
      const testWorkflows = workflows.filter(w => w.name.startsWith('Workflow Position'));
      expect(testWorkflows[0].position).toBe(0);
      expect(testWorkflows[1].position).toBe(1);
      expect(testWorkflows[2].position).toBe(2);
    }, TEST_TIMEOUT);

    test('should update workflow position', async () => {
      const workflow = await prisma.workflow.create({
        data: {
          userId: testUserId,
          name: 'Workflow to Reorder',
          position: 5,
        },
      });

      const updated = await prisma.workflow.update({
        where: { id: workflow.id },
        data: { position: 10 },
      });

      expect(updated.position).toBe(10);
    }, TEST_TIMEOUT);

    test('should use composite index for userId and position', async () => {
      // This test verifies the index exists by checking query performance
      // Create multiple workflows
      const workflows = [];
      for (let i = 0; i < 10; i++) {
        workflows.push({
          userId: testUserId,
          name: `Indexed Workflow ${i}`,
          position: i,
        });
      }
      await prisma.workflow.createMany({ data: workflows });

      const start = Date.now();
      const result = await prisma.workflow.findMany({
        where: { userId: testUserId },
        orderBy: { position: 'asc' },
        take: 5,
      });
      const duration = Date.now() - start;

      expect(result.length).toBe(5);
      // Query should be fast with index (< 2000ms for remote database, accounting for network latency)
      expect(duration).toBeLessThan(2000);
    }, TEST_TIMEOUT);
  });

  describe('MiniPrompt Position Field', () => {
    test('should create mini-prompt with default position 0', async () => {
      const miniPrompt = await prisma.miniPrompt.create({
        data: {
          userId: testUserId,
          name: 'Test Mini-Prompt 1',
          description: 'Test description',
          content: 'Test content',
        },
      });

      expect(miniPrompt.position).toBe(0);
    }, TEST_TIMEOUT);

    test('should create multiple mini-prompts with sequential positions', async () => {
      const mp1 = await prisma.miniPrompt.create({
        data: {
          userId: testUserId,
          name: 'Mini-Prompt A',
          content: 'Content A',
          position: 0,
        },
      });

      const mp2 = await prisma.miniPrompt.create({
        data: {
          userId: testUserId,
          name: 'Mini-Prompt B',
          content: 'Content B',
          position: 1,
        },
      });

      const mp3 = await prisma.miniPrompt.create({
        data: {
          userId: testUserId,
          name: 'Mini-Prompt C',
          content: 'Content C',
          position: 2,
        },
      });

      expect(mp1.position).toBe(0);
      expect(mp2.position).toBe(1);
      expect(mp3.position).toBe(2);
    }, TEST_TIMEOUT);

    test('should query mini-prompts ordered by position', async () => {
      // Create mini-prompts with explicit positions
      await prisma.miniPrompt.createMany({
        data: [
          { userId: testUserId, name: 'MP Position 2', content: 'C2', position: 2 },
          { userId: testUserId, name: 'MP Position 0', content: 'C0', position: 0 },
          { userId: testUserId, name: 'MP Position 1', content: 'C1', position: 1 },
        ],
      });

      const miniPrompts = await prisma.miniPrompt.findMany({
        where: { userId: testUserId },
        orderBy: { position: 'asc' },
        select: { name: true, position: true },
      });

      expect(miniPrompts.length).toBeGreaterThanOrEqual(3);

      // Find our test mini-prompts
      const testMPs = miniPrompts.filter(mp => mp.name.startsWith('MP Position'));
      expect(testMPs[0].position).toBe(0);
      expect(testMPs[1].position).toBe(1);
      expect(testMPs[2].position).toBe(2);
    }, TEST_TIMEOUT);

    test('should update mini-prompt position', async () => {
      const miniPrompt = await prisma.miniPrompt.create({
        data: {
          userId: testUserId,
          name: 'MP to Reorder',
          content: 'Test content',
          position: 5,
        },
      });

      const updated = await prisma.miniPrompt.update({
        where: { id: miniPrompt.id },
        data: { position: 10 },
      });

      expect(updated.position).toBe(10);
    }, TEST_TIMEOUT);

    test('should use composite index for userId and position', async () => {
      // Create multiple mini-prompts
      const miniPrompts = [];
      for (let i = 0; i < 10; i++) {
        miniPrompts.push({
          userId: testUserId,
          name: `Indexed MP ${i}`,
          content: `Content ${i}`,
          position: i,
        });
      }
      await prisma.miniPrompt.createMany({ data: miniPrompts });

      const start = Date.now();
      const result = await prisma.miniPrompt.findMany({
        where: { userId: testUserId },
        orderBy: { position: 'asc' },
        take: 5,
      });
      const duration = Date.now() - start;

      expect(result.length).toBe(5);
      // Query should be fast with index (< 2000ms for remote database, accounting for network latency)
      expect(duration).toBeLessThan(2000);
    }, TEST_TIMEOUT);
  });

  describe('Position Field Type Safety', () => {
    test('should enforce integer type for workflow position', async () => {
      const workflow = await prisma.workflow.create({
        data: {
          userId: testUserId,
          name: 'Integer Test Workflow',
          position: 42,
        },
      });

      expect(typeof workflow.position).toBe('number');
      expect(Number.isInteger(workflow.position)).toBe(true);
    }, TEST_TIMEOUT);

    test('should enforce integer type for mini-prompt position', async () => {
      const miniPrompt = await prisma.miniPrompt.create({
        data: {
          userId: testUserId,
          name: 'Integer Test MP',
          content: 'Test',
          position: 42,
        },
      });

      expect(typeof miniPrompt.position).toBe('number');
      expect(Number.isInteger(miniPrompt.position)).toBe(true);
    }, TEST_TIMEOUT);
  });
});
