# Agent Learnings & Knowledge Base

## Architecture & Design Patterns

### Database-First Architecture
- **Source of Truth**: Everything is stored in PostgreSQL (Neon). No runtime file system access for content.
- **System Content**: Seeded via `npm run db:seed:system`. Marked as `isSystemWorkflow: true` or `isSystemMiniPrompt: true`.
- **Soft Deletes**: Use `isActive: false` instead of hard deletes for user content.
- **Migrations**: Use simple UPDATE queries for data fixes where possible (idempotent).

### Feature-Sliced Design (FSD)
- **Structure**: `app` (routes) → `views` (pages) → `widgets` (composite) → `features` (business logic) → `server`/`shared`.
- **Rule**: Lower layers (`shared`) cannot import from higher layers. `features` can only import from `shared`.

### MCP & AI Integration
- **Context Persistence**: Use file-based strategy (`working-context.md` for current state, `memory-board.md` for history) to recover from context window collapse.
- **Context Detection**:
  - **Gotcha**: Zod validation in API routes strips unknown fields. Ensure properties like `currentMiniPrompt` are explicitly defined in the schema.
  - **State**: Updates (e.g., `viewingMiniPromptId`) must be handled synchronously/atomically to avoid race conditions during AI context gathering.
- **MCP Tools**:
  - `get_prompts` must strictly filter visibility to avoid exposing private system prompts.
  - Automatic prompts (Memory Board, Internal Agents Chat) are injected dynamically by `ExecutionPlanBuilder` and not stored statically in workflow steps.

### Community Forum
- **Data Model**: Flat threading (no nested replies) simplifies queries and improves mobile UX.
- **Content**: Plain text with preserved newlines (no markdown) avoids XSS risks.
- **Sorting**: Composite index (`isPinned DESC`, `createdAt DESC`) ensures pinned topics appear first efficiently.
- **Integrity**: Unique constraint on `(messageId, userId)` prevents duplicate votes.

## Technical Gotchas & Fixes

### Workflow Builder & State
- **Drag & Drop**: We use `react-beautiful-dnd` because it supports multi-select (Cmd/Shift+Click), unlike `@dnd-kit` which is smaller but lacked this stability/feature.
- **Item Order Persistence (Prisma)**:
  - Prisma regenerates Stage IDs on save/update.
  - The `itemOrder` JSON field often holds IDs referring to *old* Stage IDs (e.g., `multi-agent-chat-{oldStageId}`).
  - **Fix**: Normalize IDs during load/save to replace old stage IDs with current ones to preserve order.
- **Auto-Prompts**: These are injected virtually. Filtering logic in the UI must account for dynamic IDs (e.g., `memory-board-{stageId}`) to prevent them from being re-appended incorrectly.

### Frontend Patterns
- **Optimistic UI**: Use for high-frequency actions (votes, visibility toggles) with revert-on-error strategies.
- **Visibility**: Toggle immediately via API; do not use confirmation dialogs for simple boolean states.

## Process & Planning

### Development Workflow
- **Vertical Slices**: Implement in order: Data → API → UI → Integration → Testing.
- **Task Breakdown**:
  - Break features into granular subtasks (Data Flow, Backend, Frontend).
  - Explicitly schedule **Test Tasks** after implementation steps.
  - Define "Definition of Done" and "Success Criteria" for clarity.
- **Requirements**:
  - Ask clarifying questions (one-liners) before starting design.
  - Use **TRD-driven approach** (Technical Requirements Document) for comprehensive feature planning (Analysis -> Architecture -> Implementation).
  - Explicitly document "Out of Scope" items.

### Writing Style (Content Generation)
- **Tone**: Technical but relatable. Mix high/low register for authenticity.
- **Structure**: Use single-sentence paragraphs for rhythm and emphasis.

## Model Tags Feature (2025-11-30)

### FSD Architecture Enforcement
- **Gotcha**: Don't put data fetching hooks inside `shared/ui` components. They must be pure UI.
- **Fix**: Create `entities/[entity]` layer with `api/`, `model/`, `lib/` folders. Import hooks from entities in views/widgets.
- **Pattern**: `entities/models/api/index.ts` (fetchModels), `entities/models/lib/useModels.ts` (hook), `entities/models/index.ts` (public exports).

### Jest Testing Gotchas
- **NextResponse.json()**: API route tests fail with `Response.json is not a function`.
  - **Fix**: Mock NextResponse at top of test file:
    ```typescript
    jest.mock('next/server', () => ({
      NextResponse: { json: jest.fn((data, init) => ({ ...init, json: () => data })) }
    }));
    ```
- **jest-dom matchers**: `toBeInTheDocument()` not found.
  - **Fix**: Add `import '@testing-library/jest-dom'` at top of `.tsx` test files.
- **mockResolvedValue type errors**: `Argument of type 'undefined' is not assignable to parameter of type 'never'`.
  - **Fix**: Use `jest.fn(() => Promise.resolve())` instead of typed generics with `mockResolvedValue(undefined)`.
- **fetch mock typing**: `jest.fn<typeof fetch>()` causes overload errors.
  - **Fix**: Use loose mock: `const mockFetch = jest.fn(); global.fetch = mockFetch as typeof fetch;`

### Component Props Patterns
- **Card Components**: Discovery card components use specific prop names (`workflow`, `miniPrompt`) not generic `data`.
  - **Gotcha**: Data shape must match interface exactly (`user.username` not `authorUsername`, `stagesCount` not `_count.stages`).
- **Modal Components**: Check component interface before using props like `title`, `size`.
  - **Fix**: Use `className="max-w-4xl"` instead of `size="xl"`. Add header manually if needed.
- **Button Variants**: Only use defined variants (`primary`, `secondary`, `ghost`, `danger`). No `outline`.

### Prisma Schema Patterns
- **Junction Tables**: Follow existing pattern (e.g., `WorkflowTag`) for many-to-many with `@@id([workflowId, tagId])`.
- **Enums**: Define before models that use them. Use SCREAMING_CASE values (`LLM`, `IMAGE`).
- **Seeding**: Add to existing `prisma/seed.ts` with `upsert` for idempotency.
