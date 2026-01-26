# Library File System Redesign - Test Cases

## Overview

This document lists all test cases for the Library File System Redesign feature. Each test case includes its type, priority, implementation status, and expected results.

---

## 1. Folder Service Tests

### 1.1 Key Generation

**TC-FS-001: Generate unique slug from folder name**
- **Type**: Unit
- **Priority**: P1
- **Status**: Implemented
- **File**: `/src/server/folders/__tests__/folder-service.test.ts`
- **Details**: Call `generateFolderKey("My Test Folder", userId)`
- **Expected Result**: Returns `"my-test-folder"`

**TC-FS-002: Handle special characters in name**
- **Type**: Unit
- **Priority**: P1
- **Status**: Implemented
- **Details**: Call `generateFolderKey("Test!@#$%^&*()Folder", userId)`
- **Expected Result**: Returns `"test-folder"` (special chars removed)

**TC-FS-003: Truncate long names to 80 characters**
- **Type**: Unit
- **Priority**: P2
- **Status**: Implemented
- **Details**: Call with name of 100+ characters
- **Expected Result**: Key is <= 80 characters

**TC-FS-004: Add suffix for duplicate keys**
- **Type**: Unit
- **Priority**: P0
- **Status**: Implemented
- **Details**: Generate key when same key already exists
- **Expected Result**: Returns key with random 8-char suffix

### 1.2 Folder CRUD

**TC-FS-005: Get user folders**
- **Type**: Unit
- **Priority**: P0
- **Status**: Implemented
- **Details**: Call `getUserFolders(userId)`
- **Expected Result**: Returns array of folders with item counts, ordered by position

**TC-FS-006: Filter deleted folders from list**
- **Type**: Unit
- **Priority**: P0
- **Status**: Implemented
- **Details**: Verify query includes `deleted_at: null`
- **Expected Result**: Only active folders returned

**TC-FS-007: Get folder by ID**
- **Type**: Unit
- **Priority**: P0
- **Status**: Implemented
- **Details**: Call `getFolderById(folderId, userId)`
- **Expected Result**: Returns folder details or "Folder not found" error

**TC-FS-008: Get folder by key - public access**
- **Type**: Unit
- **Priority**: P1
- **Status**: Implemented
- **Details**: Call `getFolderByKey("public-folder")` without userId
- **Expected Result**: Returns public folder successfully

**TC-FS-009: Get folder by key - private access denied**
- **Type**: Unit
- **Priority**: P0
- **Status**: Implemented
- **Details**: Call `getFolderByKey("private-folder", otherUserId)`
- **Expected Result**: Returns "Access denied" error

**TC-FS-010: Create folder with auto-generated key**
- **Type**: Unit
- **Priority**: P0
- **Status**: Implemented
- **Details**: Call `createFolder({ name: "New Folder" }, userId)`
- **Expected Result**: Folder created with auto-generated key and next position

**TC-FS-011: Create folder with custom key**
- **Type**: Unit
- **Priority**: P1
- **Status**: Implemented
- **Details**: Call `createFolder({ name: "Folder", key: "custom-key" }, userId)`
- **Expected Result**: Folder created with provided key

**TC-FS-012: Update folder name**
- **Type**: Unit
- **Priority**: P0
- **Status**: Implemented
- **Details**: Call `updateFolder(folderId, { name: "New Name" }, userId)`
- **Expected Result**: Folder name updated

**TC-FS-013: Delete folder (soft delete)**
- **Type**: Unit
- **Priority**: P0
- **Status**: Implemented
- **Details**: Call `deleteFolder(folderId, userId)`
- **Expected Result**: Folder marked with deleted_at, folder_items removed

### 1.3 Item Organization

**TC-FS-014: Add workflow to folder**
- **Type**: Unit
- **Priority**: P0
- **Status**: Implemented
- **Details**: Call `addItemToFolder(folderId, "WORKFLOW", workflowId, userId)`
- **Expected Result**: folder_items entry created with position

**TC-FS-015: Add prompt to folder**
- **Type**: Unit
- **Priority**: P0
- **Status**: Implemented
- **Details**: Call `addItemToFolder(folderId, "MINI_PROMPT", promptId, userId)`
- **Expected Result**: folder_items entry created

**TC-FS-016: No-op when item already in folder**
- **Type**: Unit
- **Priority**: P1
- **Status**: Implemented
- **Details**: Add same item twice
- **Expected Result**: Success returned, no duplicate entry

**TC-FS-017: Remove item from folder**
- **Type**: Unit
- **Priority**: P0
- **Status**: Implemented
- **Details**: Call `removeItemFromFolder(folderId, type, targetId, userId)`
- **Expected Result**: folder_items entry deleted

**TC-FS-018: Move item between folders**
- **Type**: Unit
- **Priority**: P1
- **Status**: Implemented
- **Details**: Call `moveItemBetweenFolders(sourceId, targetId, type, targetId, userId)`
- **Expected Result**: Item removed from source, added to target

**TC-FS-019: Bulk add items to folder**
- **Type**: Unit
- **Priority**: P1
- **Status**: Implemented
- **Details**: Call `bulkAddToFolder` with array of items
- **Expected Result**: All items added (failures logged, not blocking)

### 1.4 Uncategorized Items

**TC-FS-020: Get uncategorized items**
- **Type**: Unit
- **Priority**: P0
- **Status**: Implemented
- **Details**: Call `getUncategorizedItems(userId)`
- **Expected Result**: Returns workflows/prompts not in any folder

**TC-FS-021: Exclude items in folders**
- **Type**: Unit
- **Priority**: P0
- **Status**: Implemented
- **Details**: Workflow in folder should not appear
- **Expected Result**: Only truly uncategorized items returned

**TC-FS-022: Exclude prompts in workflows**
- **Type**: Unit
- **Priority**: P0
- **Status**: Implemented
- **Details**: Prompts that are part of workflow stages excluded
- **Expected Result**: Only standalone prompts in results

### 1.5 Trash Management

**TC-FS-023: Move item to trash**
- **Type**: Unit
- **Priority**: P0
- **Status**: Implemented
- **Details**: Call `moveItemToTrash("WORKFLOW", workflowId, userId)`
- **Expected Result**: deletedAt set, removed from all folders

**TC-FS-024: Get trashed items**
- **Type**: Unit
- **Priority**: P0
- **Status**: Implemented
- **Details**: Call `getTrashedItems(userId)`
- **Expected Result**: Returns items with deletedAt set, sorted by date

**TC-FS-025: Restore from trash**
- **Type**: Unit
- **Priority**: P0
- **Status**: Implemented
- **Details**: Call `restoreFromTrash("WORKFLOW", workflowId, userId)`
- **Expected Result**: deletedAt cleared, item goes to uncategorized

**TC-FS-026: Permanent delete**
- **Type**: Unit
- **Priority**: P0
- **Status**: Implemented
- **Details**: Call `permanentDelete("WORKFLOW", workflowId, userId)`
- **Expected Result**: Record completely deleted

**TC-FS-027: Cannot restore non-trashed item**
- **Type**: Unit
- **Priority**: P1
- **Status**: Implemented
- **Details**: Try to restore item not in trash
- **Expected Result**: "Workflow not found in trash" error

---

## 2. React Hook Tests

### 2.1 useSelection

**TC-HOOK-001: Single click selection**
- **Type**: Unit
- **Priority**: P0
- **Status**: Implemented
- **File**: `/src/views/library-v2/hooks/__tests__/useSelection.test.ts`
- **Details**: Call `select(itemId)`
- **Expected Result**: Only that item selected, others cleared

**TC-HOOK-002: Toggle selection (Ctrl+click)**
- **Type**: Unit
- **Priority**: P0
- **Status**: Implemented
- **Details**: Call `toggle(itemId)` on unselected item
- **Expected Result**: Item added to selection

**TC-HOOK-003: Untoggle selection**
- **Type**: Unit
- **Priority**: P0
- **Status**: Implemented
- **Details**: Call `toggle(itemId)` on selected item
- **Expected Result**: Item removed from selection

**TC-HOOK-004: Range selection (Shift+click)**
- **Type**: Unit
- **Priority**: P0
- **Status**: Implemented
- **Details**: Select item-2, then rangeSelect(item-4)
- **Expected Result**: Items 2, 3, 4 selected

**TC-HOOK-005: Range selection reverse direction**
- **Type**: Unit
- **Priority**: P1
- **Status**: Implemented
- **Details**: Select item-4, then rangeSelect(item-2)
- **Expected Result**: Items 2, 3, 4 selected

**TC-HOOK-006: Select all**
- **Type**: Unit
- **Priority**: P0
- **Status**: Implemented
- **Details**: Call `selectAll()`
- **Expected Result**: All items selected

**TC-HOOK-007: Clear selection**
- **Type**: Unit
- **Priority**: P0
- **Status**: Implemented
- **Details**: Call `clearSelection()`
- **Expected Result**: No items selected

**TC-HOOK-008: Keyboard Ctrl+A**
- **Type**: Unit
- **Priority**: P1
- **Status**: Implemented
- **Details**: Dispatch keydown event with ctrlKey
- **Expected Result**: All items selected

**TC-HOOK-009: Keyboard Escape**
- **Type**: Unit
- **Priority**: P1
- **Status**: Implemented
- **Details**: Dispatch Escape keydown
- **Expected Result**: Selection cleared

**TC-HOOK-010: Keyboard Delete triggers callback**
- **Type**: Unit
- **Priority**: P1
- **Status**: Implemented
- **Details**: Press Delete with items selected
- **Expected Result**: onDeleteRequest callback called

### 2.2 useLibrarySearch

**TC-HOOK-011: Initial state returns all items**
- **Type**: Unit
- **Priority**: P0
- **Status**: Implemented
- **File**: `/src/views/library-v2/hooks/__tests__/useLibrarySearch.test.ts`
- **Details**: Create hook with items, no query
- **Expected Result**: filteredItems equals all items

**TC-HOOK-012: Query debouncing**
- **Type**: Unit
- **Priority**: P0
- **Status**: Implemented
- **Details**: Set query, advance timer 300ms
- **Expected Result**: debouncedQuery updates after delay

**TC-HOOK-013: Case-insensitive filtering**
- **Type**: Unit
- **Priority**: P0
- **Status**: Implemented
- **Details**: Search "react" should match "React Tutorial"
- **Expected Result**: Case-insensitive matches returned

**TC-HOOK-014: Description search enabled**
- **Type**: Unit
- **Priority**: P1
- **Status**: Implemented
- **Details**: Search for text in description
- **Expected Result**: Items with matching description included

**TC-HOOK-015: Description search disabled**
- **Type**: Unit
- **Priority**: P1
- **Status**: Implemented
- **Details**: Set searchDescriptions: false, search description text
- **Expected Result**: No matches found

**TC-HOOK-016: Clear search**
- **Type**: Unit
- **Priority**: P0
- **Status**: Implemented
- **Details**: Call clearSearch()
- **Expected Result**: Query and debouncedQuery reset to empty

---

## 3. API Route Tests

### 3.1 GET /api/folders

**TC-API-001: List folders with authentication**
- **Type**: Integration
- **Priority**: P0
- **Status**: Implemented
- **File**: `/src/app/api/folders/__tests__/route.test.ts`
- **Details**: GET request with valid session
- **Expected Result**: 200 with folders array including item counts

**TC-API-002: List folders without authentication**
- **Type**: Integration
- **Priority**: P0
- **Status**: Implemented
- **Details**: GET request without session
- **Expected Result**: 401 Unauthorized

### 3.2 POST /api/folders

**TC-API-003: Create folder success**
- **Type**: Integration
- **Priority**: P0
- **Status**: Implemented
- **Details**: POST with { name: "New Folder" }
- **Expected Result**: 200 with created folder

**TC-API-004: Create folder missing name**
- **Type**: Integration
- **Priority**: P0
- **Status**: Implemented
- **Details**: POST with empty body
- **Expected Result**: 400 "Name is required"

**TC-API-005: Create folder invalid JSON**
- **Type**: Integration
- **Priority**: P1
- **Status**: Implemented
- **Details**: POST with malformed JSON
- **Expected Result**: 400 "Invalid request body"

### 3.3 GET /api/folders/[id]

**TC-API-006: Get folder by ID**
- **Type**: Integration
- **Priority**: P0
- **Status**: Implemented
- **File**: `/src/app/api/folders/[id]/__tests__/route.test.ts`
- **Details**: GET with valid folder ID
- **Expected Result**: 200 with folder details

**TC-API-007: Get non-existent folder**
- **Type**: Integration
- **Priority**: P0
- **Status**: Implemented
- **Details**: GET with invalid folder ID
- **Expected Result**: 404 "Folder not found"

### 3.4 PATCH /api/folders/[id]

**TC-API-008: Update folder name**
- **Type**: Integration
- **Priority**: P0
- **Status**: Implemented
- **Details**: PATCH with { name: "Updated" }
- **Expected Result**: 200 with updated folder

**TC-API-009: Update folder visibility**
- **Type**: Integration
- **Priority**: P1
- **Status**: Implemented
- **Details**: PATCH with { visibility: "PUBLIC" }
- **Expected Result**: 200 with updated visibility

### 3.5 DELETE /api/folders/[id]

**TC-API-010: Delete folder**
- **Type**: Integration
- **Priority**: P0
- **Status**: Implemented
- **Details**: DELETE request
- **Expected Result**: 200 with { success: true }

**TC-API-011: Delete non-existent folder**
- **Type**: Integration
- **Priority**: P0
- **Status**: Implemented
- **Details**: DELETE with invalid ID
- **Expected Result**: 500 "Folder not found"

---

## 4. MCP Handler Tests

### 4.1 get_by_folder

**TC-MCP-001: Get public folder unauthenticated**
- **Type**: Integration
- **Priority**: P0
- **Status**: Implemented
- **File**: `/src/server/mcp-tools-db/__tests__/get-by-folder-handler.test.ts`
- **Details**: Call handler with null userId for public folder
- **Expected Result**: Success with folder contents

**TC-MCP-002: Get private folder denied**
- **Type**: Integration
- **Priority**: P0
- **Status**: Implemented
- **Details**: Call handler with different userId for private folder
- **Expected Result**: "Access denied" error

**TC-MCP-003: Pagination metadata**
- **Type**: Integration
- **Priority**: P1
- **Status**: Implemented
- **Details**: Call with page=1, limit=20, total=50
- **Expected Result**: pagination.hasMore = true

**TC-MCP-004: Limit clamped to 100**
- **Type**: Integration
- **Priority**: P2
- **Status**: Implemented
- **Details**: Call with limit=500
- **Expected Result**: pagination.limit = 100

**TC-MCP-005: Deleted folder returns error**
- **Type**: Integration
- **Priority**: P0
- **Status**: Implemented
- **Details**: Call with deleted folder key
- **Expected Result**: "Folder not found" error

### 4.2 create_folder

**TC-MCP-006: Authentication required**
- **Type**: Integration
- **Priority**: P0
- **Status**: Implemented
- **File**: `/src/server/mcp-tools-db/__tests__/create-folder-handler.test.ts`
- **Details**: Call handler with null userId
- **Expected Result**: "Authentication required" response

**TC-MCP-007: Create folder success**
- **Type**: Integration
- **Priority**: P0
- **Status**: Implemented
- **Details**: Call with valid name and userId
- **Expected Result**: Success message with folder details

**TC-MCP-008: Name validation**
- **Type**: Integration
- **Priority**: P0
- **Status**: Implemented
- **Details**: Call with empty name
- **Expected Result**: "name is required" error

**TC-MCP-009: Input trimming**
- **Type**: Integration
- **Priority**: P1
- **Status**: Implemented
- **Details**: Call with whitespace-padded name
- **Expected Result**: Name trimmed in created folder

---

## Summary Statistics

| Category | Total | P0 | P1 | P2 | Implemented |
|----------|-------|----|----|----| ------------|
| Folder Service | 27 | 19 | 7 | 1 | 27 (100%) |
| React Hooks | 16 | 10 | 6 | 0 | 16 (100%) |
| API Routes | 11 | 8 | 2 | 1 | 11 (100%) |
| MCP Handlers | 9 | 5 | 3 | 1 | 9 (100%) |
| **Total** | **63** | **42** | **18** | **3** | **63 (100%)** |

---

*Document generated: 2026-01-20*
*Feature: Library File System Redesign*
