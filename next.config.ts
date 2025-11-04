import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable static optimization
  output: 'standalone',
  
  // Configure static file serving
  publicRuntimeConfig: {
    staticFolder: '/public',
  },
  
  // Webpack configuration for MCP server files
  webpack: (config, { isServer, nextRuntime }) => {
    // Externalize native modules for both server and edge runtime
    if (isServer || nextRuntime === 'edge') {
      if (Array.isArray(config.externals)) {
        config.externals.push('bcrypt', '@mapbox/node-pre-gyp');
      } else if (typeof config.externals === 'object') {
        config.externals = {
          ...config.externals,
          bcrypt: 'commonjs bcrypt',
          '@mapbox/node-pre-gyp': 'commonjs @mapbox/node-pre-gyp',
        };
      } else {
        config.externals = ['bcrypt', '@mapbox/node-pre-gyp'];
      }
    }
    
    // Ignore optional native dependencies from node-pre-gyp
    config.resolve = config.resolve || {};
    config.resolve.fallback = {
      ...config.resolve.fallback,
      'aws-sdk': false,
      'mock-aws-s3': false,
      'nock': false,
    };
    
    // Suppress warnings for these missing modules
    config.ignoreWarnings = [
      ...(config.ignoreWarnings || []),
      /Can't resolve 'aws-sdk'/,
      /Can't resolve 'mock-aws-s3'/,
      /Can't resolve 'nock'/,
    ];
    
    // Exclude HTML and other files from node-pre-gyp
    config.module = config.module || {};
    config.module.rules = config.module.rules || [];
    config.module.rules.push({
      test: /node_modules[\\/]@mapbox[\\/]node-pre-gyp[\\/].*\.(html|md|json)$/,
      type: 'asset/source',
    });

    // Add rule for .txt files to load as raw strings
    config.module.rules.push({
      test: /\.txt$/,
      type: 'asset/source',
    });

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
        source: '/api/v1/mcp',
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
