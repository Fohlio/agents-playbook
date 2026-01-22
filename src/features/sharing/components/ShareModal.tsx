"use client";

import { useState, useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Modal, Select, type SelectOption } from "@/shared/ui/atoms";
import { CopyButton } from "@/shared/ui/molecules";

type TargetType = "WORKFLOW" | "MINI_PROMPT";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetType: TargetType;
  targetId: string;
  targetName: string;
}

export function ShareModal({
  isOpen,
  onClose,
  targetType,
  targetId,
  targetName,
}: ShareModalProps) {
  const [shareToken, setShareToken] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(true);
  const [expiration, setExpiration] = useState<string>("never");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const t = useTranslations('sharing.shareModal');
  const tCommon = useTranslations('common');

  const expirationOptions: SelectOption[] = useMemo(() => [
    { value: "never", label: t('never') },
    { value: "24h", label: t('hours24') },
    { value: "7d", label: t('days7') },
    { value: "30d", label: t('days30') },
  ], [t]);

  useEffect(() => {
    if (isOpen) {
      checkExistingShareLink();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, targetId]);

  const checkExistingShareLink = async () => {
    try {
      const response = await fetch("/api/v1/share/my-items");
      if (!response.ok) return;

      const data = await response.json();
      const existing = data.items?.find(
        (item: { targetType: string; targetId: string; shareToken: string; isActive: boolean }) =>
          item.targetType === targetType && item.targetId === targetId
      );

      if (existing) {
        setShareToken(existing.shareToken);
        setIsActive(existing.isActive);
      }
    } catch (error) {
      console.error("Error checking existing share link:", error);
    }
  };

  const calculateExpirationDate = (option: string): Date | undefined => {
    if (option === "never") return undefined;

    const now = new Date();
    switch (option) {
      case "24h":
        now.setHours(now.getHours() + 24);
        break;
      case "7d":
        now.setDate(now.getDate() + 7);
        break;
      case "30d":
        now.setDate(now.getDate() + 30);
        break;
    }
    return now;
  };

  const handleCreateShareLink = async () => {
    setLoading(true);
    setError(null);

    try {
      const expiresAt = calculateExpirationDate(expiration);
      const response = await fetch("/api/v1/share/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetType,
          targetId,
          expiresAt: expiresAt?.toISOString(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t('failedToCreateLink'));
      }

      setShareToken(data.shareToken);
      setIsActive(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('failedToCreateLink'));
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerateToken = async () => {
    if (!shareToken) return;

    setLoading(true);
    setError(null);

    try {
      const itemsResponse = await fetch("/api/v1/share/my-items");
      const itemsData = await itemsResponse.json();
      const shareLink = itemsData.items?.find(
        (item: { id: string; shareToken: string }) => item.shareToken === shareToken
      );

      if (!shareLink) {
        throw new Error(t('shareLinkNotFound'));
      }

      const response = await fetch(`/api/v1/share/${shareLink.id}/regenerate`, {
        method: "PATCH",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t('failedToRegenerateToken'));
      }

      setShareToken(data.shareToken);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('failedToRegenerateToken'));
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async () => {
    if (!shareToken) return;

    setLoading(true);
    setError(null);

    try {
      const itemsResponse = await fetch("/api/v1/share/my-items");
      const itemsData = await itemsResponse.json();
      const shareLink = itemsData.items?.find(
        (item: { id: string; shareToken: string }) => item.shareToken === shareToken
      );

      if (!shareLink) {
        throw new Error(t('shareLinkNotFound'));
      }

      const response = await fetch(`/api/v1/share/${shareLink.id}/toggle`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !isActive }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t('failedToToggleLink'));
      }

      setIsActive(!isActive);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('failedToToggleLink'));
    } finally {
      setLoading(false);
    }
  };

  const getShareUrl = () => {
    if (!shareToken) return "";
    const baseUrl = window.location.origin;
    return `${baseUrl}/s/${shareToken}`;
  };

  const typeLabel = targetType === "WORKFLOW" ? tCommon('workflows').toLowerCase() : tCommon('miniPrompts').toLowerCase();

  return (
    <Modal isOpen={isOpen} onClose={onClose} testId="share-modal" className="max-w-md">
      <h3 className="text-lg font-mono font-bold text-cyan-400 uppercase tracking-wider mb-4" style={{ textShadow: '0 0 10px #00ffff40' }}>
        {t('title', { name: targetName })}
      </h3>

      <div className="space-y-4 mb-6">
        {error && (
          <div className="p-3 bg-pink-500/10 border border-pink-500/50 text-pink-400 font-mono text-sm">
            &gt; ERROR: {error}
          </div>
        )}

        {!shareToken ? (
          <div className="space-y-4">
            <p className="text-sm text-cyan-100/60 font-mono">
              {t('description', { type: typeLabel })}
            </p>

            <div>
              <label className="block text-xs font-mono text-cyan-400 uppercase tracking-wider mb-2">
                {t('expiration')}
              </label>
              <Select
                value={expiration}
                onChange={setExpiration}
                options={expirationOptions}
                fullWidth
                testId="expiration-select"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-cyan-400 uppercase tracking-wider mb-2">
                {t('shareUrl')}
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={getShareUrl()}
                  readOnly
                  className="flex-1 px-3 py-2 bg-[#050508]/50 border border-cyan-500/50 text-cyan-100 font-mono text-sm"
                />
                <CopyButton
                  textToCopy={getShareUrl()}
                  label={t('copyLink')}
                  size="md"
                  testId="copy-share-url"
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-[#050508]/50 border border-cyan-500/30">
              <span className="text-sm font-mono text-cyan-100/60">
                {t('status')}: <span className={isActive ? 'text-green-400' : 'text-pink-400'}>{isActive ? t('statusActive') : t('statusInactive')}</span>
              </span>
              <button
                onClick={handleToggleActive}
                disabled={loading}
                className="px-3 py-1.5 bg-transparent border border-cyan-500/30 text-cyan-400 font-mono text-xs uppercase tracking-wider hover:bg-cyan-500/10 hover:border-cyan-400 disabled:opacity-50 transition-all cursor-pointer"
              >
                {isActive ? t('disableLink') : t('enableLink')}
              </button>
            </div>

            <div className="pt-2 border-t border-cyan-500/20">
              <button
                onClick={handleRegenerateToken}
                disabled={loading}
                className="w-full px-3 py-2 bg-transparent border border-yellow-500/30 text-yellow-400 font-mono text-xs uppercase tracking-wider hover:bg-yellow-500/10 hover:border-yellow-400 disabled:opacity-50 transition-all cursor-pointer"
              >
                {t('regenerateToken')}
              </button>
              <p className="mt-2 text-xs font-mono text-cyan-100/40">
                {t('regenerateNote')}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-3 justify-end">
        <button
          onClick={onClose}
          disabled={loading}
          className="px-4 py-2 bg-transparent border border-cyan-500/30 text-cyan-400 font-mono text-sm uppercase tracking-wider hover:bg-cyan-500/10 hover:border-cyan-400 disabled:opacity-50 transition-all cursor-pointer"
        >
          {tCommon('close')}
        </button>
        {!shareToken && (
          <button
            onClick={handleCreateShareLink}
            disabled={loading}
            className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-cyan-400 text-[#050508] font-bold uppercase tracking-wider text-sm hover:shadow-[0_0_20px_rgba(0,255,255,0.4)] disabled:opacity-50 transition-all cursor-pointer"
            style={{ clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))' }}
          >
            {loading ? tCommon('loading') : t('createLink')}
          </button>
        )}
      </div>
    </Modal>
  );
}
