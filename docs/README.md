# Agents Playbook Documentation

**Welcome to the comprehensive documentation for the Agents Playbook platform.**

This documentation is organized into logical categories to help you quickly find the information you need.

---

## Quick Navigation

- [Architecture](#architecture) - System design and technical architecture
- [Product Requirements](#product-requirements) - Feature specifications and PRDs
- [Guides](#guides) - How-to guides and best practices
- [Technical References](#technical-references) - Deep technical documents
- [Archive](#archive) - Historical documents and deprecated specs

---

## Architecture

System design documents and architectural decision records.

| Document | Description |
|----------|-------------|
| [MCP System Architecture](./architecture/mcp-system.md) | Complete MCP (Model Context Protocol) system design, data models, handlers, and tool specifications |

---

## Product Requirements

Feature specifications, product requirement documents, and design artifacts.

| Document | Status | Description |
|----------|--------|-------------|
| [Skills Feature PRD](./prd/skills-feature.md) | Active | Complete specification for Skills feature - MD-based instruction files with attachments, Skill Studio UI, and MCP integration |
| [Library File System Redesign](./prd/library-file-system-redesign.md) | Completed | Folder-based organization system for workflows and prompts with MCP tools |
| [Skill Studio Design](./prd/skill-studio-design.html) | Active | UI design artifact for Skill Studio interface |

---

## Guides

How-to guides, tutorials, and best practices for development and usage.

| Document | Audience | Description |
|----------|----------|-------------|
| [Development Setup Guide](./guides/development-setup.md) | Developers | Complete setup instructions, commands, and troubleshooting |
| [MCP Integration Guide](./guides/mcp-integration.md) | Developers/Users | How to integrate Agents Playbook with Claude Code, Cursor, and other AI assistants |
| [Integration Testing Guide](./guides/integration-testing.md) | Developers | How to write and run integration tests for the AI chat pipeline |

---

## Technical References

Deep technical documentation, troubleshooting guides, and implementation details.

| Document | Category | Description |
|----------|----------|-------------|
| [BCrypt & Edge Runtime Solution](./technical/bcrypt-edge-runtime-solution.md) | Authentication | How to handle bcrypt in Next.js Edge Runtime with NextAuth v5 |
| [Development Learnings](./technical/development-learnings.md) | Best Practices | Accumulated knowledge about architecture patterns, technical gotchas, and development workflows |

---

## Archive

Historical documents, deprecated specifications, and superseded designs.

These documents are preserved for reference but may no longer reflect the current implementation.

| Document | Archived Date | Reason |
|----------|---------------|--------|
| [Library File System - Business Review](./archive/library-file-system-business-review.md) | 2025-01-20 | Feature completed |
| [Library File System - Verification](./archive/library-file-system-redesign-verification.md) | 2025-01-20 | Feature completed |
| [Library File System - Report](./archive/library-file-system-report.md) | 2025-01-20 | Feature completed |
| [Library File System - Test Cases](./archive/library-file-system-test-cases.md) | 2025-01-20 | Feature completed |
| [Skills Feature Brief](./archive/skills-feature-brief.md) | 2025-01-24 | Superseded by full PRD |

---

## Root Documentation

Essential project documentation located in the repository root:

- [README.md](../README.md) - Project overview, setup instructions, and quick start guide
- [CLAUDE.md](../CLAUDE.md) - Quick reference for Claude Code (commands, troubleshooting, UI learnings)

---

## Documentation Standards

### File Naming Convention

All documentation files follow kebab-case naming:
- `feature-name-prd.md` for product requirements
- `system-name-architecture.md` for architecture docs
- `topic-guide.md` for guides
- `topic-reference.md` for technical references

### Document Structure

Each document should include:
1. Clear title and purpose
2. Table of contents (for longer docs)
3. Overview/Problem statement
4. Main content with clear sections
5. Related documents or next steps

### Maintenance

- Active documents are reviewed and updated regularly
- Outdated documents are moved to `archive/` with reason noted
- Deprecated information is never deleted without archiving first
- Each archive entry includes date and reason for archival

---

## Contributing to Documentation

When adding new documentation:

1. Choose the appropriate category folder
2. Use descriptive, kebab-case filenames
3. Add entry to this index
4. Follow the document structure standards
5. Link to related documents where relevant

When updating documentation:

1. Update the document's "Last Updated" date if present
2. Update related documents if the change affects them
3. Update this index if the document's purpose changes

When archiving documentation:

1. Move to `archive/` folder
2. Add to archive table with date and reason
3. Update any references to the document

---

## Document Lifecycle

```
Draft → Active → Superseded → Archived
   ↓       ↓          ↓           ↓
  WIP   Current   Outdated   Historical
```

- **Draft**: Work in progress, may be incomplete
- **Active**: Current and maintained
- **Superseded**: Replaced by newer version but kept for reference
- **Archived**: Historical record, no longer relevant to current implementation

---

*Last Updated: 2026-01-26*
