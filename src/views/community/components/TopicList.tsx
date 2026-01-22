"use client";

import { useTranslations } from "next-intl";
import { TopicCard } from "./TopicCard";
import { Pagination } from "./Pagination";
import type { TopicWithDetails } from "../types";

interface TopicListProps {
  topics: TopicWithDetails[];
  currentPage: number;
  totalPages: number;
}

export function TopicList({
  topics,
  currentPage,
  totalPages,
}: TopicListProps) {
  const t = useTranslations("community");

  if (topics.length === 0) {
    return (
      <div className="text-center py-12 bg-[#0a0a0f]/50 border border-cyan-500/30" style={{ clipPath: 'polygon(0 0, calc(100% - 15px) 0, 100% 15px, 100% 100%, 15px 100%, 0 calc(100% - 15px))' }}>
        <div className="text-cyan-500/30 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <p className="text-cyan-100/40 font-mono uppercase tracking-wider mb-2">
          {t("noTopics")}
        </p>
        <p className="text-cyan-400 font-mono text-sm">
          {t("noTopicsDescription")}
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid gap-4">
        {topics.map((topic) => (
          <TopicCard key={topic.id} topic={topic} />
        ))}
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        basePath="/dashboard/community"
      />
    </div>
  );
}
