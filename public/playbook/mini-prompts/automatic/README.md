# Automatic Mini-Prompts

This directory contains the **automatic system mini-prompts** that are auto-attached to workflows and stages based on settings.

## Prompts

### 1. Handoff Memory Board (v2)
**File:** `handoff-memory-board-v2.md`
**Purpose:** Stage-level review and progress documentation
**Auto-attached:** When stage has `withReview: true` (default)
**Position:** End of stage (after all mini-prompts)

**Features:**
- Document phase completion
- Track file changes (list or summary)
- Capture learnings in global `.agents-playbook/learnings.md`
- Request user approval before proceeding

### 2. Internal Agents Chat (v2)
**File:** `internal-agents-chat-v2.md`
**Purpose:** Multi-agent coordination for parallel work
**Auto-attached:** When workflow has `includeMultiAgentChat: true`
**Position:** After each mini-prompt

**Features:**
- Enable simultaneous multi-agent work
- Structured chat protocol for coordination
- Track status, blockers, and progress
- Capture coordination learnings

## Seeding

These prompts are seeded to the database using:

```bash
npm run db:seed:auto-prompts
```

This script:
1. Finds or creates system user (`system@agents-playbook.app`)
2. Upserts both automatic prompts as system mini-prompts
3. Sets `isSystemMiniPrompt: true` and `visibility: PUBLIC`
4. Safe to run multiple times (uses upsert logic)

## After Database Reset

When you reset the database, run:

```bash
# 1. Run migrations
npm run db:migrate:dev

# 2. Seed system content (workflows, mini-prompts)
npm run db:seed:system

# 3. Seed automatic prompts
npm run db:seed:auto-prompts

# 4. Generate embeddings for semantic search
npm run build:embeddings
```

## Admin Management

These prompts can be edited by admins at:
- **Route:** `/dashboard/admin/system-prompts`
- **Display:** Special section "Automatic Prompts" with ⚡ icon
- **Badges:** "Auto" badge to indicate auto-attachment
- **Editing:** Full markdown editor with embedding regeneration

## Implementation Notes

**Database Fields:**
- `Workflow.includeMultiAgentChat` - Boolean flag for multi-agent chat
- `WorkflowStage.withReview` - Boolean flag for memory board (default: true)

**MCP Integration:**
- Automatic prompts injected into execution plan based on flags
- Metadata includes `isAutoAttached: true` and `type` fields
- Execution plan built during `select_workflow` MCP tool call

**UI Visualization:**
- Auto-prompts shown as special cards (non-draggable)
- Badge indicates type: "Review" (memory board) or "Auto" (multi-agent chat)
- Lock icon shows non-editable/non-movable status
- Admin link for editing (admin users only)

## Content Updates

To update prompt content:

**Option 1: Via Admin Panel (Recommended)**
- Login as admin
- Navigate to `/dashboard/admin/system-prompts`
- Click "Edit Content" on the prompt
- Embeddings regenerated automatically

**Option 2: Via File + Re-seed**
1. Edit `.md` file in this directory
2. Run `npm run db:seed:auto-prompts`
3. Run `npm run build:embeddings`

## Learnings File

Both prompts reference a global learnings file:
- **Path:** `.agents-playbook/learnings.md`
- **Behavior:** Append only (never overwrite)
- **Purpose:** Capture non-obvious insights across workflows
- **Scope:** Global (shared across all workflows)
