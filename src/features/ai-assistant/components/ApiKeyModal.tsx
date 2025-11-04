"use client";

import { useState } from "react";
import { Modal, ModalHeader, ModalBody, ModalActions } from "@/shared/ui/atoms/Modal";
import Button from "@/shared/ui/atoms/Button";
import { Input } from "@/shared/ui/atoms";

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: () => void;
}

export function ApiKeyModal({ isOpen, onClose, onSave }: ApiKeyModalProps) {
  const [apiKey, setApiKey] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSave = async () => {
    if (!apiKey.trim()) {
      setError("Please enter an API key");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch("/api/ai-assistant/openai-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: apiKey.trim() }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to save API key");
      }

      setSuccess(true);
      setApiKey("");

      // Call onSave callback if provided
      onSave?.();

      // Close modal after short delay to show success message
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save API key");
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    if (!isSaving) {
      setApiKey("");
      setError(null);
      setSuccess(false);
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <ModalHeader title="Add OpenAI API Key" />
      <ModalBody>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-4">
              Enter your OpenAI API key to enable AI-powered chat features. Your key is stored securely and never shared.
            </p>
            <p className="text-xs text-gray-500 mb-4">
              Get your API key from{" "}
              <a
                href="https://platform.openai.com/api-keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 underline"
              >
                OpenAI Platform
              </a>
            </p>
          </div>

          <div>
            <label htmlFor="api-key" className="block text-sm font-medium text-gray-700 mb-2">
              API Key
            </label>
            <Input
              id="api-key"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
              disabled={isSaving || success}
              className="w-full"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !isSaving && !success) {
                  handleSave();
                }
              }}
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-800">✓ API key saved successfully!</p>
            </div>
          )}
        </div>
      </ModalBody>
      <ModalActions>
        <Button
          variant="secondary"
          onClick={handleClose}
          disabled={isSaving || success}
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleSave}
          disabled={isSaving || success || !apiKey.trim()}
        >
          {isSaving ? "Saving..." : success ? "Saved!" : "Save API Key"}
        </Button>
      </ModalActions>
    </Modal>
  );
}
