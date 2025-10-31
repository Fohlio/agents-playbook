export default function HeroSection() {
  return (
    <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50"></div>
      
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>
      
      <div className="relative max-w-7xl mx-auto px-6 py-20 text-center">
        {/* Badge */}
        <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-sm border border-blue-200/50 rounded-full text-blue-800 text-sm font-medium mb-8 hover:scale-105 transition-transform duration-300">
          <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mr-3 animate-pulse"></div>
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-semibold">
            MCP Server • Cursor Compatible
          </span>
        </div>
        
        {/* Main Heading */}
        <h1 className="text-4xl lg:text-5xl font-bold mb-8 leading-tight">
          <span className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 bg-clip-text text-transparent">
            AI Agents
          </span>
          <br />
          <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent animate-pulse">
            Playbook
          </span>
        </h1>
        
        {/* Subtitle */}
        <p className="text-xl lg:text-2xl text-slate-600 mb-8 max-w-4xl mx-auto leading-relaxed">
          Stop AI hallucinations. Start shipping reliable code.
        </p>

        {/* Value Propositions */}
        <div className="flex flex-wrap justify-center gap-6 mb-12 max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-3 px-5 py-3 bg-white/80 backdrop-blur-sm rounded-lg shadow-sm border border-gray-200">
            <span className="text-2xl">🎯</span>
            <span className="text-gray-700 font-medium">95% Fewer Errors</span>
          </div>
          <div className="inline-flex items-center gap-3 px-5 py-3 bg-white/80 backdrop-blur-sm rounded-lg shadow-sm border border-gray-200">
            <span className="text-2xl">⚡</span>
            <span className="text-gray-700 font-medium">10x Faster Development</span>
          </div>
          <div className="inline-flex items-center gap-3 px-5 py-3 bg-white/80 backdrop-blur-sm rounded-lg shadow-sm border border-gray-200">
            <span className="text-2xl">🔒</span>
            <span className="text-gray-700 font-medium">Zero Hallucinations</span>
          </div>
        </div>

        <p className="text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed mb-12">
          Structured workflows give your AI assistant the context it needs to generate production-ready code.
          No more hardcoded credentials. No more invented APIs. Just validated, tested, reliable results.
        </p>
      </div>
    </section>
  );
} 