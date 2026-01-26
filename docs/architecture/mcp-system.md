# MCP System Architecture

> Model Context Protocol (MCP) implementation for Agents Playbook

## Overview

The MCP system provides a standardized interface for AI assistants to interact with workflows, skills, and prompts. It enables semantic search, CRUD operations, and workflow execution guidance through a single HTTP endpoint.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        AI Clients                                │
│         (Claude Code, Cursor, other MCP-compatible tools)        │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌───────────────────────────────────────────────────────────────────┐
│                    POST /api/v1/mcp                               │
│                   (Vercel MCP Adapter)                            │
├───────────────────────────────────────────────────────────────────┤
│  Authentication Layer                                             │
│  ├── Session Auth (web users)                                     │
│  └── API Token Auth (programmatic access)                         │
└───────────────────────────────┬───────────────────────────────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        ▼                       ▼                       ▼
┌───────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Workflow     │     │    Skill        │     │    Folder       │
│  Handlers     │     │    Handlers     │     │    Handlers     │
├───────────────┤     ├─────────────────┤     ├─────────────────┤
│ get_workflows │     │ get_skills      │     │ get_by_folder   │
│ select_workflow│    │ get_selected_   │     │ create_folder   │
│ get_next_step │     │   skill         │     └─────────────────┘
│ get_workflow  │     │ add_skill       │
│ add_workflow  │     │ edit_skill      │
│ edit_workflow │     └─────────────────┘
└───────────────┘
        │                       │                       │
        └───────────────────────┼───────────────────────┘
                                ▼
┌───────────────────────────────────────────────────────────────────┐
│                    Shared Services                                │
├─────────────────┬─────────────────────┬───────────────────────────┤
│ Semantic Search │ Execution Plan      │ Folder Utils              │
│ (OpenAI embed.) │ Builder             │                           │
└─────────────────┴─────────────────────┴───────────────────────────┘
                                │
                                ▼
┌───────────────────────────────────────────────────────────────────┐
│                      Prisma ORM                                   │
│               (PostgreSQL Database)                               │
└───────────────────────────────────────────────────────────────────┘
```

## File Structure

```
src/
├── app/api/v1/mcp/
│   └── route.ts                    # MCP HTTP endpoint
│
└── server/mcp-tools-db/
    ├── index.ts                    # Central exports
    │
    ├── mcp-auth-helpers.ts         # Authentication logic
    ├── require-auth.ts             # Auth guards & response helpers
    │
    ├── workflow-utils.ts           # Schema validation & tags
    ├── folder-utils.ts             # Folder creation/lookup
    ├── execution-plan-builder.ts   # Workflow execution plans
    │
    ├── get-workflows.ts            # Semantic workflow search
    ├── select-workflow.ts          # Get workflow + execution plan
    ├── get-next-step.ts            # Step progression
    ├── get-workflow-handler.ts     # Get workflow details
    ├── add-workflow-handler.ts     # Create workflow
    ├── edit-workflow-handler.ts    # Update workflow
    │
    ├── get-skills-handler.ts       # Skill search (text/semantic)
    ├── get-selected-skill-handler.ts # Get skill details
    ├── add-skill-handler.ts        # Create skill
    ├── edit-skill-handler.ts       # Update skill
    │
    ├── get-by-folder-handler.ts    # List folder contents
    └── create-folder-handler.ts    # Create folder
```

## MCP Tools Reference

### Discovery Tools

| Tool | Auth | Description |
|------|------|-------------|
| `get_available_workflows` | Optional | Semantic search for workflows |
| `get_skills` | Optional | Search skills (text or semantic) |

### Selection Tools

| Tool | Auth | Description |
|------|------|-------------|
| `select_workflow` | Optional | Get workflow with execution plan |
| `get_next_step` | No | Get specific step from execution plan |
| `get_selected_skill` | Optional | Get complete skill details |
| `get_workflow` | Optional | Get workflow details |

### CRUD Tools

| Tool | Auth | Description |
|------|------|-------------|
| `add_workflow` | Required | Create new workflow |
| `edit_workflow` | Required | Update/soft-delete workflow |
| `add_skill` | Required | Create new skill |
| `edit_skill` | Required | Update/soft-delete skill |
| `create_folder` | Required | Create new folder |
| `get_by_folder` | Optional | List folder contents |

## Authentication

### Methods

1. **Session Auth** - For web users with active sessions
2. **API Token Auth** - Bearer token in `Authorization` header

### Auth Flow

```typescript
// src/server/mcp-tools-db/mcp-auth-helpers.ts

export async function getUserId(): Promise<string | null> {
  // 1. Check API token (from Authorization header)
  // 2. Check session (from auth provider)
  // Returns userId or null
}
```

### API Token Storage

Tokens stored as SHA-256 hashes in `api_tokens` table with:
- Expiration date
- Last used timestamp
- User association

## Database Schema

### Core Tables

```
workflows              # Main workflow records
├── workflow_stages    # Stages within workflows
│   ├── stage_mini_prompts  # Junction: stages ↔ prompts
│   └── stage_skills        # Junction: stages ↔ skills
├── workflow_tags      # Workflow categorization
└── workflow_embeddings # Vector embeddings for search

skills                 # Reusable skill cards
├── skill_attachments  # File attachments
├── skill_tags         # Skill categorization
└── skill_embeddings   # Vector embeddings for search

mini_prompts           # Reusable prompt templates

folders                # Organization containers
└── folder_items       # Junction: folders ↔ content

api_tokens             # User API tokens (hashed)
```

### Key Enums

```typescript
enum Visibility {
  PUBLIC   // Accessible to all
  PRIVATE  // Owner only
}

enum TargetType {
  WORKFLOW
  MINI_PROMPT
  SKILL
}

enum WorkflowComplexity {
  XS, S, M, L, XL
}
```

## Execution Plan Builder

The execution plan builder transforms workflows into sequential steps for guided execution.

### Structure

```typescript
interface ExecutionPlan {
  workflowId: string;
  workflowName: string;
  includeMultiAgentChat: boolean;
  totalSteps: number;
  items: ExecutionPlanItem[];
}

interface ExecutionPlanItem {
  index: number;
  type: 'stage' | 'mini-prompt' | 'auto-prompt' | 'skill';
  stageIndex?: number;
  stageName?: string;
  name: string;
  description?: string;
  content?: string;
  autoPromptType?: 'memory-board' | 'multi-agent-chat';
  attachments?: Attachment[];
}
```

### Build Process

1. Fetch workflow with stages, mini-prompts, and skills
2. Fetch auto-prompts (Memory Board, Internal Agents Chat)
3. For each stage:
   - Use custom `itemOrder` if defined (drag-and-drop)
   - Otherwise use default ordering
4. Inject auto-prompts based on stage settings:
   - `withReview: true` → Memory Board
   - `includeMultiAgentChat: true` → Internal Agents Chat
5. Return sequential 0-based step indices

## Semantic Search

### Implementation

```typescript
// src/server/workflows/db-semantic-search.ts

class DBSemanticSearch {
  async searchWorkflows(query: string, limit: number, userId?: string)
  async searchSkills(taskDescription: string, limit: number, userId?: string)
}
```

### Process

1. Generate query embedding via OpenAI API
2. Load pre-computed embeddings from database
3. Calculate cosine similarity
4. Sort by similarity and return top results
5. Fallback to text search if OpenAI unavailable

### Access Control

- **No userId**: Returns all active system workflows/skills
- **With userId**: Returns system items in user's library + user's own active items

## Handler Pattern

All handlers follow a consistent pattern:

```typescript
// 1. Define Zod schema
export const toolNameToolSchema = {
  param1: z.string().describe('Parameter description'),
  param2: z.string().optional().describe('Optional param'),
};

// 2. Define input interface
export interface ToolNameInput {
  param1: string;
  param2?: string;
}

// 3. Handler function
export async function toolNameHandler(
  input: ToolNameInput,
  userId: string | null
): Promise<McpResponse> {
  // Check auth if needed
  const auth = requireAuth(userId);
  if (!auth.authenticated) return auth.response;

  // Perform operation
  const result = await prisma.table.findMany({...});

  // Return response
  return mcpSuccess(result);
}
```

### Response Format

```typescript
type McpResponse = {
  content: [{ type: "text"; text: string }];
};

// Helpers
mcpSuccess<T>(data: T): McpResponse
mcpError(message: string): McpResponse
```

## Workflow Hierarchy

```
Workflow
├── metadata (title, description, complexity, visibility)
├── tags
└── Stages (ordered)
    ├── Mini-Prompts (ordered)
    ├── Skills (ordered)
    └── Auto-Prompts (conditional)
        ├── Memory Board (if withReview)
        └── Internal Agents Chat (if includeMultiAgentChat)
```

### Stage Features

- Color coding for visual organization
- `withReview` - Enables Memory Board auto-prompt
- `includeMultiAgentChat` - Enables multi-agent discussion
- `itemOrder` - Custom ordering via drag-and-drop (JSON field)

## Folder System

### Features

- Hierarchical organization
- Public/private visibility
- Soft delete support (`deleted_at`)
- Position-based ordering
- Auto-generated or custom keys

### Contents

Folders can contain:
- Workflows
- Mini-Prompts
- Skills

### Utilities

```typescript
// src/server/mcp-tools-db/folder-utils.ts

async function findOrCreateFolder(
  folderIdOrName: string,
  userId: string,
  tx?: PrismaTransaction
): Promise<string> // Returns folder ID
```

## Error Handling

### Auth Errors

```typescript
// Unauthenticated request to protected endpoint
{
  content: [{
    type: "text",
    text: "Authentication required"
  }]
}
```

### Resource Errors

```typescript
// Resource not found
{
  content: [{
    type: "text",
    text: "Workflow not found"
  }]
}

// Access denied
{
  content: [{
    type: "text",
    text: "Access denied: workflow is private"
  }]
}
```

## Testing

Tests located at `tests/unit/mcp-handlers.test.ts`:

- `selectWorkflowHandler` - Workflow retrieval with execution plan
- `getNextStepHandler` - Step progression logic
- Token validation
- Error handling scenarios

## Usage Examples

### Search Workflows

```json
{
  "tool": "get_available_workflows",
  "arguments": {
    "task": "code review workflow"
  }
}
```

### Select and Execute Workflow

```json
// 1. Select workflow
{
  "tool": "select_workflow",
  "arguments": {
    "workflow_id": "cm123..."
  }
}

// 2. Get next step
{
  "tool": "get_next_step",
  "arguments": {
    "workflow_id": "cm123...",
    "step_index": 0
  }
}
```

### Create Skill

```json
{
  "tool": "add_skill",
  "arguments": {
    "name": "My Skill",
    "content": "# Skill Content\n\nMarkdown content here...",
    "tags": ["productivity", "coding"]
  }
}
```
