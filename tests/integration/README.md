# Integration Tests

This directory contains integration tests for the Agents Playbook AI assistant pipeline.

## AI Chat Pipeline Integration Tests

The `ai-chat-pipeline.test.ts` file contains comprehensive integration tests for the complete AI chat flow, including:

### Test Coverage

1. **MessagePersistenceService Tests**
   - Message saving and session stats updates
   - Message history retrieval
   - Auto-reset threshold checking

2. **AutoResetManager Tests**
   - Session archival and reset
   - Summary generation with OpenAI
   - New session creation with context

3. **End-to-End Chat Flow Tests** (with Real OpenAI API)
   - Complete chat request with OpenAI
   - Follow-up messages in existing sessions
   - Error handling for missing API keys

### Prerequisites

1. **Database Connection**
   - Ensure PostgreSQL is running
   - Database URL configured in `.env.local`

2. **OpenAI API Key**
   - Set `OPENAI_API_KEY` in `.env.local` or environment
   - Tests will skip OpenAI calls if key is not present

3. **Test Database** (Recommended)
   - Use a separate test database to avoid polluting production data
   - Update `DATABASE_URL` in `.env.test` if using separate test DB

### Running the Tests

```bash
# Run all integration tests
npm run test:integration

# Run specific test file
npm run test:integration -- ai-chat-pipeline

# Run with verbose output
VERBOSE=1 npm run test:integration

# Run with OpenAI API key
OPENAI_API_KEY=sk-... npm run test:integration
```

### Environment Variables

```bash
# .env.local or .env.test
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
OPENAI_API_KEY="sk-..."
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="http://localhost:3012"
```

### Test Structure

Each test follows this pattern:

1. **Setup (beforeAll)**
   - Create test user with OpenAI key
   - Create test workflow
   - Initialize database connections

2. **Test Execution**
   - Run individual test cases
   - Verify expected behavior
   - Check database state

3. **Cleanup (afterAll)**
   - Delete test chat sessions and messages
   - Optionally delete test user and workflow
   - Disconnect from database

### Important Notes

**Real OpenAI API Calls:**
- Tests with "with Real OpenAI API" in the name make actual API calls
- These tests consume OpenAI credits
- Skip them by not setting `OPENAI_API_KEY`

**Test Isolation:**
- Each test creates its own sessions and messages
- Cleanup happens in `afterAll` and individual test cleanup
- Test user persists across runs to avoid repeated creation

**Timeouts:**
- Default timeout: 60 seconds (for OpenAI API calls)
- Can be increased if needed in slow networks

### Troubleshooting

**Tests fail with "Connection refused":**
- Ensure PostgreSQL is running
- Check `DATABASE_URL` in environment

**Tests skip with "OPENAI_API_KEY not set":**
- Set `OPENAI_API_KEY` environment variable
- Tests will skip OpenAI-dependent tests gracefully

**Tests fail with "User already exists":**
- Normal behavior - test user persists across runs
- User is upserted (updated if exists, created if not)

**Database cleanup issues:**
- Run `npx prisma migrate reset` to reset test database
- Be careful not to run on production database!

### Example Output

```
🧪 Setting up AI Chat Pipeline integration tests...
✅ Test setup complete
   User ID: clxxx...
   Workflow ID: test-ai-chat-workflow

 PASS  tests/integration/ai-chat-pipeline.test.ts (45.231 s)
  AI Chat Pipeline Integration Tests
    MessagePersistenceService
      ✓ should save messages and update session stats (142 ms)
      ✓ should retrieve message history (89 ms)
      ✓ should check auto-reset threshold (56 ms)
    AutoResetManager
      ✓ should trigger auto-reset and create new session (3214 ms)
    End-to-End Chat Flow (with Real OpenAI API)
      🤖 Testing complete chat flow with real OpenAI API...
      ✓ should handle complete chat request with OpenAI (5892 ms)
      🤖 Testing follow-up message...
      ✓ should handle follow-up message in existing session (4123 ms)
      🔒 Testing missing API key handling...
      ✓ should return 400 when OpenAI key is missing (34 ms)

🧹 Cleaning up test data...
✅ Cleanup complete

Test Suites: 1 passed, 1 total
Tests:       7 passed, 7 total
Snapshots:   0 total
Time:        45.231 s
```

### Adding New Tests

When adding new integration tests:

1. Follow the existing test structure
2. Use descriptive test names
3. Clean up test data in `afterAll` or individual tests
4. Add appropriate timeouts for async operations
5. Handle missing API keys gracefully with skip logic
6. Document what the test is verifying

### CI/CD Integration

For CI/CD pipelines:

1. Set `OPENAI_API_KEY` as a secret
2. Configure test database connection
3. Run `npm run test:integration` in pipeline
4. Consider skipping OpenAI tests in PR checks (expensive)
5. Run full tests on main branch or nightly

### Related Documentation

- [AI Chat Architecture](../../.agents-playbook/ai-enhancements/design.md)
- [Implementation Plan](../../.agents-playbook/ai-enhancements/tasks.md)
- [Message Persistence Service](../../src/lib/ai-chat/message-persistence-service.ts)
- [Auto Reset Manager](../../src/lib/ai-chat/auto-reset-manager.ts)
