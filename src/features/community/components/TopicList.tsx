"use client";

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
  if (topics.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 mb-4">
          No topics yet. Create the first one!
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
