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
      <div className="border-b border-gray-200 mb-6">
        <div className="flex gap-8" role="tablist" aria-label="Content tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                activeTab === tab.id
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
              data-testid={`tab-${tab.id}`}
              role="tab"
              id={`${tabsId}-tab-${tab.id}`}
              aria-selected={activeTab === tab.id}
              aria-controls={`${tabsId}-panel-${tab.id}`}
              tabIndex={activeTab === tab.id ? 0 : -1}
            >
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
