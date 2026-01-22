"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Card } from "@/shared/ui/atoms";
import { CopyButton, EmptyState } from "@/shared/ui/molecules";
import { noSharedItems } from "@/shared/ui/molecules/empty-state-presets";
import { useToast } from "@/shared/ui/providers/ToastProvider";
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

export function MySharedItemsSection() {
  const t = useTranslations('sharing');
  const tCommon = useTranslations('common');

  const [items, setItems] = useState<SharedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    const doFetch = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/api/v1/share/my-items");
        if (!response.ok) {
          throw new Error(t('failedToLoad'));
        }

        const data = await response.json();
        setItems(data.items || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : t('failedToLoad'));
      } finally {
        setLoading(false);
      }
    };
    doFetch();
  }, [t]);


  const toggleActive = async (itemId: string, currentStatus: boolean) => {
    const previousItems = items;
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, isActive: !currentStatus } : item
      )
    );

    try {
      const response = await fetch(`/api/v1/share/${itemId}/toggle`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (!response.ok) {
        throw new Error(t('failedToToggle'));
      }

      showToast({
        message: currentStatus ? t('linkDisabled') : t('linkEnabled'),
        variant: "success",
      });
    } catch (err) {
      setItems(previousItems);
      showToast({
        message: err instanceof Error ? err.message : t('failedToToggle'),
        variant: "error",
      });
    }
  };

  const deleteShare = async (itemId: string, itemName: string) => {
    if (!confirm(t('confirmDelete', { name: itemName }))) {
      return;
    }

    const previousItems = items;
    setItems((prev) => prev.filter((item) => item.id !== itemId));

    try {
      const response = await fetch(`/api/v1/share/${itemId}/delete`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || t('failedToDelete'));
      }

      showToast({
        message: t('linkDeleted'),
        variant: "success",
      });
    } catch (err) {
      setItems(previousItems);
      showToast({
        message: err instanceof Error ? err.message : t('failedToDelete'),
        variant: "error",
      });
    }
  };

  const getShareUrl = (token: string) => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/s/${token}`;
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
        <h2 className="text-lg font-mono font-bold text-cyan-400 uppercase tracking-wider mb-4" style={{ textShadow: '0 0 10px #00ffff40' }}>
          {t('header')}
        </h2>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin" />
          <span className="text-sm font-mono text-cyan-100/40">{t('loading')}</span>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <h2 className="text-lg font-mono font-bold text-cyan-400 uppercase tracking-wider mb-4" style={{ textShadow: '0 0 10px #00ffff40' }}>
          {t('header')}
        </h2>
        <div className="p-3 bg-pink-500/10 border border-pink-500/50 text-pink-400 font-mono text-sm">
          &gt; ERROR: {error}
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-mono font-bold text-cyan-400 uppercase tracking-wider" style={{ textShadow: '0 0 10px #00ffff40' }}>
          {t('header')}
        </h2>
        <span className="px-2 py-1 bg-cyan-500/20 text-cyan-400 font-mono text-sm border border-cyan-500/50">
          {items.length}
        </span>
      </div>

      {items.length === 0 ? (
        <EmptyState {...noSharedItems()} />
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="p-4 bg-[#050508]/50 border border-cyan-500/30 hover:border-cyan-400/50 transition-all"
              style={{ clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))' }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-mono font-bold text-pink-400 mb-2" style={{ textShadow: '0 0 10px #ff006640' }}>
                    {item.targetName}
                  </h3>
                  <div className="flex items-center gap-2 text-sm font-mono flex-wrap">
                    <span className="px-2 py-0.5 text-xs bg-cyan-500/20 text-cyan-400 border border-cyan-500/50">
                      {item.targetType === "WORKFLOW" ? tCommon('workflows') : tCommon('miniPrompts')}
                    </span>
                    <span className={`px-2 py-0.5 text-xs border ${
                      item.targetVisibility === "PUBLIC"
                        ? "bg-green-500/20 text-green-400 border-green-500/50"
                        : "bg-yellow-500/20 text-yellow-400 border-yellow-500/50"
                    }`}>
                      {item.targetVisibility === "PUBLIC" ? t('public') : t('private')}
                    </span>
                    <span className="flex items-center gap-1 text-cyan-100/50">
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
                      {t('views', { count: item.viewCount })}
                    </span>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs font-mono border ${
                  item.isActive
                    ? "bg-green-500/20 text-green-400 border-green-500/50"
                    : "bg-cyan-500/10 text-cyan-100/40 border-cyan-500/30"
                }`}>
                  {item.isActive ? t('statusActive') : t('statusDisabled')}
                </span>
              </div>

              <div className="flex items-center gap-2 mb-3">
                <input
                  type="text"
                  value={getShareUrl(item.shareToken)}
                  readOnly
                  className="flex-1 px-3 py-1.5 bg-[#050508]/50 border border-cyan-500/30 text-cyan-100 font-mono text-sm"
                />
                <CopyButton
                  textToCopy={getShareUrl(item.shareToken)}
                  size="sm"
                />
              </div>

              <div className="flex items-center justify-between text-xs font-mono text-cyan-100/40">
                <div>
                  {t('created')}: {formatDate(item.createdAt)}
                  {item.expiresAt && (
                    <span className="text-yellow-400"> {t('expires')}: {formatDate(item.expiresAt)}</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleActive(item.id, item.isActive)}
                    className="px-3 py-1.5 bg-transparent border border-cyan-500/30 text-cyan-400 font-mono text-xs uppercase tracking-wider hover:bg-cyan-500/10 hover:border-cyan-400 transition-all cursor-pointer"
                  >
                    {item.isActive ? t('disable') : t('enable')}
                  </button>
                  <button
                    onClick={() => deleteShare(item.id, item.targetName)}
                    className="px-3 py-1.5 bg-pink-500/20 border border-pink-500/50 text-pink-400 font-mono text-xs uppercase tracking-wider hover:bg-pink-500/30 hover:border-pink-400 transition-all cursor-pointer"
                  >
                    {tCommon('delete')}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
