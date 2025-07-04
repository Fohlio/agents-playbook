# TRD • AI Workflow MCP Server

## 📋 Overview
**Project**: MCP Server for AI Agent Workflow Management  
**Repository**: `agents-workflow-mcp`  
**Complexity**: Standard (6/10)  
**Platform**: Vercel + TypeScript + Next.js  

## 🎯 Business Requirements
Create an MCP server that provides AI models with workflow recommendations based on their tasks, leveraging the existing `agents-playbook` prompts collection.

## 🏗️ Technical Architecture

### Core Functionality
1. **Workflow Discovery** - Analyze task and recommend appropriate workflows
2. **Workflow Delivery** - Provide complete step-by-step workflows 
3. **Progress Tracking** - Support "next step" requests within workflows

### Data Structure Strategy
**Source of Truth**: MD files (existing prompts)  
**Runtime Optimization**: JSON index/cache generated at startup  
**Sync Strategy**: Parse MD frontmatter + content → generate JSON mapping

### MCP Tools Design
```typescript
interface MCPTools {
  get_available_workflows(task_description: string): WorkflowOption[]
  select_workflow(workflow_id: string): WorkflowDetails  
  get_next_step(workflow_id: string, current_step: number): StepDetails
}
```

## 📂 Project Structure
```
/
├── src/
│   ├── app/
│   │   └── api/
│   │       └── mcp/
│   │           └── route.ts          # MCP endpoint
│   ├── lib/
│   │   ├── workflow-parser.ts        # MD → JSON parser
│   │   ├── workflow-matcher.ts       # Task → Workflow matching
│   │   └── mcp-tools.ts             # MCP tool implementations
│   └── data/
│       └── workflows.json           # Generated cache
└── agents-playbook/                 # Source MD files
```

## 🔧 Implementation Details

### Phase 1: Core MCP Setup
- [x] Next.js app with `@vercel/mcp-adapter`
- [ ] Basic MCP route with placeholder tools
- [ ] Zod schemas for validation (flexible)
- [ ] Error logging setup

### Phase 2: Workflow Engine  
- [ ] MD file parser (frontmatter + content)
- [ ] JSON cache generation
- [ ] Workflow matching algorithm (keyword-based)
- [ ] Step navigation logic

### Phase 3: MCP Tools Implementation
- [ ] `get_available_workflows` - search and recommend
- [ ] `select_workflow` - return full workflow
- [ ] `get_next_step` - track progress

### Phase 4: Testing & Deployment
- [ ] Local MCP inspector testing
- [ ] Vercel deployment
- [ ] Integration testing with Cursor/Claude

## 📊 Data Schemas

### Workflow JSON Structure
```json
{
  "workflows": [
    {
      "id": "product-development",
      "title": "Product Development",
      "description": "Product idea → comprehensive planning",
      "complexity": "High",
      "keywords": ["product", "planning", "idea", "prd"],
      "file_path": "planning/product-development-prompt.md",
      "steps": [
        {
          "step": 1,
          "title": "Research & Analysis",
          "description": "...",
          "estimated_time": "2-4 hours"
        }
      ],
      "next_workflows": ["trd-creation", "development-kickoff"]
    }
  ]
}
```

### MCP Response Formats
```typescript
interface WorkflowOption {
  id: string
  title: string
  description: string
  complexity: 'Simple' | 'Standard' | 'Complex'
  match_score: number
}

interface StepDetails {
  current_step: number
  total_steps: number
  title: string
  content: string
  next_available: boolean
  suggested_next_workflows?: string[]
}
```

## 🚀 Deployment Configuration

### Environment Variables
```env
# Optional
WORKFLOW_CACHE_TTL=3600
LOG_LEVEL=error
NODE_ENV=production
```

### Vercel Deployment
- Route: `/api/mcp`
- Runtime: Node.js 18+
- Memory: 512MB (sufficient for MD parsing)

## ✅ Acceptance Criteria
1. MCP server responds to all 3 core tools
2. Workflow recommendations are relevant (>70% accuracy)
3. Step navigation works correctly
4. Deployment on Vercel is successful
5. Integration with Cursor works without errors

## 🔍 Testing Strategy
- **Unit**: Workflow parsing, matching algorithms
- **Integration**: MCP tool responses, API routes
- **E2E**: MCP inspector + real client testing
- **Performance**: Response time < 2s for workflow search

## 📝 Documentation Deliverables
- [ ] README with setup instructions
- [ ] MCP server configuration guide
- [ ] API documentation for tools
- [ ] Integration examples

## 🎯 Success Metrics
- Response time: < 2 seconds
- Workflow match accuracy: > 70%
- Error rate: < 5%
- Client integration: Works with Cursor + Claude

---
**Estimated Timeline**: 1-2 days  
**Priority**: High  
**Dependencies**: `@vercel/mcp-adapter`, existing `agents-playbook` structure 