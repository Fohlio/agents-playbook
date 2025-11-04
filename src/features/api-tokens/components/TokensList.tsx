import { ApiToken } from "../types";
import { TokenItem } from "./TokenItem";

interface TokensListProps {
  tokens: ApiToken[];
  loading: boolean;
  onRevoke: (tokenId: string) => void;
}

export function TokensList({ tokens, loading, onRevoke }: TokensListProps) {
  if (loading) {
    return (
      <div className="text-center py-8 text-gray-500" data-testid="tokens-loading">
        Loading tokens...
      </div>
    );
  }

  if (tokens.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500" data-testid="tokens-empty-state">
        <p className="text-lg mb-2">No API tokens yet</p>
        <p className="text-sm">
          Create a token to authenticate with the MCP server
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

