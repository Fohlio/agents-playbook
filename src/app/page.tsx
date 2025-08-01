import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import SetupSection from "@/components/SetupSection";
import WorkflowMatcherGame from "@/components/WorkflowMatcherGame";

// Types
interface Stat {
  value: string;
  label: string;
  color: string;
  icon?: string;
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
      term: "Workflow Engine",
      definition: "structured development processes with semantic search and validation."
    },
    {
      term: "Context Framework", 
      definition: "helps AI models follow consistent processes with intelligent workflow discovery."
    },
    {
      summary: "Find workflows through semantic search, validate steps automatically, and transfer context between development phases."
    }
  ]
} as const;

const STATS: Stat[] = [
  { value: "9", label: "Workflows", color: "text-blue-600" },
  { value: "25+", label: "Mini-Prompts", color: "text-green-600" },
  { value: "65", label: "Tests", color: "text-purple-600" },
  { value: "3", label: "MCP Tools", color: "text-orange-600" }
] as const;

const WORKFLOW_CATEGORIES: WorkflowCategory[] = [
  {
    title: "Development",
    icon: "⚡",
    workflows: ["feature-development", "product-development", "quick-fix", "code-refactoring"]
  },
  {
    title: "Testing & QA", 
    icon: "🔧",
    workflows: ["fix-tests", "fix-circular-dependencies", "unit-test-coverage"]
  },
  {
    title: "Setup & Planning",
    icon: "📝", 
    workflows: ["trd-creation", "feature-brainstorming"]
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
        <WorkflowMatcherGame />
        <WorkflowsSection />
        <FeaturesSection />
        <SetupSection />
      </main>
    </div>
  );
}
