import type {NextConfig} from "next";

const nextConfig:NextConfig={
  reactStrictMode:true,
  poweredByHeader:false,
  serverExternalPackages:["@prisma/client"],
  // All bundled demo images are served locally. Remote images uploaded by an
  // admin are rendered unoptimized, so no image CDN is required at install time.
};
export default nextConfig;
