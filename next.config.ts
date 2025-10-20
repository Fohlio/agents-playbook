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
  
  // Security and CORS headers
  async headers() {
    const securityHeaders = [
      {
        key: 'X-DNS-Prefetch-Control',
        value: 'on',
      },
      {
        key: 'Strict-Transport-Security',
        value: 'max-age=63072000; includeSubDomains; preload',
      },
      {
        key: 'X-Frame-Options',
        value: 'DENY',
      },
      {
        key: 'X-Content-Type-Options',
        value: 'nosniff',
      },
      {
        key: 'Referrer-Policy',
        value: 'strict-origin-when-cross-origin',
      },
      {
        key: 'Content-Security-Policy',
        value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self';",
      },
    ];

    return [
      // Security headers for all routes
      {
        source: '/:path*',
        headers: securityHeaders,
      },
      // MCP server CORS headers
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
