/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3002/api/:path*', // Proxy API requests to your backend
      },
    ]
  },
};

export default nextConfig;
