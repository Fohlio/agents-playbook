"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button, Alert, Badge, Input, FormField, Card, CardHeader, Modal, ModalHeader, ModalBody, ModalActions } from "@/shared/ui/atoms";
import { formatDistanceToNow } from "date-fns";

const tokenNameSchema = z.object({
  name: z
    .string()
    .min(1, "Token name is required")
    .max(100, "Token name must be at most 100 characters"),
});

type TokenNameInput = z.infer<typeof tokenNameSchema>;

interface ApiToken {
  id: string;
  name: string;
  maskedToken: string;
  createdAt: string;
  expiresAt: string;
  lastUsedAt: string | null;
}

/**
 * ApiTokensSection Component
 *
 * Manages API tokens for MCP server integration:
 * - Lists existing tokens with metadata
 * - Creates new tokens with one-time display
 * - Revokes tokens with confirmation
 * - Shows token expiration status
 */
export default function ApiTokensSection() {
  const [tokens, setTokens] = useState<ApiToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [newPlainToken, setNewPlainToken] = useState<string | null>(null);
  const [tokenToRevoke, setTokenToRevoke] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TokenNameInput>({
    resolver: zodResolver(tokenNameSchema),
  });

  // Fetch tokens on mount
  useEffect(() => {
    fetchTokens();
  }, []);

  const fetchTokens = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/v1/tokens");
      const data = await response.json();

      if (response.ok) {
        setTokens(data.tokens);
      } else {
        setError(data.error || "Failed to fetch tokens");
      }
    } catch {
      setError("Failed to fetch tokens");
    } finally {
      setLoading(false);
    }
  };

  const createToken = async (data: TokenNameInput) => {
    try {
      setError(null);
      const response = await fetch("/api/v1/tokens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to create token");
      }

      // Show plain token in modal (one-time display)
      setNewPlainToken(result.token.plainToken);
      setShowTokenModal(true);
      setShowCreateModal(false);
      reset();

      // Refresh tokens list
      await fetchTokens();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create token");
    }
  };

  const revokeToken = async (tokenId: string) => {
    try {
      setError(null);
      const response = await fetch(`/api/v1/tokens/${tokenId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Failed to revoke token");
      }

      setSuccess("Token revoked successfully");
      setTokenToRevoke(null);

      // Refresh tokens list
      await fetchTokens();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to revoke token");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setSuccess("Token copied to clipboard");
    setTimeout(() => setSuccess(null), 2000);
  };

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
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
          <Button
            variant="primary"
            onClick={() => setShowCreateModal(true)}
            testId="create-token-button"
          >
            Create New Token
          </Button>
        </div>

        {/* Alerts */}
        {error && <Alert variant="error" testId="tokens-error-alert">{error}</Alert>}
        {success && <Alert variant="success" testId="tokens-success-alert">{success}</Alert>}

        {/* Tokens List */}
        {loading ? (
          <div className="text-center py-8 text-gray-500" data-testid="tokens-loading">Loading tokens...</div>
        ) : tokens.length === 0 ? (
          <div className="text-center py-8 text-gray-500" data-testid="tokens-empty-state">
            <p className="text-lg mb-2">No API tokens yet</p>
            <p className="text-sm">
              Create a token to authenticate with the MCP server
            </p>
          </div>
        ) : (
          <div className="space-y-4" data-testid="tokens-list">
            {tokens.map((token) => (
              <div
                key={token.id}
                className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                data-testid={`token-item-${token.id}`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-gray-900" data-testid={`token-name-${token.id}`}>{token.name}</h3>
                      {isExpired(token.expiresAt) && (
                        <Badge variant="error" testId={`token-expired-badge-${token.id}`}>Expired</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 font-mono mt-1" data-testid={`token-masked-${token.id}`}>
                      {token.maskedToken}
                    </p>
                    <div className="mt-2 text-xs text-gray-500 space-y-1" data-testid={`token-metadata-${token.id}`}>
                      <p>
                        Created:{" "}
                        {formatDistanceToNow(new Date(token.createdAt), {
                          addSuffix: true,
                        })}
                      </p>
                      <p>
                        Expires:{" "}
                        {formatDistanceToNow(new Date(token.expiresAt), {
                          addSuffix: true,
                        })}
                      </p>
                      {token.lastUsedAt && (
                        <p>
                          Last used:{" "}
                          {formatDistanceToNow(new Date(token.lastUsedAt), {
                            addSuffix: true,
                          })}
                        </p>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => setTokenToRevoke(token.id)}
                    testId={`revoke-token-button-${token.id}`}
                  >
                    Revoke
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={showCreateModal} onClose={() => { setShowCreateModal(false); reset(); }} testId="create-token-modal">
        <ModalHeader title="Create API Token" testId="create-token-modal-heading" />
        <form onSubmit={handleSubmit(createToken)} className="space-y-4">
          <FormField
            label="Token Name"
            htmlFor="tokenName"
            required
            error={errors.name?.message}
            helperText="A descriptive name for this token"
          >
            <Input
              id="tokenName"
              type="text"
              placeholder="My MCP Token"
              error={!!errors.name}
              fullWidth
              testId="token-name-input"
              {...register("name")}
            />
          </FormField>
          <ModalActions>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setShowCreateModal(false);
                reset();
              }}
              testId="cancel-create-token-button"
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" testId="submit-create-token-button">
              Create Token
            </Button>
          </ModalActions>
        </form>
      </Modal>

      <Modal
        isOpen={showTokenModal && !!newPlainToken}
        className="max-w-lg"
        testId="token-display-modal"
      >
        <ModalHeader title="Token Created Successfully" testId="token-display-modal-heading" />
        <ModalBody>
          <div className="mb-4">
            <Alert variant="warning" testId="token-display-warning">
              <strong>Important:</strong> Copy this token now. You won&apos;t be
              able to see it again!
            </Alert>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your API Token
            </label>
            <div className="flex gap-2">
              <Input
                value={newPlainToken || ""}
                readOnly
                fullWidth
                className="font-mono text-sm"
                testId="token-display-input"
              />
              <Button
                variant="secondary"
                onClick={() => newPlainToken && copyToClipboard(newPlainToken)}
                testId="copy-token-button"
              >
                Copy
              </Button>
            </div>
          </div>
        </ModalBody>
        <ModalActions>
          <Button
            variant="primary"
            onClick={() => {
              setShowTokenModal(false);
              setNewPlainToken(null);
            }}
            testId="close-token-modal-button"
          >
            I&apos;ve Saved My Token
          </Button>
        </ModalActions>
      </Modal>

      <Modal
        isOpen={!!tokenToRevoke}
        onClose={() => setTokenToRevoke(null)}
        testId="revoke-token-modal"
      >
        <ModalHeader title="Revoke Token?" testId="revoke-token-modal-heading" />
        <ModalBody>
          <p className="text-sm text-gray-600" data-testid="revoke-token-modal-description">
            This will permanently revoke the token. Any applications using
            this token will no longer be able to authenticate.
          </p>
        </ModalBody>
        <ModalActions>
          <Button
            variant="secondary"
            onClick={() => setTokenToRevoke(null)}
            testId="cancel-revoke-button"
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => tokenToRevoke && revokeToken(tokenToRevoke)}
            testId="confirm-revoke-button"
          >
            Revoke Token
          </Button>
        </ModalActions>
      </Modal>
    </Card>
  );
}
