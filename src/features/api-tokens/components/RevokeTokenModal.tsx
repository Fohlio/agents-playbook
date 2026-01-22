"use client";

import { useTranslations } from "next-intl";
import { Modal } from "@/shared/ui/atoms";

interface RevokeTokenModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function RevokeTokenModal({ isOpen, onClose, onConfirm }: RevokeTokenModalProps) {
  const t = useTranslations('settings.apiTokens');
  const tCommon = useTranslations('common');

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      testId="revoke-token-modal"
    >
      <h3 className="text-lg font-mono font-bold text-pink-400 uppercase tracking-wider mb-4" style={{ textShadow: '0 0 10px #ff006640' }} data-testid="revoke-token-modal-heading">
        {t('revokeModal.title')}
      </h3>

      <div className="mb-6">
        <p className="text-sm text-cyan-100/60 font-mono" data-testid="revoke-token-modal-description">
          {t('revokeModal.message')}
        </p>
      </div>

      <div className="flex gap-3 justify-end">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-transparent border border-cyan-500/30 text-cyan-400 font-mono text-sm uppercase tracking-wider hover:bg-cyan-500/10 hover:border-cyan-400 transition-all cursor-pointer"
          data-testid="cancel-revoke-button"
        >
          {tCommon('cancel')}
        </button>
        <button
          onClick={onConfirm}
          className="px-6 py-2.5 bg-gradient-to-r from-pink-500 to-pink-400 text-white font-bold uppercase tracking-wider text-sm hover:shadow-[0_0_20px_rgba(255,0,102,0.4)] transition-all cursor-pointer"
          style={{ clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))' }}
          data-testid="confirm-revoke-button"
        >
          {t('revokeModal.confirm')}
        </button>
      </div>
    </Modal>
  );
}
