# CLAUDE.md

**Agents Playbook** — AI workflow orchestration platform with MCP server, semantic search, and team collaboration.

## Tech Stack
- **Core**: Next.js 15 (App Router), TypeScript, Tailwind CSS v4
- **Data**: Prisma, PostgreSQL (Neon), OpenAI Embeddings
- **Auth**: NextAuth v5 (Auth.js)

## Commands
```bash
npm run dev              # Dev server (port 3012)
npm run build            # Production build
npm run lint             # ESLint

# Database
npm run db:migrate:dev   # Run migrations
npm run db:push          # Push schema (dev only)
npm run db:seed:system   # Seed system workflows/prompts
npm run db:studio        # Prisma Studio
npm run db:generate      # Generate Prisma Client

# Testing
npm test                 # Jest tests
npm run test:e2e         # Playwright E2E
npm run build:embeddings # Generate OpenAI embeddings
```

## Architecture

### Feature-Sliced Design (FSD)
- `src/app` — Next.js routes only
- `src/views` — Page compositions
- `src/widgets` — Composite UI components
- `src/features` — Business logic (ai-assistant, ratings, etc.)
- `src/server` — Server-only (DB, Auth, MCP)
- `src/shared` — Reusable UI/utils (no upstream imports)

### Database-First
- All workflows/prompts in PostgreSQL, no runtime file system
- System content: `isSystemWorkflow: true`, owned by `system@agents-playbook.app`
- User content: soft-deleted via `isActive: false`
- Search: `WorkflowEmbedding` with OpenAI vectors

### MCP Server (`src/app/api/v1/mcp/`)
Tools: `get_available_workflows`, `select_workflow`, `get_next_step`, `get_prompts`
- Uses `src/server/mcp-tools-db` for DB queries
- `ExecutionPlanBuilder` injects auto-prompts (Memory Board, Internal Agents Chat)

## Key Patterns
- **Server Actions**: `"use server"`, Zod validation, return `{ success, data?, error? }`
- **API Routes**: Protected via `auth()` (NextAuth) or `authenticateRequest()` (MCP tokens)
- **DB Queries**: Use `withRetry` helper (`src/server/db/retry.ts`), filter `isActive: true`
- **Validation**: `WorkflowValidator` for complex workflow logic

## Key Files
- `src/server/workflows/unified-workflow-service.ts` — Central workflow query logic
- `src/server/mcp-tools-db/execution-plan-builder.ts` — Execution plan construction
- `src/server/workflows/db-semantic-search.ts` — Vector search
- `prisma/schema.prisma` — Database schema
- `src/server/auth/auth.ts` — Auth configuration

## Troubleshooting
- **"No workflows found"**: Run `npm run db:seed:system && npm run build:embeddings`
- **Database Errors**: Ensure `DATABASE_URL` ends with `?sslmode=require`
- **Detailed history**: `.agents-playbook/learnings.md`

## Startup Hub
**Project Slug:** `agents-playbook-Rjm09y`
