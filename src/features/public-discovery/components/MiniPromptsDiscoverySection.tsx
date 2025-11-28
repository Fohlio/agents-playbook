"use client";

import { useState, useEffect } from "react";
import { MiniPromptDiscoveryCard } from "@/shared/ui/molecules/MiniPromptDiscoveryCard";
import { DiscoveryGrid } from "@/shared/ui/organisms/DiscoveryGrid";
import { Pagination } from "@/shared/ui/molecules/Pagination";
import { SearchBar } from "@/shared/ui/molecules/SearchBar";
import { DiscoveryFilters } from "./DiscoveryFilters";
import { PublicMiniPromptWithMeta, PaginatedResult, MiniPromptSortOption, MiniPromptFilters } from "../types";
import { useToast } from "@/shared/ui/providers/ToastProvider";
import { noSearchResults, noFilterResults, emptyDiscovery } from "@/shared/ui/molecules/empty-state-presets";

interface MiniPromptsDiscoverySectionProps {
  isAuthenticated: boolean;
  currentUserId?: string;
}

export function MiniPromptsDiscoverySection({
  isAuthenticated,
  currentUserId,
}: MiniPromptsDiscoverySectionProps) {
  const [data, setData] = useState<PaginatedResult<PublicMiniPromptWithMeta> | null>(null);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<MiniPromptSortOption>("most_used");
  const [filters, setFilters] = useState<MiniPromptFilters>({});
  const { showToast } = useToast();

  useEffect(() => {
    fetchMiniPrompts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search, sort, filters]);

  const fetchMiniPrompts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        ...(search && { search }),
        sort,
        ...(Object.keys(filters).length > 0 && { filters: JSON.stringify(filters) }),
      });

      const response = await fetch(`/api/v1/public/mini-prompts?${params}`);
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error("Error fetching mini-prompts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUndo = async (miniPromptId: string) => {
    try {
      const response = await fetch(`/api/v1/mini-prompts/import/${miniPromptId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        showToast({
          message: "Removed from library",
          variant: "info",
        });
        fetchMiniPrompts();
      }
    } catch (error) {
      console.error("Error undoing import:", error);
      showToast({
        message: "Failed to undo",
        variant: "error",
      });
    }
  };

  const handleImport = async (miniPromptId: string) => {
    setImporting(miniPromptId);
    try {
      const response = await fetch(
        `/api/v1/mini-prompts/import/${miniPromptId}`,
        {
          method: "POST",
        }
      );

      if (response.ok) {
        showToast({
          message: "Mini-prompt added to library",
          variant: "success",
          action: {
            label: "Undo",
            onClick: () => handleUndo(miniPromptId),
          },
        });
        // Refresh data to update "In Library" status
        fetchMiniPrompts();
      } else {
        const errorData = await response.json();
        showToast({
          message: errorData.error || "Failed to add to library",
          variant: "error",
        });
      }
    } catch (error) {
      console.error("Error importing mini-prompt:", error);
      showToast({
        message: "Failed to add to library",
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
          placeholder="Search mini-prompts by name, content, or author..."
        />
      </div>

      <DiscoveryFilters
        type="mini-prompt"
        currentSort={sort}
        currentFilters={filters}
        onSortChange={(newSort) => {
          setSort(newSort as MiniPromptSortOption);
          setPage(1);
        }}
        onFiltersChange={(newFilters) => {
          setFilters(newFilters as MiniPromptFilters);
          setPage(1);
        }}
      />

      <DiscoveryGrid
        items={data?.items || []}
        renderCard={(miniPrompt) => (
          <MiniPromptDiscoveryCard
            key={miniPrompt.id}
            miniPrompt={miniPrompt}
            onImport={handleImport}
            onDuplicate={fetchMiniPrompts}
            onUpdate={fetchMiniPrompts}
            isAuthenticated={isAuthenticated}
            isImporting={importing === miniPrompt.id}
            currentUserId={currentUserId}
          />
        )}
        loading={loading}
        emptyStateProps={
          search
            ? noSearchResults(search, () => setSearch(""))
            : Object.keys(filters).length > 0
            ? noFilterResults(() => setFilters({}))
            : emptyDiscovery("mini-prompt")
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
