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
    // Each of these libraries benefits from tree-shaking optimization
    optimizePackageImports: [
      // UI component libraries
      "lucide-react",
      "@mantine/core",
      "@mantine/hooks",
      // Chart library (heavy)
      "recharts",
      // Date utilities
      "date-fns",
      // Markdown rendering
      "react-markdown",
      "remark-gfm",
      // Animation library
      "framer-motion",
    ],
  },
};

export default nextConfig;
