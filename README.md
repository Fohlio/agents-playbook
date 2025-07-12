# 🎯 Structured Workflow Engine MCP Server

**Context Engineering Framework** with ready-to-use development workflows that bring structure to chaos.

## 🎯 What is this

**Structured Workflow System** - designed to help both high-tier and low-tier AI models follow consistent processes:

- **🧠 Context Engineering** - workflows engineered for reliable AI execution across model tiers
- **🔧 6 Workflows** - battle-tested processes that provide structure and guardrails  
- **⚡ Smart Validation** - automatically validates prerequisites and skips irrelevant steps
- **📋 12 Mini-Prompts** - context-engineered prompts organized by development phases

## 🚀 Installation

```bash
# 1. Clone repository
git clone https://github.com/your-repo/agents-playbook
cd agents-playbook

# 2. Install dependencies
npm install

# 3. Add OpenAI API key to .env
OPENAI_API_KEY=your_key_here

# 4. Generate search index
npm run build:embeddings

# 5. Start server
npm run dev
```

**MCP Server**: 
- **Local Development**: http://localhost:3000/api/mcp
- **Production**: https://agents-playbook.vercel.app/api/mcp

## 🧪 Testing

```bash
# MCP Inspector for testing
DANGEROUSLY_OMIT_AUTH=true npx @modelcontextprotocol/inspector@latest http://localhost:3000/api/mcp

# Run tests (86 tests)
npm run test:integration
```

## 🛠️ Available Tools

### `get_available_workflows`
Search workflows with AI semantic search.

**Example**: 
- Input: `"fix critical bug"`
- Output: `quick-fix` workflow (🎯 89% match)

### `select_workflow`  
Get complete workflow with execution plan.

### `get_next_step`
Step-by-step navigation with smart validation.

## 📁 Workflows (6 total)

### 🚀 Development (4)
- **feature-development** - Complete feature development lifecycle
- **product-development** - From idea to product launch
- **quick-fix** - Fast bug fixes and hotfixes
- **code-refactoring** - Code architecture improvements

### 📋 Setup & Planning (2)
- **project-initialization** - New project setup
- **trd-creation** - Technical Requirements Document creation

## 🎯 Usage Examples

```
1. Search: "create new feature"
2. Result: feature-development workflow (🎯 92% match)  
3. Execute: 14 steps with TRD integration and smart skipping
```

```
1. Search: "technical documentation"  
2. Result: trd-creation workflow (🎯 94% match)
3. Execute: 7 steps of TRD creation with validation
```

## 🔌 MCP Integration

### 🤖 Claude Desktop
```json
{
  "mcpServers": {
    "agents-playbook": {
      "url": "https://agents-playbook.vercel.app/api/mcp"
    }
  }
}
```

### 🎯 Cursor
Add to your Cursor settings or create a MCP configuration:

```json
{
  "mcpServers": {
    "agents-playbook": {
      "url": "https://agents-playbook.vercel.app/api/mcp",
      "description": "AI Agent Workflow Engine with semantic search"
    }
  }
}
```

**For Cursor users:**
1. Open Cursor Settings
2. Navigate to "Extensions" or "Integrations"
3. Add MCP Server configuration
4. Restart Cursor

### 📁 Direct File Usage (Any IDE)
Copy playbook files directly to your project:

```bash
# Copy entire playbook to your project
cp -r public/playbook/ /path/to/your/project/

# For Cursor: create a .cursorrules file
echo "Use workflows from playbook/ directory for structured development" > .cursorrules
```

## 🎯 Cursor Integration Examples

### 1. Workflow Discovery in Cursor
```javascript
// Create a simple workflow helper for Cursor
async function findWorkflow(task) {
  const response = await fetch('https://agents-playbook.vercel.app/api/workflows', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: task })
  });
  
  const { workflows } = await response.json();
  return workflows[0]; // Get best match
}

// Usage in Cursor:
const workflow = await findWorkflow('create new feature');
console.log(`Recommended: ${workflow.id} (${workflow.match}% match)`);
```

### 2. Step-by-Step Navigation
```javascript
// Get workflow steps
async function getWorkflowSteps(workflowId) {
  const response = await fetch(`https://agents-playbook.vercel.app/api/workflows/${workflowId}`);
  const workflow = await response.json();
  return workflow.phases.flatMap(phase => phase.steps);
}

// Usage:
const steps = await getWorkflowSteps('feature-development');
steps.forEach((step, i) => console.log(`${i+1}. ${step.action}`));
```

### 3. Mini-Prompts in Cursor
```javascript
// Access mini-prompts directly
const miniPrompts = {
  'implement-feature': 'https://agents-playbook.vercel.app/api/mini-prompts/development/implement-feature',
  'code-review': 'https://agents-playbook.vercel.app/api/mini-prompts/development/code-review',
  'ask-questions': 'https://agents-playbook.vercel.app/api/mini-prompts/development/ask-clarifying-questions'
};

// Get specific prompt
async function getPrompt(promptId) {
  const response = await fetch(miniPrompts[promptId]);
  return await response.text();
}
```

## 📚 Local Usage

```bash
# Copy entire playbook to your project
cp -r public/playbook/ /path/to/your/project/

# For Cursor: create a .cursorrules file
echo "Use workflows from playbook/ directory for structured development" > .cursorrules
```

**Benefits:**
- ✅ Works without MCP server
- ✅ Customize for your team  
- ✅ Offline access
- ✅ Version control with project
- ✅ Cursor can reference workflows directly

## 🧠 How it works

- **Context Engineering** - workflows designed with clear context boundaries and validation
- **Semantic Search** - OpenAI embeddings understand task context for workflow selection
- **YAML Workflows** - structured processes with phases, steps, and guardrails
- **Mini-Prompts** - context-engineered reusable prompts that work across model tiers
- **Smart Validation** - prevents execution without required context, provides structure for low-tier models

## 🐛 Troubleshooting

### "No workflows found"
- Use simple terms: "bug", "feature", "documentation"
- Check: `npm run build:embeddings`

### "OpenAI API errors"  
- Check `OPENAI_API_KEY` in `.env`
- System falls back to text search if OpenAI unavailable

### "Can't connect to MCP server"
- Make sure server is running: `npm run dev`
- URL: `http://localhost:3000/api/mcp`

### "Steps are being skipped"
- This is normal behavior! System skips steps without required context
- Check logs to understand skip reasons

---

**🎯 Structured Workflow Engine** - Context engineering framework that brings order to chaos in AI-driven development