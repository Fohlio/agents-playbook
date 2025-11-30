"use client";

import { useState } from "react";
import { Filter } from "lucide-react";
import { Button } from "@/shared/ui/atoms";
import { Tooltip } from "@/shared/ui/molecules";
import { WorkflowSortOption, MiniPromptSortOption, WorkflowFilters, MiniPromptFilters } from "../types";
import { FiltersModal } from "./FiltersModal";
import { FilterPills } from "./FilterPills";

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
  const [isModalOpen, setIsModalOpen] = useState(false);

  const hasFilters = () => {
    const f = currentFilters;
    return !!(
      f.rating ||
      f.minUsage ||
      (f.tagIds && f.tagIds.length > 0) ||
      (f.modelIds && f.modelIds.length > 0) ||
      (type === "workflow" && ((f as WorkflowFilters).complexity || (f as WorkflowFilters).phaseCount))
    );
  };

  const filterCount = () => {
    let count = 0;
    const f = currentFilters;
    if (f.rating) count++;
    if (f.minUsage) count++;
    if (f.tagIds && f.tagIds.length > 0) count += f.tagIds.length;
    if (f.modelIds && f.modelIds.length > 0) count += f.modelIds.length;
    if (type === "workflow") {
      const wf = f as WorkflowFilters;
      if (wf.complexity) count++;
      if (wf.phaseCount) count++;
    }
    return count;
  };

  const handleRemoveFilter = (key: string, value?: string) => {
    const newFilters = { ...currentFilters };

    if (key === "tagIds" && value) {
      newFilters.tagIds = newFilters.tagIds?.filter((id) => id !== value);
      if (newFilters.tagIds?.length === 0) {
        newFilters.tagIds = undefined;
      }
    } else if (key === "modelIds" && value) {
      newFilters.modelIds = newFilters.modelIds?.filter((id) => id !== value);
      if (newFilters.modelIds?.length === 0) {
        newFilters.modelIds = undefined;
      }
    } else if (key === "rating") {
      newFilters.rating = undefined;
    } else if (key === "minUsage") {
      newFilters.minUsage = undefined;
    } else if (key === "complexity" && type === "workflow") {
      (newFilters as WorkflowFilters).complexity = undefined;
    } else if (key === "phaseCount" && type === "workflow") {
      (newFilters as WorkflowFilters).phaseCount = undefined;
    }

    onFiltersChange(newFilters);
  };

  const handleClearAll = () => {
    onFiltersChange({});
  };

  return (
    <div className="mb-6">
      {/* Sort and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        {/* Sort Dropdown */}
        <div className="flex-1 max-w-xs">
          <Tooltip content="Order results by usage frequency, rating, recency, or popularity">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sort By
            </label>
          </Tooltip>
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

        {/* Filters Button */}
        <div className="flex items-end">
          <Tooltip content="Open filters modal to refine results">
            <Button
              variant={hasFilters() ? "primary" : "secondary"}
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 cursor-pointer"
            >
              <Filter className="w-4 h-4" />
              Filters
            </Button>
          </Tooltip>
        </div>
          
        {/* Applied Filters Pills - same row, next to button, vertically centered with button */}
        {hasFilters() && (
          <div className="flex items-center self-end mb-1.5">
            <FilterPills
              type={type}
              filters={currentFilters}
              onRemoveFilter={handleRemoveFilter}
              onClearAll={handleClearAll}
              inline
            />
          </div>
        )}
      </div>

      {/* Filters Modal */}
      <FiltersModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        type={type}
        currentFilters={currentFilters}
        onApply={onFiltersChange}
      />
    </div>
  );
}
