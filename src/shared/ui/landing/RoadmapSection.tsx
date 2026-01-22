'use client';

import { useTranslations } from 'next-intl';

export default function RoadmapSection() {
  const t = useTranslations('landing.roadmap');

  const roadmapItems = [
    { titleKey: 'item1.title', descriptionKey: 'item1.description', status: 'COMPLETE' },
    { titleKey: 'item2.title', descriptionKey: 'item2.description', status: 'IN_PROGRESS' },
    { titleKey: 'item3.title', descriptionKey: 'item3.description', status: 'QUEUED' },
  ];

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'COMPLETE':
        return { color: 'text-green-400', bg: 'bg-green-500', glow: 'shadow-[0_0_10px_#00ff66]' };
      case 'IN_PROGRESS':
        return { color: 'text-cyan-400', bg: 'bg-cyan-500', glow: 'shadow-[0_0_10px_#00ffff]' };
      default:
        return { color: 'text-pink-400', bg: 'bg-pink-500', glow: 'shadow-[0_0_10px_#ff0066]' };
    }
  };

  return (
    <section className="py-20 bg-[#050508] border-t border-b border-cyan-500/20" aria-labelledby="roadmap-title">
      {/* Circuit background */}
      <div className="absolute inset-0 cyber-circuit-bg opacity-20 pointer-events-none"></div>
      
      <div className="relative max-w-4xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 id="roadmap-title" className="text-4xl font-black tracking-tight mb-4">
            <span className="cyber-text-cyan">DEVELOPMENT</span>
            <span className="text-white mx-3">{'//'}</span>
            <span className="cyber-text-pink">ROADMAP</span>
          </h2>
          {/* Scanner underline */}
          <div className="relative w-48 h-0.5 mx-auto mb-6 bg-gradient-to-r from-transparent via-cyan-500 to-transparent overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-pink-400 animate-pulse"></div>
          </div>
          <p className="text-lg text-cyan-100/60 max-w-3xl mx-auto font-mono">
            {t('subtitle')}
          </p>
        </div>

        <div className="bg-[#0a0a0f]/80 backdrop-blur-sm border border-cyan-500/30 p-8"
          style={{
            clipPath: 'polygon(0 0, calc(100% - 30px) 0, 100% 30px, 100% 100%, 30px 100%, 0 calc(100% - 30px))',
          }}
        >
          <ol className="space-y-8">
            {roadmapItems.map((item, index) => {
              const statusStyles = getStatusStyles(item.status);
              return (
                <li key={index} className="flex items-start group">
                  <div className="flex-shrink-0 relative mr-6">
                    {/* Number box */}
                    <div className="w-12 h-12 bg-[#050508] border border-cyan-500/50 flex items-center justify-center font-mono font-bold text-cyan-400 group-hover:border-cyan-400 group-hover:shadow-[0_0_15px_rgba(0,255,255,0.3)] transition-all duration-300"
                      style={{
                        clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)',
                      }}
                    >
                      {String(index + 1).padStart(2, '0')}
                    </div>
                    {/* Connecting line */}
                    {index < roadmapItems.length - 1 && (
                      <div className="absolute left-1/2 top-14 w-px h-8 bg-gradient-to-b from-cyan-500/50 to-transparent -translate-x-1/2"></div>
                    )}
                  </div>
                  <div className="flex-1 pt-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-bold text-white group-hover:text-cyan-100 transition-colors">
                        {t(item.titleKey)}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${statusStyles.bg} ${statusStyles.glow} animate-pulse`}></span>
                        <span className={`text-xs font-mono uppercase tracking-wider ${statusStyles.color}`}>
                          {item.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                    <p className="text-cyan-100/60 leading-relaxed">
                      {t(item.descriptionKey)}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
