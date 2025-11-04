# Agents Playbook

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

AI workflow orchestration framework with structured development processes and semantic workflow discovery.

## Overview

Agents Playbook is a framework for AI-driven development workflows. It provides structured processes through semantic workflow discovery and validation.

### Features

- 3 core YAML-based workflows for development tasks
- 8 context-engineered mini-prompts organized by phases
- Semantic search using OpenAI embeddings (with text fallback)
- MCP (Model Context Protocol) server integration
- TypeScript implementation
- Workflow validation and smart step skipping
- Context7 integration for fresh library documentation

## Prerequisites

- Node.js 18.0.0 or higher
- npm 8.0.0 or higher
- OpenAI API Key (for semantic search)

## Quick Start

### Installation

```bash
# Clone the repository
git clone https://github.com/your-repo/agents-playbook
cd agents-playbook

# Install dependencies
npm install

# Run tests
npm test
```

### Configuration

Create a `.env.local` file:

```env
OPENAI_API_KEY=your_openai_api_key_here
```

### Development

```bash
# Build embeddings for semantic search
npm run build:embeddings

# Start development server
npm run dev

# Server available at:
# - Web UI: http://localhost:3000
# - MCP Endpoint: http://localhost:3000/api/v1/mcp
```

## Project Structure

```
agents-playbook/
├── public/playbook/          # Workflow definitions
│   ├── workflows/            # YAML workflow specifications
│   └── mini-prompts/         # Context-engineered prompts
│       ├── analysis/         # Requirements gathering
│       ├── design-architecture/ # Technical design
│       ├── planning/         # Implementation planning
│       ├── implementation/   # Coding phase
│       └── testing-review/   # QA & validation
├── src/
│   ├── lib/                  # Core implementation
│   │   ├── execution/        # Workflow execution
│   │   ├── mcp-tools/        # MCP protocol tools
│   │   └── validation/       # Validation logic
│   └── app/                  # Next.js application
└── tests/                    # Test suite
```

## Testing

```bash
# Run all tests
npm test

# Run integration tests
npm run test:integration

# Run tests in watch mode
npm run test:watch
```

## MCP Tools

The project provides three MCP tools:

- `get_available_workflows(task_description)` - Semantic search for workflows
- `select_workflow(workflow_id)` - Get complete workflow specification
- `get_next_step(workflow_id, current_step, available_context)` - Step-by-step navigation

## Environment Variables

```bash
OPENAI_API_KEY=your_api_key    # Required for semantic search
```

## Workflows

Available workflows:

**Development**
- feature-development - Complete feature implementation lifecycle (5 phases: analysis, design-architecture, planning, implementation, testing-review)
- quick-fix - Fast bug fixes and hotfixes (4 phases: analysis, planning, implementation, testing-review)
- code-refactoring - Code quality improvements (4 phases: analysis, planning, implementation, testing-review)

> 💡 **Tip**: When chatting with AI models, ask them to "use agents-playbook to select workflow" for structured development processes.

## MCP Integration

### Cursor

Add to your Cursor MCP settings:

```json
{
  "mcpServers": {
    "agents-playbook": {
      "url": "https://agents-playbook.vercel.app/api/v1/mcp",
      "description": "AI Agent Workflow Engine",
      "apiKey": "your-token-from-settings"
    }
  }
}
```

**Note:** If `apiKey` is provided, it will be automatically sent as `Authorization: Bearer <token>` in the request headers.

### Local Usage

Copy playbook files directly to your project:

```bash
cp -r public/playbook/ /path/to/your/project/
```

## Deployment

### Vercel

```bash
npm i -g vercel
vercel --prod
```

Set environment variables in Vercel dashboard:
- `OPENAI_API_KEY=your_key_here`

## Roadmap

**Upcoming Features**

1. **Enhanced MCP Integration** - Intelligent MCP server recommendations at each workflow step
2. **Cursor Extension + Sub-Agents** - Deep Cursor integration with isolated context and workflow merging
3. **Custom Workflows as a Service** - Dynamic workflow creation and customization platform
4. **Advanced Figma & Layout Workflows** - Enhanced UI implementation flows with design system integration
5. **Extended Workflow Library** - Enhanced bug tracing, refactoring, and integrated testing strategies

## Contributing

1. Fork and clone the repository
2. Install dependencies: `npm install`
3. Start development: `npm run dev`
4. Run tests: `npm test`
5. Create pull request

Add workflows in `public/playbook/workflows/` and mini-prompts in `public/playbook/mini-prompts/`.

## Troubleshooting

**No workflows found**: Rebuild embeddings with `npm run build:embeddings`

**OpenAI API errors**: Verify API key is set correctly

**MCP server connection failed**: Check if server is running on port 3000

## License

MIT License - see [LICENSE](LICENSE) file for details.