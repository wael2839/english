import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Include lesson JSON so Hostinger/standalone deploys don't miss content/
  outputFileTracingIncludes: {
    '/*': ['./content/**/*'],
  },
};

export default nextConfig;
