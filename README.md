# 🤖 AI Agents Playbook MCP Server

**Early Beta** - Model Context Protocol server providing intelligent workflow recommendations using semantic search across real development workflows.

## 🎯 What It Does

This MCP server helps you find the right development workflow for your task using **AI-powered semantic search**:

1. **🧠 Smart Search** - Describe your task in natural language, get relevant workflows
2. **📄 Real Workflows** - Access proven development workflows used by experienced teams  
3. **🎯 Step-by-Step** - Get guided execution through each workflow

**Status**: Early testing phase - feedback welcome!

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

### 3. Generate Workflow Search Index
```bash
npm run build:embeddings
```

### 4. Start the Server
```bash
npm run dev
```

**MCP Server**: http://localhost:3000/api/mcp  
**MCP Inspector**: http://127.0.0.1:6274

## 🧪 Test with MCP Inspector

```bash
# Start MCP Inspector (with authentication disabled)
DANGEROUSLY_OMIT_AUTH=true npx @modelcontextprotocol/inspector@latest http://localhost:3000/api/mcp
```

1. Open http://127.0.0.1:6274 in browser
2. Select "Streamable HTTP" transport  
3. URL: `http://localhost:3000/api/mcp`
4. Click "Connect"

## 🛠️ Available Tools

### 1. `get_available_workflows`
**Find workflows** that match your task description.

**Example**: 
- Input: `"fix a critical bug"`
- Output: Quick Fix Kickoff workflow (46% match)

### 2. `select_workflow`
**Get complete workflow** with all steps and details.

**Example**:
- Input: `"quick-fix-kickoff"`
- Output: Full 11-step bug fix workflow

### 3. `get_next_step`
**Navigate step-by-step** through your chosen workflow.

**Example**:
- Input: Workflow ID + current step
- Output: Next step with progress tracking

## 📁 Available Workflows (11 Total)

### 📋 Planning Workflows (7)
- **product-development** - Product Development from Scratch
- **trd-creation** - Technical Requirements Document Creation  
- **brd-to-trd-translation** - Business to Technical Requirements
- **existing-feature-analysis** - Analyze Existing Features
- **feature-migration** - Feature Migration Planning
- **brd-creation-with-research** - Business Requirements with Research
- **code-refactoring** - Code Refactoring to Scalable Architecture

### 🚀 Kickoff Workflows (3)
- **quick-fix-kickoff** - Quick Bug Fix / Mini Feature
- **development-kickoff** - Development Project Kickoff  
- **project-initialization-kickoff** - New Project Setup

### 🧪 QA Workflows (1)
- **qa-validation** - Quality Assurance & Testing

## 🧪 Usage Examples

### Example 1: "I need to fix a bug"
```
1. Ask: "fix a critical bug in production"
2. Get: Quick Fix Kickoff workflow (46% similarity)
3. Follow: 11-step systematic bug fixing process
```

### Example 2: "I'm planning a new feature"
```
1. Ask: "plan a new product feature"
2. Get: Product Development from Scratch (51% similarity)  
3. Follow: Complete feature planning workflow
```

### Example 3: "I need technical documentation"
```
1. Ask: "create technical requirements"
2. Get: TRD Creation workflow
3. Follow: Step-by-step technical documentation process
```

## 🔌 Cursor Integration

Add to your Cursor MCP configuration:

```json
{
  "mcpServers": {
    "aiAgentsPlaybook": {
      "url": "http://localhost:3000/api/mcp"
    }
  }
}
```

Then restart Cursor and you'll have access to all workflows directly in your coding environment!

## 📚 AI Development Workflows

This MCP server is built on the **[AI Agents Playbook](playbook/prompt-playbook.md)** - a comprehensive collection of proven development workflows.

### 📁 Copy Playbook to Your Project

You can copy the entire `playbook/` folder to your own project for direct use:

```bash
# Copy the whole playbook
cp -r playbook/ /path/to/your/project/
```

**Benefits of local copy:**
- ✅ Use workflows without MCP server
- ✅ Customize prompts for your team
- ✅ Offline access to all workflows
- ✅ Version control with your project

### 🎯 Browse All Workflows

**[→ View Complete Playbook](playbook/prompt-playbook.md)**

Contains decision guides, complexity assessments, and workflow flows to help you pick the right prompt for any development task.

## 🔧 How It Works

- **Semantic Search**: Uses OpenAI embeddings to understand what you're asking for
- **Real Workflows**: Returns actual markdown files used by development teams
- **Smart Matching**: Finds workflows based on meaning, not just keywords
- **Guided Execution**: Breaks down complex processes into manageable steps

## 🐛 Troubleshooting

### "No workflows found"
- Try broader terms like "planning", "development", "bug fix"
- Make sure embeddings are generated: `npm run build:embeddings`

### "OpenAI API errors"  
- Check your `OPENAI_API_KEY` in `.env` file
- Verify your OpenAI account has API access

### "Can't connect to MCP server"
- Make sure server is running: `npm run dev`
- Check URL: `http://localhost:3000/api/mcp`
- Try MCP Inspector for debugging

## 💬 Feedback & Contributing

This is an **early beta** - we're actively improving based on user feedback!

- Found a workflow that should be included? Let us know!
- Having trouble with search results? Tell us what you're looking for!
- Want to contribute workflows? Check out the `playbook/` directory structure

---

**🚀 AI Agents Playbook** - Making development workflows accessible through AI