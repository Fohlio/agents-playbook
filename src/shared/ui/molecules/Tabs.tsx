"use client";

import { useState, ReactNode, useId } from "react";

export interface TabItem {
  id: string;
  label: string;
  content: ReactNode;
}

interface TabsProps {
  tabs: TabItem[];
  defaultTab?: string;
}

export function Tabs({ tabs, defaultTab }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);
  const tabsId = useId();

  const activeTabContent = tabs.find((tab) => tab.id === activeTab)?.content;

  return (
    <div>
      {/* Tab navigation - Cyberpunk Style */}
      <div className="border-b border-cyan-500/30 mb-6">
        <div className="flex gap-0" role="tablist" aria-label="Content tabs">
          {tabs.map((tab, index) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                relative py-3 px-6 font-mono text-sm uppercase tracking-wider transition-all
                focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:ring-offset-2 focus:ring-offset-[#050508]
                ${activeTab === tab.id
                  ? "text-cyan-400 bg-cyan-500/10"
                  : "text-cyan-100/40 hover:text-cyan-300 hover:bg-cyan-500/5"
                }
              `}
              style={{
                clipPath: index === 0 
                  ? 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 0 100%)'
                  : index === tabs.length - 1
                    ? 'polygon(10px 0, 100% 0, 100% 100%, 0 100%, 0 10px)'
                    : 'polygon(10px 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 0 100%, 0 10px)'
              }}
              data-testid={`tab-${tab.id}`}
              role="tab"
              id={`${tabsId}-tab-${tab.id}`}
              aria-selected={activeTab === tab.id}
              aria-controls={`${tabsId}-panel-${tab.id}`}
              tabIndex={activeTab === tab.id ? 0 : -1}
            >
              {/* Active indicator */}
              {activeTab === tab.id && (
                <span 
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-500 to-cyan-400"
                  style={{ boxShadow: '0 0 10px #00ffff' }}
                />
              )}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div
        data-tab={activeTab}
        role="tabpanel"
        id={`${tabsId}-panel-${activeTab}`}
        aria-labelledby={`${tabsId}-tab-${activeTab}`}
        tabIndex={0}
      >
        {activeTabContent}
      </div>
    </div>
  );
}
