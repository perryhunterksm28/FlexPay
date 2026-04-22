import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Monorepo root is Flexpay/; avoids Next output tracing picking the wrong lockfile.
  outputFileTracingRoot: path.join(__dirname, ".."),
  webpack: (config, { dev }) => {
    config.externals.push("pino-pretty", "lokijs", "encoding");

    // Windows can intermittently fail renaming webpack pack cache files (EPERM/ENOENT),
    // which leads to route flapping/404s in dev. Use in-memory cache in dev to avoid it.
    if (dev) {
      config.cache = false;
    }
    
    // Fix for MetaMask SDK React Native AsyncStorage import
    config.resolve.fallback = {
      ...config.resolve.fallback,
      "@react-native-async-storage/async-storage": false,
    };
    
    return config;
  },
};

export default nextConfig;
