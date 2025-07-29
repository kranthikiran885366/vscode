/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    allowedDevOrigins: [
      'http://172.31.121.66:3000',
      'http://localhost:3000',
      'https://*.replit.dev',
      'https://*.repl.co'
    ]
  }
}

export default nextConfig