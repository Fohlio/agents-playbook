# PRD: Library File System Redesign

**Version:** 1.2
**Date:** 2025-01-19
**Author:** Product Team
**Status:** Final (Updated after Business Review)

---

## 1. Overview

### 1.1 Problem Statement

The current Library and Discover interfaces display workflows and mini-prompts as flat lists with tabs. Users lack the ability to organize their content hierarchically, making it difficult to manage large collections of workflows and prompts. The current paradigm doesn't support logical grouping or the intuitive file-system mental model that users are familiar with.

### 1.2 Goals

1. Transform the Library into a file-system-like interface with folder support
2. Enable users to organize workflows and prompts into folders
3. Provide intuitive navigation (tree view + main view switching)
4. Implement familiar file-system interactions (selection, bulk operations, trash)
5. Expose folder functionality through MCP tools for AI agent integration
6. Simplify the Discover page by removing filters (temporary, for redesign phase)

### 1.3 Non-Goals (Out of Scope)

- Prompt Studio implementation (Phase 2)
- Advanced filter/search functionality on Discover (Phase 2)
- Nested folders (folders inside folders)
- Full workflow/prompt editor within file-system view

---

## 2. Target Audience

| Persona | Description | Key Needs |
|---------|-------------|-----------|
| **Regular Users** | Users organizing their workflow collections | Simple navigation, intuitive folder organization |
| **AI Developers** | MCP tool integrators building AI agents | Programmatic folder access via `get_by_folder(key)` |
| **Content Sharers** | Users sharing public folders/collections | Folder visibility, easy import functionality |

---

## 3. User Stories

### 3.1 Navigation & Views

| ID | Story | Priority |
|----|-------|----------|
| US-1 | As a user, I want to switch between sidebar tree view and main view navigation, so I can use whichever suits my workflow | P0 |
| US-2 | As a user, I want to see breadcrumb navigation when inside folders, so I can understand my location and navigate back | P0 |
| US-3 | As a user, I want items not in any folder to appear in a dedicated "Uncategorized" area, so nothing gets lost | P0 |
| US-4 | As a user, I want to click on an item's title to drill into it (folder→contents, workflow→prompts), so I can browse hierarchically | P0 |
| US-5 | As a user, I want to single-click an item card to select it (for bulk operations), so I can work with multiple items | P0 |
| US-5a | As a user, I want to open a preview modal via context menu or double-click, so I can quickly review content | P1 |
| US-5b | As a user, I want to search/filter items in the Library by name, so I can quickly find what I need | P0 |

### 3.2 Folder Management

| ID | Story | Priority |
|----|-------|----------|
| US-6 | As a user, I want to create folders via a button or right-click menu, so I can organize my content | P0 |
| US-7 | As a user, I want to rename folders, so I can update organization as my needs change | P0 |
| US-8 | As a user, I want to delete folders (moving contents to trash), so I can clean up unused organization | P0 |
| US-9 | As a user, I want folders to support visibility settings (public/private), so I can share curated collections | P1 |

### 3.3 Item Organization

| ID | Story | Priority |
|----|-------|----------|
| US-10 | As a user, I want to add a workflow/prompt to multiple folders, so I can categorize content flexibly | P0 |
| US-11 | As a user, I want new items created in a folder context to default to that folder, so organization is automatic | P0 |
| US-12 | As a user, I want to move items between folders via drag-and-drop, so I can reorganize quickly | P0 |
| US-13 | As a user, I want to remove an item from a folder (keeping it in others or moving to Uncategorized), so I have granular control | P0 |

### 3.4 Selection & Bulk Operations

| ID | Story | Priority |
|----|-------|----------|
| US-14 | As a user, I want to select multiple items with Ctrl/Cmd+click, Shift+click, and Ctrl/Cmd+A, so I can work efficiently | P0 |
| US-15 | As a user, I want to drag-select items with a rectangle (lasso), so I can quickly select visible items | P2 (Deferred) |
| US-16 | As a user, I want to bulk move selected items to a folder, so I can reorganize in batches | P0 |
| US-17 | As a user, I want to bulk delete (trash) selected items, so I can clean up efficiently | P0 |
| US-18 | As a user, I want to bulk remove selected items from the current folder, so I can declutter views | P0 |

### 3.5 Trash Management

| ID | Story | Priority |
|----|-------|----------|
| US-19 | As a user, I want a dedicated Trash section in the sidebar, so I can review deleted items | P0 |
| US-20 | As a user, I want to restore items from trash, so I can recover accidentally deleted content | P0 |
| US-21 | As a user, I want trashed items to auto-delete after 30 days, so storage is managed automatically | P1 |
| US-22 | As a user, I want to permanently delete items from trash immediately, so I can free space on demand | P1 |

### 3.6 Import & Sharing

| ID | Story | Priority |
|----|-------|----------|
| US-23 | As a user, I want to import public folders to my library (as references), so I can use curated collections | P1 |
| US-24 | As a user, I want to organize imported items into my own folders, so I can integrate them with my workflow | P1 |

### 3.7 MCP Integration

| ID | Story | Priority |
|----|-------|----------|
| US-25 | As an AI developer, I want `get_by_folder(key)` to return all workflows/prompts in a folder, so I can query organized content | P0 |
| US-26 | As an AI developer, I want to create folders via MCP, so I can programmatically organize content | P1 |
| US-27 | As an AI developer, I want to specify a folder when creating workflows/prompts via MCP, so content is organized from creation | P1 |

---

## 4. Functional Requirements

### 4.1 Navigation System (P0)

| ID | Requirement |
|----|-------------|
| FR-1 | System SHALL provide two view modes: Sidebar Tree View and Main View Navigation |
| FR-2 | User SHALL be able to toggle between view modes via a UI control |
| FR-3 | Sidebar Tree View SHALL display: Folders, Uncategorized, Trash as top-level items |
| FR-4 | Main View Navigation SHALL show folder contents with breadcrumb navigation |
| FR-5 | Single-clicking an item card SHALL select the item (for multi-select operations) |
| FR-6 | Clicking an item's title/name SHALL drill into it (folder→contents, workflow→prompts) |
| FR-7 | Double-clicking an item OR selecting "Preview" from context menu SHALL open preview modal |
| FR-8 | Right-click or dot-menu on item SHALL show "Open in Prompt Studio" option |

### 4.1a Library Search (P0)

| ID | Requirement |
|----|-------------|
| FR-8a | Library SHALL include a search bar in the header area |
| FR-8b | Search SHALL filter items in current view by name (simple text match) |
| FR-8c | Search results SHALL update as user types (debounced, 300ms) |
| FR-8d | Clear button SHALL reset search and show all items |

### 4.2 Folder Management (P0)

| ID | Requirement |
|----|-------------|
| FR-9 | User SHALL be able to create folders via "+ New Folder" button |
| FR-10 | User SHALL be able to create folders via right-click context menu |
| FR-11 | User SHALL be able to rename folders via context menu or inline editing |
| FR-12 | User SHALL be able to delete folders, which moves all contents to Trash |
| FR-13 | Folders SHALL NOT support nesting (no folders inside folders) |
| FR-14 | Folders SHALL have visibility settings: PUBLIC or PRIVATE |
| FR-15 | Folders SHALL have a unique `key` field for MCP access |

### 4.3 Item Organization (P0)

| ID | Requirement |
|----|-------------|
| FR-16 | Workflows and prompts SHALL support membership in multiple folders |
| FR-17 | Items removed from all folders SHALL appear in "Uncategorized" virtual view (items with zero `folder_items` entries) |
| FR-18 | New items created within a folder context SHALL default to that folder |
| FR-19 | User SHALL be prompted to select folder location when creating items |
| FR-20 | Drag-and-drop SHALL support moving items between folders (removes from source, adds to target) |
| FR-21 | Context menu SHALL include "Add to Folder →" submenu to add item to additional folders (primary method for multi-folder) |
| FR-21a | Alt+drag MAY support adding items to additional folders as a shortcut (keeps in source, adds to target) |

### 4.4 Selection & Bulk Operations (P0)

| ID | Requirement |
|----|-------------|
| FR-22 | Ctrl/Cmd+click SHALL toggle individual item selection |
| FR-23 | Shift+click SHALL select range of items |
| FR-24 | Ctrl/Cmd+A SHALL select all items in current view |
| FR-25 | Mouse drag MAY create selection rectangle (lasso select) - P2, deferred |
| FR-26 | Selected items SHALL have visual highlight indicator (checkbox + border) |
| FR-27 | Bulk "Move to Folder" action SHALL be available for selected items |
| FR-28 | Bulk "Move to Trash" action SHALL be available for selected items |
| FR-29 | Bulk "Remove from Folder" action SHALL be available for selected items |
| FR-29a | Bulk "Add to Folder" action SHALL be available for selected items (adds to additional folder) |

### 4.5 Trash System (P0)

| ID | Requirement |
|----|-------------|
| FR-30 | Trash SHALL appear as a special section in the sidebar |
| FR-31 | Trashed items SHALL be restorable to Uncategorized (original folder tracking is P2) |
| FR-32 | Trashed items SHALL be permanently deleted after 30 days via Vercel Cron job |
| FR-33 | User SHALL be able to permanently delete items from Trash immediately |
| FR-34 | Trash view SHALL show item name and deletion date |
| FR-35a | `folder_items` entries SHALL be deleted when item is trashed (restore goes to Uncategorized) |

### 4.6 Display Rules (P0)

| ID | Requirement |
|----|-------------|
| FR-35 | When viewing folder contents: show workflows and standalone prompts |
| FR-36 | When viewing workflow contents: show prompts contained in that workflow |
| FR-37 | Prompts that are inside workflows SHALL NOT appear as standalone items in folder view |
| FR-38 | Items in Trash SHALL NOT appear in regular folder views |

### 4.7 MCP Tools (P0/P1)

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-39 | `get_all_my_prompts` tool SHALL be removed | P0 |
| FR-40 | New `get_by_folder(key)` tool SHALL return workflows and prompts in folder | P0 |
| FR-41 | `get_by_folder` SHALL support pagination with max limit of 100 items per page | P0 |
| FR-42 | `get_by_folder` SHALL only return workflows (not nested prompts) when prompts are inside workflows | P0 |
| FR-43 | `get_by_folder` SHALL require authentication for private folders | P0 |
| FR-44 | New `create_folder` MCP tool SHALL allow folder creation | P1 |
| FR-45 | New `move_to_folder` MCP tool SHALL allow organizing items | P1 |
| FR-46 | `add_workflow` and `add_prompt` SHALL accept optional `folder_id` parameter | P1 |

### 4.8 Discover Page (P0)

| ID | Requirement |
|----|-------------|
| FR-47 | All filter UI components SHALL be removed from Discover page |
| FR-48 | Discover page SHALL display public workflows and prompts in a simple list/grid |
| FR-49 | Simple search functionality SHALL be retained (search by name) |

### 4.9 Onboarding & Empty States (P0)

| ID | Requirement |
|----|-------------|
| FR-50 | Uncategorized view with 3+ items SHALL show prompt: "Create a folder to organize your content" with inline folder creation |
| FR-51 | Empty folder view SHALL show helpful message: "This folder is empty. Drag items here or use 'Add to Folder' from any item." |
| FR-52 | First folder creation SHALL show tooltip: "Drag items here to add them" |
| FR-53 | Empty Library (new user) SHALL show welcome message with "Create your first workflow" and "Create your first folder" actions |

---

## 5. Technical Constraints

### 5.1 Database Schema

The existing schema already supports folders:

```prisma
model folders {
  id          String   @id
  user_id     String
  name        String   @db.VarChar(100)
  description String?  @db.VarChar(500)
  visibility  Visibility @default(PRIVATE)
  is_active   Boolean  @default(true)
  position    Int      @default(0)
  key         String?  @unique @db.VarChar(100)  // Add for MCP access
  deleted_at  DateTime?  // Add for 30-day trash
}

model folder_items {
  id          String     @id
  folder_id   String
  target_type TargetType // WORKFLOW | MINI_PROMPT
  target_id   String
  position    Int        @default(0)
  added_at    DateTime   @default(now())
}
```

**Required Schema Changes:**
1. Add `key` field to `folders` for MCP tool access (unique, auto-generated slug format)
2. Add `deleted_at` field to `folders`, `Workflow`, `MiniPrompt` for 30-day trash
3. Add database indexes on `deleted_at` fields for efficient Trash queries and cron job
4. Remove `FOLDER` from `TargetType` enum (no nested folders)

**Key Definitions:**
- **Uncategorized**: A virtual view showing items with zero `folder_items` entries (NOT a physical folder)
- **Trash**: Items where `deleted_at IS NOT NULL` and within 30-day retention window

### 5.2 Integration Points

| Component | File Path | Changes Required |
|-----------|-----------|------------------|
| Library Page | `/src/app/[locale]/dashboard/library/page.tsx` | Replace with folder-based view |
| Discover Page | `/src/app/[locale]/dashboard/discover/page.tsx` | Remove filters |
| Workflows Section | `/src/views/library/components/WorkflowsSection.tsx` | Replace with folder-aware component |
| MiniPrompts Section | `/src/views/library/components/MiniPromptsSection.tsx` | Replace with folder-aware component |
| MCP Route | `/src/app/api/v1/mcp/route.ts` | Add folder tools, remove `get_all_my_prompts` |
| Discovery Filters | `/src/views/discover/components/DiscoveryFilters.tsx` | Remove/disable |

### 5.3 Patterns to Follow

- **Server Actions**: Use `"use server"` directive, Zod validation, return `{ success, data?, error? }`
- **Soft Delete**: Use `isActive: false` and `deleted_at` timestamp
- **Optimistic UI**: Update immediately, revert on error
- **FSD Architecture**: Views → Widgets → Shared components

---

## 6. UI/UX Requirements

### 6.1 Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│  Header: [Toggle View] [🔍 Search...] [+ Folder] [+ Workflow]│
├──────────────┬──────────────────────────────────────────────┤
│  Sidebar     │  Main Content Area                           │
│  ─────────   │  ─────────────────                           │
│  📁 Folders  │  Breadcrumbs: Home > Folder Name             │
│    📁 Work   │  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐            │
│    📁 Personal│  │ 📄  │ │ 📄  │ │ 📁  │ │ 📄  │            │
│  📄 Uncateg. │  │Item1│ │Item2│ │Sub  │ │Item3│            │
│  🗑️ Trash    │  └─────┘ └─────┘ └─────┘ └─────┘            │
│              │                                              │
└──────────────┴──────────────────────────────────────────────┘
```

**Click Behavior:**
- **Single-click on card** = Select item (for bulk operations)
- **Click on item title** = Drill into item (navigate)
- **Double-click** = Open preview modal

### 6.2 Visual States

| State | Visual Treatment |
|-------|------------------|
| Default item | Standard card/row appearance |
| Hover | Subtle background highlight |
| Selected | Blue border/background, checkbox visible |
| Multi-selected | Same as selected, count badge shown |
| Dragging | Reduced opacity, drag ghost |
| Drop target | Dashed border highlight |

### 6.3 Context Menu Items

**For Folders:**
- Open
- Rename
- Move to Trash
- Copy Link (if public)

**For Workflows/Prompts:**
- Preview
- Open in Prompt Studio
- **Add to Folder →** (submenu with folder list - primary multi-folder method)
- Move to Folder → (removes from current, adds to selected)
- Remove from Folder
- Move to Trash
- Duplicate

**For Trash Items:**
- Restore
- Delete Permanently

**For Multi-Selection:**
- Add to Folder →
- Move to Folder →
- Remove from Folder
- Move to Trash

### 6.4 Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + A` | Select all in view |
| `Ctrl/Cmd + Click` | Toggle selection |
| `Shift + Click` | Range select |
| `Delete / Backspace` | Move to trash |
| `Enter` | Open selected item |
| `Escape` | Clear selection |
| `Ctrl/Cmd + N` | New item in current context |

---

## 7. Phasing & MVP

### Phase 1: MVP (This PRD)

| Feature | Included |
|---------|----------|
| Dual view mode (sidebar + main) | ✅ |
| Folder CRUD operations | ✅ |
| Item organization (add/remove from folders) | ✅ |
| Multi-folder membership via context menu | ✅ |
| Selection mechanics (click, Ctrl+click, Shift+click) | ✅ |
| Bulk operations (move, trash, remove, add to folder) | ✅ |
| Trash with 30-day retention | ✅ |
| Restore from trash | ✅ |
| Preview modal for workflows/prompts | ✅ |
| **Simple search in Library** | ✅ |
| **Simple search in Discover** | ✅ |
| **Onboarding empty states** | ✅ |
| `get_by_folder` MCP tool | ✅ |
| Remove `get_all_my_prompts` | ✅ |
| Remove Discover advanced filters | ✅ |

### Phase 2: Future Enhancements

| Feature | Status |
|---------|--------|
| Lasso/rectangle selection | Deferred |
| Prompt Studio (full editor) | Planned |
| Advanced Discover filters | Planned |
| Public folder discovery | Planned |
| Folder sharing/collaboration | Planned |
| Folder templates | Considered |

---

## 8. Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Folder adoption rate | 50% of active users create ≥1 folder within 30 days | Analytics |
| Organization depth | Average 2+ items per folder | Database query |
| MCP tool adoption | `get_by_folder` used by 30% of MCP integrations | API logs |
| User satisfaction | Positive feedback on folder feature | User feedback |

---

## 9. Open Questions

| # | Question | Owner | Status |
|---|----------|-------|--------|
| 1 | Should we support folder icons/colors for visual organization? | Design | Open |
| 2 | What's the maximum number of items per folder before pagination kicks in? | Engineering | Open |
| 3 | Should drag-drop from Discover to Library folders be supported? | Product | Open |
| 4 | Should the preview modal allow inline editing or always redirect? | Design | Open |

### Resolved Questions

| # | Question | Resolution |
|---|----------|------------|
| 5 | How should we handle the migration of existing items? | **No migration needed.** "Uncategorized" is a virtual view of items with zero `folder_items` entries. All existing items will appear in Uncategorized by default. |
| 6 | How does trash restoration work? | **Simplified for MVP.** Restore always goes to Uncategorized. Original folder tracking deferred to P2. |
| 7 | What scheduler for 30-day auto-deletion? | **Vercel Cron.** Daily cron job to delete items where `deleted_at < NOW() - 30 days`. |
| 8 | What is the click behavior model? | **Single-click = select, Click title = drill.** Single-click on card selects for bulk operations. Click on item title/name drills into it. Double-click opens preview modal. |
| 9 | How do users add items to multiple folders? | **Context menu primary.** "Add to Folder →" submenu is the primary method. Alt+drag is optional shortcut. |
| 10 | Is search available after filter removal? | **Yes.** Simple name-based search retained in both Library and Discover. |

---

## 10. Appendix

### A. MCP Tool Specifications

#### `get_by_folder`

```typescript
// Request
{
  "folder_key": "my-workflows",  // Required: folder key
  "page": 1,                      // Optional: pagination
  "limit": 20                     // Optional: items per page (max 100)
}

// Response
{
  "folder": {
    "id": "uuid",
    "name": "My Workflows",
    "key": "my-workflows",
    "visibility": "PRIVATE"
  },
  "items": [
    {
      "type": "WORKFLOW",
      "id": "uuid",
      "name": "Workflow Name",
      "description": "...",
      "position": 0
    },
    {
      "type": "MINI_PROMPT",
      "id": "uuid",
      "name": "Prompt Name",
      "content": "...",
      "position": 1
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "hasMore": true
  }
}
```

#### `create_folder`

```typescript
// Request
{
  "name": "My New Folder",        // Required
  "description": "Optional desc", // Optional
  "visibility": "PRIVATE",        // Optional, default PRIVATE
  "key": "my-new-folder"          // Optional, auto-generated if not provided
}

// Response
{
  "id": "uuid",
  "name": "My New Folder",
  "key": "my-new-folder",
  "visibility": "PRIVATE"
}
```

### B. Database Migration Notes

1. **Add fields to existing tables:**
   - `folders.key` (unique, for MCP access)
   - `folders.deleted_at` (nullable timestamp)
   - `Workflow.deleted_at` (nullable timestamp)
   - `MiniPrompt.deleted_at` (nullable timestamp)

2. **Modify TargetType enum:**
   - Remove `FOLDER` value (no nested folders)

3. **Data migration:**
   - All existing workflows/prompts without folder assignments remain accessible via "Uncategorized"
   - No data loss during migration

### C. Related Documents

- [Technical Context Analysis](./technical-context.md)
- [Existing Schema Reference](../../prisma/schema.prisma)
- [FSD Architecture Guide](../../CLAUDE.md)

---

*End of PRD*
