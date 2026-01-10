/** @type {import('next').NextConfig} */

const nextConfig = {
  eslint: {
    // 禁用Next.js默认的lint配置，使用项目自定义配置
    ignoreDuringBuilds: true
  },
  experimental: {
    typedRoutes: true,
  },
  // API代理配置，用于解决跨域问题
  // 统一开发环境和生产环境的API代理配置
  async rewrites() {
    // 使用统一的API地址，确保环境一致性
    const apiBaseUrl = process.env.API_BASE_URL || 'https://catchweight-graphemically-eldora.ngrok-free.dev';
    
    return [
      { source: '/api/users/me', destination: '/api/users/me' }, // 不转发到外部服务器
      { source: '/api/users/register', destination: `${apiBaseUrl}/api/users/register` },
      { source: '/api/users/login', destination: `${apiBaseUrl}/api/users/login` },
      { source: '/api/users', destination: `${apiBaseUrl}/api/users` },
      { source: '/api/:path*', destination: `${apiBaseUrl}/api/:path*` },
    ]
  },
  // H5移动端优化
  compiler: {
    // 保留所有环境的日志输出，便于调试和问题排查
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