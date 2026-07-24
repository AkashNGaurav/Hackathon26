import type { NextConfig } from "next";
import withFlowbiteReact from "flowbite-react/plugin/nextjs";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_URL || process.env.URL || "https://hackathon26-dgku.onrender.com"}/api/:path*`,
      },
    ];
  },
};

export default withFlowbiteReact(nextConfig);
