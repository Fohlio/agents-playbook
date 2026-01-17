"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalActions,
  Button,
  Select,
  type SelectOption,
} from "@/shared/ui/atoms";
import { CopyButton } from "@/shared/ui/molecules";

type TargetType = "WORKFLOW" | "MINI_PROMPT";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetType: TargetType;
  targetId: string;
  targetName: string;
}

const EXPIRATION_OPTIONS: SelectOption[] = [
  { value: "never", label: "Never" },
  { value: "24h", label: "24 Hours" },
  { value: "7d", label: "7 Days" },
  { value: "30d", label: "30 Days" },
];

/**
 * ShareModal Component
 *
 * Modal for creating and managing share links
 * - Create share link with expiration options
 * - Copy share URL to clipboard
 * - Regenerate token
 * - Disable/Enable sharing
 */
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

  // Check if share link exists on mount
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
        throw new Error(data.error || "Failed to create share link");
      }

      setShareToken(data.shareToken);
      setIsActive(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create share link");
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerateToken = async () => {
    if (!shareToken) return;

    setLoading(true);
    setError(null);

    try {
      // First, get the share link ID
      const itemsResponse = await fetch("/api/v1/share/my-items");
      const itemsData = await itemsResponse.json();
      const shareLink = itemsData.items?.find(
        (item: { id: string; shareToken: string }) => item.shareToken === shareToken
      );

      if (!shareLink) {
        throw new Error("Share link not found");
      }

      const response = await fetch(`/api/v1/share/${shareLink.id}/regenerate`, {
        method: "PATCH",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to regenerate token");
      }

      setShareToken(data.shareToken);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to regenerate token");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async () => {
    if (!shareToken) return;

    setLoading(true);
    setError(null);

    try {
      // Get share link ID
      const itemsResponse = await fetch("/api/v1/share/my-items");
      const itemsData = await itemsResponse.json();
      const shareLink = itemsData.items?.find(
        (item: { id: string; shareToken: string }) => item.shareToken === shareToken
      );

      if (!shareLink) {
        throw new Error("Share link not found");
      }

      const response = await fetch(`/api/v1/share/${shareLink.id}/toggle`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !isActive }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to toggle share link");
      }

      setIsActive(!isActive);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to toggle share link");
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
    <Modal isOpen={isOpen} onClose={onClose} testId="share-modal">
      <ModalHeader title={t('title', { name: targetName })} />
      <ModalBody>
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
            {error}
          </div>
        )}

        {!shareToken ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-700">
              {t('description', { type: typeLabel })}
            </p>

            <Select
              label="Expiration"
              value={expiration}
              onChange={setExpiration}
              options={EXPIRATION_OPTIONS}
              fullWidth
              testId="expiration-select"
            />
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Share URL
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={getShareUrl()}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm"
                />
                <CopyButton
                  textToCopy={getShareUrl()}
                  label={t('copyLink')}
                  size="md"
                  testId="copy-share-url"
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <span className="text-sm text-gray-700">
                Status: {isActive ? tCommon('active') : tCommon('inactive')}
              </span>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleToggleActive}
                disabled={loading}
              >
                {isActive ? t('disableLink') : t('enableLink')}
              </Button>
            </div>

            <div className="pt-2 border-t">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleRegenerateToken}
                disabled={loading}
                fullWidth
              >
                Regenerate Token
              </Button>
              <p className="mt-2 text-xs text-gray-500">
                Regenerating will invalidate the old link
              </p>
            </div>
          </div>
        )}
      </ModalBody>
      <ModalActions>
        <Button variant="secondary" onClick={onClose} disabled={loading}>
          {tCommon('close')}
        </Button>
        {!shareToken && (
          <Button
            variant="primary"
            onClick={handleCreateShareLink}
            disabled={loading}
          >
            {loading ? tCommon('loading') : t('createLink')}
          </Button>
        )}
      </ModalActions>
    </Modal>
  );
}
