/** @type {import('next').NextConfig} */

const nextConfig = {
  experimental: {
    typedRoutes: true,
  },
  // API代理配置，用于解决跨域问题
  async rewrites() {
    return [
      { source: '/api/users/me', destination: '/api/users/me' }, // 不转发到外部服务器
      { source: '/api/users/register', destination: 'https://catchweight-graphemically-eldora.ngrok-free.dev/api/users/register' },
      { source: '/api/users/login', destination: 'https://catchweight-graphemically-eldora.ngrok-free.dev/api/users/login' },
      { source: '/api/users', destination: 'https://catchweight-graphemically-eldora.ngrok-free.dev/api/users' },
      { source: '/api/:path*', destination: 'https://catchweight-graphemically-eldora.ngrok-free.dev/api/:path*' },
    ]
  },
  // H5移动端优化
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // 图片优化
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.douyin.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'api.douyin-task.com',
        port: '',
        pathname: '/**',
      },
    ],
    formats: ['image/webp', 'image/avif'],
  },
  // PWA支持准备
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
  // 环境变量
  env: {
    CUSTOM_APP_NAME: '抖音派单系统',
    CUSTOM_APP_VERSION: '2.0.0',
  },
};

module.exports = nextConfig;