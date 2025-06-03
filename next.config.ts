import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      'lh3.googleusercontent.com', // Add this hostname
      // Add any other external image domains you use, e.g., 'example.com', 'cdn.myservice.com'
    ],
  },
  /* config options here */
};

export default nextConfig;
