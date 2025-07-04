import Link from "next/link";

export default function Footer() {
  return (
    <footer className="relative bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
      
      <div className="relative max-w-7xl mx-auto px-6 py-16">
        {/* Main footer content */}
        <div className="grid md:grid-cols-3 gap-12 mb-12">
          {/* Brand section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl blur-sm opacity-60"></div>
              </div>
              <div>
                <h3 className="text-white font-bold text-xl">AI Agents Playbook</h3>
                <p className="text-slate-300 text-sm">MCP Server</p>
              </div>
            </div>
            <p className="text-slate-400 leading-relaxed max-w-sm">
              Intelligent workflow recommendations powered by semantic search. 
              Get the right AI agent workflow for any task.
            </p>
          </div>

          {/* Quick links */}
          <div className="space-y-4">
            <h4 className="text-white font-semibold text-lg">Quick Links</h4>
            <div className="space-y-3">
              <Link 
                href="https://github.com/ivanbunin/agents-playbook" 
                target="_blank"
                className="block text-slate-400 hover:text-white transition-colors duration-200 hover:translate-x-1 transform"
              >
                → GitHub Repository
              </Link>
              <Link 
                href="https://github.com/ivanbunin/agents-playbook/blob/main/README.md" 
                target="_blank"
                className="block text-slate-400 hover:text-white transition-colors duration-200 hover:translate-x-1 transform"
              >
                → Documentation
              </Link>
              <Link 
                href="https://github.com/ivanbunin/agents-playbook/issues" 
                target="_blank"
                className="block text-slate-400 hover:text-white transition-colors duration-200 hover:translate-x-1 transform"
              >
                → Report Issues
              </Link>
            </div>
          </div>

          {/* Status & info */}
          <div className="space-y-4">
            <h4 className="text-white font-semibold text-lg">Status</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-slate-400">Server Online</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span className="text-slate-400">Early Beta</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                <span className="text-slate-400">Deployed on Vercel</span>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-700/50 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            {/* Copyright */}
            <div className="text-slate-400 text-sm">
              © 2024 AI Agents Playbook. Open source project.
            </div>

            {/* Social links */}
            <div className="flex items-center space-x-4">
              <Link
                href="https://github.com/ivanbunin/agents-playbook"
                target="_blank"
                className="w-10 h-10 bg-slate-800 hover:bg-slate-700 rounded-xl flex items-center justify-center text-slate-400 hover:text-white transition-all duration-200 hover:scale-110"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </Link>
              
              <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-slate-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
} 