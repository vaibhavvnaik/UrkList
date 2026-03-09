/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 's3.us-east-1.wasabisys.com',
      },
      {
        protocol: 'https',
        hostname: 'urklist.s3.us-east-005.backblazeb2.com',
      },
      {
        protocol: 'https',
        hostname: '*.backblazeb2.com',
      },
    ]
  }
}
module.exports = nextConfig
