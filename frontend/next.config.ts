import type { NextConfig } from "next";
import withFlowbiteReact from "flowbite-react/plugin/nextjs";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_URL || process.env.URL || "http://127.0.0.1:8000"}/api/:path*`,
      },
    ];
  },
};

export default withFlowbiteReact(nextConfig);
