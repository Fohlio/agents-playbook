import AutoAddButton from "./AutoAddButton";

export default function SetupSection() {
  const steps = [
    {
      number: "1",
      title: "Add to Claude Desktop",
      description: "Configure the MCP server in your Claude Desktop settings",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
        </svg>
      ),
      gradient: "from-blue-500 to-purple-500",
      codeBlock: `"mcpServers": {
  "agents-playbook": {
    "url": "https://agents-playbook.vercel.app/api/mcp"
  }
}`
    },
    {
      number: "2", 
      title: "Restart Claude Desktop",
      description: "The server will be automatically available after restart",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      ),
      gradient: "from-purple-500 to-pink-500"
    },
    {
      number: "3",
      title: "Start Using", 
      description: "Ask Claude for intelligent workflow recommendations",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      gradient: "from-green-500 to-emerald-500",
      examples: [
        "I need help with product development",
        "Find a workflow for bug fixing",
        "Show me planning templates"
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
            Get started in minutes with our streamlined installation process
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

                  {/* Code block for step 1 */}
                  {step.codeBlock && (
                    <div className="bg-slate-900 rounded-2xl p-6 overflow-x-auto border border-slate-200">
                      <pre className="text-slate-300 text-sm font-mono leading-relaxed">
                        <code>{step.codeBlock}</code>
                      </pre>
                      {/* Info note */}
                      <div className="mt-4 px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
                        <p className="font-medium">💡 Use the "Quick Setup" button below for automatic copying</p>
                      </div>
                    </div>
                  )}

                  {/* Examples for step 3 */}
                  {step.examples && (
                    <div className="space-y-3">
                      {step.examples.map((example, exampleIndex) => (
                        <div 
                          key={exampleIndex}
                          className="flex items-center space-x-3 p-4 bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl border border-slate-200/50"
                        >
                          <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                          <span className="text-slate-700 font-medium">"{example}"</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Auto Add Button */}
        <div className="mt-20">
          <AutoAddButton />
        </div>
      </div>
    </section>
  );
} 