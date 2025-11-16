# Agents Playbook

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Production-ready AI workflow orchestration platform with database-driven workflows, personal libraries, and team collaboration.

## Overview

Agents Playbook empowers AI to handle complex tasks and navigate large codebases with precision. Build custom workflows and mini-prompts for your team's specific needs, maintain personal libraries of reusable patterns, and reduce AI hallucinations through structured, validated processes.

### Features

- **Database-First Architecture** - All workflows and mini-prompts stored in PostgreSQL, no file system access at runtime
- **Personal Libraries** - Build and maintain your own library of reusable workflows and mini-prompts
- **Team Workflows** - Create, share, and collaborate on custom workflows tailored to your team's needs
- **Visual Workflow Builder** - Drag-and-drop constructor for creating sophisticated workflows without YAML
- **AI-Powered Discovery** - Semantic search using OpenAI embeddings finds the perfect workflow for any task
- **MCP Server Integration** - Native Model Context Protocol support for Claude Code, Cursor, and other AI assistants
- **Authentication & API Tokens** - Secure user accounts with NextAuth v5 and API token authentication
- **Smart Execution Plans** - Automatic injection of Memory Board and Multi-Agent Chat prompts
- **Privacy Controls** - Public/private workflows with shareable time-limited links

## Prerequisites

- Node.js 18.0.0 or higher
- npm 8.0.0 or higher
- PostgreSQL database (Neon recommended)
- OpenAI API Key (for semantic search)

## Quick Start

### Installation

```bash
# Clone the repository
git clone https://github.com/anthropics/agents-playbook
cd agents-playbook

# Install dependencies
npm install
```

### Configuration

Create a `.env.local` file:

```env
# Database (Neon PostgreSQL)
DATABASE_URL=postgresql://...         # Pooled connection
DIRECT_URL=postgresql://...           # Direct connection for migrations

# OpenAI (for semantic search)
OPENAI_API_KEY=sk-...

# NextAuth
NEXTAUTH_SECRET=...                   # Generate with: openssl rand -base64 32
NEXTAUTH_URL=http://localhost:3012    # Your app URL
```

### Database Setup

```bash
# Run migrations
npm run db:migrate:dev

# Seed system workflows and mini-prompts
npm run db:seed:system

# Generate embeddings for semantic search
npm run build:embeddings
```

### Development

```bash
# Start development server
npm run dev

# Server available at:
# - Web UI: http://localhost:3012
# - MCP Endpoint: http://localhost:3012/api/v1/mcp
```

## Architecture

### Database-First Design

**Everything is stored in PostgreSQL** - no runtime file system access:

- **System Workflows & Mini-Prompts**: Pre-built content seeded once, available to all users
- **User Content**: Created through the visual workflow constructor, stored with privacy controls
- **Embeddings**: OpenAI vectors stored in database for fast semantic search
- **Execution Plans**: Built dynamically with automatic prompt injection

### Project Structure

```
agents-playbook/
├── prisma/
│   ├── schema.prisma         # Database schema (Workflows, MiniPrompts, Users, etc.)
│   └── migrations/           # Database migrations
├── src/
│   ├── app/                  # Next.js 15 app router
│   │   ├── api/              # API routes (MCP, admin, auth)
│   │   └── dashboard/        # Dashboard pages
│   ├── features/             # Feature-specific components
│   │   ├── workflow-constructor/  # Drag-and-drop workflow builder
│   │   ├── api-tokens/       # API token management
│   │   └── sharing/          # Workflow sharing
│   ├── lib/
│   │   ├── workflows/        # UnifiedWorkflowService, semantic search
│   │   ├── mcp-tools-db/     # Database-backed MCP tools
│   │   ├── auth/             # NextAuth configuration
│   │   └── db/               # Prisma client
│   └── shared/               # Shared UI components
├── scripts/
│   └── build-embeddings.ts       # Generate OpenAI embeddings
└── tests/                    # Integration & E2E tests
```

## Testing

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

## Using Workflows

### Through the Web UI

1. **Discover Workflows**: Browse public workflows at `/dashboard/discover` (no login required)
2. **Search with AI**: Use semantic search to find workflows by describing your task
3. **Create Your Own**: Build custom workflows with the visual constructor at `/dashboard/library/workflows/new`
4. **Personal Library**: Manage your workflows and mini-prompts at `/dashboard/library`
5. **Team Sharing**: Share workflows with time-limited links or make them public

### Through MCP Server

The MCP endpoint (`/api/v1/mcp`) provides these tools:

- `get_available_workflows(task_description)` - AI-powered semantic search
- `select_workflow(workflow_id)` - Get complete workflow with execution plan
- `get_next_step(workflow_id, current_step, available_context)` - Step-by-step navigation
- `get_prompts(search)` - Search mini-prompts library
- `get_selected_prompt(prompt_id)` - Get specific mini-prompt details

**Authentication**:
- Unauthenticated: Returns system workflows/prompts only
- Authenticated: Returns system + your personal content

> 💡 **Tip**: Ask your AI assistant to "use agents-playbook to select workflow" for structured development processes.

## MCP Integration

### Getting API Token

1. Create account at [agents-playbook.com](https://agents-playbook.com)
2. Navigate to Settings → API Tokens
3. Create new token and copy it

### Cursor Setup

Add to Cursor MCP settings (File → Preferences → Cursor Settings → Features → MCP):

```json
{
  "mcpServers": {
    "agents-playbook": {
      "url": "https://agents-playbook.com/api/v1/mcp",
      "description": "AI Agent Workflow Engine",
      "headers": {
        "Authorization": "Bearer your-api-token"
      }
    }
  }
}
```

### Claude Code Setup

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "agents-playbook": {
      "url": "https://agents-playbook.com/api/v1/mcp",
      "headers": {
        "Authorization": "Bearer your-api-token"
      }
    }
  }
}
```

### Local Development

Test the MCP server locally:

```bash
# Start dev server
npm run dev

# Test with MCP Inspector (no auth)
DANGEROUSLY_OMIT_AUTH=true npx @modelcontextprotocol/inspector@latest http://localhost:3012/api/v1/mcp
```

## Key Features Explained

### Visual Workflow Constructor

Create sophisticated workflows through drag-and-drop interface:
- Add stages (Analysis, Implementation, Testing, etc.)
- Drag mini-prompts from your library into stages
- Configure automatic prompts (Memory Board, Multi-Agent Chat)
- Set privacy controls (PUBLIC/PRIVATE)
- Share with time-limited links

### Personal Libraries

Build your knowledge base:
- **Workflows**: Multi-step processes for complex tasks
- **Mini-Prompts**: Reusable prompt templates
- **Privacy Controls**: Keep private or share publicly
- **Tagging**: Organize with custom tags
- **Search**: AI-powered semantic search across your library

### Automatic System Prompts

Workflows can include two automatic prompts:
- **Memory Board** (📋): Injected at end of each stage for context handoff
- **Multi-Agent Chat** (🤖): Coordination prompts after each mini-prompt
- Admins can edit at `/dashboard/admin/system-prompts`

### Discovery

Browse public workflows without login:
- Semantic search: Describe your task in natural language
- Filter by complexity, tags, ratings
- Preview execution plans before using
- Fork workflows to your library

## Deployment

### Vercel

```bash
npm i -g vercel
vercel --prod
```

Set environment variables in Vercel dashboard:
- `DATABASE_URL` - Pooled PostgreSQL connection
- `DIRECT_URL` - Direct PostgreSQL connection
- `OPENAI_API_KEY` - For semantic search
- `NEXTAUTH_SECRET` - Session encryption key
- `NEXTAUTH_URL` - Production URL

## Troubleshooting

**No workflows found**:
- Run `npm run db:seed:system` to populate system workflows
- Run `npm run build:embeddings` to generate embeddings
- Check database: `npm run db:studio`

**Database connection errors**:
- Verify `DATABASE_URL` includes `?sslmode=require`
- Use `DIRECT_URL` for migrations
- Regenerate Prisma client: `npm run db:generate`

**MCP server not responding**:
- Ensure dev server running: `npm run dev`
- Check endpoint: `http://localhost:3012/api/v1/mcp`
- Verify API token in headers

**Build failures**:
- Clear Next.js cache: `rm -rf .next`
- Regenerate Prisma client: `npm run db:generate`
- Check TypeScript: `npm run lint`

## License

MIT License - see [LICENSE](LICENSE) file for details.