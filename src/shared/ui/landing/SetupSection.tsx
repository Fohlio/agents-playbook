export default function SetupSection() {
  const steps = [
    {
      number: "1",
      title: "Add MCP Server",
      description: "Configure the MCP server in your IDE settings",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
        </svg>
      ),
      gradient: "from-blue-500 to-purple-500",
      codeBlocks: {
        cursor: `{
  "mcpServers": {
    "agents-playbook": {
      "url": "https://agents-playbook.com/api/v1/mcp",
      "description": "AI Agent Workflow Engine",
      "headers": {
        "Authorization": "Bearer your-api-token"
      }
    }
  }
}`
      }
    },
    {
      number: "2",
      title: "Start Using",
      description: "Ask your AI assistant for intelligent workflow recommendations",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      gradient: "from-green-500 to-emerald-500",
      examples: [
        "use agents-playbook to select feature development workflow",
      ]
    },
    {
      number: "3",
      title: "Create Custom Workflows",
      description: "Use the built-in AI assistant to design workflows tailored to your team",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      ),
      gradient: "from-violet-500 to-fuchsia-500",
      examples: [
        "Help me create a workflow for implementing authentication with OAuth",
        "Create a mini-prompt for writing API documentation",
        "What's the best workflow structure for a microservices project?",
      ]
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-br from-slate-50 to-blue-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-20 right-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        <div className="absolute bottom-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
      </div>

      <div className="relative max-w-6xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-20">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              Quick Setup
            </span>
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Get started in minutes with Cursor
          </p>

        </div>

        {/* Steps */}
        <div className="space-y-8">
          {steps.map((step, index) => (
            <div 
              key={index}
              className="group relative"
            >
              {/* Connecting line */}
              {index < steps.length - 1 && (
                <div className="absolute left-8 top-20 w-0.5 h-16 bg-gradient-to-b from-slate-300 to-transparent"></div>
              )}
              
              <div className="flex items-start space-x-6">
                {/* Step number circle */}
                <div className="relative flex-shrink-0">
                  <div className={`w-16 h-16 bg-gradient-to-br ${step.gradient} rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    {step.number}
                  </div>
                  {/* Glow effect */}
                  <div className={`absolute inset-0 w-16 h-16 bg-gradient-to-br ${step.gradient} rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-300`}></div>
                </div>

                {/* Content */}
                <div className="flex-1 bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-white/50 group-hover:-translate-y-1">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className={`w-10 h-10 bg-gradient-to-br ${step.gradient} rounded-xl flex items-center justify-center text-white`}>
                      {step.icon}
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900">{step.title}</h3>
                  </div>
                  
                  <p className="text-slate-600 text-lg mb-6 leading-relaxed">
                    {step.description}
                  </p>

                  {/* Code blocks for step 1 */}
                  {step.codeBlocks && (
                    <div className="space-y-4">
                      <div className="bg-slate-900 rounded-2xl p-6 overflow-x-auto border border-slate-200">
                        <div className="flex items-center space-x-2 mb-4">
                          <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                          <span className="text-slate-300 font-medium">Cursor MCP Settings</span>
                        </div>
                        <pre className="text-slate-300 text-sm font-mono leading-relaxed">
                          <code>{step.codeBlocks.cursor}</code>
                        </pre>
                      </div>
                      
                      {/* Info note */}
                      <div className="px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
                        <p className="font-medium">💡 Add this configuration to your Cursor MCP settings</p>
                        <p className="mt-2 text-xs">
                          <strong>Note:</strong> Get your API token from Settings → API Tokens. The <code className="bg-blue-100 px-1 rounded">headers</code> field ensures proper authentication.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Examples for step 2 */}
                  {step.examples && (
                    <div className="space-y-3">
                      {step.examples.map((example, exampleIndex) => (
                        <div 
                          key={exampleIndex}
                          className="flex items-center space-x-3 p-4 bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl border border-slate-200/50"
                        >
                          <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                          <span className="text-slate-700 font-medium">&quot;{example}&quot;</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>


      </div>
    </section>
  );
} 