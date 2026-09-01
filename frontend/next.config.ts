/** @type {import('next').NextConfig} */
const nextConfig = {
  // Rewrites to proxy API calls to FastAPI backend during development
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:8000/api/:path*",
      },
    ];
  },
};

export default nextConfig;
