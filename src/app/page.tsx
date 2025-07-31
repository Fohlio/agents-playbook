import { Fragment } from "react";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import SetupSection from "@/components/SetupSection";
import Footer from "@/components/Footer";

// Types
interface Stat {
  value: string;
  label: string;
  color: string;
  icon?: string;
}

interface MCPConfig {
  name: string;
  color: string;
  config: object;
}

interface WorkflowCategory {
  title: string;
  icon: string;
  workflows: string[];
}

// Data Constants
const OVERVIEW_CONTENT = {
  title: "What is this?",
  descriptions: [
    {
      term: "AI Agent Workflow Engine",
      definition: "transforms complex collaboration processes into structured, repeatable agent workflows with seamless handoffs and critical review phases."
    },
    {
      term: "Context Engineering Framework",
      definition: "designed to help AI models follow consistent, validated processes with intelligent guardrails, semantic workflow discovery, and agent handoff system for optimal context management."
    },
    {
      summary: "Turn manual coordination into automated intelligence. Semantic search finds the right workflow, smart validation provides structure for reliable execution, and agent handoffs ensure seamless context transfer between phases."
    }
  ]
} as const;

const STATS: Stat[] = [
  { value: "9", label: "Workflows", color: "text-blue-600" },
  { value: "25+", label: "Mini-Prompts", color: "text-green-600" },
  { value: "🔄", label: "Agent Handoffs", color: "text-orange-600", icon: "🔄" },
  { value: "90+", label: "Tests", color: "text-purple-600" },
  { value: "🔍", label: "Review Phases", color: "text-red-600", icon: "🔍" }
] as const;

const MCP_CONFIGURATIONS: MCPConfig[] = [
  {
    name: "Claude Desktop",
    color: "bg-blue-500",
    config: {
      mcpServers: {
        "agents-playbook": {
          url: "https://agents-playbook.vercel.app/api/mcp"
        }
      }
    }
  },
  {
    name: "Cursor",
    color: "bg-purple-500", 
    config: {
      mcpServers: {
        "agents-playbook": {
          url: "https://agents-playbook.vercel.app/api/mcp",
          description: "AI Agent Workflow Engine"
        }
      }
    }
  }
] as const;

const WORKFLOW_CATEGORIES: WorkflowCategory[] = [
  {
    title: "🚀 Development",
    icon: "🚀",
    workflows: ["feature-development", "product-development", "quick-fix", "code-refactoring"]
  },
  {
    title: "🧪 Testing & QA", 
    icon: "🧪",
    workflows: ["fix-tests", "fix-circular-dependencies", "unit-test-coverage"]
  },
  {
    title: "📋 Setup & Planning",
    icon: "📋", 
    workflows: ["project-initialization", "trd-creation"]
  }
] as const;

// Component Definitions
function OverviewSection() {
  return (
    <section className="py-16 bg-white" aria-labelledby="overview-title">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h2 id="overview-title" className="text-3xl font-bold text-gray-900 mb-8">
          {OVERVIEW_CONTENT.title}
        </h2>
        <div className="text-lg text-gray-700 space-y-4">
          {OVERVIEW_CONTENT.descriptions.map((item, index) => (
            <p key={index}>
              {'term' in item ? (
                <>
                  <strong>{item.term}</strong> {item.definition}
                </>
              ) : (
                item.summary
              )}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}

function StatsSection() {
  return (
    <section className="py-12 bg-gray-50" aria-labelledby="stats-title">
      <div className="max-w-4xl mx-auto px-4">
        <h2 id="stats-title" className="sr-only">Platform Statistics</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 text-center">
          {STATS.map((stat, index) => (
            <div key={index} className="p-4" role="group" aria-label={`${stat.value} ${stat.label}`}>
              <div className={`text-2xl font-bold ${stat.color}`} aria-hidden="true">
                {stat.value}
              </div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function MCPIntegrationSection() {
  return (
    <section className="py-16 bg-white" aria-labelledby="mcp-title">
      <div className="max-w-4xl mx-auto px-4">
        <h2 id="mcp-title" className="text-3xl font-bold text-gray-900 text-center mb-8">
          MCP Integration
        </h2>
        
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {MCP_CONFIGURATIONS.map((mcp, index) => (
            <div key={index} className="bg-gray-900 text-gray-100 p-6 rounded-lg">
              <div className="flex items-center space-x-2 mb-4">
                <div className={`w-3 h-3 ${mcp.color} rounded-full`} aria-hidden="true"></div>
                <h3 className="text-white font-semibold">{mcp.name}</h3>
              </div>
              <pre className="text-sm overflow-x-auto" role="region" aria-label={`${mcp.name} configuration`}>
                <code>{JSON.stringify(mcp.config, null, 2)}</code>
              </pre>
            </div>
          ))}
        </div>
        
        <div className="text-center">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800">
              <strong>Transform collaboration into automation:</strong> Turn manual coordination 
              processes into structured, intelligent agent workflows with built-in handoffs 
              and critical review phases.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function WorkflowsSection() {
  return (
    <section className="py-16 bg-gray-50" aria-labelledby="workflows-title">
      <div className="max-w-4xl mx-auto px-4">
        <h2 id="workflows-title" className="text-3xl font-bold text-gray-900 text-center mb-8">
          Workflows
        </h2>
        
        <div className="grid md:grid-cols-3 gap-6">
          {WORKFLOW_CATEGORIES.map((category, index) => (
            <article key={index} className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                {category.title}
              </h3>
              <ul className="text-sm text-gray-600 space-y-1" role="list">
                {category.workflows.map((workflow, workflowIndex) => (
                  <li key={workflowIndex} role="listitem">
                    • {workflow}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

// Main Component
export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Header />
      <main role="main">
        <HeroSection />
        <OverviewSection />
        <StatsSection />
        <MCPIntegrationSection />
        <WorkflowsSection />
        <FeaturesSection />
        <SetupSection />
      </main>
    </div>
  );
}
