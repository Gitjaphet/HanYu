import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Image Docker minimale : Next copie uniquement ce qui est nécessaire dans .next/standalone
  output: "standalone",
};

export default nextConfig;
