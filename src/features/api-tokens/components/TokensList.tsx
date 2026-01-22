'use client';

import { useTranslations } from 'next-intl';
import { ApiToken } from "../types";
import { TokenItem } from "./TokenItem";

interface TokensListProps {
  tokens: ApiToken[];
  loading: boolean;
  onRevoke: (tokenId: string) => void;
}

export function TokensList({ tokens, loading, onRevoke }: TokensListProps) {
  const t = useTranslations('settings.apiTokens');

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8" data-testid="tokens-loading">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin" />
          <span className="text-cyan-400 font-mono text-sm uppercase tracking-wider">{t('loading')}</span>
        </div>
      </div>
    );
  }

  if (tokens.length === 0) {
    return (
      <div className="text-center py-8" data-testid="tokens-empty-state">
        <div className="text-cyan-500/30 mb-4">
          <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
          </svg>
        </div>
        <p className="text-cyan-400 font-mono uppercase tracking-wider mb-2">{t('noTokens')}</p>
        <p className="text-cyan-100/40 font-mono text-sm">
          {t('noTokensDescription')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3" data-testid="tokens-list">
      {tokens.map((token) => (
        <TokenItem key={token.id} token={token} onRevoke={onRevoke} />
      ))}
    </div>
  );
}
