import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  turbopack: {
    root: rootDir,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "coresg-normal.trae.ai",
        port: "",
        pathname: "/api/ide/v1/text_to_image",
      },
      {
        protocol: "https",
        hostname: "gpwaopsfulhiyqgmjczu.supabase.co",
        port: "",
        pathname: "/storage/v1/object/sign/**",
      },
      {
        protocol: "https",
        hostname: "gpwaopsfulhiyqgmjczu.storage.supabase.co",
        port: "",
        pathname: "/storage/v1/s3/**",
      },
    ],
  },
};

export default nextConfig;
