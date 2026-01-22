"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Modal } from "@/shared/ui/atoms/Modal";

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: () => void;
}

export function ApiKeyModal({ isOpen, onClose, onSave }: ApiKeyModalProps) {
  const t = useTranslations('aiAssistant.apiKeyModal');
  const tCommon = useTranslations('common');

  const [apiKey, setApiKey] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSave = async () => {
    if (!apiKey.trim()) {
      setError(t('enterApiKey'));
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
        throw new Error(data.error || t('failedToSave'));
      }

      setSuccess(true);
      setApiKey("");
      onSave?.();

      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('failedToSave'));
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
      <h3 className="text-lg font-mono font-bold text-cyan-400 uppercase tracking-wider mb-4" style={{ textShadow: '0 0 10px #00ffff40' }}>
        {t('title')}
      </h3>

      <div className="space-y-4 mb-6">
        <div>
          <p className="text-sm text-cyan-100/60 font-mono mb-4">
            {t('description')}
          </p>
          <p className="text-xs font-mono text-cyan-100/40 mb-4">
            {t('getKeyFrom')}{" "}
            <a
              href="https://platform.openai.com/api-keys"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:text-cyan-300 underline"
            >
              {t('openaiPlatform')}
            </a>
          </p>
        </div>

        <div>
          <label htmlFor="api-key" className="block text-xs font-mono text-cyan-400 uppercase tracking-wider mb-2">
            {t('apiKeyLabel')}
          </label>
          <input
            id="api-key"
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-..."
            disabled={isSaving || success}
            className="w-full px-3 py-2 bg-[#050508]/50 border border-cyan-500/50 text-cyan-100 font-mono text-sm placeholder:text-cyan-500/30 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(0,255,255,0.2)] disabled:opacity-50 transition-all"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !isSaving && !success) {
                handleSave();
              }
            }}
          />
        </div>

        {error && (
          <div className="p-3 bg-pink-500/10 border border-pink-500/50 text-pink-400 font-mono text-sm">
            &gt; ERROR: {error}
          </div>
        )}

        {success && (
          <div className="p-3 bg-green-500/10 border border-green-500/50 text-green-400 font-mono text-sm">
            &gt; {t('savedSuccess')}
          </div>
        )}
      </div>

      <div className="flex gap-3 justify-end">
        <button
          onClick={handleClose}
          disabled={isSaving || success}
          className="px-4 py-2 bg-transparent border border-cyan-500/30 text-cyan-400 font-mono text-sm uppercase tracking-wider hover:bg-cyan-500/10 hover:border-cyan-400 disabled:opacity-50 transition-all cursor-pointer"
        >
          {tCommon('cancel')}
        </button>
        <button
          onClick={handleSave}
          disabled={isSaving || success || !apiKey.trim()}
          className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-cyan-400 text-[#050508] font-bold uppercase tracking-wider text-sm hover:shadow-[0_0_20px_rgba(0,255,255,0.4)] disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
          style={{ clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))' }}
        >
          {isSaving ? t('saving') : success ? t('saved') : t('saveKey')}
        </button>
      </div>
    </Modal>
  );
}
