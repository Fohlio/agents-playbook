"use client";

import { WorkflowComplexity } from "@prisma/client";
import { WorkflowSortOption, MiniPromptSortOption, WorkflowFilters, MiniPromptFilters } from "../types";
import { TagMultiSelect } from "@/shared/ui/molecules/TagMultiSelect";

interface DiscoveryFiltersProps {
  type: "workflow" | "mini-prompt";
  currentSort: WorkflowSortOption | MiniPromptSortOption;
  currentFilters: WorkflowFilters | MiniPromptFilters;
  onSortChange: (sort: WorkflowSortOption | MiniPromptSortOption) => void;
  onFiltersChange: (filters: WorkflowFilters | MiniPromptFilters) => void;
}

export function DiscoveryFilters({
  type,
  currentSort,
  currentFilters,
  onSortChange,
  onFiltersChange,
}: DiscoveryFiltersProps) {
  const handleRatingFilterChange = (rating: string) => {
    onFiltersChange({
      ...currentFilters,
      rating: rating === "" ? undefined : (rating as "4+" | "3+"),
    });
  };

  const handleUsageFilterChange = (minUsage: string) => {
    onFiltersChange({
      ...currentFilters,
      minUsage: minUsage === "" ? undefined : (minUsage as "10" | "50"),
    });
  };

  const handlePhaseCountFilterChange = (phaseCount: string) => {
    if (type === "workflow") {
      onFiltersChange({
        ...currentFilters,
        phaseCount: phaseCount === "" ? undefined : (phaseCount as "1-3" | "4-5" | "6+"),
      } as WorkflowFilters);
    }
  };

  const handleComplexityFilterChange = (complexity: string) => {
    if (type === "workflow") {
      onFiltersChange({
        ...currentFilters,
        complexity: complexity === "" ? undefined : (complexity as WorkflowComplexity),
      } as WorkflowFilters);
    }
  };

  const handleTagFilterChange = (tagIds: string[]) => {
    onFiltersChange({
      ...currentFilters,
      tagIds: tagIds.length > 0 ? tagIds : undefined,
    });
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-6">
      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Sort By
        </label>
        <select
          value={currentSort}
          onChange={(e) => onSortChange(e.target.value as WorkflowSortOption | MiniPromptSortOption)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="most_used">Most Used (default)</option>
          <option value="highest_rated">Highest Rated</option>
          <option value="recent">Most Recent</option>
          <option value="popular">Popular</option>
        </select>
      </div>

      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tags
        </label>
        <TagMultiSelect
          selectedTagIds={currentFilters.tagIds || []}
          onChange={handleTagFilterChange}
        />
      </div>

      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Rating
        </label>
        <select
          value={currentFilters.rating || ""}
          onChange={(e) => handleRatingFilterChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">All Ratings</option>
          <option value="4+">4+ Stars</option>
          <option value="3+">3+ Stars</option>
        </select>
      </div>

      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Usage
        </label>
        <select
          value={currentFilters.minUsage || ""}
          onChange={(e) => handleUsageFilterChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">All Usage</option>
          <option value="10">10+ Users</option>
          <option value="50">50+ Users</option>
        </select>
      </div>

      {type === "workflow" && (
        <>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Complexity
            </label>
            <select
              value={(currentFilters as WorkflowFilters).complexity || ""}
              onChange={(e) => handleComplexityFilterChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Complexity</option>
              <option value="XS">XS - Quick</option>
              <option value="S">S - Simple</option>
              <option value="M">M - Moderate</option>
              <option value="L">L - Complex</option>
              <option value="XL">XL - Advanced</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Stages
            </label>
            <select
              value={(currentFilters as WorkflowFilters).phaseCount || ""}
              onChange={(e) => handlePhaseCountFilterChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Stages</option>
              <option value="1-3">1-3 Stages</option>
              <option value="4-5">4-5 Stages</option>
              <option value="6+">6+ Stages</option>
            </select>
          </div>
        </>
      )}
    </div>
  );
}
