export interface ApiToken {
  id: string;
  name: string;
  maskedToken: string;
  createdAt: string;
  expiresAt: string;
  lastUsedAt: string | null;
}

export interface CreateTokenResponse {
  token: {
    plainToken: string;
  };
}

