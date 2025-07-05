import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable static optimization
  output: 'standalone',
  
  // Configure static file serving
  publicRuntimeConfig: {
    staticFolder: '/public',
  },
  
  // Webpack configuration for MCP server files
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Copy static files during build
      config.externals = [...(config.externals || [])];
    }
    
    return config;
  },
  
  // Headers for MCP server
  async headers() {
    return [
      {
        source: '/api/mcp',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization, mcp-session-id',
          },
          {
            key: 'Access-Control-Expose-Headers',
            value: 'mcp-session-id',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
