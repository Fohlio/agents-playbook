/**
 * Workflow Combinations Step
 *
 * Shows how to combine multiple workflows for complex projects
 * Example: PRD Creation → Feature Development
 */
export function WorkflowCombinationsStep() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          🔗 Combining Workflows
        </h2>
        <p className="text-gray-600">
          Chain workflows together for complex projects and better results
        </p>
      </div>

      {/* Main Example */}
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200 rounded-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span>💡</span>
          <span>Example: Building a Complete Feature</span>
        </h3>

        <div className="space-y-4">
          {/* Step 1: PRD Creation */}
          <div className="bg-white rounded-lg p-5 border-l-4 border-purple-500">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center font-bold text-purple-600">
                1
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-gray-900 mb-2 text-lg">
                  Start with PRD Creation Workflow
                </h4>
                <p className="text-gray-700 mb-3">
                  Use the <span className="font-semibold text-purple-600">Product Requirements Architect</span> workflow to break down your project.
                </p>
                <div className="bg-purple-50 rounded p-3 mb-3">
                  <p className="text-sm font-semibold text-purple-900 mb-2">📋 Creates:</p>
                  <ul className="text-sm text-purple-800 space-y-1">
                    <li>• <code className="bg-purple-100 px-2 py-0.5 rounded">.agents-playbook/[project]/prd.md</code> - Main PRD index</li>
                    <li>• <code className="bg-purple-100 px-2 py-0.5 rounded">.agents-playbook/[project]/requirements.md</code> - Product requirements</li>
                    <li>• <code className="bg-purple-100 px-2 py-0.5 rounded">.agents-playbook/[project]/design.md</code> - Technical architecture</li>
                    <li>• <code className="bg-purple-100 px-2 py-0.5 rounded">.agents-playbook/[project]/design-system.md</code> - Design system specs</li>
                    <li>• <code className="bg-purple-100 px-2 py-0.5 rounded">.agents-playbook/[project]/features/[feature].md</code> - Feature files with AC</li>
                  </ul>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                  <p className="text-sm text-yellow-900">
                    <span className="font-semibold">💡 Pro Tip:</span> Each feature file includes a ready-to-use prompt for Feature Development!
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Arrow */}
          <div className="flex justify-center">
            <div className="text-4xl text-gray-400">↓</div>
          </div>

          {/* Step 2: Feature Development */}
          <div className="bg-white rounded-lg p-5 border-l-4 border-blue-500">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center font-bold text-blue-600">
                2
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-gray-900 mb-2 text-lg">
                  Dive Deep with Feature Development Workflow
                </h4>
                <p className="text-gray-700 mb-3">
                  For each feature from the PRD, use the <span className="font-semibold text-blue-600">Feature Development</span> workflow.
                </p>
                <div className="bg-blue-50 rounded p-3 mb-3">
                  <p className="text-sm font-semibold text-blue-900 mb-2">🎯 Process:</p>
                  <ul className="text-sm text-blue-800 space-y-2">
                    <li>• Open feature file from <code className="bg-blue-100 px-1 rounded">.agents-playbook/[project]/features/[feature].md</code></li>
                    <li>• Copy the ready-to-use prompt from the feature file</li>
                    <li>• Run Feature Development workflow with that prompt</li>
                    <li>• Workflow goes through: Analysis → Design → Planning → Implementation → Testing</li>
                    <li>• References <code className="bg-blue-100 px-1 rounded">design.md</code> and <code className="bg-blue-100 px-1 rounded">design-system.md</code> for consistency</li>
                  </ul>
                </div>
                <div className="bg-emerald-50 border border-emerald-200 rounded p-3">
                  <p className="text-sm text-emerald-900">
                    <span className="font-semibold">✅ Result:</span> Production-ready implementation that follows the PRD specs exactly!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Why This Works */}
      <div className="bg-gray-900 rounded-lg p-6 text-white">
        <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
          <span>🚀</span>
          <span>Why Combining Workflows Works</span>
        </h4>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-gray-800 rounded p-4">
            <div className="text-2xl mb-2">📐</div>
            <h5 className="font-semibold mb-2">Structured Planning</h5>
            <p className="text-sm text-gray-300">
              PRD creates the blueprint. Each feature is documented with clear requirements.
            </p>
          </div>
          <div className="bg-gray-800 rounded p-4">
            <div className="text-2xl mb-2">🎯</div>
            <h5 className="font-semibold mb-2">Focused Execution</h5>
            <p className="text-sm text-gray-300">
              Feature Development follows the plan without deviating or hallucinating.
            </p>
          </div>
          <div className="bg-gray-800 rounded p-4">
            <div className="text-2xl mb-2">✨</div>
            <h5 className="font-semibold mb-2">Better Results</h5>
            <p className="text-sm text-gray-300">
              Each workflow stage validates against the PRD, ensuring consistency.
            </p>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-5">
        <div className="flex items-start gap-3">
          <span className="text-2xl">💪</span>
          <div>
            <p className="font-semibold text-gray-900 mb-1">
              Ready to Try Workflow Combinations?
            </p>
            <p className="text-sm text-gray-700 mb-3">
              Start with a simple project: Use PRD Creation to plan, then Feature Development to build each piece.
            </p>
            <div className="flex gap-2">
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded font-medium">
                PRD Creation
              </span>
              <span className="text-xs text-gray-400">→</span>
              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded font-medium">
                Feature Development
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
