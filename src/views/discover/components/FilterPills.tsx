"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { WorkflowFilters, MiniPromptFilters } from "../types";
import { useModels } from "@/entities/models";

interface FilterPill {
  key: string;
  label: string;
  value: string;
}

interface FilterPillsProps {
  type: "workflow" | "mini-prompt";
  filters: WorkflowFilters | MiniPromptFilters;
  onRemoveFilter: (key: string, value?: string) => void;
  onClearAll: () => void;
  inline?: boolean;
}

export function FilterPills({
  type,
  filters,
  onRemoveFilter,
  onClearAll,
  inline = false,
}: FilterPillsProps) {
  const [tags, setTags] = useState<Array<{ id: string; name: string }>>([]);
  const { models } = useModels();

  // Fetch tag names for display
  useEffect(() => {
    if (filters.tagIds && filters.tagIds.length > 0) {
      fetch(`/api/tags?ids=${filters.tagIds.join(",")}`)
        .then((res) => res.json())
        .then((data) => setTags(data.tags || []))
        .catch(() => setTags([]));
    } else {
      setTags([]);
    }
  }, [filters.tagIds]);

  const pills: FilterPill[] = [];

  // Tag pills
  if (filters.tagIds && filters.tagIds.length > 0) {
    filters.tagIds.forEach((tagId) => {
      const tag = tags.find((t) => t.id === tagId);
      pills.push({
        key: `tag-${tagId}`,
        label: "Tag",
        value: tag?.name || tagId,
      });
    });
  }

  // Model pills
  if (filters.modelIds && filters.modelIds.length > 0) {
    filters.modelIds.forEach((modelId) => {
      const model = models.find((m) => m.id === modelId);
      pills.push({
        key: `model-${modelId}`,
        label: "Model",
        value: model?.name || modelId,
      });
    });
  }

  // Rating pill
  if (filters.rating) {
    pills.push({
      key: "rating",
      label: "Rating",
      value: `${filters.rating} Stars`,
    });
  }

  // Usage pill
  if (filters.minUsage) {
    pills.push({
      key: "minUsage",
      label: "Usage",
      value: `${filters.minUsage}+ Users`,
    });
  }

  // Workflow-specific pills
  if (type === "workflow") {
    const wf = filters as WorkflowFilters;
    
    if (wf.complexity) {
      const complexityLabels: Record<string, string> = {
        XS: "XS - Quick",
        S: "S - Simple",
        M: "M - Moderate",
        L: "L - Complex",
        XL: "XL - Advanced",
      };
      pills.push({
        key: "complexity",
        label: "Complexity",
        value: complexityLabels[wf.complexity] || wf.complexity,
      });
    }

    if (wf.phaseCount) {
      pills.push({
        key: "phaseCount",
        label: "Stages",
        value: `${wf.phaseCount} Stages`,
      });
    }
  }

  if (pills.length === 0) {
    return null;
  }

  const handleRemovePill = (pill: FilterPill) => {
    if (pill.key.startsWith("tag-")) {
      const tagId = pill.key.replace("tag-", "");
      onRemoveFilter("tagIds", tagId);
    } else if (pill.key.startsWith("model-")) {
      const modelId = pill.key.replace("model-", "");
      onRemoveFilter("modelIds", modelId);
    } else {
      onRemoveFilter(pill.key);
    }
  };

  return (
    <div className={`flex flex-wrap items-center gap-2 ${inline ? '' : 'mb-4'}`}>
      {!inline && <span className="text-sm text-gray-500">Filters:</span>}
      {pills.map((pill) => (
        <span
          key={pill.key}
          className={`inline-flex items-center gap-1 rounded-full ${
            inline 
              ? 'px-2 py-0.5 text-xs bg-blue-50 text-blue-700 border border-blue-200' 
              : 'px-2.5 py-1 text-sm bg-blue-100 text-blue-800'
          }`}
        >
          {!inline && <span className="font-medium">{pill.label}:</span>}
          {pill.value}
          <button
            onClick={() => handleRemovePill(pill)}
            className={`p-0.5 hover:bg-blue-200 rounded-full transition-colors cursor-pointer ${
              inline ? 'ml-0' : 'ml-0.5'
            }`}
            aria-label={`Remove ${pill.label} filter`}
          >
            <X className={inline ? 'w-3 h-3' : 'w-3 h-3'} />
          </button>
        </span>
      ))}
      {pills.length > 1 && (
        <button
          onClick={onClearAll}
          className={`hover:text-blue-800 cursor-pointer ${
            inline 
              ? 'text-xs text-gray-500 hover:text-gray-700' 
              : 'text-sm text-blue-600 underline'
          }`}
        >
          {inline ? '✕ Clear' : 'Clear All'}
        </button>
      )}
    </div>
  );
}

