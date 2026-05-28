import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async rewrites() {
    return [
      {
        source: '/:path*',
        destination: '/\\(app\\)/:path*', // On ajoute \\ devant chaque parenthèse
      },
    ];
  },
};

export default nextConfig;