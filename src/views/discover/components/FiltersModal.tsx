"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { WorkflowComplexity } from "@prisma/client";
import { Modal } from "@/shared/ui/atoms/Modal";
import { Button } from "@/shared/ui/atoms";
import { TagMultiSelect } from "@/shared/ui/molecules/TagMultiSelect";
import { ModelMultiSelect } from "@/shared/ui/molecules/ModelMultiSelect";
import { useModels } from "@/entities/models";
import { WorkflowFilters, MiniPromptFilters } from "../types";

interface FiltersModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "workflow" | "mini-prompt";
  currentFilters: WorkflowFilters | MiniPromptFilters;
  onApply: (filters: WorkflowFilters | MiniPromptFilters) => void;
}

export function FiltersModal({
  isOpen,
  onClose,
  type,
  currentFilters,
  onApply,
}: FiltersModalProps) {
  const t = useTranslations("discover.filters");
  // Local state for filter values
  const [localFilters, setLocalFilters] = useState<WorkflowFilters | MiniPromptFilters>(currentFilters);

  // Fetch models from entities layer
  const { models, loading: modelsLoading } = useModels();

  // Reset local filters when modal opens
  useEffect(() => {
    if (isOpen) {
      setLocalFilters(currentFilters);
    }
  }, [isOpen, currentFilters]);

  const handleApply = () => {
    onApply(localFilters);
    onClose();
  };

  const handleClear = () => {
    const clearedFilters: WorkflowFilters | MiniPromptFilters = {};
    setLocalFilters(clearedFilters);
  };

  const hasFilters = () => {
    const f = localFilters;
    return !!(
      f.rating ||
      f.minUsage ||
      (f.tagIds && f.tagIds.length > 0) ||
      (f.modelIds && f.modelIds.length > 0) ||
      (type === "workflow" && ((f as WorkflowFilters).complexity || (f as WorkflowFilters).phaseCount))
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-4xl"
    >
      <div className="space-y-5">
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">{t("title")}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        {/* Horizontal grid layout for filters */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {/* Tags Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("tags")}
            </label>
            <TagMultiSelect
              selectedTagIds={localFilters.tagIds || []}
              onChange={(tagIds) => setLocalFilters({ ...localFilters, tagIds: tagIds.length > 0 ? tagIds : undefined })}
            />
          </div>

          {/* Models Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("aiModels")}
            </label>
            <ModelMultiSelect
              models={models}
              selectedModelIds={localFilters.modelIds || []}
              onChange={(modelIds) => setLocalFilters({ ...localFilters, modelIds: modelIds.length > 0 ? modelIds : undefined })}
              loading={modelsLoading}
              placeholder={t("filterByModels")}
            />
          </div>

          {/* Rating Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("minRating")}
            </label>
            <select
              value={localFilters.rating || ""}
              onChange={(e) => setLocalFilters({
                ...localFilters,
                rating: e.target.value === "" ? undefined : (e.target.value as "4+" | "3+"),
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">{t("allRatings")}</option>
              <option value="4+">{t("rating4Plus")}</option>
              <option value="3+">{t("rating3Plus")}</option>
            </select>
          </div>

          {/* Usage Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("minUsage")}
            </label>
            <select
              value={localFilters.minUsage || ""}
              onChange={(e) => setLocalFilters({
                ...localFilters,
                minUsage: e.target.value === "" ? undefined : (e.target.value as "10" | "50"),
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">{t("allUsage")}</option>
              <option value="10">{t("usage10Plus")}</option>
              <option value="50">{t("usage50Plus")}</option>
            </select>
          </div>

          {/* Workflow-specific filters */}
          {type === "workflow" && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("complexity")}
                </label>
                <select
                  value={(localFilters as WorkflowFilters).complexity || ""}
                  onChange={(e) => setLocalFilters({
                    ...localFilters,
                    complexity: e.target.value === "" ? undefined : (e.target.value as WorkflowComplexity),
                  } as WorkflowFilters)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">{t("allComplexity")}</option>
                  <option value="XS">{t("complexityXS")}</option>
                  <option value="S">{t("complexityS")}</option>
                  <option value="M">{t("complexityM")}</option>
                  <option value="L">{t("complexityL")}</option>
                  <option value="XL">{t("complexityXL")}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("stageCount")}
                </label>
                <select
                  value={(localFilters as WorkflowFilters).phaseCount || ""}
                  onChange={(e) => setLocalFilters({
                    ...localFilters,
                    phaseCount: e.target.value === "" ? undefined : (e.target.value as "1-3" | "4-5" | "6+"),
                  } as WorkflowFilters)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">{t("allStages")}</option>
                  <option value="1-3">{t("stages1to3")}</option>
                  <option value="4-5">{t("stages4to5")}</option>
                  <option value="6+">{t("stages6Plus")}</option>
                </select>
              </div>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-between pt-4 border-t border-gray-200">
          <Button
            variant="ghost"
            onClick={handleClear}
            disabled={!hasFilters()}
          >
            {t("clearAll")}
          </Button>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={onClose}>
              {t("cancel") || "Cancel"}
            </Button>
            <Button variant="primary" onClick={handleApply}>
              {t("apply")}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

