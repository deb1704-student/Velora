import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@velora/ui', '@velora/types'],
};

export default nextConfig;
