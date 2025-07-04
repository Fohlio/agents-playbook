# 🤖 AI Workflow MCP Server

**Model Context Protocol server providing intelligent workflow recommendations using OpenAI semantic search across 15 real development workflows.**

## 🎯 What It Does

This MCP server uses **OpenAI embeddings** to provide semantic search across real markdown workflows:

1. **🧠 Semantic Search** - Find workflows using natural language (not just keywords)
2. **📄 Real MD Content** - Returns actual workflow files from `playbook/` directory  
3. **🎯 Step Navigation** - Guided execution through workflow steps

## 🚀 Quick Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure OpenAI API Key
Create `.env` file:
```bash
OPENAI_API_KEY=your_openai_api_key_here
```

### 3. Generate Workflow Embeddings
```bash
npm run build:embeddings
```
This processes all **15 workflows** from `playbook/` and creates semantic search embeddings.

### 4. Start Development Server
```bash
npm run dev
```

**MCP Server**: http://localhost:3001/api/mcp  
**MCP Inspector**: http://127.0.0.1:6274

## 🧪 Test with MCP Inspector

```bash
# Start MCP Inspector (with authentication disabled)
DANGEROUSLY_OMIT_AUTH=true npx @modelcontextprotocol/inspector@latest http://localhost:3001/api/mcp
```

1. Open http://127.0.0.1:6274 in browser
2. Select "Streamable HTTP" transport  
3. URL: `http://localhost:3001/api/mcp`
4. Click "Connect"

## 🛠️ MCP Tools

### 1. `get_available_workflows`
**Semantic search** using OpenAI embeddings to find relevant workflows.

**Input**: `task_description` (string)  
**Output**: Workflows ranked by similarity score

**Examples:**
- `"fix a bug"` → Quick Fix Kickoff (46% similarity)
- `"product development"` → Product Development from Scratch (51% similarity)
- `"create technical spec"` → TRD Creation workflow

### 2. `select_workflow`
Returns **complete markdown content** from original workflow files.

**Input**: `workflow_id` (string)  
**Output**: Full workflow with instructions, context, and examples
**Source**: Real MD files from `playbook/` directory

### 3. `get_next_step`
Navigate through workflow with guided step-by-step execution.

**Input**: `workflow_id`, `current_step` (0-based)  
**Output**: Current step details and progress tracking

## 📁 Available Workflows (15 Total)

### 📋 Planning Workflows (7)
- **product-development** - Product Development from Scratch (AI-Ready)
- **trd-creation** - TRD From Scratch (AI-Ready)  
- **brd-to-trd-translation** - BRD to TRD Translation
- **existing-feature-analysis** - Existing Feature → "As-Is" TRD
- **feature-migration** - Feature Migration Planner
- **brd-creation-with-research** - BRD with External Research
- **code-refactoring** - Code Refactor → Scalable Architecture

### 🚀 Kickoff Workflows (3)
- **quick-fix-kickoff** - Quick Fix / Mini Feature Kickoff
- **development-kickoff** - Development Kickoff  
- **project-initialization-kickoff** - Project Initialization Kickoff

### 🧪 QA Workflows (1)
- **qa-validation** - QA Validation & Testing

### 📚 Instructions & Templates (4)
- **context-engineering-rules** - Context Engineering Rules
- **task-breakdown-helper** - Task Breakdown & Planning Helper
- **brd-template** - BRD Template (AI Edition)
- **trd-template** - TRD Template

## 🧪 Usage Examples

### Example 1: Bug Fix
```json
// 1. Search for bug fix workflows
{
  "method": "tools/call",
  "params": {
    "name": "get_available_workflows", 
    "arguments": {"task_description": "fix a critical bug"}
  }
}

// Response: Quick Fix Kickoff (46% similarity)

// 2. Get full workflow
{
  "method": "tools/call",
  "params": {
    "name": "select_workflow",
    "arguments": {"workflow_id": "quick-fix-kickoff"}
  }
}

// Response: Complete markdown workflow with 11 steps
```

### Example 2: Product Planning
```json
// 1. Search for planning workflows  
{
  "method": "tools/call",
  "params": {
    "name": "get_available_workflows",
    "arguments": {"task_description": "plan a new product feature"}
  }
}

// Response: Product Development from Scratch (51% similarity)

// 2. Start guided execution
{
  "method": "tools/call", 
  "params": {
    "name": "get_next_step",
    "arguments": {"workflow_id": "product-development", "current_step": 0}
  }
}
```

## 🚀 Deploy to Vercel

### 1. Build Embeddings
```bash
npm run build:embeddings
```

### 2. Deploy
```bash
vercel --prod
```

### 3. Configure Environment Variables in Vercel
Add `OPENAI_API_KEY` in Vercel dashboard.

### 4. Test Production
```bash
npx @modelcontextprotocol/inspector@latest https://your-app.vercel.app/api/mcp
```

## 🔌 Cursor Integration

Add to your Cursor MCP configuration:

```json
{
  "mcpServers": {
    "ai-workflow-server": {
      "url": "https://your-app.vercel.app/api/mcp"
    }
  }
}
```

## 📂 Project Structure

```
agents-playbook/
├── scripts/
│   └── build-embeddings.ts         # Generate OpenAI embeddings
├── src/
│   ├── app/api/mcp/route.ts        # MCP endpoint  
│   ├── lib/semantic-search.ts      # Semantic search utilities
│   └── data/workflow-embeddings.json # Generated embeddings
├── playbook/                       # Source workflow files
│   ├── planning/                   # 7 planning workflows
│   ├── kickoff/                    # 3 kickoff workflows
│   ├── qa/                         # 1 QA workflow
│   ├── instructions/               # 2 instruction files
│   └── templates/                  # 2 template files
├── package.json
└── README.md
```

## 🔧 Technical Details

### Semantic Search
- **Model**: OpenAI `text-embedding-3-small`
- **Similarity**: Cosine similarity with 0.4 threshold
- **Content**: Title + description + first 1000 chars of each workflow
- **Cache**: Embeddings stored in JSON for fast runtime search

### Workflow Processing
- **Source**: Real markdown files from `playbook/`
- **Parsing**: Gray-matter for frontmatter + content extraction
- **Steps**: Intelligent parsing of workflow sections and numbered steps
- **Metadata**: Auto-extracted complexity, keywords, use cases

## 🐛 Troubleshooting

### No workflows found
- Lower similarity threshold (currently 0.4)
- Try broader search terms
- Rebuild embeddings: `npm run build:embeddings`

### OpenAI API errors
- Check `OPENAI_API_KEY` in `.env`
- Verify API key has embeddings access
- Check API quota/limits

### MCP connection issues
- Ensure dev server is running: `npm run dev`
- Check URL: `http://localhost:3001/api/mcp`
- Try MCP Inspector for debugging

## 🎯 Success Metrics

✅ **15 real workflows** loaded from markdown files  
✅ **Semantic search** with OpenAI embeddings  
✅ **46-51% similarity** scores for relevant matches  
✅ **Full MD content** returned from source files  
✅ **Guided execution** through workflow steps  
✅ **Production ready** for Vercel deployment

---

**🚀 Ready for deployment and Cursor integration!**