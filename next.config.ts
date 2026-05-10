import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    TAVILY_API_KEY: process.env.TAVILY_API_KEY || "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",
  },
};

export default nextConfig;
