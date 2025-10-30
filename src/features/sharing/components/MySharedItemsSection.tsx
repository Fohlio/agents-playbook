"use client";

import { useState, useEffect } from "react";
import { Card, Button, Badge } from "@/shared/ui/atoms";
import { CopyButton } from "@/shared/ui/molecules";
import { TargetType } from "@prisma/client";

interface SharedItem {
  id: string;
  shareToken: string;
  targetType: TargetType;
  targetId: string;
  targetName: string;
  targetVisibility: "PUBLIC" | "PRIVATE";
  isActive: boolean;
  expiresAt: string | null;
  viewCount: number;
  createdAt: string;
}

/**
 * MySharedItemsSection Component
 *
 * Dashboard section displaying user's shared items
 * - Shows all share links created by the user
 * - Displays target name, type, view count, active status
 * - Copy share URL button
 * - Toggle enable/disable button
 * - Shows expiration info if set
 * - Empty state when no items
 */
export function MySharedItemsSection() {
  const [items, setItems] = useState<SharedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSharedItems();
  }, []);

  const fetchSharedItems = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/v1/share/my-items");
      if (!response.ok) {
        throw new Error("Failed to fetch shared items");
      }

      const data = await response.json();
      setItems(data.items || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load shared items");
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (itemId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/v1/share/${itemId}/toggle`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to toggle share link");
      }

      // Refresh items
      await fetchSharedItems();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to toggle share link");
    }
  };

  const getShareUrl = (token: string, type: TargetType) => {
    const baseUrl = window.location.origin;
    const typeSlug = type === "WORKFLOW" ? "workflow" : "mini-prompt";
    return `${baseUrl}/share/${typeSlug}/${token}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          My Shared Items
        </h2>
        <p className="text-sm text-gray-500">Loading...</p>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          My Shared Items
        </h2>
        <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
          {error}
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">My Shared Items</h2>
        <Badge variant="default">{items.length}</Badge>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-8">
          <svg
            className="w-16 h-16 mx-auto text-gray-300 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
            />
          </svg>
          <p className="text-gray-500 mb-2">No shared items yet</p>
          <p className="text-sm text-gray-400">
            Share workflows or mini-prompts to see them here
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {item.targetName}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Badge variant="default">
                      {item.targetType === "WORKFLOW" ? "Workflow" : "Mini-Prompt"}
                    </Badge>
                    <Badge
                      variant={
                        item.targetVisibility === "PUBLIC" ? "success" : "warning"
                      }
                    >
                      {item.targetVisibility}
                    </Badge>
                    <span className="flex items-center gap-1">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                      {item.viewCount} {item.viewCount === 1 ? "view" : "views"}
                    </span>
                  </div>
                </div>
                <Badge variant={item.isActive ? "success" : "default"}>
                  {item.isActive ? "Active" : "Disabled"}
                </Badge>
              </div>

              <div className="flex items-center gap-2 mb-3">
                <input
                  type="text"
                  value={getShareUrl(item.shareToken, item.targetType)}
                  readOnly
                  className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-gray-50"
                />
                <CopyButton
                  textToCopy={getShareUrl(item.shareToken, item.targetType)}
                  size="sm"
                />
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500">
                <div>
                  Created: {formatDate(item.createdAt)}
                  {item.expiresAt && (
                    <> • Expires: {formatDate(item.expiresAt)}</>
                  )}
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => toggleActive(item.id, item.isActive)}
                >
                  {item.isActive ? "Disable" : "Enable"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
