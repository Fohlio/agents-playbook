import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import SetupSection from "@/components/SetupSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Header />
      <main>
        <HeroSection />
        
        {/* What is this */}
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">What is this?</h2>
            <div className="text-lg text-gray-700 space-y-4">
              <p>
                <strong>AI Agent Workflow Engine</strong> that transforms complex collaboration processes into structured, repeatable agent workflows with seamless handoffs and critical review phases.
              </p>
              <p>
                <strong>Context Engineering Framework</strong> - designed to help AI models follow consistent, validated processes with intelligent guardrails, semantic workflow discovery, and agent handoff system for optimal context management.
              </p>
              <p>
                Turn manual coordination into automated intelligence. Semantic search finds the right workflow, smart validation provides structure for reliable execution, and agent handoffs ensure seamless context transfer between phases.
              </p>
            </div>
          </div>
        </section>

        {/* Quick Stats */}
        <section className="py-12 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6 text-center">
              <div className="p-4">
                <div className="text-2xl font-bold text-blue-600">9</div>
                <div className="text-sm text-gray-600">Workflows</div>
              </div>
              <div className="p-4">
                <div className="text-2xl font-bold text-green-600">25+</div>
                <div className="text-sm text-gray-600">Mini-Prompts</div>
              </div>
              <div className="p-4">
                <div className="text-2xl font-bold text-orange-600">🔄</div>
                <div className="text-sm text-gray-600">Agent Handoffs</div>
              </div>
              <div className="p-4">
                <div className="text-2xl font-bold text-purple-600">90+</div>
                <div className="text-sm text-gray-600">Tests</div>
              </div>
              <div className="p-4">
                <div className="text-2xl font-bold text-red-600">🔍</div>
                <div className="text-sm text-gray-600">Review Phases</div>
              </div>
            </div>
          </div>
        </section>

        {/* Installation */}
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">MCP Integration</h2>
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gray-900 text-gray-100 p-6 rounded-lg">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <h3 className="text-white font-semibold">Claude Desktop</h3>
                </div>
                <pre className="text-sm overflow-x-auto">{`{
  "mcpServers": {
    "agents-playbook": {
      "url": "https://agents-playbook.vercel.app/api/mcp"
    }
  }
}`}</pre>
              </div>
              
              <div className="bg-gray-900 text-gray-100 p-6 rounded-lg">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <h3 className="text-white font-semibold">Cursor</h3>
                </div>
                <pre className="text-sm overflow-x-auto">{`{
  "mcpServers": {
    "agents-playbook": {
      "url": "https://agents-playbook.vercel.app/api/mcp",
      "description": "AI Agent Workflow Engine"
    }
  }
}`}</pre>
              </div>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800">
                  <strong>Transform collaboration into automation:</strong> Turn manual coordination processes into structured, intelligent agent workflows with built-in handoffs and critical review phases.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Workflows */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">Workflows</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">🚀 Development</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• feature-development</li>
                  <li>• product-development</li>
                  <li>• quick-fix</li>
                  <li>• code-refactoring</li>
                </ul>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">🧪 Testing & QA</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• fix-tests</li>
                  <li>• fix-circular-dependencies</li>
                  <li>• unit-test-coverage</li>
                </ul>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">📋 Setup & Planning</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• project-initialization</li>
                  <li>• trd-creation</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <FeaturesSection />
        <SetupSection />
      </main>
    </div>
  );
}
