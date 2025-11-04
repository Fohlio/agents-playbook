/**
 * Retry Logic for Database Operations
 * Implements exponential backoff for transient failures
 */

export interface RetryConfig {
  maxAttempts: number;
  delays: number[]; // milliseconds for each retry
}

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  delays: [1000, 2000, 4000], // 1s, 2s, 4s exponential backoff
};

/**
 * Execute a database operation with retry logic
 * @param operation - Async function to execute
 * @param config - Retry configuration
 * @returns Promise with operation result
 * @throws Error after all retries exhausted
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  config: RetryConfig = DEFAULT_RETRY_CONFIG
): Promise<T> {
  let lastError: Error = new Error('Unknown error');
  
  for (let attempt = 0; attempt < config.maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      // Don't retry on client errors (validation, constraints)
      if (isClientError(error)) {
        throw error;
      }
      
      // Log retry attempt
      console.warn(
        `[Retry] Attempt ${attempt + 1}/${config.maxAttempts} failed:`,
        lastError.message
      );
      
      // Wait before retry (except on last attempt)
      if (attempt < config.maxAttempts - 1) {
        await sleep(config.delays[attempt]);
      }
    }
  }
  
  // All retries exhausted
  throw new Error(
    `Operation failed after ${config.maxAttempts} attempts: ${lastError.message}`
  );
}

/**
 * Check if error is a client error (should not retry)
 * @param error - Error object
 * @returns true if client error, false otherwise
 */
function isClientError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }
  
  const message = error.message.toLowerCase();
  
  // Prisma client errors that shouldn't be retried
  return (
    message.includes('unique constraint') ||
    message.includes('foreign key constraint') ||
    message.includes('invalid') ||
    message.includes('validation') ||
    message.includes('not found')
  );
}

/**
 * Sleep helper for delays
 * @param ms - Milliseconds to sleep
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

