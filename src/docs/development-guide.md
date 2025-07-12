# 🛠️ Development Guide • AI Agents Playbook MCP Server

Complete guide for setting up, developing, and testing the MCP server locally.

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ 
- **npm** or **yarn**
- **OpenAI API key** with embeddings access
- **Terminal** access

### 1. Clone & Install
```bash
git clone <repository-url>
cd agents-playbook
npm install
```

### 2. Environment Setup
Create `.env` file in project root:
```bash
OPENAI_API_KEY=your_openai_api_key
```

**Getting OpenAI API Key:**
1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create new API key
3. Copy and paste into `.env`

### 3. Generate Workflow Embeddings
```bash
npm run build:embeddings
```
This processes **15 workflows** and creates semantic search index.

### 4. Start Development Server
```bash
npm run dev
```

✅ **MCP Server**: 
- **Production**: https://agents-playbook.vercel.app/api/mcp
- **Local Dev**: http://localhost:3000/api/mcp  
✅ **Ready for testing!**

## 🧪 Testing with MCP Inspector

### Start MCP Inspector
```bash
DANGEROUSLY_OMIT_AUTH=true npx @modelcontextprotocol/inspector@latest http://localhost:3000/api/mcp
# OR for production testing:
# DANGEROUSLY_OMIT_AUTH=true npx @modelcontextprotocol/inspector@latest https://agents-playbook.vercel.app/api/mcp
```

### Connect to Server
1. **Open browser**: http://127.0.0.1:6274
2. **Select transport**: "Streamable HTTP"  
3. **Enter URL**: 
   - **Production**: `https://agents-playbook.vercel.app/api/mcp`
   - **Local Dev**: `http://localhost:3000/api/mcp`
4. **Click**: "Connect"

### Test All 3 Tools

#### 1. Test `get_available_workflows`
```json
{
  "name": "get_available_workflows",
  "arguments": {
    "task_description": "fix a critical bug in production"
  }
}
```
**Expected**: Quick Fix Kickoff workflow (~46% similarity)

#### 2. Test `select_workflow`
```json
{
  "name": "select_workflow", 
  "arguments": {
    "workflow_id": "quick-fix-kickoff"
  }
}
```
**Expected**: Complete 11-step bug fix workflow

#### 3. Test `get_next_step`
```json
{
  "name": "get_next_step",
  "arguments": {
    "workflow_id": "quick-fix-kickoff",
    "current_step": 0
  }
}
```
**Expected**: Step 1 details with progress tracking

## 📂 Project Structure

```
agents-playbook/
├── src/
│   ├── app/api/mcp/route.ts         # MCP endpoint (44 lines)
│   ├── lib/
│   │   ├── semantic-search.ts       # OpenAI embeddings + search
│   │   ├── workflow-parser.ts       # MD file parser
│   │   └── mcp-tools/               # Decomposed MCP tools
│   │       ├── get-workflows.ts     # Semantic search tool
│   │       ├── select-workflow.ts   # Full workflow retrieval
│   │       ├── get-next-step.ts     # Step navigation
│   │       └── index.ts             # Export all tools
│   ├── data/
│   │   └── workflow-embeddings.json # Generated embeddings cache
│   └── docs/
│       └── development-guide.md     # This file
├── scripts/
│   └── build-embeddings.ts         # Embedding generation script
├── playbook/
│   ├── prompt-playbook.md           # Main workflow navigator
│   ├── planning/                    # 7 planning workflows
│   ├── kickoff/                     # 3 kickoff workflows
│   ├── qa/                          # 1 QA workflow
│   ├── templates/                   # 2 templates
│   └── instructions/                # 2 instruction files
├── package.json                     # Dependencies & scripts
├── .env                             # OpenAI API key
└── README.md                        # User documentation
```

## 🔧 Development Workflow

### Making Changes to Workflows
1. **Edit MD files** in `playbook/` directories
2. **Regenerate embeddings**: `npm run build:embeddings`
3. **Restart dev server**: `npm run dev`
4. **Test in MCP Inspector**

### Adding New Workflows
1. **Create MD file** in appropriate `playbook/` subdirectory
2. **Follow existing format** (frontmatter + content)
3. **Regenerate embeddings**: `npm run build:embeddings`
4. **Test semantic search** in MCP Inspector

### Modifying MCP Tools
1. **Edit files** in `src/lib/mcp-tools/`
2. **Update schemas** if needed
3. **Test with MCP Inspector**
4. **No restart needed** (hot reload)

## 📊 Understanding Embeddings

### How It Works
- **Model**: OpenAI `text-embedding-3-small`
- **Input**: Title + description + first 1000 chars
- **Output**: 1536-dimensional vector
- **Search**: Cosine similarity (threshold: 0.4)

### Embedding Generation Process
```bash
npm run build:embeddings
```
1. Scans `playbook/` directories
2. Parses MD files with gray-matter
3. Generates embeddings via OpenAI API
4. Saves to `src/data/workflow-embeddings.json`

### Cache File Structure
```json
{
  "workflows": [
    {
      "id": "quick-fix-kickoff",
      "title": "Quick Fix / Mini Feature Kickoff", 
      "embedding": [0.123, -0.456, ...],
      "file_path": "playbook/kickoff/quick-fix-kickoff-prompt.md",
      "category": "kickoff",
      "complexity": "Simple",
      "keywords": ["fix", "bug", "quick"]
    }
  ]
}
```

## 🐛 Troubleshooting

### "OpenAI API Error"
```bash
# Check API key
echo $OPENAI_API_KEY

# Test API access
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

### "No workflows found"
1. **Check embeddings file exists**:
   ```bash
   ls -la src/data/workflow-embeddings.json
   ```

2. **Regenerate embeddings**:
   ```bash
   npm run build:embeddings
   ```

3. **Lower similarity threshold** in `src/lib/semantic-search.ts`:
   ```typescript
   const threshold = 0.3; // From 0.4
   ```

### "MCP Inspector won't connect"
1. **Check dev server running**:
   ```bash
   curl http://localhost:3000/api/mcp
# OR production:
# curl https://agents-playbook.vercel.app/api/mcp
   ```

2. **Check for port conflicts**:
   ```bash
   lsof -i :3000
   lsof -i :6274
   ```

3. **Try different port**:
   ```bash
   npm run dev -- --port 3001
   ```

### "Workflow parsing errors"
1. **Check MD file format**:
   - Valid frontmatter (YAML between `---`)
   - Proper markdown structure
   - UTF-8 encoding

2. **Debug parser**:
   ```bash
   node -e "
   const { WorkflowParser } = require('./src/lib/workflow-parser.ts');
   const parser = new WorkflowParser('./playbook');
   parser.parseAllWorkflows().then(console.log);
   "
   ```

## 🧪 Testing Strategy

### Unit Testing (Future)
```bash
# Not implemented yet
npm test
```

### Integration Testing
1. **MCP Inspector** - Manual testing of all tools
2. **Cursor Integration** - Real-world usage testing
3. **Performance Testing** - Response time monitoring

### Load Testing
```bash
# Test semantic search performance
time curl -X POST http://localhost:3000/api/mcp \
  -H "Content-Type: application/json" \
  -d '{"method": "tools/call", "params": {"name": "get_available_workflows", "arguments": {"task_description": "fix bug"}}}'
```

## 🚀 Deployment

### Vercel Deployment
```bash
# Build embeddings first
npm run build:embeddings

# Deploy
vercel --prod

# Set environment variables in Vercel dashboard
# OPENAI_API_KEY=your_key_here
```

### Environment Variables (Production)
```env
OPENAI_API_KEY=your_openai_api_key
NODE_ENV=production
```

## 📈 Performance Monitoring

### Key Metrics
- **Response time**: < 2s for workflow search
- **Similarity accuracy**: 40-60% for relevant matches
- **Cache hit rate**: ~100% (pre-generated embeddings)

### Monitoring Commands
```bash
# Check embedding file size
ls -lh src/data/workflow-embeddings.json

# Monitor API calls
tail -f .vercel/output/functions/api/mcp.func/.next/server-build-trace.json

# Test response times
curl -w "%{time_total}" -X POST http://localhost:3000/api/mcp
```

## 🔄 Contributing

### Before Submitting Changes
1. **Test locally** with MCP Inspector
2. **Regenerate embeddings** if workflows changed
3. **Update documentation** if architecture changed
4. **Test Cursor integration** if possible

### Code Style
- **TypeScript** strict mode
- **ESLint** configuration (if added)
- **Clear variable names** and comments
- **Error handling** for all async operations

---

**🎯 Goal**: Make development and testing as smooth as possible for anyone working on the MCP server. 