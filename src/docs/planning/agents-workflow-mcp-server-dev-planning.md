# AI Workflow MCP Server - Development Checklist

## Project Overview
**Goal**: Build MCP server providing AI workflow recommendations  
**Complexity**: Standard (6/10)  
**Timeline**: 1-2 days  
**Stack**: Next.js + TypeScript + @vercel/mcp-adapter  

## Phase 1: Foundation Setup
**Timeline**: 2-4 hours | **Priority**: High

- [ ] **Task 1.1**: Initialize Next.js project `complexity: 2/10` `deps: none`
  - [ ] `npx create-next-app@latest agents-workflow-mcp --typescript`
  - [ ] Install dependencies: `@vercel/mcp-adapter`, `zod`, `gray-matter`
  - [ ] Setup project structure (app/, lib/, data/)
  - [ ] Test: Basic Next.js app runs locally

- [ ] **Task 1.2**: Basic MCP endpoint setup `complexity: 4/10` `deps: 1.1`
  - [ ] Create `/app/api/mcp/route.ts` with basic handler
  - [ ] Import and configure `@vercel/mcp-adapter`
  - [ ] Add placeholder MCP tools (3 empty tools)
  - [ ] Test: MCP inspector connects successfully

- [ ] **Task 1.3**: Error handling & logging `complexity: 3/10` `deps: 1.2`
  - [ ] Setup console.error logging for MCP operations
  - [ ] Add try-catch blocks for all tool functions
  - [ ] Create error response format
  - [ ] Test: Error responses return properly formatted messages

## Phase 2: Workflow Data Engine
**Timeline**: 3-5 hours | **Priority**: High

- [ ] **Task 2.1**: MD file parser implementation `complexity: 6/10` `deps: 1.1`
  - [ ] Install `gray-matter` for frontmatter parsing
  - [ ] Create `lib/workflow-parser.ts`
  - [ ] Parse all MD files in `agents-playbook/` directories
  - [ ] Extract frontmatter metadata + content
  - [ ] Test: Successfully parse all existing prompt files

- [ ] **Task 2.2**: JSON cache generation `complexity: 5/10` `deps: 2.1`
  - [ ] Design workflow JSON schema (per TRD)
  - [ ] Map MD content to workflow steps
  - [ ] Generate keywords from titles/descriptions
  - [ ] Create `data/workflows.json` on startup
  - [ ] Test: Generated JSON contains all workflows

- [ ] **Task 2.3**: Workflow matching algorithm `complexity: 7/10` `deps: 2.2`
  - [ ] Create `lib/workflow-matcher.ts`
  - [ ] Implement keyword-based matching
  - [ ] Add relevance scoring (0-100)
  - [ ] Sort results by match score
  - [ ] Test: Relevant workflows rank higher

## Phase 3: MCP Tools Implementation
**Timeline**: 3-4 hours | **Priority**: High

- [ ] **Task 3.1**: `get_available_workflows` tool `complexity: 5/10` `deps: 2.3`
  - [ ] Accept task_description parameter
  - [ ] Call workflow matcher
  - [ ] Return top 5 relevant workflows
  - [ ] Include match scores in response
  - [ ] Test: Returns appropriate workflows for sample queries

- [ ] **Task 3.2**: `select_workflow` tool `complexity: 4/10` `deps: 2.2`
  - [ ] Accept workflow_id parameter
  - [ ] Retrieve full workflow details
  - [ ] Parse MD content into structured steps
  - [ ] Return workflow with step breakdown
  - [ ] Test: Returns complete workflow information

- [ ] **Task 3.3**: `get_next_step` tool `complexity: 6/10` `deps: 3.2`
  - [ ] Accept workflow_id and current_step parameters
  - [ ] Track step progression
  - [ ] Return next step details
  - [ ] Suggest follow-up workflows when complete
  - [ ] Test: Correctly navigates through workflow steps

## Phase 4: Integration & Testing
**Timeline**: 2-3 hours | **Priority**: Medium

- [ ] **Task 4.1**: Local MCP inspector testing `complexity: 3/10` `deps: 3.1, 3.2, 3.3`
  - [ ] Test all 3 MCP tools via inspector
  - [ ] Verify response formats match schemas
  - [ ] Test error scenarios
  - [ ] Document API usage examples
  - [ ] Test: All tools work correctly in MCP inspector

- [ ] **Task 4.2**: Vercel deployment setup `complexity: 4/10` `deps: 4.1`
  - [ ] Create `vercel.json` if needed
  - [ ] Configure environment variables
  - [ ] Test local production build
  - [ ] Deploy to Vercel
  - [ ] Test: MCP server accessible via HTTPS

- [ ] **Task 4.3**: Cursor integration testing `complexity: 5/10` `deps: 4.2`
  - [ ] Configure Cursor with MCP server URL
  - [ ] Test workflow discovery in real scenario
  - [ ] Test step-by-step navigation
  - [ ] Document integration instructions
  - [ ] Test: Works seamlessly with Cursor AI chat

## Phase 5: Documentation & Polish
**Timeline**: 1-2 hours | **Priority**: Low

- [ ] **Task 5.1**: README documentation `complexity: 2/10` `deps: 4.3`
  - [ ] Setup instructions
  - [ ] MCP client configuration
  - [ ] Usage examples
  - [ ] Troubleshooting guide

- [ ] **Task 5.2**: Performance optimization `complexity: 4/10` `deps: 4.2`
  - [ ] Cache workflows.json in memory
  - [ ] Optimize workflow matching algorithm
  - [ ] Add response time monitoring
  - [ ] Test: Response times < 2 seconds

## Dependency Graph
```
1.1 → 1.2 → 1.3
1.1 → 2.1 → 2.2 → 2.3
2.3 → 3.1
2.2 → 3.2 → 3.3
3.1,3.2,3.3 → 4.1 → 4.2 → 4.3
4.3 → 5.1
4.2 → 5.2
```

## Risk Analysis
- **High Risk**: Workflow matching accuracy - может потребовать несколько итераций
- **Medium Risk**: MD parsing edge cases - некоторые файлы могут иметь нестандартный формат
- **Low Risk**: MCP integration - хорошо документированный API

## Timeline Estimates
- **Phase 1**: 2-4 hours
- **Phase 2**: 3-5 hours  
- **Phase 3**: 3-4 hours
- **Phase 4**: 2-3 hours
- **Phase 5**: 1-2 hours
- **Total**: 11-18 hours (1-2 days)

## Completion Criteria
- [ ] All MCP tools respond correctly
- [ ] Workflow recommendations are relevant
- [ ] Step navigation works
- [ ] Deployed successfully on Vercel
- [ ] Cursor integration confirmed
- [ ] Documentation complete
- [ ] Performance targets met

## Progress Tracking Log
```
[YYYY-MM-DD] Task X.Y: Status - Notes
```

---
**Critical Path**: 1.1 → 1.2 → 2.1 → 2.2 → 2.3 → 3.1 → 4.1 → 4.2  
**Parallel Opportunities**: Tasks 3.1, 3.2, 3.3 can be developed simultaneously  
**Quality Gates**: Each phase requires testing before proceeding 