import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  env: {
    ENV: process.env.ENV ?? "local",
  },
};

export default nextConfig;
