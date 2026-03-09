/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'avatars.githubusercontent.com',
      'lh3.googleusercontent.com',
      's3.us-east-1.wasabisys.com',
      'urklist.s3.us-east-005.backblazeb2.com',
    ]
  }
}
module.exports = nextConfig
