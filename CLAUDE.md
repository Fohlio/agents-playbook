# CLAUDE.md

**Agents Playbook** is an AI workflow orchestration platform with database-driven workflows, semantic search, and an MCP server.

## Tech Stack
- **Core**: Next.js 15 (App Router), TypeScript, Tailwind CSS v4.
- **Data**: Prisma, PostgreSQL (Neon), OpenAI Embeddings.
- **Auth**: NextAuth v5 (Auth.js).

## Essential Commands
```bash
npm run dev              # Start dev server (port 3012)
npm run build            # Production build
npm run start            # Start production server
npm run lint             # Run ESLint

# Database
npm run db:migrate:dev   # Run migrations
npm run db:push          # Push schema (dev only)
npm run db:seed:system   # Seed system workflows/prompts
npm run db:studio        # Open Prisma Studio
npm run db:generate      # Generate Prisma Client

# Testing
npm test                 # Run all Jest tests
npm run test:e2e         # Run Playwright E2E tests
npm run build:embeddings # Generate OpenAI embeddings
```

## Architecture Overview

### Feature-Sliced Design (FSD)
The codebase follows strict layering:
- `src/app`: Next.js routes only.
- `src/views`: Page compositions ("pages" layer).
- `src/widgets`: Composite UI components.
- `src/features`: Business logic (e.g., `ai-assistant`, `ratings`).
- `src/server`: Server-only logic (DB, Auth, MCP).
- `src/shared`: Reusable UI/utils. No upstream imports.

### Database-First Architecture
- **Content**: All workflows and prompts are stored in PostgreSQL. No runtime file system.
- **System Content**: Seeded content is owned by `system@agents-playbook.app` (`isSystemWorkflow: true`).
- **User Content**: Created via UI. Soft-deleted via `isActive: false`.
- **Search**: Uses `WorkflowEmbedding` (OpenAI vectors) for semantic search.

### MCP Server (`src/app/api/v1/mcp/`)
Exposes tools for AI agents to query workflows:
- `get_available_workflows`, `select_workflow`, `get_next_step`, `get_prompts`.
- Uses `src/server/mcp-tools-db` to query DB.
- **Execution Plans**: Built dynamically by `ExecutionPlanBuilder`, injecting auto-prompts (Memory Board, Internal Agents Chat).

## Common Patterns

### API & Actions
- **Server Actions**: Use `"use server"`, validate input with Zod, return `{ success: boolean, data?, error? }`.
- **API Routes**: Protected via `auth()` (NextAuth) or `authenticateRequest()` (MCP tokens).
- **Validation**: Use `WorkflowValidator` for complex workflow logic.

### Database
- **Queries**: Use `withRetry` helper for resilience (`src/server/db/retry.ts`).
- **Optimization**: Select only needed relations to avoid N+1.
- **Filtering**: Always filter by `isActive: true` for user-facing queries.

## Development Guidelines

- **Tailwind**: Colors defined via `@theme` in `globals.css`. Do not edit `tailwind.config.ts` for theme.
- **Workflows**: Created in UI (`/dashboard/library`). System workflows managed via DB flags.
- **Automatic Prompts**: Managed in Admin Panel (`/dashboard/admin/system-prompts`).
- **Testing**:
  - Integration: Mock Prisma with `jest-mock-extended`.
  - E2E: Use Page Object Pattern in `tests/e2e/`.

## Key Files Reference
- `src/server/workflows/unified-workflow-service.ts`: Central workflow query logic.
- `src/server/mcp-tools-db/execution-plan-builder.ts`: Logic for constructing execution plans.
- `src/server/workflows/db-semantic-search.ts`: Vector search implementation.
- `prisma/schema.prisma`: Database schema.
- `src/server/auth/auth.ts`: Auth configuration.

## Troubleshooting
- **"No workflows found"**: Run `npm run db:seed:system` and `npm run build:embeddings`.
- **Database Errors**: Ensure `DATABASE_URL` ends with `?sslmode=require`.
- **See `.agents-playbook/learnings.md`** for detailed architectural insights, gotchas, and debugging history.

## Active Task

**Task:** model-tags-filters-landing ✅ COMPLETE
**Updated:** 2025-11-30
**Phase:** All 12 Steps Complete

→ **Context:** `.agents-playbook/model-tags-filters-landing/memory-board.md`
