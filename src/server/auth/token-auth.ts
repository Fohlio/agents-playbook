import crypto from 'crypto';
import { prisma } from '@/server/db/client';

export interface TokenValidationResult {
  valid: boolean;
  userId?: string;
  error?: 'INVALID_TOKEN' | 'EXPIRED' | 'USER_INACTIVE';
}

export class TokenAuthService {
  /**
   * Hash token using SHA-256
   */
  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  /**
   * Validate authentication token
   */
  async validateToken(token: string): Promise<TokenValidationResult> {
    try {
      const tokenHash = this.hashToken(token);

      // Query token from database
      const apiToken = await prisma.apiToken.findFirst({
        where: { tokenHash },
        include: { user: true }
      });

      // Token doesn't exist
      if (!apiToken) {
        return { valid: false, error: 'INVALID_TOKEN' };
      }

      // Token expired
      if (apiToken.expiresAt < new Date()) {
        return { valid: false, error: 'EXPIRED' };
      }

      // User inactive
      if (!apiToken.user) {
        return { valid: false, error: 'USER_INACTIVE' };
      }

      // Update last used timestamp (async, don't wait)
      this.updateLastUsed(apiToken.id).catch(err =>
        console.error('[TokenAuth] Failed to update lastUsedAt:', err)
      );

      return {
        valid: true,
        userId: apiToken.userId
      };
    } catch (error) {
      console.error('[TokenAuth] Validation error:', error);
      return { valid: false, error: 'INVALID_TOKEN' };
    }
  }

  /**
   * Update token last used timestamp
   */
  private async updateLastUsed(tokenId: string): Promise<void> {
    await prisma.apiToken.update({
      where: { id: tokenId },
      data: { lastUsedAt: new Date() }
    });
  }
}

export const tokenAuth = new TokenAuthService();
