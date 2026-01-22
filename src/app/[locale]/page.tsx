import { setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import Header from "@/shared/ui/landing/Header";
import HeroSection from "@/shared/ui/landing/HeroSection";
import FeaturesSection from "@/shared/ui/landing/FeaturesSection";
import SetupSection from "@/shared/ui/landing/SetupSection";
import RoadmapSection from "@/shared/ui/landing/RoadmapSection";
import RecentItemsSection from "@/shared/ui/landing/RecentItemsSection";

type Props = {
  params: Promise<{ locale: string }>;
};

function CyberFooter() {
  return (
    <footer className="relative bg-[#050508] border-t border-cyan-500/20 py-12">
      {/* Circuit background */}
      <div className="absolute inset-0 cyber-circuit-bg opacity-20 pointer-events-none"></div>
      
      {/* Neon line at top */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500 to-transparent"></div>
      
      <div className="relative max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* System Status */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-[0_0_10px_#00ff66]"></span>
              <span className="text-xs font-mono uppercase tracking-wider text-green-400">SYSTEM ONLINE</span>
            </div>
            <span className="text-cyan-500/30">|</span>
            <span className="text-xs font-mono text-cyan-100/40">v2.0.26</span>
          </div>
          
          {/* Copyright */}
          <div className="text-center">
            <p className="text-sm font-mono text-cyan-100/40">
              <span className="text-cyan-400">&copy;</span> {new Date().getFullYear()} <span className="cyber-text-cyan">AGENTS PLAYBOOK</span>
            </p>
            <p className="text-xs font-mono text-cyan-100/30 mt-1">
              AI WORKFLOW ORCHESTRATION PLATFORM
            </p>
          </div>
          
          {/* Links */}
          <div className="flex items-center gap-6">
            <a 
              href="https://github.com/chernobelenkiy/agents-playbook" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs font-mono uppercase tracking-wider text-cyan-400 hover:text-cyan-300 hover:shadow-[0_0_10px_#00ffff] transition-all"
            >
              [GITHUB]
            </a>
            <Link
              href="/dashboard/discover"
              className="text-xs font-mono uppercase tracking-wider text-pink-400 hover:text-pink-300 hover:shadow-[0_0_10px_#ff0066] transition-all"
            >
              [DISCOVER]
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default async function Home({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="min-h-screen bg-[#050508] cyber-scanlines">
      <Header />
      <main role="main">
        <HeroSection />
        <RecentItemsSection />
        <FeaturesSection />
        <SetupSection />
        <RoadmapSection />
      </main>
      <CyberFooter />
    </div>
  );
}
