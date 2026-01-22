"use client";

import { useTranslations } from "next-intl";
import { formatDistanceToNow } from "date-fns";
import { ApiToken } from "../types";

interface TokenItemProps {
  token: ApiToken;
  onRevoke: (tokenId: string) => void;
}

export function TokenItem({ token, onRevoke }: TokenItemProps) {
  const t = useTranslations("settings.apiTokens");

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  const expired = isExpired(token.expiresAt);

  return (
    <div
      className={`border p-4 transition-all ${
        expired 
          ? 'bg-pink-500/5 border-pink-500/30 hover:border-pink-400/50' 
          : 'bg-[#050508]/30 border-cyan-500/30 hover:border-cyan-400/50'
      }`}
      data-testid={`token-item-${token.id}`}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-mono text-cyan-100" data-testid={`token-name-${token.id}`}>
              {token.name}
            </h3>
            {expired && (
              <span 
                className="px-2 py-0.5 text-xs font-mono bg-pink-500/20 text-pink-400 border border-pink-500/50 uppercase"
                data-testid={`token-expired-badge-${token.id}`}
              >
                {t("expired")}
              </span>
            )}
          </div>
          <p className="text-sm text-cyan-400 font-mono mt-1" data-testid={`token-masked-${token.id}`}>
            {token.maskedToken}
          </p>
          <div className="mt-2 text-xs text-cyan-100/40 font-mono space-y-1" data-testid={`token-metadata-${token.id}`}>
            <p>
              {t("created")}{" "}
              {formatDistanceToNow(new Date(token.createdAt), {
                addSuffix: true,
              })}
            </p>
            <p>
              {t("expires")}{" "}
              {formatDistanceToNow(new Date(token.expiresAt), {
                addSuffix: true,
              })}
            </p>
            {token.lastUsedAt && (
              <p>
                {t("lastUsed")}{" "}
                {formatDistanceToNow(new Date(token.lastUsedAt), {
                  addSuffix: true,
                })}
              </p>
            )}
          </div>
        </div>
        <button
          onClick={() => onRevoke(token.id)}
          className="px-3 py-1.5 text-xs font-mono uppercase bg-transparent border border-pink-500/50 text-pink-400 hover:bg-pink-500/10 hover:border-pink-400 transition-all cursor-pointer"
          data-testid={`revoke-token-button-${token.id}`}
          title={t("revokeTooltip")}
        >
          {t("revoke")}
        </button>
      </div>
    </div>
  );
}
