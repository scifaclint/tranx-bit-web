import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "storage.googleapis.com",
      },
      {
        protocol: "https",
        hostname: "pub-a2e4dd4a05b049fb98bafe7c2f3a1083.r2.dev",
      },
      {
        protocol: "https",
        hostname:
          "tranxbit-private.84faabb69e96a5a11297b8259eb73867.r2.cloudflarestorage.com",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Permissions-Policy",
            value: "interest-cohort=()",
          },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/register",
        destination: "/auth?mode=register",
      },
    ];
  },
};

export default nextConfig;
