# Development Setup Guide

Complete guide for setting up and running the Agents Playbook development environment.

---

## Prerequisites

Before you begin, ensure you have:

- **Node.js** 18.0.0 or higher
- **npm** 8.0.0 or higher
- **PostgreSQL** database access (Neon recommended)
- **OpenAI API Key** (for semantic search)
- **Git** for version control

---

## Initial Setup

### 1. Clone Repository

```bash
git clone https://github.com/anthropics/agents-playbook
cd agents-playbook
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create `.env.local` file in the project root:

```env
# Database (Neon PostgreSQL)
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
DIRECT_URL=postgresql://user:password@host/database

# OpenAI (for semantic search)
OPENAI_API_KEY=sk-...

# NextAuth Configuration
NEXTAUTH_SECRET=your-secret-here  # Generate: openssl rand -base64 32
NEXTAUTH_URL=http://localhost:3012

# Optional: Development Settings
NODE_ENV=development
```

**Important Notes:**
- `DATABASE_URL` should be pooled connection (ends with `?sslmode=require`)
- `DIRECT_URL` should be direct connection for migrations
- Generate `NEXTAUTH_SECRET` using: `openssl rand -base64 32`

### 4. Database Setup

Run migrations to set up the database schema:

```bash
npm run db:migrate:dev
```

Seed system workflows and mini-prompts:

```bash
npm run db:seed:system
```

Generate embeddings for semantic search:

```bash
npm run build:embeddings
```

---

## Development Commands

### Running the Development Server

```bash
npm run dev
```

Server will be available at:
- Web UI: http://localhost:3012
- MCP Endpoint: http://localhost:3012/api/v1/mcp

### Building for Production

```bash
npm run build
```

### Linting and Code Quality

```bash
# Run ESLint
npm run lint

# Run TypeScript type checking
npm run type-check
```

### Testing

```bash
# Run all tests
npm test

# Run integration tests
npm run test:integration

# Run E2E tests
npm run test:e2e

# Run E2E tests in UI mode
npm run test:e2e:ui
```

### Database Management

```bash
# Open Prisma Studio (database GUI)
npm run db:studio

# Generate Prisma Client
npm run db:generate

# Push schema changes (dev only)
npm run db:push

# Create a new migration
npm run db:migrate:dev

# Seed database
npm run db:seed:system

# Build embeddings
npm run build:embeddings
```

---

## Project Structure

```
agents-playbook/
├── prisma/
│   ├── schema.prisma              # Database schema
│   ├── migrations/                # Database migrations
│   └── seed.ts                    # Database seeding
├── src/
│   ├── app/                       # Next.js 15 app router
│   │   ├── [locale]/              # Internationalized routes
│   │   └── api/                   # API routes
│   ├── features/                  # Feature-specific components
│   │   ├── workflow-constructor/  # Drag-and-drop workflow builder
│   │   ├── api-tokens/            # API token management
│   │   └── sharing/               # Workflow sharing
│   ├── server/                    # Server-side services
│   │   ├── mcp-tools-db/          # MCP tool handlers
│   │   ├── workflows/             # Workflow services
│   │   └── ai-chat/               # AI chat pipeline
│   ├── shared/                    # Shared components and utilities
│   │   ├── ui/                    # UI components
│   │   └── lib/                   # Utility functions
│   └── views/                     # Page-level components
├── docs/                          # Documentation (you are here)
├── scripts/                       # Build and utility scripts
└── tests/                         # Test files
```

---

## Troubleshooting

### No Workflows Found

**Problem:** Dashboard shows "No workflows found"

**Solution:**
```bash
npm run db:seed:system && npm run build:embeddings
```

### Database Connection Errors

**Problem:** "Connection refused" or "SSL required" errors

**Solutions:**
1. Verify `DATABASE_URL` includes `?sslmode=require`
2. Check database is running and accessible
3. Regenerate Prisma Client: `npm run db:generate`

### Build Failures

**Problem:** Build fails with TypeScript or module errors

**Solutions:**
1. Clear Next.js cache: `rm -rf .next`
2. Regenerate Prisma client: `npm run db:generate`
3. Check TypeScript: `npm run lint`
4. Delete and reinstall node_modules: `rm -rf node_modules && npm install`

### MCP Server Not Responding

**Problem:** MCP tools not working or returning errors

**Solutions:**
1. Ensure dev server is running: `npm run dev`
2. Check endpoint accessibility: http://localhost:3012/api/v1/mcp
3. Verify API token in request headers
4. Check logs for authentication errors

### OpenAI API Errors

**Problem:** Semantic search not working or OpenAI errors

**Solutions:**
1. Verify `OPENAI_API_KEY` is set in `.env.local`
2. Check API key has sufficient credits
3. Regenerate embeddings: `npm run build:embeddings`

---

## Development Workflow

### Feature Development

1. Create feature branch: `git checkout -b feature/your-feature-name`
2. Make changes following FSD architecture
3. Run tests: `npm test`
4. Commit changes: `git commit -m "Add feature description"`
5. Push to remote: `git push origin feature/your-feature-name`

### Database Schema Changes

1. Update `prisma/schema.prisma`
2. Create migration: `npm run db:migrate:dev`
3. Update seed data if needed: `prisma/seed.ts`
4. Test migration on clean database
5. Commit migration files

### Testing Strategy

1. Write unit tests for business logic
2. Write integration tests for API routes
3. Write E2E tests for critical user flows
4. Run all tests before pushing: `npm test && npm run test:integration`

---

## Code Style and Conventions

### TypeScript

- Use TypeScript for all new code
- Define interfaces for data structures
- Avoid `any` type - use `unknown` if needed

### React Components

- Use functional components with hooks
- Follow naming convention: `PascalCase` for components
- Use `kebab-case` for file names

### API Routes

- Use server actions with `"use server"` directive
- Validate input with Zod schemas
- Return structured responses: `{ success, data?, error? }`

### Database

- Use Prisma for all database operations
- Implement soft deletes with `isActive` and `deletedAt`
- Add indexes for frequently queried fields

---

## Environment-Specific Configuration

### Development

- Hot reload enabled
- Detailed error messages
- Source maps available
- Database: development database

### Testing

Create `.env.test`:
```env
DATABASE_URL=postgresql://test-db-url
OPENAI_API_KEY=sk-test-key
NEXTAUTH_SECRET=test-secret
```

### Production

- Optimized builds
- Error tracking enabled
- Database: production with connection pooling
- CDN for static assets

---

## Additional Resources

- [CLAUDE.md](../../CLAUDE.md) - Quick reference commands
- [README.md](../../README.md) - Project overview
- [MCP System Architecture](../architecture/mcp-system.md) - MCP implementation details
- [Integration Testing Guide](./integration-testing.md) - Testing guide

---

*Last Updated: 2026-01-26*
