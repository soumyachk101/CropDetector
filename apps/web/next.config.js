/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  /* Since we proxy file uploads or request external API gateway, we can configure rewrites or just call the API gateway url */
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: 'http://localhost:4000/v1/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
