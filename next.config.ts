/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "jbg584dxw1.ufs.sh",
      },
      // keep any other hostnames you already have here
    ],
  },
};

export default nextConfig;