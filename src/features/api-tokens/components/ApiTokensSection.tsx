"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Card, CardHeader } from "@/shared/ui/atoms";
import { useApiTokens } from "../hooks/useApiTokens";
import { TokensList } from "./TokensList";
import { CreateTokenModal } from "./CreateTokenModal";
import { TokenDisplayModal } from "./TokenDisplayModal";
import { RevokeTokenModal } from "./RevokeTokenModal";

export function ApiTokensSection() {
  const t = useTranslations("settings.apiTokens");
  const {
    tokens,
    loading,
    error,
    success,
    createToken,
    revokeToken,
  } = useApiTokens();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [newPlainToken, setNewPlainToken] = useState<string | null>(null);
  const [tokenToRevoke, setTokenToRevoke] = useState<string | null>(null);

  const handleCreateToken = async (name: string) => {
    const plainToken = await createToken(name);
    setNewPlainToken(plainToken);
    setShowTokenModal(true);
  };

  const handleRevokeToken = async () => {
    if (tokenToRevoke) {
      await revokeToken(tokenToRevoke);
      setTokenToRevoke(null);
    }
  };

  const handleCloseTokenDisplay = () => {
    setShowTokenModal(false);
    setNewPlainToken(null);
  };

  return (
    <Card testId="api-tokens-section">
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <CardHeader
            title={t("title")}
            description={t("subtitle")}
            testId="tokens-heading"
            className="mb-0"
          />
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-cyan-400 text-[#050508] font-bold uppercase tracking-wider text-sm hover:shadow-[0_0_20px_rgba(0,255,255,0.4)] transition-all cursor-pointer"
            style={{ clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))' }}
            data-testid="create-token-button"
            title={t("createTooltip")}
          >
            {t("create")}
          </button>
        </div>

        {error && (
          <div className="p-3 bg-pink-500/10 border border-pink-500/50 text-pink-400 font-mono text-sm" data-testid="tokens-error-alert">
            &gt; ERROR: {error}
          </div>
        )}
        {success && (
          <div className="p-3 bg-green-500/10 border border-green-500/50 text-green-400 font-mono text-sm" data-testid="tokens-success-alert">
            &gt; SUCCESS: {success}
          </div>
        )}

        <TokensList
          tokens={tokens}
          loading={loading}
          onRevoke={(id) => setTokenToRevoke(id)}
        />
      </div>

      <CreateTokenModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateToken}
      />

      <TokenDisplayModal
        isOpen={showTokenModal}
        token={newPlainToken}
        onClose={handleCloseTokenDisplay}
      />

      <RevokeTokenModal
        isOpen={!!tokenToRevoke}
        onClose={() => setTokenToRevoke(null)}
        onConfirm={handleRevokeToken}
      />
    </Card>
  );
}
