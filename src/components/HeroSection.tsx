export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
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
            MCP Server • Claude Desktop • Cursor
          </span>
        </div>
        
        {/* Main Heading */}
        <h1 className="text-6xl lg:text-8xl font-bold mb-8 leading-tight">
          <span className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 bg-clip-text text-transparent">
            AI Agents
          </span>
          <br />
          <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent animate-pulse">
            Playbook
          </span>
        </h1>
        
        {/* Subtitle */}
        <p className="text-xl lg:text-2xl text-slate-600 mb-12 max-w-4xl mx-auto leading-relaxed">
          Discover intelligent workflow recommendations powered by{" "}
          <span className="font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            semantic search
          </span>
          . Get the perfect AI agent workflow for any task, instantly.
        </p>
        
        {/* Info Card */}
        <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl p-8 max-w-2xl mx-auto mb-12 shadow-lg">
          <h3 className="text-xl font-semibold text-slate-800 mb-4">Ready to Use</h3>
          <p className="text-slate-600 leading-relaxed">
            Install the MCP server in Claude Desktop or Cursor and get access to 6 proven workflows for AI agent development.
          </p>
        </div>
        
        {/* Stats */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
          <div className="text-center">
            <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">6</div>
            <div className="text-slate-600 text-sm font-medium">Workflows</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">100%</div>
            <div className="text-slate-600 text-sm font-medium">MCP Compatible</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">∞</div>
            <div className="text-slate-600 text-sm font-medium">Possibilities</div>
          </div>
        </div>
      </div>
      
      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <div className="w-6 h-10 border-2 border-slate-300 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-slate-400 rounded-full mt-2 animate-bounce"></div>
        </div>
      </div>
    </section>
  );
} 