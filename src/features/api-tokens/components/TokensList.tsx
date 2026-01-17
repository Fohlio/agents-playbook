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
  const tCommon = useTranslations('common');

  if (loading) {
    return (
      <div className="text-center py-8 text-gray-500" data-testid="tokens-loading">
        {tCommon('loading')}
      </div>
    );
  }

  if (tokens.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500" data-testid="tokens-empty-state">
        <p className="text-lg mb-2">{t('noTokens')}</p>
        <p className="text-sm">
          {t('noTokensDescription')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4" data-testid="tokens-list">
      {tokens.map((token) => (
        <TokenItem key={token.id} token={token} onRevoke={onRevoke} />
      ))}
    </div>
  );
}
