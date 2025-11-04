# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

**Agents Playbook** is a production-ready AI workflow orchestration platform that provides database-driven workflows, modular mini-prompts, AI-powered semantic search, and an MCP (Model Context Protocol) server for AI agents.

**Tech Stack:**
- Next.js 15 (App Router)
- TypeScript
- Prisma + PostgreSQL (Neon)
- NextAuth v5 (Auth.js)
- Tailwind CSS v4 (colors via `@theme` in CSS, not config file)
- OpenAI (semantic search embeddings)

## Essential Commands

### Development
```bash
npm run dev              # Start dev server on port 3012
npm run build            # Production build
npm run start            # Start production server
npm run lint             # Run ESLint
```

### Database Operations
```bash
npm run db:migrate:dev   # Run migrations in development
npm run db:push          # Push schema changes (development)
npm run db:seed          # Seed database with test data
npm run db:seed:system   # Seed system workflows/mini-prompts
npm run db:studio        # Open Prisma Studio
npm run db:generate      # Generate Prisma Client
```

### Testing
```bash
npm test                 # Run all Jest tests
npm run test:watch       # Run tests in watch mode
npm run test:integration # Run integration tests only
npm run test:e2e         # Run Playwright E2E tests
npm run test:e2e:ui      # Run E2E tests in UI mode
npm run test:e2e:debug   # Debug E2E tests
```

### Embeddings & Search
```bash
npm run build:embeddings # Generate OpenAI embeddings for semantic search
```

## Architecture Overview

### Database-First Architecture

**Everything is stored in PostgreSQL** - there is no runtime file system access. The platform operates on a pure database architecture:

**System Workflows & Mini-Prompts:**
- Pre-built workflows and prompts provided by the platform
- Marked with `isSystemWorkflow: true` (workflows) or `isSystemMiniPrompt: true` (mini-prompts)
- Owned by system user (`system@agents-playbook.app`)
- Available to all users (public)
- Seeded once during setup via `npm run db:seed:system`

**User Workflows & Mini-Prompts:**
- Created by users through the visual workflow constructor UI
- Marked with `isSystemWorkflow: false` (workflows) or `isSystemMiniPrompt: false` (mini-prompts)
- Privacy controls: PUBLIC (discoverable by all) or PRIVATE (user-only)
- Shareable via time-limited token links
- Only visible when user is authenticated

### Workflow Data Model

Database structure (`prisma/schema.prisma`):
```
Workflow (metadata: name, description, complexity, visibility)
  ├─ WorkflowStage[] (phases: Analysis, Design, Implementation, etc.)
  │   └─ StageMiniPrompt[] (junction table with order)
  │       └─ MiniPrompt (reusable prompt content)
  ├─ WorkflowEmbedding (OpenAI vector for semantic search)
  └─ WorkflowTag[] (categorization)
```

**Key Relationships:**
- Each workflow has multiple stages (ordered)
- Each stage links to multiple mini-prompts (ordered via junction table)
- Mini-prompts are reusable across workflows
- Embeddings enable AI-powered semantic search

**Automatic Mini-Prompts:**
- Workflows have `includeMultiAgentChat` boolean flag (default: false)
- Stages have `withReview` boolean flag (default: true)
- Two system mini-prompts auto-injected into execution plans:
  - **Memory Board** (📋): Injected at end of each stage when `withReview: true`
  - **Internal Agents Chat** (🤖): Injected after each mini-prompt when `includeMultiAgentChat: true`
- Auto-prompts are visible in workflow constructor but non-draggable
- Managed via admin panel at `/dashboard/admin/system-prompts`
- Execution plans built dynamically by `ExecutionPlanBuilder` service

### Unified Workflow Service

The `UnifiedWorkflowService` (`src/lib/workflows/unified-workflow-service.ts`) provides single database query interface:
- **No auth**: Returns workflows where `isSystemWorkflow: true` AND `isActive: true`
- **With auth**: Returns system workflows + user's workflows where `userId: {userId}` AND `isActive: true`
- All queries filtered by `isActive` flag for soft deletion support

### MCP Server Integration

Primary MCP endpoint: `src/app/api/v1/mcp/route.ts`

**Available Tools:**
1. `get_available_workflows` - AI semantic search for workflows
2. `select_workflow` - Get complete workflow with execution plan
3. `get_next_step` - Step-by-step navigation with validation
4. `get_prompts` - Get mini-prompts library
5. `get_selected_prompt` - Get specific mini-prompt details

**All tools query the database** via `mcp-tools-db/`:
- No file system access at runtime
- Semantic search via OpenAI embeddings stored in DB
- Returns system workflows for unauthenticated requests
- Returns system + user workflows for authenticated requests

### Database Schema

Key models (see `prisma/schema.prisma`):

**User Management:**
- `User` - User accounts with tier (FREE/PREMIUM) and role (USER/ADMIN)
- `ApiToken` - API tokens for MCP authentication

**Content:**
- `Workflow` - Custom workflows with YAML content
- `WorkflowStage` - Stages within workflows
- `MiniPrompt` - Reusable mini-prompt templates
- `StageMiniPrompt` - Junction table linking stages to mini-prompts

**Discovery:**
- `Tag` - Categorization tags
- `Rating` - User ratings for workflows/mini-prompts
- `UsageStats` - Usage tracking
- `SharedLink` - Shareable links with expiration

**Embeddings:**
- `WorkflowEmbedding` - OpenAI embeddings for semantic search
- `MiniPromptEmbedding` - Mini-prompt embeddings

### Authentication & Authorization

**NextAuth v5** (`src/lib/auth/`):
- JWT-based sessions
- Credentials provider (email/password with bcrypt)
- API token authentication for MCP
- Edge-safe middleware configuration

**Route Protection** (`src/middleware.ts`):
- Protected: `/dashboard/*` (except `/dashboard/discover`)
- Protected: `/api/v1/*` (except `/api/v1/public/*`)
- Unauthenticated users redirected to login

**API Authentication:**
- Session-based: `auth()` from NextAuth
- Token-based: `authenticateRequest()` for MCP endpoints
- Admin-only routes check `user.role === "ADMIN"`

### Frontend Architecture

**Component Organization:**
- `src/shared/ui/atoms/` - Base components (Button, Input, Card, Modal)
- `src/shared/ui/molecules/` - Composed components (SearchBar, Pagination)
- `src/shared/ui/organisms/` - Complex components (DashboardHeader, DiscoveryGrid)
- `src/shared/ui/landing/` - Landing page sections
- `src/features/*/components/` - Feature-specific components

**Key Features:**
- `features/workflow-constructor/` - Visual workflow builder with drag-and-drop (@dnd-kit)
- `features/api-tokens/` - API token management
- `features/sharing/` - Workflow/mini-prompt sharing
- `features/ratings/` - Rating system
- `features/dashboard/` - Dashboard stats and actions

### Semantic Search System

**Embedding Generation** (`scripts/build-embeddings.ts`):
- Generates OpenAI embeddings for workflows/mini-prompts
- Stores in database for fast similarity search
- Run after adding/modifying content: `npm run build:embeddings`

**Search Implementation** (`src/lib/workflows/db-semantic-search.ts`):
- Cosine similarity matching
- Quality indicators: 🎯 High (80%+), ✅ Good (60-79%), etc.
- Fallback to text search if embeddings unavailable

## Development Guidelines

### Tailwind CSS v4 Usage

**IMPORTANT:**
- Colors defined via `@theme` in `src/app/globals.css`
- DO NOT modify `tailwind.config.ts` for theme changes
- Use semantic utility classes: `bg-white`, `text-gray-900`, `shadow-base`
- Extract reusable components but keep Tailwind classes

### Adding New Workflows

**All workflows are created through the web UI:**
1. Navigate to `/dashboard/library/workflows/new`
2. Enter workflow metadata (name, description, complexity)
3. Configure automatic mini-prompts (optional):
   - Toggle "Include Multi-Agent Chat" to add coordination prompts after each mini-prompt
   - Each stage has "With Review" checkbox (on by default) to add Memory Board at stage end
4. Create stages (e.g., "Analysis", "Implementation")
5. Drag mini-prompts from library into stages
6. Set visibility (PUBLIC/PRIVATE) and tags
7. Save - embeddings are auto-generated

**Auto-prompt visualization:**
- Memory Board cards (📋) appear at stage end when "With Review" enabled
- Multi-Agent Chat cards (🤖) appear after each mini-prompt when enabled
- Auto-prompts shown with dashed borders, lock icon, and special badges
- Non-draggable and non-removable (automatically managed)

**For system workflows (admins only):**
- Mark `isSystemWorkflow: true` in database
- These appear for all users automatically
- Cannot be edited by regular users

### Adding Mini-Prompts

**All mini-prompts are created through the web UI:**
1. Navigate to `/dashboard/library` (create via mini-prompts section)
2. Enter name, description, and markdown content
3. Set visibility (PUBLIC/PRIVATE)
4. Add tags for categorization
5. Save - embeddings are auto-generated

**For system mini-prompts (admins only):**
- Mark `isSystemMiniPrompt: true` in database
- These appear in everyone's library
- Cannot be edited by regular users

### Managing Automatic System Prompts (Admins Only)

**Admin Panel:** `/dashboard/admin/system-prompts`

The platform includes two special automatic system mini-prompts:
1. **Handoff Memory Board** - Added at end of stages when `withReview: true`
2. **Internal Agents Chat** - Added after each mini-prompt when `includeMultiAgentChat: true`

**Editing automatic prompts:**
- Navigate to admin panel at `/dashboard/admin/system-prompts`
- Automatic prompts displayed first with special styling (🔧 icon)
- Click "Edit Content" to modify prompt markdown
- Changes affect all workflows using these prompts
- Content updates are immediate (no migration needed)

**Important notes:**
- Only admins can edit automatic prompts
- Changes impact ALL workflows that use these prompts
- Consider running `npm run build:embeddings` after updates for semantic search
- Automatic prompts cannot be deleted or deactivated

### Testing Guidelines

**Integration Tests** (`tests/integration/`):
- Test MCP tools with database queries
- Mock Prisma with `jest-mock-extended`
- 70+ tests covering all MCP operations

**E2E Tests** (`e2e/`):
- Playwright tests for user flows
- Page Object Pattern
- Test against seeded database
- Run with: `npm run test:e2e`

### Database Migrations

**Creating Migrations:**
```bash
npm run db:migrate:create  # Interactive migration creation
npm run db:migrate:dev     # Apply migrations + regenerate client
```

**Important:**
- Always use pooled connection for app (`DATABASE_URL`)
- Use direct connection for migrations (`DIRECT_URL`)
- Neon PostgreSQL requires SSL: `?sslmode=require`

### Environment Variables

Required in `.env.local`:
```bash
# Database (Neon PostgreSQL)
DATABASE_URL=postgresql://...         # Pooled connection
DIRECT_URL=postgresql://...           # Direct connection for migrations

# OpenAI (for semantic search)
OPENAI_API_KEY=sk-...

# NextAuth
NEXTAUTH_SECRET=...                   # Generate with: openssl rand -base64 32
NEXTAUTH_URL=http://localhost:3012    # Your app URL
```

### MCP Server Testing

**Local Development:**
```bash
# Start dev server
npm run dev

# Test with MCP Inspector
DANGEROUSLY_OMIT_AUTH=true npx @modelcontextprotocol/inspector@latest http://localhost:3012/api/v1/mcp
```

**Production Testing:**
```bash
DANGEROUSLY_OMIT_AUTH=true npx @modelcontextprotocol/inspector@latest https://agents-playbook.com/api/v1/mcp
```

## Common Patterns

### Server Actions

Server actions in `src/features/*/actions/`:
- Use `"use server"` directive
- Validate with Zod schemas
- Return `{ success: boolean, data?, error? }`
- Handle Prisma errors gracefully

### API Routes

API routes in `src/app/api/`:
- Use `auth()` for session checks
- Validate request bodies with Zod
- Return consistent JSON responses
- Handle errors with proper status codes

### Database Queries

**With Retry Logic** (`src/lib/db/retry.ts`):
```typescript
import { withRetry } from '@/lib/db/retry';

const result = await withRetry(() =>
  prisma.workflow.findMany({...})
);
```

**Query Patterns:**
- Include relations selectively (avoid N+1 queries)
- Use indexes for frequent queries (see schema)
- Filter by `isActive: true` for user-facing queries
- Check `isSystemWorkflow` for system vs. user content

### Workflow Validation

Use `WorkflowValidator` for:
- Checking MCP prerequisites
- Validating context requirements
- Planning execution (which steps will run)
- Smart step skipping

## Deployment

**Vercel Deployment:**
- Auto-deploys from main branch
- Set environment variables in dashboard
- Uses standalone output mode
- Prisma client auto-generated on build

**Database Setup:**
- Neon PostgreSQL (serverless)
- Connection pooling via PgBouncer
- Row-level security enabled
- Automatic backups

## Troubleshooting

**"No workflows found":**
- Run `npm run db:seed:system` to populate system workflows
- Run `npm run build:embeddings` to generate search embeddings
- Check database has workflows: `npm run db:studio`
- Verify OPENAI_API_KEY is set for semantic search

**Database connection errors:**
- Check DATABASE_URL includes `?sslmode=require`
- Use DIRECT_URL for migrations
- Verify Prisma client generated: `npm run db:generate`

**MCP server not responding:**
- Ensure dev server running on port 3012
- Check CORS headers in `next.config.ts`
- Verify `@vercel/mcp-adapter` installed

**Build failures:**
- Clear `.next` folder: `rm -rf .next`
- Regenerate Prisma client: `npm run db:generate`
- Check for TypeScript errors: `npm run lint`

## Key Files Reference

**Core Services:**
- `src/lib/workflows/unified-workflow-service.ts` - Database workflow queries
- `src/lib/workflows/db-semantic-search.ts` - Semantic search with OpenAI embeddings
- `src/lib/embeddings/user-workflow-embeddings.ts` - Embedding generation

**MCP Implementation:**
- `src/app/api/v1/mcp/route.ts` - MCP server endpoint
- `src/lib/mcp-tools-db/` - Database-backed MCP tools
- `src/lib/mcp-tools-db/execution-plan-builder.ts` - Builds execution plans with auto-prompts
- `src/lib/mcp-tools-db/select-workflow.ts` - Returns workflow with execution plan
- `src/lib/mcp-tools-db/get-next-step.ts` - Returns step content from execution plan

**Automatic Mini-Prompts:**
- `src/features/workflow-constructor/components/AutoPromptCard.tsx` - Visual representation
- `src/app/dashboard/admin/system-prompts/` - Admin panel for managing prompts
- `src/app/api/admin/system-prompts/` - API endpoints for prompt management
- `public/playbook/mini-prompts/automatic/` - Automatic prompt content files
- `scripts/seed-automatic-prompts.ts` - Seed script for automatic prompts

**Authentication:**
- `src/lib/auth/auth.ts` - NextAuth configuration
- `src/lib/auth/token-auth.ts` - API token authentication
- `src/middleware.ts` - Route protection

**Database:**
- `prisma/schema.prisma` - Database schema
- `src/lib/db/client.ts` - Prisma client singleton
- `scripts/seed-system-content.ts` - Import system workflows/mini-prompts (for initial setup)
- `scripts/build-embeddings.ts` - Generate OpenAI embeddings for search
