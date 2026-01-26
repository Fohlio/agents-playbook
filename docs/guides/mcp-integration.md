# MCP Integration Guide

Complete guide for integrating Agents Playbook with AI assistants using the Model Context Protocol (MCP).

---

## Overview

The MCP server provides AI assistants with access to workflows, skills, and prompts through a standardized protocol. This enables Claude Code, Cursor, and other MCP-compatible tools to discover and use your workflows programmatically.

**MCP Endpoint:** `https://agents-playbook.com/api/v1/mcp` (production)
**Local Development:** `http://localhost:3012/api/v1/mcp`

---

## Quick Start

### 1. Get Your API Token

1. Sign up at [agents-playbook.com](https://agents-playbook.com)
2. Navigate to **Settings → API Tokens**
3. Click **"Create New Token"**
4. Copy the generated token (it won't be shown again)

### 2. Configure Your AI Assistant

Choose your tool:
- [Claude Code Setup](#claude-code-setup)
- [Cursor Setup](#cursor-setup)
- [Generic MCP Client Setup](#generic-mcp-client-setup)

---

## Claude Code Setup

### Configuration

Add to your `claude_desktop_config.json`:

**Location:**
- **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

**Configuration:**
```json
{
  "mcpServers": {
    "agents-playbook": {
      "url": "https://agents-playbook.com/api/v1/mcp",
      "headers": {
        "Authorization": "Bearer your-api-token-here"
      }
    }
  }
}
```

### Usage Examples

**Discover Workflows:**
```
Find a workflow for code review
```

**Select and Execute:**
```
Use the code-review workflow from agents-playbook
```

**Create Content:**
```
Create a new workflow in my agents-playbook library for API testing
```

---

## Cursor Setup

### Configuration

Add to Cursor MCP settings:

**Location:** File → Preferences → Cursor Settings → Features → MCP

```json
{
  "mcpServers": {
    "agents-playbook": {
      "url": "https://agents-playbook.com/api/v1/mcp",
      "description": "AI Agent Workflow Engine",
      "headers": {
        "Authorization": "Bearer your-api-token-here"
      }
    }
  }
}
```

### Usage in Cursor

Cursor will automatically discover available MCP tools. Use natural language:
```
@agents-playbook find workflows for documentation
```

---

## Generic MCP Client Setup

For custom integrations or other MCP-compatible tools:

### HTTP Endpoint

```
POST https://agents-playbook.com/api/v1/mcp
Content-Type: application/json
Authorization: Bearer your-api-token
```

### Request Format

```json
{
  "tool": "get_available_workflows",
  "arguments": {
    "task": "code review workflow"
  }
}
```

### Response Format

```json
{
  "content": [
    {
      "type": "text",
      "text": "[JSON response data]"
    }
  ]
}
```

---

## Available MCP Tools

### Discovery Tools

#### get_available_workflows

Search for workflows using semantic search.

**Arguments:**
- `task` (string, required): Description of what you want to accomplish

**Example:**
```json
{
  "tool": "get_available_workflows",
  "arguments": {
    "task": "refactoring legacy code"
  }
}
```

**Returns:** List of matching workflows with relevance scores.

#### get_skills

Search for skills using text or semantic search.

**Arguments:**
- `task_description` (string, optional): What you want the skill to help with
- `search_text` (string, optional): Text search in skill names/content

**Example:**
```json
{
  "tool": "get_skills",
  "arguments": {
    "task_description": "database migration"
  }
}
```

**Returns:** List of matching skills.

---

### Selection Tools

#### select_workflow

Get a complete workflow with execution plan.

**Arguments:**
- `workflow_id` (string, required): Workflow ID or key

**Example:**
```json
{
  "tool": "select_workflow",
  "arguments": {
    "workflow_id": "code-review-workflow"
  }
}
```

**Returns:** Complete workflow with stages, prompts, and execution plan.

#### get_next_step

Get a specific step from a workflow execution plan.

**Arguments:**
- `workflow_id` (string, required): Workflow ID
- `step_index` (number, required): Zero-based step index

**Example:**
```json
{
  "tool": "get_next_step",
  "arguments": {
    "workflow_id": "code-review-workflow",
    "step_index": 0
  }
}
```

**Returns:** Step content and details.

#### get_selected_skill

Get complete skill details including attachments.

**Arguments:**
- `skill_id` (string, required): Skill ID or key

**Example:**
```json
{
  "tool": "get_selected_skill",
  "arguments": {
    "skill_id": "data-processing-7a9x"
  }
}
```

**Returns:** Skill content, metadata, and attachment URLs.

#### get_workflow

Get workflow details without execution plan.

**Arguments:**
- `workflow_id` (string, required): Workflow ID or key

---

### CRUD Tools

#### add_workflow

Create a new workflow.

**Arguments:**
- `name` (string, required): Workflow name
- `description` (string, optional): Workflow description
- `complexity` (string, optional): XS, S, M, L, or XL
- `tags` (array, optional): Array of tag names
- `folder_id` (string, optional): Folder to add to

**Example:**
```json
{
  "tool": "add_workflow",
  "arguments": {
    "name": "API Testing Workflow",
    "description": "Comprehensive API testing process",
    "complexity": "M",
    "tags": ["testing", "api"]
  }
}
```

**Requires Authentication:** Yes

#### edit_workflow

Update an existing workflow.

**Arguments:**
- `workflow_id` (string, required): Workflow ID
- `name` (string, optional): New name
- `description` (string, optional): New description
- `is_active` (boolean, optional): Soft delete by setting to false

**Requires Authentication:** Yes (owner only)

#### add_skill

Create a new skill.

**Arguments:**
- `name` (string, required): Skill name
- `content` (string, required): Markdown content
- `description` (string, optional): Brief description
- `tags` (array, optional): Array of tag names
- `folder_id` (string, optional): Folder to add to

**Example:**
```json
{
  "tool": "add_skill",
  "arguments": {
    "name": "Database Migration",
    "content": "# Database Migration\n\nSteps for safe migrations...",
    "tags": ["database", "devops"]
  }
}
```

**Requires Authentication:** Yes

#### edit_skill

Update an existing skill.

**Arguments:**
- `skill_id` (string, required): Skill ID
- `name` (string, optional): New name
- `content` (string, optional): New content
- `is_active` (boolean, optional): Soft delete by setting to false

**Requires Authentication:** Yes (owner only)

---

### Folder Tools

#### create_folder

Create a new folder for organization.

**Arguments:**
- `name` (string, required): Folder name
- `description` (string, optional): Folder description
- `visibility` (string, optional): PUBLIC or PRIVATE (default: PRIVATE)

**Requires Authentication:** Yes

#### get_by_folder

List contents of a folder.

**Arguments:**
- `folder_key` (string, required): Folder key
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (max 100)

**Returns:** Workflows and skills in the folder.

---

## Authentication

### API Token Authentication

**Header:**
```
Authorization: Bearer your-api-token
```

### Unauthenticated Access

Without authentication, tools return:
- Public system workflows
- Public system skills
- Public folders

With authentication, tools return:
- All of the above, plus:
- Your private content
- Your personal library

### Token Security

- Store tokens securely (use environment variables)
- Never commit tokens to version control
- Rotate tokens regularly
- Revoke tokens if compromised

---

## Local Development

### Setup

1. Start local dev server:
```bash
npm run dev
```

2. Use local endpoint in MCP config:
```json
{
  "mcpServers": {
    "agents-playbook-local": {
      "url": "http://localhost:3012/api/v1/mcp"
    }
  }
}
```

### Testing Without Auth

For local testing, you can skip authentication:

```bash
DANGEROUSLY_OMIT_AUTH=true npx @modelcontextprotocol/inspector@latest http://localhost:3012/api/v1/mcp
```

**Warning:** Only use this in local development. Never in production.

### MCP Inspector

Test MCP tools with the official inspector:

```bash
npx @modelcontextprotocol/inspector@latest http://localhost:3012/api/v1/mcp
```

---

## Common Use Cases

### Use Case 1: Execute a Workflow

```
1. User: "Find a workflow for code review"
   → Tool: get_available_workflows(task="code review")

2. User: "Use the first one"
   → Tool: select_workflow(workflow_id="code-review-workflow")

3. User: "What's the first step?"
   → Tool: get_next_step(workflow_id="code-review-workflow", step_index=0)

4. User: "Next step"
   → Tool: get_next_step(workflow_id="code-review-workflow", step_index=1)
```

### Use Case 2: Create and Organize Content

```
1. User: "Create a folder for my testing workflows"
   → Tool: create_folder(name="Testing Workflows")

2. User: "Create a new workflow for API testing"
   → Tool: add_workflow(name="API Testing", folder_id="...")

3. User: "Show me what's in my testing folder"
   → Tool: get_by_folder(folder_key="testing-workflows")
```

### Use Case 3: Find and Use a Skill

```
1. User: "Find a skill for database migrations"
   → Tool: get_skills(task_description="database migration")

2. User: "Show me the details of that skill"
   → Tool: get_selected_skill(skill_id="database-migration-x7y2")
```

---

## Troubleshooting

### Tool Returns "Authentication required"

**Problem:** Tool requires authentication but no token provided.

**Solution:** Add `Authorization: Bearer your-token` header to MCP config.

### Tool Returns Empty Results

**Problem:** No matching workflows/skills found.

**Possible causes:**
1. Search query too specific
2. No public content available (if unauthenticated)
3. Content not yet indexed

**Solutions:**
1. Try broader search terms
2. Authenticate to access your content
3. Wait a few minutes for indexing (new content)

### Tool Returns "Access denied"

**Problem:** Trying to access private content without permission.

**Solution:** Content is private. Either:
1. Authenticate as the owner
2. Ask owner to make it public
3. Import public version to your library

### Token Expired or Invalid

**Problem:** Authentication fails with valid-looking token.

**Solutions:**
1. Regenerate token in dashboard
2. Check token wasn't truncated when copied
3. Verify no extra spaces in config
4. Check token hasn't been revoked

---

## Best Practices

### Workflow Design

1. **Clear Names**: Use descriptive workflow names for better search
2. **Good Descriptions**: Include key terms AI will search for
3. **Appropriate Complexity**: Set complexity level accurately
4. **Useful Tags**: Add relevant tags for filtering

### Performance

1. **Pagination**: Use pagination for large folders
2. **Specific Searches**: Provide detailed search queries
3. **Cache Results**: Store workflow IDs to avoid repeated searches

### Security

1. **Private by Default**: Keep sensitive workflows private
2. **Token Rotation**: Rotate API tokens regularly
3. **Minimal Permissions**: Use separate tokens for different purposes
4. **Audit Access**: Review API token usage in dashboard

---

## Rate Limits

Current rate limits (subject to change):

- **Authenticated requests:** 100 requests/minute
- **Unauthenticated requests:** 20 requests/minute
- **Bulk operations:** 10 operations/minute

Rate limit headers in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1640000000
```

---

## Support and Resources

### Documentation

- [MCP System Architecture](../architecture/mcp-system.md) - Technical implementation details
- [Development Setup](./development-setup.md) - Local development guide

### Getting Help

- Check [troubleshooting section](#troubleshooting) above
- Review [common use cases](#common-use-cases)
- Verify token configuration
- Test with MCP Inspector

### API Changes

MCP API is versioned. Current version: `v1`

Breaking changes will result in new version endpoint. We maintain backwards compatibility within major versions.

---

*Last Updated: 2026-01-26*
