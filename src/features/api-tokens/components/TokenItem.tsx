"use client";

import { Badge, Button } from "@/shared/ui/atoms";
import { Tooltip } from "@/shared/ui/molecules";
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

  return (
    <div
      className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
      data-testid={`token-item-${token.id}`}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-gray-900" data-testid={`token-name-${token.id}`}>
              {token.name}
            </h3>
            {isExpired(token.expiresAt) && (
              <Badge variant="error" testId={`token-expired-badge-${token.id}`}>
                {t("expired")}
              </Badge>
            )}
          </div>
          <p className="text-sm text-gray-500 font-mono mt-1" data-testid={`token-masked-${token.id}`}>
            {token.maskedToken}
          </p>
          <div className="mt-2 text-xs text-gray-500 space-y-1" data-testid={`token-metadata-${token.id}`}>
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
        <Tooltip content={t("revokeTooltip")}>
          <Button
            variant="danger"
            size="sm"
            onClick={() => onRevoke(token.id)}
            testId={`revoke-token-button-${token.id}`}
          >
            {t("revoke")}
          </Button>
        </Tooltip>
      </div>
    </div>
  );
}

