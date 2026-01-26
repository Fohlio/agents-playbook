# PRD: Skills Feature

## Overview

### Problem Statement
The Agents Playbook platform currently exposes mini-prompts as the primary reusable content unit in the UI, MCP tools, and library. However, users need a richer content type — **Skills** — that can bundle a markdown instruction file with supporting attachments (scripts, configs, images, code files). This enables more complex, self-contained reusable units that can be shared, discovered, and referenced in workflows.

### Goals
1. Introduce a new **Skill** entity: an MD-based instruction file with any number of file attachments stored in Vercel Blob Storage.
2. Provide a **Skill Studio** UI for creating/editing skills with AI assistant support.
3. **Replace prompts with skills** in discoverable UI surfaces (library, dashboard, discover, landing) and MCP tools. Mini-prompts remain in Workflow Constructor only.
4. Keep mini-prompts available exclusively inside the **Workflow Constructor** (stage editor).
5. Enable skills to be first-class items in workflow stages (parallel to mini-prompts).
6. Add a **tags system** for workflows, skills, and mini-prompts for search and filtering.
7. Improve card interactions with 3-dot menus and double-click navigation.

---

## Target Audience

- **AI engineers and prompt engineers** building multi-step agent workflows.
- **Teams** sharing reusable skill definitions (with attached scripts/configs).
- **Solo developers** organizing their AI tooling and automation recipes.

---

## User Stories

| # | As a... | I want to... | So that... |
|---|---------|-------------|-----------|
| 1 | User | Create a skill with an MD file and attached scripts/configs | I can package a complete, self-contained instruction set |
| 2 | User | Use AI assistant to help generate skill content | I can create skills faster without writing everything manually |
| 3 | User | Browse and discover skills in my library | I can find and reuse skills across projects |
| 4 | User | Reference skills inside workflow stages | My workflows can leverage skill definitions at execution time |
| 5 | User | Search skills via MCP tools | My AI agents can find and use relevant skills |
| 6 | User | Tag workflows, skills, and prompts | I can organize and filter my content effectively |
| 7 | User | Double-click a workflow/skill card to open its detail page | I can quickly navigate to item details |
| 8 | User | Use a 3-dot menu on cards for quick actions | I can perform common operations without navigating away |
| 9 | User | Share skills publicly | Other users can discover and import my skills |

---

## Functional Requirements

### Phase 1: Skill Entity (Backend Foundation)

#### 1.1 Data Model

**New Prisma models:**

```prisma
model Skill {
  id              String          @id @default(cuid())
  userId          String
  user            User            @relation(fields: [userId], references: [id])
  name            String
  content         String          // Main MD content
  description     String?
  key             String?         @unique // Globally unique slug
  visibility      Visibility      @default(PRIVATE)
  isActive        Boolean         @default(true)
  isSystemSkill   Boolean         @default(false)
  position        Int             @default(0)
  deletedAt       DateTime?
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt

  attachments     SkillAttachment[]
  tags            SkillTag[]
  embedding       SkillEmbedding?
  stageSkills     StageSkill[]
  models          SkillModel[]
  references      SkillReference[]
  ratings         Rating[]        // via targetType/targetId
  usageStats      UsageStats[]    // via targetType/targetId
  chatSessions    AIChatSession[]

  @@index([userId])
  @@index([key])
  @@index([visibility, isActive, deletedAt])
}

model SkillAttachment {
  id          String   @id @default(cuid())
  skillId     String
  skill       Skill    @relation(fields: [skillId], references: [id], onDelete: Cascade)
  fileName    String
  fileSize    Int      // bytes
  mimeType    String
  blobUrl     String   // Vercel Blob Storage URL
  createdAt   DateTime @default(now())

  @@index([skillId])
}

model StageSkill {
  id              String        @id @default(cuid())
  workflowStageId String
  workflowStage   WorkflowStage @relation(fields: [workflowStageId], references: [id], onDelete: Cascade)
  skillId         String
  skill           Skill         @relation(fields: [skillId], references: [id], onDelete: Cascade)
  order           Int           @default(0)

  @@unique([workflowStageId, skillId])
  @@index([workflowStageId])
  @@index([skillId])
}

model SkillTag {
  id      String @id @default(cuid())
  skillId String
  skill   Skill  @relation(fields: [skillId], references: [id], onDelete: Cascade)
  tagId   String
  tag     Tag    @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@unique([skillId, tagId])
}

model SkillEmbedding {
  id         String @id @default(cuid())
  skillId    String @unique
  skill      Skill  @relation(fields: [skillId], references: [id], onDelete: Cascade)
  embedding  Float[]
  searchText String
}

model SkillModel {
  id      String @id @default(cuid())
  skillId String
  skill   Skill  @relation(fields: [skillId], references: [id], onDelete: Cascade)
  modelId String
  model   Model  @relation(fields: [modelId], references: [id], onDelete: Cascade)

  @@unique([skillId, modelId])
}

model SkillReference {
  id      String @id @default(cuid())
  userId  String
  user    User   @relation(fields: [userId], references: [id])
  skillId String
  skill   Skill  @relation(fields: [skillId], references: [id])

  @@unique([userId, skillId])
}
```

**Enum updates:**
- Add `SKILL` to `TargetType` enum (for folder_items, ratings, usage stats)

#### 1.2 API Routes

```
/api/skills/
├── route.ts                    (GET: list, POST: create)
├── [id]/
│   ├── route.ts                (GET: details, PATCH: update, DELETE: soft-delete)
│   ├── duplicate/route.ts      (POST: clone skill)
│   └── attachments/
│       ├── route.ts            (POST: upload attachment)
│       └── [attachmentId]/
│           └── route.ts        (DELETE: remove attachment)
└── reorder/route.ts            (POST: reorder skills)
```

#### 1.3 File Storage

- **Provider:** Vercel Blob Storage (`@vercel/blob`)
- **Upload flow:** Client → API route → Vercel Blob → store URL in SkillAttachment
- **Size limits:** 10MB per file, 50MB total per skill. Server validates at upload; rejects with 413 Payload Too Large.
- **Allowed types:** Any file type (images, scripts, configs, code, docs)
- **Security:** Blob URLs are signed with time-limited access (24h expiry). API validates user has access to the skill before serving download URLs.
- **Deletion:** Blob deletion via async background job on skill/attachment delete. If blob deletion fails, log error and continue (orphaned blobs cleaned in periodic maintenance).
- **Attachment preview rules:**
  - Code files (`.js`, `.ts`, `.py`, `.sh`, `.go`, `.rs`, etc.) → preview in modal with syntax highlighting
  - Images (`.png`, `.jpg`, `.gif`, `.svg`, `.webp`) → inline preview
  - Text files (`.md`, `.txt`, `.csv`) → preview in modal
  - Binary files (`.zip`, `.pdf`, `.docx`) → download only

#### 1.4 Key Generation

- Globally unique keys (same pattern as workflows/prompts)
- Auto-generated from skill name using slugify + random suffix (e.g., `data-processing-7a9x`)
- Uniqueness enforced at DB level (`@unique` constraint)
- On collision: append additional random suffix; if still fails, return 409 Conflict

#### 1.5 Soft-Delete Behavior

- Soft-delete sets `deletedAt` timestamp; skill hidden from UI and MCP results
- `StageSkill` references remain intact (stages show "skill unavailable" indicator)
- `SkillReference` (imports) remain; importing user sees "skill deleted by owner" state
- Hard-delete (permanent) cascades to StageSkill, SkillTag, SkillAttachment, SkillEmbedding
- Queries always filter by `deletedAt IS NULL` unless viewing trash

---

### Phase 2: Skills in MCP

#### 2.1 Replace Prompt Tools with Skill Tools

**Remove:**
- `get_prompts`
- `get_selected_prompt`
- `add_prompt`
- `edit_prompt`

**Add:**
- `get_skills` — Search/list skills (semantic search with embeddings). No auth: public system skills. With auth: user's active + system skills.
- `get_selected_skill` — Get specific skill by ID or key. Returns full content + attachment list.
- `add_skill` — Create a skill (MD content, optional tags, optional folder). Triggers embedding generation.
- `edit_skill` — Update skill content/metadata. Ownership verification.

#### 2.2 MCP Response Format

`get_selected_skill` returns:
```json
{
  "name": "data-processing-7a9x",
  "title": "Data Processing Pipeline",
  "content": "# Data Processing\n\nThis skill handles...",
  "description": "ETL pipeline for CSV data",
  "tags": ["data", "etl"],
  "attachments": [
    { "fileName": "transform.py", "mimeType": "text/x-python", "fileSize": 2048, "downloadUrl": "https://..." },
    { "fileName": "config.yaml", "mimeType": "text/yaml", "fileSize": 512, "downloadUrl": "https://..." }
  ]
}
```

#### 2.3 Skill in Workflow Execution

Update `get_next_step` to resolve skills referenced in stages:
- A workflow stage can contain BOTH MiniPrompts AND Skills. Both are rendered in execution order (via `order` field).
- When a stage contains skills (via StageSkill), include skill content in the step output.
- Skill attachments listed as available resources with download URLs.

#### 2.4 Semantic Search

- Generate OpenAI embeddings for skills (same pattern as workflows/prompts).
- Embeddings auto-generated on skill create/update via async job. Fallback: `npm run build:embeddings` regenerates all.
- Semantic search queries skills and workflows separately, merges results ranked by embedding distance.
- `get_skills` accepts `task_description` parameter for semantic matching.

---

### Phase 3: Skill Studio UI

#### 3.1 Skill Studio Page

**Routes:**
- `/dashboard/skills/studio` — Create a new skill
- `/dashboard/skills/[id]/edit` — Edit existing skill

**Layout:**
- Split-pane editor: Left = MD editor, Right = live preview
- Toolbar: Save, AI Assistant toggle, Attachment manager
- Bottom/side panel: Attachment list with upload, delete, preview

**Editor features:**
- Markdown editor with syntax highlighting
- Code block support with language detection
- Skill metadata form (name, description, tags, visibility)

#### 3.2 AI Assistant Integration

- Reuse existing `AIChatSession` / `ChatMessage` system
- Add `skillId` FK to `AIChatSession` model (nullable, coexists with `workflowId`)
- Chat panel slides in from the right (resizable)
- **Capabilities:** Generate skill content from description, review/refine markdown, suggest structure, explain attached code
- **System prompt:** "You are an expert at writing clear, structured skill documentation for AI agents. Help the user create comprehensive, actionable skill definitions."
- One active chat session per skill per user

#### 3.3 Attachment Management

- Drag-and-drop file upload area
- File list with: name, size, type icon, delete button
- Click to preview (images inline, code files in modal, others download)
- Upload progress indicator

#### 3.4 Design Task

> **ACTION REQUIRED:** Generate Stitch UI designs for Skill Studio.
> - Use `mcp__stitch__generate_screen_from_text` to create:
>   1. Skill Studio editor (split-pane: MD editor + preview, attachment panel)
>   2. Skill card component (for library grid view, cyberpunk style matching existing workflow cards)
>   3. Skill detail/preview modal
> - Design should follow existing cyberpunk aesthetic: dark backgrounds, neon cyan (#00ffff) primary, pink (#ff00ff) accents, angular borders

---

### Phase 4: UI Migration (Library, Dashboard, Discover, Landing)

#### 4.1 Library Page Changes

- **Remove:** `MiniPromptDiscoveryCard` from library grid
- **Add:** `SkillDiscoveryCard` in its place
- **Folder system:** Skills use existing `folder_items` with `target_type: 'SKILL'`
- **Search:** Include skills in library search results
- **Filters:** Filter by tags, visibility, type (workflow/skill)

#### 4.2 Dashboard Changes

- Replace any prompt stats/cards with skill equivalents
- Skill count in dashboard summary

#### 4.3 Discover Page Changes

- Show public skills (replace public prompts listing)
- Import skill → creates `SkillReference`
- Skill preview modal on click

#### 4.4 Landing Page Changes

- Replace prompt showcases with skill examples
- Update copy/messaging to reference skills

#### 4.5 Where Prompts Remain

- **Workflow Constructor:** Mini-prompts still selectable within stage editor (`MiniPromptLibrary` component)
- **Workflow Detail Page:** Stage sections still show mini-prompts
- Prompts are internal building blocks, not user-facing browsable content

---

### Phase 5: Card Interactions

#### 5.1 Three-Dot Menu (CardActionsMenu)

**Workflow cards:**
- Edit (navigate to workflow constructor)
- Duplicate
- Share (generate SharedLink)
- Toggle Active/Inactive
- Toggle Public/Private
- Delete (soft-delete)

**Skill cards:**
- Edit (navigate to Skill Studio)
- Duplicate
- Share
- Toggle Active/Inactive
- Toggle Public/Private
- Delete (soft-delete)

#### 5.2 Double-Click Navigation

- **Workflow card** double-click → Navigate to `/dashboard/workflows/[id]` (detail page showing stages + prompts)
- **Skill card** double-click → Navigate to `/dashboard/skills/[id]/edit` (Skill Studio)

#### 5.3 Prompt Preview (within workflows)

- Clicking a mini-prompt inside a workflow stage → Opens `PromptPreviewModal` (existing component)
- Read-only view of prompt content

---

### Phase 6: Tags System Enhancement

#### 6.1 Tag CRUD

- Tags already exist in schema (`Tag`, `WorkflowTag`, `MiniPromptTag`). No changes needed for those.
- `SkillTag` junction table already defined in Phase 1 schema.
- Tag creation: inline when adding tags to items (type-ahead + create new)
- Tag management: Admin can manage global tags

#### 6.2 Tag UI

- Tag chips on cards (workflow, skill cards)
- Tag filter in library sidebar/header
- Multi-select tag filtering: OR logic (selecting tags A and B returns items with ANY of them; `WHERE tag_id IN (...)`)
- Tag colors for visual distinction

#### 6.3 Tag in Search

- Include tags in search index
- Filter by tag in API endpoints (`?tags=tag1,tag2`)
- MCP tools support tag-based filtering

---

## Technical Constraints

### Integration Points
- **Vercel Blob Storage:** New dependency for file attachments
- **Prisma schema:** 6+ new models, enum update, migration required
- **MCP server:** Remove 4 tools, add 4 new tools (breaking change for existing MCP users)
- **Embedding pipeline:** Extend to generate embeddings for skills
- **Folder system:** Add SKILL to TargetType enum
- **AI Chat:** Add skillId FK to AIChatSession

### Performance Targets
- Skill creation: < 2s (excluding file upload)
- File upload: < 5s for files under 10MB
- Library search: < 500ms including semantic search
- MCP tool response: < 3s

### Breaking Changes & Migration
- MCP tools `get_prompts`, `get_selected_prompt`, `add_prompt`, `edit_prompt` will be removed
- Users of these tools must migrate to `get_skills`, `get_selected_skill`, `add_skill`, `edit_skill`
- Prompt cards no longer visible in library/dashboard/discover
- **Migration path:** MCP tool removal is immediate (no deprecation period). Users update their tool configurations on next deployment.
- **Database:** New migration adds Skill tables. No data migration needed (skills are new; prompts stay as-is).
- **SharedLink:** Reuse existing model with `target_type: 'SKILL'`. No new table needed.

---

## UI/UX Requirements

### Visual Design
- Follow existing cyberpunk aesthetic (dark theme, neon cyan/pink accents)
- Skill cards should be visually distinct from workflow cards (different icon, subtle color variation)
- Skill Studio should feel like a professional editor (think Notion/Obsidian dark mode)
- Attachment area should support drag-and-drop with clear visual feedback

### Key Interactions
- Card hover: subtle glow effect (consistent with existing cards)
- Double-click: navigate to detail page
- 3-dot menu: appears on hover or always visible (match existing pattern)
- Tag chips: clickable to filter, removable with X on edit
- AI assistant: slide-in panel from right, resizable

### Design Generation Task
Generate the following screens in Stitch (cyberpunk dark theme, desktop):
1. **Skill Studio** — Split-pane editor with MD left, preview right, attachment panel below
2. **Skill Card** — Library grid item matching workflow card style
3. **Library with Skills** — Updated library view showing skill cards instead of prompt cards
4. **Tag Filter UI** — Tag chips + filter dropdown in library header

---

## Phasing & MVP

### MVP (Phase 1-3): Skill Entity + MCP + Studio
- Skill CRUD (backend + API)
- File attachments via Vercel Blob
- MCP tools (replace prompt tools with skill tools)
- Basic Skill Studio (editor + attachments, no AI assistant yet)
- Skill cards in library (replace prompt cards)

### V1.1 (Phase 4-5): UI Migration + Interactions
- Full UI migration (dashboard, discover, landing)
- 3-dot menus on all cards
- Double-click navigation
- AI assistant in Skill Studio

### V1.2 (Phase 6): Tags
- Tag UI on cards
- Tag filtering in library
- Tag support in MCP search

---

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Skills created per user/week | > 3 | DB query |
| Skill attachments usage | > 50% of skills have attachments | DB query |
| MCP skill tool usage | Matches previous prompt tool usage | Usage stats |
| Library engagement | No drop in browse/search activity | Analytics |
| AI assistant usage in Studio | > 30% of skill creation sessions | Chat session count |
| Tag adoption | > 60% of items tagged within 30 days | DB query |

---

## Out of Scope

- Skill versioning / revision history (future feature)
- Collaborative editing (multiple users editing same skill)
- Skill marketplace / monetization
- Skill execution runtime (skills are reference content, not executable)
- Prompt-to-skill migration tool (manual recreation expected)
- Real-time collaboration in Skill Studio
