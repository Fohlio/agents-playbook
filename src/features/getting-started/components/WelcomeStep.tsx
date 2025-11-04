/**
 * Welcome Step
 *
 * First step in Getting Started wizard
 * Introduces platform value propositions and overview
 */
export function WelcomeStep() {
  return (
    <div className="text-center space-y-6">
      <div className="flex justify-center">
        <div className="relative">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl blur-sm opacity-60"></div>
        </div>
      </div>

      <h1 className="text-3xl font-bold text-gray-900">
        Welcome to Agents Playbook
      </h1>

      <p className="text-lg text-gray-600 max-w-2xl mx-auto">
        Learn how to prevent AI hallucinations and build reliable workflows
        in just 5 steps.
      </p>

      <div className="grid grid-cols-3 gap-4 mt-8 max-w-2xl mx-auto">
        <div className="text-center p-4">
          <div className="text-4xl mb-2">🎯</div>
          <p className="text-sm font-medium text-gray-700">Discover Workflows</p>
          <p className="text-xs text-gray-500 mt-1">Find proven solutions</p>
        </div>
        <div className="text-center p-4">
          <div className="text-4xl mb-2">📚</div>
          <p className="text-sm font-medium text-gray-700">Build Library</p>
          <p className="text-xs text-gray-500 mt-1">Organize your tools</p>
        </div>
        <div className="text-center p-4">
          <div className="text-4xl mb-2">🚀</div>
          <p className="text-sm font-medium text-gray-700">Integrate MCP</p>
          <p className="text-xs text-gray-500 mt-1">Connect with AI</p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-xl mx-auto mt-8">
        <p className="text-sm text-blue-900">
          <strong>Why workflows?</strong> Planning ahead saves time on re-iteration, prevents bugs,
          ensures consistency in requirements, and helps AI understand context better—reducing wasted effort
          and improving code quality.
        </p>
      </div>
    </div>
  );
}
