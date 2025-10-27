"use client";

import { useState, useEffect } from "react";
import { MiniPromptDiscoveryCard } from "@/shared/ui/molecules/MiniPromptDiscoveryCard";
import { DiscoveryGrid } from "@/shared/ui/organisms/DiscoveryGrid";
import { Pagination } from "@/shared/ui/molecules/Pagination";
import { SearchBar } from "@/shared/ui/molecules/SearchBar";
import { PublicMiniPromptWithMeta, PaginatedResult } from "../types";

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
  const sort = "recent";

  useEffect(() => {
    fetchMiniPrompts();
  }, [page, search, sort]);

  const fetchMiniPrompts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        ...(search && { search }),
        sort,
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
        // Refresh data to update "In Library" status
        fetchMiniPrompts();
      }
    } catch (error) {
      console.error("Error importing mini-prompt:", error);
    } finally {
      setImporting(null);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <SearchBar
          value={search}
          onChange={(value) => {
            setSearch(value);
            setPage(1); // Reset to first page on search
          }}
          placeholder="Search mini-prompts by name, content, or author..."
        />
      </div>

      <DiscoveryGrid
        items={data?.items || []}
        renderCard={(miniPrompt) => (
          <MiniPromptDiscoveryCard
            key={miniPrompt.id}
            miniPrompt={miniPrompt}
            onImport={handleImport}
            isAuthenticated={isAuthenticated}
            isImporting={importing === miniPrompt.id}
            currentUserId={currentUserId}
          />
        )}
        loading={loading}
        emptyMessage="No mini-prompts found"
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
