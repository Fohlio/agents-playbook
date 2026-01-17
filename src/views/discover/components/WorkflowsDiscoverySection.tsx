"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { WorkflowDiscoveryCardWidget } from "@/widgets/workflow-discovery-card";
import { DiscoveryGrid } from "@/shared/ui/organisms/DiscoveryGrid";
import { Pagination } from "@/shared/ui/molecules/Pagination";
import { SearchBar } from "@/shared/ui/molecules/SearchBar";
import { DiscoveryFilters } from "./DiscoveryFilters";
import { PublicWorkflowWithMeta, PaginatedResult, WorkflowSortOption, WorkflowFilters } from "../types";
import { useToast } from "@/shared/ui/providers/ToastProvider";
import { useEmptyStatePresets } from "@/shared/hooks/use-empty-state-presets";

interface WorkflowsDiscoverySectionProps {
  isAuthenticated: boolean;
  currentUserId?: string;
}

export function WorkflowsDiscoverySection({
  isAuthenticated,
  currentUserId,
}: WorkflowsDiscoverySectionProps) {
  const t = useTranslations("discover");
  const { noSearchResults, noFilterResults, emptyDiscovery } = useEmptyStatePresets();
  const [data, setData] = useState<PaginatedResult<PublicWorkflowWithMeta> | null>(null);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<WorkflowSortOption>("most_used");
  const [filters, setFilters] = useState<WorkflowFilters>({});
  const { showToast } = useToast();

  useEffect(() => {
    fetchWorkflows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search, sort, filters]);

  const fetchWorkflows = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        ...(search && { search }),
        sort,
        ...(Object.keys(filters).length > 0 && { filters: JSON.stringify(filters) }),
      });

      const response = await fetch(`/api/v1/public/workflows?${params}`);
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error("Error fetching workflows:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUndo = async (workflowId: string) => {
    try {
      const response = await fetch(`/api/v1/workflows/import/${workflowId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        showToast({
          message: t("toast.removedFromLibrary"),
          variant: "info",
        });
        fetchWorkflows();
      }
    } catch (error) {
      console.error("Error undoing import:", error);
      showToast({
        message: t("toast.failedToUndo"),
        variant: "error",
      });
    }
  };

  const handleImport = async (workflowId: string) => {
    setImporting(workflowId);
    try {
      const response = await fetch(`/api/v1/workflows/import/${workflowId}`, {
        method: "POST",
      });

      if (response.ok) {
        showToast({
          message: t("toast.addedToLibrary"),
          variant: "success",
          action: {
            label: t("toast.undo"),
            onClick: () => handleUndo(workflowId),
          },
        });
        // Refresh data to update "In Library" status
        fetchWorkflows();
      } else {
        const errorData = await response.json();
        showToast({
          message: errorData.error || t("toast.failedToAdd"),
          variant: "error",
        });
      }
    } catch (error) {
      console.error("Error importing workflow:", error);
      showToast({
        message: t("toast.failedToAdd"),
        variant: "error",
      });
    } finally {
      setImporting(null);
    }
  };

  return (
    <div>
      <div className="mb-4">
        <SearchBar
          value={search}
          onChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          placeholder={t("searchPlaceholder")}
        />
      </div>

      <DiscoveryFilters
        type="workflow"
        currentSort={sort}
        currentFilters={filters}
        onSortChange={(newSort) => {
          setSort(newSort as WorkflowSortOption);
          setPage(1);
        }}
        onFiltersChange={(newFilters) => {
          setFilters(newFilters as WorkflowFilters);
          setPage(1);
        }}
      />

      <DiscoveryGrid
        items={data?.items || []}
        renderCard={(workflow) => (
          <WorkflowDiscoveryCardWidget
            key={workflow.id}
            workflow={workflow}
            onImport={handleImport}
            onDuplicate={fetchWorkflows}
            isAuthenticated={isAuthenticated}
            isImporting={importing === workflow.id}
            currentUserId={currentUserId}
          />
        )}
        loading={loading}
        emptyStateProps={
          search
            ? noSearchResults(search, () => setSearch(""))
            : Object.keys(filters).length > 0
            ? noFilterResults(() => setFilters({}))
            : emptyDiscovery("workflow")
        }
      />

      {data && data.pagination.totalPages > 1 && (
        <Pagination
          currentPage={data.pagination.page}
          totalPages={data.pagination.totalPages}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
