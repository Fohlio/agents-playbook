"use client";

import { useState } from "react";
import { Button, Alert, Card, CardHeader } from "@/shared/ui/atoms";
import { Tooltip } from "@/shared/ui/molecules";
import { useApiTokens } from "../hooks/useApiTokens";
import { TokensList } from "./TokensList";
import { CreateTokenModal } from "./CreateTokenModal";
import { TokenDisplayModal } from "./TokenDisplayModal";
import { RevokeTokenModal } from "./RevokeTokenModal";

export function ApiTokensSection() {
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
            title="API Tokens"
            description="Manage API tokens for MCP server integration"
            testId="tokens-heading"
            className="mb-0"
          />
          <Tooltip content="Generate a new API token for authenticating MCP server requests from AI assistants">
            <Button
              variant="primary"
              onClick={() => setShowCreateModal(true)}
              testId="create-token-button"
            >
              Create New Token
            </Button>
          </Tooltip>
        </div>

        {error && <Alert variant="error" testId="tokens-error-alert">{error}</Alert>}
        {success && <Alert variant="success" testId="tokens-success-alert">{success}</Alert>}

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

