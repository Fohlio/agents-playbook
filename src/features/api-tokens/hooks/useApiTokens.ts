"use client";
import { useState, useEffect } from "react";
import { ApiToken } from "../types";

export function useApiTokens() {
  const [tokens, setTokens] = useState<ApiToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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

  useEffect(() => {
    fetchTokens();
  }, []);

  const createToken = async (name: string) => {
    try {
      setError(null);
      const response = await fetch("/api/v1/tokens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to create token");
      }

      await fetchTokens();
      return result.token.plainToken;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create token";
      setError(errorMessage);
      throw err;
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
      await fetchTokens();

      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to revoke token";
      setError(errorMessage);
      throw err;
    }
  };

  const clearError = () => setError(null);
  const clearSuccess = () => setSuccess(null);

  return {
    tokens,
    loading,
    error,
    success,
    fetchTokens,
    createToken,
    revokeToken,
    clearError,
    clearSuccess,
  };
}

