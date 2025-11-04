"use client";

import { useState, useEffect } from "react";
import { WorkflowDiscoveryCard } from "@/shared/ui/molecules/WorkflowDiscoveryCard";
import { DiscoveryGrid } from "@/shared/ui/organisms/DiscoveryGrid";
import { Pagination } from "@/shared/ui/molecules/Pagination";
import { SearchBar } from "@/shared/ui/molecules/SearchBar";
import { DiscoveryFilters } from "./DiscoveryFilters";
import { PublicWorkflowWithMeta, PaginatedResult, WorkflowSortOption, WorkflowFilters } from "../types";

interface WorkflowsDiscoverySectionProps {
  isAuthenticated: boolean;
  currentUserId?: string;
}

export function WorkflowsDiscoverySection({
  isAuthenticated,
  currentUserId,
}: WorkflowsDiscoverySectionProps) {
  const [data, setData] = useState<PaginatedResult<PublicWorkflowWithMeta> | null>(null);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<WorkflowSortOption>("most_used");
  const [filters, setFilters] = useState<WorkflowFilters>({});

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

  const handleImport = async (workflowId: string) => {
    setImporting(workflowId);
    try {
      const response = await fetch(`/api/v1/workflows/import/${workflowId}`, {
        method: "POST",
      });

      if (response.ok) {
        // Refresh data to update "In Library" status
        fetchWorkflows();
      }
    } catch (error) {
      console.error("Error importing workflow:", error);
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
          placeholder="Search workflows by name, description, or author..."
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
          <WorkflowDiscoveryCard
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
        emptyMessage="No workflows found"
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
