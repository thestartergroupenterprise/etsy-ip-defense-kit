import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Explicitly bundle the download ZIP with the serverless function.
  // outputFileTracingIncludes ensures Vercel includes _files/ in the
  // function container — without it, fs.readFile fails in production
  // because public/ files go to the CDN, not the function filesystem.
  outputFileTracingIncludes: {
    "/api/download/[token]": ["./_files/**"],
  },
};

export default nextConfig;
