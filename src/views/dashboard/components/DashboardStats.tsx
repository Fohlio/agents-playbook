'use client';

import { useTranslations } from "next-intl";

export interface DashboardStatsData {
  totalWorkflows: number;
  totalMiniPrompts: number;
  activeWorkflows: number;
  publicItems: number;
}

interface DashboardStatsProps {
  stats: DashboardStatsData;
  userTier?: string;
}

interface CyberStatCardProps {
  label: string;
  value: number;
  accentColor: 'cyan' | 'green' | 'pink' | 'purple';
  testId: string;
  tooltip?: string;
}

function CyberStatCard({ label, value, accentColor, testId }: CyberStatCardProps) {
  const colorStyles = {
    cyan: {
      border: 'border-cyan-500/30 hover:border-cyan-400/60',
      text: 'text-cyan-400',
      glow: 'hover:shadow-[0_0_30px_rgba(0,255,255,0.2)]',
      valueShadow: '0 0 20px #00ffff',
    },
    green: {
      border: 'border-green-500/30 hover:border-green-400/60',
      text: 'text-green-400',
      glow: 'hover:shadow-[0_0_30px_rgba(0,255,102,0.2)]',
      valueShadow: '0 0 20px #00ff66',
    },
    pink: {
      border: 'border-pink-500/30 hover:border-pink-400/60',
      text: 'text-pink-400',
      glow: 'hover:shadow-[0_0_30px_rgba(255,0,102,0.2)]',
      valueShadow: '0 0 20px #ff0066',
    },
    purple: {
      border: 'border-purple-500/30 hover:border-purple-400/60',
      text: 'text-purple-400',
      glow: 'hover:shadow-[0_0_30px_rgba(204,0,255,0.2)]',
      valueShadow: '0 0 20px #cc00ff',
    },
  };

  const styles = colorStyles[accentColor];

  return (
    <div
      data-testid={testId}
      className={`
        relative bg-[#0a0a0f]/80 backdrop-blur-sm p-6 border transition-all duration-300
        ${styles.border} ${styles.glow}
      `}
      style={{
        clipPath: 'polygon(0 0, calc(100% - 15px) 0, 100% 15px, 100% 100%, 15px 100%, 0 calc(100% - 15px))',
      }}
    >
      {/* Corner accents */}
      <div className={`absolute top-0 right-0 w-4 h-4 border-t border-r ${styles.border.split(' ')[0]}`}></div>
      <div className={`absolute bottom-0 left-0 w-4 h-4 border-b border-l ${styles.border.split(' ')[0]}`}></div>
      
      {/* Circuit pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-10" style={{
        backgroundImage: `
          linear-gradient(rgba(0, 255, 255, 0.05) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0, 255, 255, 0.05) 1px, transparent 1px)
        `,
        backgroundSize: '20px 20px'
      }}></div>
      
      <div className="relative">
        <p 
          className={`text-4xl font-black font-mono ${styles.text}`}
          style={{ textShadow: styles.valueShadow }}
        >
          {value}
        </p>
        <p className="text-xs font-mono uppercase tracking-wider text-cyan-100/50 mt-2">
          {label}
        </p>
      </div>
    </div>
  );
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  const t = useTranslations('dashboard.stats');

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <CyberStatCard
        label={t('totalWorkflows')}
        value={stats.totalWorkflows}
        accentColor="cyan"
        testId="stat-total-workflows"
        tooltip={t('totalWorkflowsTooltip')}
      />

      <CyberStatCard
        label={t('activeWorkflows')}
        value={stats.activeWorkflows}
        accentColor="green"
        testId="stat-active-workflows"
        tooltip={t('activeWorkflowsTooltip')}
      />

      <CyberStatCard
        label={t('miniPrompts')}
        value={stats.totalMiniPrompts}
        accentColor="pink"
        testId="stat-mini-prompts"
        tooltip={t('miniPromptsTooltip')}
      />

      <CyberStatCard
        label={t('publicItems')}
        value={stats.publicItems}
        accentColor="purple"
        testId="stat-public-items"
        tooltip={t('publicItemsTooltip')}
      />
    </div>
  );
}
