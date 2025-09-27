import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import SetupSection from "@/components/SetupSection";
import WorkflowMatcherGame from "@/components/WorkflowMatcherGame";

// Types

// Data Constants



const ROADMAP_FEATURES = [
  {
    title: "Enhanced MCP Integration",
    description: "Intelligent MCP server recommendations at each workflow step"
  },
  {
    title: "Cursor Extension + Sub-Agents",
    description: "Deep Cursor integration with isolated context and multiple agents support"
  },
  {
    title: "Custom Workflows as a Service",
    description: "Dynamic workflow creation and customization platform"
  },
  {
    title: "Advanced Figma & Layout Workflows",
    description: "Enhanced UI implementation flows with design system integration"
  },
  {
    title: "Extended Workflow Library",
    description: "Enhanced bug tracing, refactoring, and integrated testing strategies"
  }
] as const;

// Component Definitions


function RoadmapSection() {
  return (
    <section className="py-20 bg-gradient-to-b from-blue-50 to-indigo-100 border-t border-b border-blue-200" aria-labelledby="roadmap-title">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 id="roadmap-title" className="text-4xl font-bold text-gray-900 mb-4">
            Roadmap
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Upcoming features to enhance AI-driven development workflows
          </p>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg border border-blue-200 p-8">
          <ol className="space-y-6">
            {ROADMAP_FEATURES.map((feature, index) => (
              <li key={index} className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-full flex items-center justify-center font-bold text-sm mr-4 mt-1">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </li>
            ))}
          </ol>
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
        <FeaturesSection />
        <SetupSection />
        <RoadmapSection />
        <WorkflowMatcherGame />
      </main>
    </div>
  );
}
