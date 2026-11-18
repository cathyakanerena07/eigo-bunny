import type { NextConfig } from "next";

const build =
  process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ??
  new Date().toISOString().slice(5, 16).replace('T', ' ');

const nextConfig: NextConfig = {
  env: { NEXT_PUBLIC_BUILD: build },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
