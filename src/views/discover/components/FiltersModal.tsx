"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { WorkflowComplexity } from "@prisma/client";
import { Modal } from "@/shared/ui/atoms/Modal";
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
  const [localFilters, setLocalFilters] = useState<WorkflowFilters | MiniPromptFilters>(currentFilters);
  const { models, loading: modelsLoading } = useModels();

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

  const selectClassName = "w-full px-3 py-2 bg-[#050508]/50 border border-cyan-500/50 text-cyan-100 font-mono text-sm focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(0,255,255,0.2)] transition-all cursor-pointer";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-4xl"
    >
      <div className="space-y-5">
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-cyan-500/20">
          <h2 className="text-lg font-mono font-bold text-cyan-400 uppercase tracking-wider" style={{ textShadow: '0 0 10px #00ffff40' }}>
            {t("title")}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 transition-all cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Horizontal grid layout for filters */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {/* Tags Filter */}
          <div>
            <label className="block text-xs font-mono text-cyan-400 uppercase tracking-wider mb-2">
              {t("tags")}
            </label>
            <TagMultiSelect
              selectedTagIds={localFilters.tagIds || []}
              onChange={(tagIds) => setLocalFilters({ ...localFilters, tagIds: tagIds.length > 0 ? tagIds : undefined })}
            />
          </div>

          {/* Models Filter */}
          <div>
            <label className="block text-xs font-mono text-cyan-400 uppercase tracking-wider mb-2">
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
            <label className="block text-xs font-mono text-cyan-400 uppercase tracking-wider mb-2">
              {t("minRating")}
            </label>
            <select
              value={localFilters.rating || ""}
              onChange={(e) => setLocalFilters({
                ...localFilters,
                rating: e.target.value === "" ? undefined : (e.target.value as "4+" | "3+"),
              })}
              className={selectClassName}
            >
              <option value="">{t("allRatings")}</option>
              <option value="4+">{t("rating4Plus")}</option>
              <option value="3+">{t("rating3Plus")}</option>
            </select>
          </div>

          {/* Usage Filter */}
          <div>
            <label className="block text-xs font-mono text-cyan-400 uppercase tracking-wider mb-2">
              {t("minUsage")}
            </label>
            <select
              value={localFilters.minUsage || ""}
              onChange={(e) => setLocalFilters({
                ...localFilters,
                minUsage: e.target.value === "" ? undefined : (e.target.value as "10" | "50"),
              })}
              className={selectClassName}
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
                <label className="block text-xs font-mono text-cyan-400 uppercase tracking-wider mb-2">
                  {t("complexity")}
                </label>
                <select
                  value={(localFilters as WorkflowFilters).complexity || ""}
                  onChange={(e) => setLocalFilters({
                    ...localFilters,
                    complexity: e.target.value === "" ? undefined : (e.target.value as WorkflowComplexity),
                  } as WorkflowFilters)}
                  className={selectClassName}
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
                <label className="block text-xs font-mono text-cyan-400 uppercase tracking-wider mb-2">
                  {t("stageCount")}
                </label>
                <select
                  value={(localFilters as WorkflowFilters).phaseCount || ""}
                  onChange={(e) => setLocalFilters({
                    ...localFilters,
                    phaseCount: e.target.value === "" ? undefined : (e.target.value as "1-3" | "4-5" | "6+"),
                  } as WorkflowFilters)}
                  className={selectClassName}
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
        <div className="flex justify-between pt-4 border-t border-cyan-500/20">
          <button
            onClick={handleClear}
            disabled={!hasFilters()}
            className="px-4 py-2 bg-transparent text-cyan-400 font-mono text-sm uppercase tracking-wider hover:text-pink-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            {t("clearAll")}
          </button>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-transparent border border-cyan-500/30 text-cyan-400 font-mono text-sm uppercase tracking-wider hover:bg-cyan-500/10 hover:border-cyan-400 transition-all cursor-pointer"
            >
              {t("cancel")}
            </button>
            <button
              onClick={handleApply}
              className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-cyan-400 text-[#050508] font-bold uppercase tracking-wider text-sm hover:shadow-[0_0_20px_rgba(0,255,255,0.4)] transition-all cursor-pointer"
              style={{ clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))' }}
            >
              {t("apply")}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
