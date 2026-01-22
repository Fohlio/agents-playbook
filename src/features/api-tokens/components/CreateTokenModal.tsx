"use client";

import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { z } from "zod";
import { Modal } from "@/shared/ui/atoms";

type TokenNameInput = { name: string };

interface CreateTokenModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string) => Promise<void>;
}

export function CreateTokenModal({ isOpen, onClose, onSubmit }: CreateTokenModalProps) {
  const t = useTranslations("settings.apiTokens");
  const tCommon = useTranslations("common");

  const tokenNameSchema = useMemo(() => z.object({
    name: z
      .string()
      .min(1, t("tokenNameRequired"))
      .max(100, t("tokenNameMax")),
  }), [t]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TokenNameInput>({
    resolver: zodResolver(tokenNameSchema),
  });

  const handleClose = () => {
    onClose();
    reset();
  };

  const handleFormSubmit = async (data: TokenNameInput) => {
    await onSubmit(data.name);
    handleClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} testId="create-token-modal">
      <h3 className="text-lg font-mono font-bold text-cyan-400 uppercase tracking-wider mb-4" style={{ textShadow: '0 0 10px #00ffff40' }} data-testid="create-token-modal-heading">
        {t("createModal.title")}
      </h3>
      
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <div>
          <label htmlFor="tokenName" className="block text-xs font-mono text-cyan-400 uppercase tracking-wider mb-2">
            {t("tokenName")} <span className="text-pink-400">*</span>
          </label>
          <input
            id="tokenName"
            type="text"
            placeholder={t("tokenNamePlaceholder")}
            className={`w-full px-3 py-2 bg-[#050508]/50 border font-mono text-sm text-cyan-100 placeholder:text-cyan-500/30 focus:outline-none transition-all ${
              errors.name 
                ? 'border-pink-500/50 focus:border-pink-400 focus:shadow-[0_0_15px_rgba(255,0,102,0.2)]' 
                : 'border-cyan-500/50 focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(0,255,255,0.2)]'
            }`}
            data-testid="token-name-input"
            {...register("name")}
          />
          <p className="text-xs font-mono text-cyan-100/40 mt-1">{t("tokenNameHelper")}</p>
          {errors.name && (
            <p className="text-xs font-mono text-pink-400 mt-1">&gt; ERROR: {errors.name.message}</p>
          )}
        </div>
        
        <div className="flex gap-3 justify-end pt-4">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 bg-transparent border border-cyan-500/30 text-cyan-400 font-mono text-sm uppercase tracking-wider hover:bg-cyan-500/10 hover:border-cyan-400 transition-all cursor-pointer"
            data-testid="cancel-create-token-button"
          >
            {tCommon("cancel")}
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-cyan-400 text-[#050508] font-bold uppercase tracking-wider text-sm hover:shadow-[0_0_20px_rgba(0,255,255,0.4)] transition-all cursor-pointer"
            style={{ clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))' }}
            data-testid="submit-create-token-button"
          >
            {t("createToken")}
          </button>
        </div>
      </form>
    </Modal>
  );
}
