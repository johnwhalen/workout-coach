/** @type {import('next').NextConfig} */
const nextConfig = {
  // ESLint runs during builds - ensures code quality
  eslint: {
    // Directories to lint during production builds
    dirs: ["app", "lib", "components", "hooks", "types"],
  },
  // Performance optimizations
  experimental: {
    // Optimize package imports for smaller bundles
    optimizePackageImports: ["lucide-react", "@mantine/core", "@mantine/hooks"],
  },
};

export default nextConfig;
