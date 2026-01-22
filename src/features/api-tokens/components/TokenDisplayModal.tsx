"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Modal } from "@/shared/ui/atoms";

interface TokenDisplayModalProps {
  isOpen: boolean;
  token: string | null;
  onClose: () => void;
}

export function TokenDisplayModal({ isOpen, token, onClose }: TokenDisplayModalProps) {
  const t = useTranslations('settings.apiTokens');
  const tCommon = useTranslations('common');

  const [success, setSuccess] = useState<string | null>(null);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setSuccess(t('displayModal.copied'));
    setTimeout(() => setSuccess(null), 2000);
  };

  const handleClose = () => {
    onClose();
    setSuccess(null);
  };

  return (
    <Modal
      isOpen={isOpen && !!token}
      className="max-w-lg"
      testId="token-display-modal"
    >
      <h3 className="text-lg font-mono font-bold text-green-400 uppercase tracking-wider mb-4" style={{ textShadow: '0 0 10px #00ff0040' }} data-testid="token-display-modal-heading">
        {t('displayModal.title')}
      </h3>

      <div className="space-y-4 mb-6">
        <div className="p-3 bg-yellow-500/10 border border-yellow-500/50 text-yellow-400 font-mono text-sm" data-testid="token-display-warning">
          <span className="font-bold">&gt; WARNING:</span> {t('displayModal.warning')}
        </div>

        {success && (
          <div className="p-3 bg-green-500/10 border border-green-500/50 text-green-400 font-mono text-sm">
            &gt; {success}
          </div>
        )}

        <div>
          <label className="block text-xs font-mono text-cyan-400 uppercase tracking-wider mb-2">
            {t('yourApiToken')}
          </label>
          <div className="flex gap-2">
            <input
              value={token || ""}
              readOnly
              className="flex-1 px-3 py-2 bg-[#050508]/50 border border-cyan-500/50 text-cyan-100 font-mono text-sm"
              data-testid="token-display-input"
            />
            <button
              onClick={() => token && copyToClipboard(token)}
              className="px-4 py-2 bg-transparent border border-cyan-500/30 text-cyan-400 font-mono text-sm uppercase tracking-wider hover:bg-cyan-500/10 hover:border-cyan-400 transition-all cursor-pointer"
              data-testid="copy-token-button"
            >
              {tCommon('copy')}
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleClose}
          className="px-6 py-2.5 bg-gradient-to-r from-green-500 to-emerald-400 text-[#050508] font-bold uppercase tracking-wider text-sm hover:shadow-[0_0_20px_rgba(0,255,0,0.4)] transition-all cursor-pointer"
          style={{ clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))' }}
          data-testid="close-token-modal-button"
        >
          {t('tokenSaved')}
        </button>
      </div>
    </Modal>
  );
}
