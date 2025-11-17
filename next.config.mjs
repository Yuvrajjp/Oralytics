import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const nextConfig = {
  transpilePackages: ["@prisma/client"],
  // Silence Turbopack/webpack warning when using a webpack override.
  turbopack: {},
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@/components": path.resolve(__dirname, "components"),
      "@/lib": path.resolve(__dirname, "lib"),
      "@/app": path.resolve(__dirname, "app"),
    };

    return config;
  },
};

export default nextConfig;
