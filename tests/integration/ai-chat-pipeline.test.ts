/**
 * @jest-environment node
 *
 * Integration tests for AI Chat Pipeline
 *
 * Tests the complete flow from API request to message persistence:
 * 1. User sends message to /api/ai-assistant/chat
 * 2. API validates OpenAI key and creates/loads session
 * 3. ContextBuilder enriches prompts with workflow context
 * 4. OpenAI generates response
 * 5. MessagePersistenceService saves messages to database
 * 6. Token count is tracked and auto-reset is triggered if needed
 *
 * Requirements:
 * - Valid OPENAI_API_KEY in environment
 * - Database connection configured
 * - Test user with OpenAI key set
 */

import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';
import { NextRequest } from 'next/server';
import { prisma } from '../../src/lib/db/client';
import { MessagePersistenceService } from '../../src/lib/ai-chat/message-persistence-service';
import { AutoResetManager } from '../../src/lib/ai-chat/auto-reset-manager';

// Test configuration
const TEST_TIMEOUT = 60000; // 60 seconds for OpenAI API calls
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Test user ID (will be created in beforeAll)
let testUserId: string;
let testWorkflowId: string;
let testChatSessionId: string;

describe('AI Chat Pipeline Integration Tests', () => {
  beforeAll(async () => {
    console.log('🧪 Setting up AI Chat Pipeline integration tests...');

    if (!OPENAI_API_KEY) {
      console.warn('⚠️  OPENAI_API_KEY not set - skipping real API tests');
      return;
    }

    // Create test user with OpenAI key
    const testUser = await prisma.user.upsert({
      where: { email: 'ai-chat-test@test.com' },
      update: {
        openaiApiKey: OPENAI_API_KEY,
      },
      create: {
        email: 'ai-chat-test@test.com',
        username: 'ai-chat-test-user',
        passwordHash: 'test-hash-value',
        openaiApiKey: OPENAI_API_KEY,
      },
    });
    testUserId = testUser.id;

    // Create test workflow
    const testWorkflow = await prisma.workflow.upsert({
      where: { id: 'test-ai-chat-workflow' },
      update: {},
      create: {
        id: 'test-ai-chat-workflow',
        userId: testUserId,
        name: 'Test AI Chat Workflow',
        description: 'Workflow for testing AI chat pipeline',
        complexity: 'S', // Small complexity
        isSystemWorkflow: false,
        isActive: true,
        visibility: 'PRIVATE',
        includeMultiAgentChat: false,
      },
    });
    testWorkflowId = testWorkflow.id;

    console.log('✅ Test setup complete');
    console.log(`   User ID: ${testUserId}`);
    console.log(`   Workflow ID: ${testWorkflowId}`);
  }, TEST_TIMEOUT);

  afterAll(async () => {
    console.log('🧹 Cleaning up test data...');

    // Clean up test chat sessions and messages
    if (testUserId) {
      await prisma.chatMessage.deleteMany({
        where: { userId: testUserId },
      });
      await prisma.aIChatSession.deleteMany({
        where: { userId: testUserId },
      });
    }

    // Note: We don't delete the test user or workflow as they may be reused
    // If needed, uncomment the following:
    // await prisma.workflow.delete({ where: { id: testWorkflowId } });
    // await prisma.user.delete({ where: { id: testUserId } });

    await prisma.$disconnect();
    console.log('✅ Cleanup complete');
  }, TEST_TIMEOUT);

  describe('MessagePersistenceService', () => {
    test('should save messages and update session stats', async () => {
      if (!OPENAI_API_KEY) {
        console.log('⏭️  Skipping - OPENAI_API_KEY not set');
        return;
      }

      // Create a test session
      const session = await prisma.aIChatSession.create({
        data: {
          userId: testUserId,
          workflowId: testWorkflowId,
          mode: 'workflow',
          totalTokens: 0,
        },
      });

      // Save test messages
      await MessagePersistenceService.saveMessages({
        chatId: session.id,
        userId: testUserId,
        messages: [
          { role: 'user', content: 'Hello, AI!' },
          { role: 'assistant', content: 'Hello! How can I help you today?' },
        ],
        tokenCount: 20,
        responseId: undefined,
      });

      // Verify messages were saved
      const messages = await prisma.chatMessage.findMany({
        where: { chatId: session.id },
        orderBy: { createdAt: 'asc' },
      });

      expect(messages).toHaveLength(2);
      expect(messages[0].role).toBe('USER');
      expect(messages[0].content).toBe('Hello, AI!');
      expect(messages[1].role).toBe('ASSISTANT');
      expect(messages[1].content).toBe('Hello! How can I help you today?');

      // Verify session stats were updated
      const updatedSession = await prisma.aIChatSession.findUnique({
        where: { id: session.id },
      });

      expect(updatedSession?.totalTokens).toBe(20);
      expect(updatedSession?.lastMessageAt).toBeDefined();

      // Cleanup
      await prisma.chatMessage.deleteMany({ where: { chatId: session.id } });
      await prisma.aIChatSession.delete({ where: { id: session.id } });
    }, TEST_TIMEOUT);

    test('should retrieve message history', async () => {
      if (!OPENAI_API_KEY) {
        console.log('⏭️  Skipping - OPENAI_API_KEY not set');
        return;
      }

      // Create session with messages
      const session = await prisma.aIChatSession.create({
        data: {
          userId: testUserId,
          workflowId: testWorkflowId,
          mode: 'workflow',
          totalTokens: 0,
        },
      });

      // Save messages
      await MessagePersistenceService.saveMessages({
        chatId: session.id,
        userId: testUserId,
        messages: [
          { role: 'user', content: 'Message 1' },
          { role: 'assistant', content: 'Response 1' },
          { role: 'user', content: 'Message 2' },
        ],
        tokenCount: 30,
        responseId: undefined,
      });

      // Retrieve history
      const history = await MessagePersistenceService.getMessageHistory(session.id);

      expect(history).toHaveLength(3);
      expect(history[0].role).toBe('user');
      expect(history[0].content).toBe('Message 1');
      expect(history[1].role).toBe('assistant');
      expect(history[2].role).toBe('user');
      expect(history[2].content).toBe('Message 2');

      // Cleanup
      await prisma.chatMessage.deleteMany({ where: { chatId: session.id } });
      await prisma.aIChatSession.delete({ where: { id: session.id } });
    }, TEST_TIMEOUT);

    test('should check auto-reset threshold', async () => {
      if (!OPENAI_API_KEY) {
        console.log('⏭️  Skipping - OPENAI_API_KEY not set');
        return;
      }

      // Create session below threshold
      const sessionBelow = await prisma.aIChatSession.create({
        data: {
          userId: testUserId,
          workflowId: testWorkflowId,
          mode: 'workflow',
          totalTokens: 50000, // Below 100k threshold
        },
      });

      const shouldResetBelow = await MessagePersistenceService.shouldTriggerAutoReset(
        sessionBelow.id
      );
      expect(shouldResetBelow).toBe(false);

      // Create session above threshold
      const sessionAbove = await prisma.aIChatSession.create({
        data: {
          userId: testUserId,
          workflowId: testWorkflowId,
          mode: 'workflow',
          totalTokens: 150000, // Above 100k threshold
        },
      });

      const shouldResetAbove = await MessagePersistenceService.shouldTriggerAutoReset(
        sessionAbove.id
      );
      expect(shouldResetAbove).toBe(true);

      // Cleanup
      await prisma.aIChatSession.delete({ where: { id: sessionBelow.id } });
      await prisma.aIChatSession.delete({ where: { id: sessionAbove.id } });
    }, TEST_TIMEOUT);
  });

  describe('AutoResetManager', () => {
    test('should trigger auto-reset and create new session', async () => {
      if (!OPENAI_API_KEY) {
        console.log('⏭️  Skipping - OPENAI_API_KEY not set');
        return;
      }

      // Create old session with messages
      const oldSession = await prisma.aIChatSession.create({
        data: {
          userId: testUserId,
          workflowId: testWorkflowId,
          mode: 'workflow',
          totalTokens: 150000, // Above threshold
        },
      });

      // Add some messages
      await MessagePersistenceService.saveMessages({
        chatId: oldSession.id,
        userId: testUserId,
        messages: [
          { role: 'user', content: 'Old conversation message 1' },
          { role: 'assistant', content: 'Old conversation response 1' },
        ],
        tokenCount: 20,
        responseId: undefined,
      });

      // Trigger auto-reset
      const newSessionId = await AutoResetManager.triggerAutoReset(
        oldSession.id,
        testUserId,
        OPENAI_API_KEY
      );

      expect(newSessionId).toBeDefined();
      expect(newSessionId).not.toBe(oldSession.id);

      // Verify old session is archived
      const archivedSession = await prisma.aIChatSession.findUnique({
        where: { id: oldSession.id },
      });
      expect(archivedSession?.archivedAt).toBeDefined();

      // Verify new session exists
      const newSession = await prisma.aIChatSession.findUnique({
        where: { id: newSessionId },
        include: { messages: true },
      });

      expect(newSession).toBeDefined();
      expect(newSession?.totalTokens).toBe(0);
      expect(newSession?.workflowId).toBe(testWorkflowId);
      expect(newSession?.messages).toHaveLength(1); // Summary message

      // Verify summary message
      const summaryMessage = newSession?.messages[0];
      expect(summaryMessage?.role).toBe('SYSTEM');
      expect(summaryMessage?.content).toContain('Previous conversation summary');

      // Cleanup
      await prisma.chatMessage.deleteMany({ where: { chatId: oldSession.id } });
      await prisma.chatMessage.deleteMany({ where: { chatId: newSessionId } });
      await prisma.aIChatSession.delete({ where: { id: oldSession.id } });
      await prisma.aIChatSession.delete({ where: { id: newSessionId } });
    }, TEST_TIMEOUT);
  });

  describe('End-to-End Chat Flow (with Real OpenAI API)', () => {
    test('should handle complete chat request with OpenAI', async () => {
      if (!OPENAI_API_KEY) {
        console.log('⏭️  Skipping - OPENAI_API_KEY not set');
        console.log('   Set OPENAI_API_KEY environment variable to run this test');
        return;
      }

      console.log('🤖 Testing complete chat flow with real OpenAI API...');

      // Import the chat route handler
      const { POST } = await import('../../src/app/api/ai-assistant/chat/route');

      // Create mock request
      const requestBody = {
        message: 'What is 2 + 2?',
        mode: 'workflow',
        workflowContext: {
          workflow: {
            id: testWorkflowId,
            name: 'Test AI Chat Workflow',
            description: 'Test workflow',
            complexity: 'S',
          },
          stages: [],
          availableMiniPrompts: [],
        },
        sessionId: null, // New session
      };

      const mockRequest = new NextRequest('http://localhost:3000/api/ai-assistant/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      // Mock auth session
      const mockAuth = jest.fn().mockResolvedValue({
        user: {
          id: testUserId,
          email: 'ai-chat-test@test.com',
        },
      });

      // Replace auth temporarily
      const originalAuth = require('../../src/lib/auth/auth').auth;
      require('../../src/lib/auth/auth').auth = mockAuth;

      try {
        // Execute request
        const response = await POST(mockRequest);

        expect(response).toBeDefined();
        expect(response.status).toBe(200);

        // Parse response
        const responseData = await response.json();

        console.log('   Response:', JSON.stringify(responseData, null, 2));

        expect(responseData.sessionId).toBeDefined();
        expect(responseData.message).toBeDefined();
        expect(responseData.message.role).toBe('assistant');
        expect(responseData.message.content).toBeDefined();
        expect(responseData.tokenUsage).toBeDefined();
        expect(responseData.tokenUsage.total).toBeGreaterThan(0);

        testChatSessionId = responseData.sessionId;

        // Verify session was created
        const session = await prisma.aIChatSession.findUnique({
          where: { id: responseData.sessionId },
          include: { messages: true },
        });

        expect(session).toBeDefined();
        expect(session?.userId).toBe(testUserId);
        expect(session?.mode).toBe('workflow');
        expect(session?.totalTokens).toBe(responseData.tokenUsage.total);
        expect(session?.messages).toHaveLength(2); // User + assistant

        // Verify messages
        const userMessage = session?.messages.find((m) => m.role === 'USER');
        const assistantMessage = session?.messages.find((m) => m.role === 'ASSISTANT');

        expect(userMessage?.content).toBe('What is 2 + 2?');
        expect(assistantMessage?.content).toBeDefined();
        expect(assistantMessage?.content.toLowerCase()).toContain('4');

        console.log('✅ Complete chat flow test passed!');
      } finally {
        // Restore auth
        require('../../src/lib/auth/auth').auth = originalAuth;
      }
    }, TEST_TIMEOUT);

    test('should handle follow-up message in existing session', async () => {
      if (!OPENAI_API_KEY || !testChatSessionId) {
        console.log('⏭️  Skipping - requires previous test to pass');
        return;
      }

      console.log('🤖 Testing follow-up message...');

      // Import the chat route handler
      const { POST } = await import('../../src/app/api/ai-assistant/chat/route');

      // Create mock request for follow-up
      const requestBody = {
        message: 'What about 3 + 3?',
        mode: 'workflow',
        sessionId: testChatSessionId,
      };

      const mockRequest = new NextRequest('http://localhost:3000/api/ai-assistant/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      // Mock auth session
      const mockAuth = jest.fn().mockResolvedValue({
        user: {
          id: testUserId,
          email: 'ai-chat-test@test.com',
        },
      });

      // Replace auth temporarily
      const originalAuth = require('../../src/lib/auth/auth').auth;
      require('../../src/lib/auth/auth').auth = mockAuth;

      try {
        // Execute request
        const response = await POST(mockRequest);

        expect(response.status).toBe(200);

        const responseData = await response.json();

        expect(responseData.sessionId).toBe(testChatSessionId);
        expect(responseData.message.content).toBeDefined();

        // Verify session now has 4 messages (2 from first, 2 from second)
        const session = await prisma.aIChatSession.findUnique({
          where: { id: testChatSessionId },
          include: { messages: { orderBy: { createdAt: 'asc' } } },
        });

        expect(session?.messages).toHaveLength(4);
        expect(session?.messages[2].content).toBe('What about 3 + 3?');
        expect(session?.messages[3].content.toLowerCase()).toContain('6');

        console.log('✅ Follow-up message test passed!');
      } finally {
        // Restore auth
        require('../../src/lib/auth/auth').auth = originalAuth;

        // Cleanup
        if (testChatSessionId) {
          await prisma.chatMessage.deleteMany({ where: { chatId: testChatSessionId } });
          await prisma.aIChatSession.delete({ where: { id: testChatSessionId } });
        }
      }
    }, TEST_TIMEOUT);

    test('should return 400 when OpenAI key is missing', async () => {
      console.log('🔒 Testing missing API key handling...');

      // Create user without OpenAI key
      const userWithoutKey = await prisma.user.create({
        data: {
          email: 'no-key-test@test.com',
          username: 'no-key-test-user',
          passwordHash: 'test-hash-value',
          openaiApiKey: null,
        },
      });

      const { POST } = await import('../../src/app/api/ai-assistant/chat/route');

      const requestBody = {
        message: 'Test message',
        mode: 'workflow',
      };

      const mockRequest = new NextRequest('http://localhost:3000/api/ai-assistant/chat', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      // Mock auth with user without key
      const mockAuth = jest.fn().mockResolvedValue({
        user: {
          id: userWithoutKey.id,
          email: userWithoutKey.email,
        },
      });

      const originalAuth = require('../../src/lib/auth/auth').auth;
      require('../../src/lib/auth/auth').auth = mockAuth;

      try {
        const response = await POST(mockRequest);

        expect(response.status).toBe(400);

        const responseData = await response.json();
        expect(responseData.error).toContain('OpenAI API key');

        console.log('✅ Missing API key test passed!');
      } finally {
        require('../../src/lib/auth/auth').auth = originalAuth;
        await prisma.user.delete({ where: { id: userWithoutKey.id } });
      }
    }, TEST_TIMEOUT);
  });
});
