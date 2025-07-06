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
                <strong>Structured Workflow Engine</strong> with 9 context-engineered development workflows that bring order to chaos.
              </p>
              <p>
                <strong>Context Engineering Framework</strong> - designed to help both high-tier and low-tier AI models follow consistent, structured processes.
              </p>
              <p>
                Semantic search finds the right workflow, smart validation provides guardrails and structure for reliable execution.
              </p>
            </div>
          </div>
        </section>

        {/* Quick Stats */}
        <section className="py-12 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div className="p-4">
                <div className="text-2xl font-bold text-blue-600">9</div>
                <div className="text-sm text-gray-600">Workflows</div>
              </div>
              <div className="p-4">
                <div className="text-2xl font-bold text-green-600">25+</div>
                <div className="text-sm text-gray-600">Mini-Prompts</div>
              </div>
              <div className="p-4">
                <div className="text-2xl font-bold text-purple-600">47</div>
                <div className="text-sm text-gray-600">Tests</div>
              </div>
              <div className="p-4">
                <div className="text-2xl font-bold text-orange-600">🎯</div>
                <div className="text-sm text-gray-600">Context Engineering</div>
              </div>
            </div>
          </div>
        </section>

        {/* Installation */}
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">Installation</h2>
            <div className="bg-gray-900 text-gray-100 p-6 rounded-lg">
              <pre className="text-sm overflow-x-auto">{`# 1. Clone repository
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

# MCP Server: http://localhost:3000/api/mcp`}</pre>
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
                <h3 className="text-lg font-semibold text-gray-900 mb-3">📋 Documentation</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• trd-creation</li>
                  <li>• brd-creation</li>
                  <li>• brd-to-trd-translation</li>
                </ul>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">🏗️ Setup & Ops</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• project-initialization</li>
                  <li>• infrastructure-setup</li>
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
