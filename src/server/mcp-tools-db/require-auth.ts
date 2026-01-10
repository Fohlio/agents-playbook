/**
 * Authentication helpers for MCP tools
 */

export type McpResponse = {
  content: [{ type: "text"; text: string }];
};

export interface AuthRequired {
  authenticated: false;
  response: McpResponse;
}

export interface AuthSuccess {
  authenticated: true;
  userId: string;
}

export type AuthResult = AuthRequired | AuthSuccess;

const AUTH_REQUIRED_MESSAGE = `Authentication required. Please provide an API token to use this tool.

To get your API token:
1. Go to your dashboard settings
2. Generate an API token
3. Include it as a Bearer token in your request`;

export function requireAuth(userId: string | null): AuthResult {
  if (!userId) {
    return {
      authenticated: false,
      response: {
        content: [{ type: "text", text: AUTH_REQUIRED_MESSAGE }],
      },
    };
  }

  return {
    authenticated: true,
    userId,
  };
}

export function mcpError(message: string): McpResponse {
  return {
    content: [{ type: "text", text: `Error: ${message}` }],
  };
}

export function mcpSuccess<T>(data: T): McpResponse {
  return {
    content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
  };
}
