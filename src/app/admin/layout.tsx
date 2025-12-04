'use client';

import React, { Suspense } from 'react';
import { usePathname } from 'next/navigation';
import { AdminBottomNavigation } from './components/AdminBottomNavigation';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // 模拟用户数据用于显示
  const user = {
    id: 'dev-admin-123',
    username: '管理员账号',
    role: 'admin',
    status: 'active',
    createdAt: new Date().toISOString()
  };

  const handleLogout = () => {
    // 移除了实际的登出逻辑
    console.log('Logout clicked');
  };

  // 获取当前页面标题
  const getPageTitle = () => {
    if (pathname?.includes('/dashboard')) return '数据总览';
    if (pathname?.includes('/managementCenter')) return '用户管理';
    if (pathname?.includes('/finance')) return '财务管理';
    if (pathname?.includes('/settings')) return '系统设置';
    return '管理员中心';
  };

  // 检查当前路由是否激活
  const isActive = (path: string) => {
    return pathname?.includes(path) ?? false;
  };



  // 检查是否是认证相关页面
  const isAuthPage = pathname?.includes('/admin/auth/');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 认证页面不显示顶部管理栏 */}
      {!isAuthPage && (
        <div className="bg-purple-500 text-white px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold">管理员</span>
            <div className="flex items-center space-x-1">
              <span className="text-yellow-400">⚙️</span>
              <span className="text-sm">系统正常</span>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <span className="text-yellow-400">🔔</span>
              <span className="absolute -top-1 -right-1 bg-red-500 text-xs rounded-full px-1">5</span>
            </div>
            <button onClick={handleLogout} className="text-sm">👤</button>
          </div>
        </div>
      )}

      {/* 认证页面不显示页面标题 */}
      {!isAuthPage && (
        <div className="bg-white px-4 py-4">
          <h2 className="text-lg font-bold text-gray-800">
            {getPageTitle()}
          </h2>
        </div>
      )}

      {/* 主要内容区域 - 认证页面不需要底部内边距 */}
      <main className={`flex-1 ${isAuthPage ? '' : 'pb-20'}`}>
        <Suspense fallback={<div className="w-full h-64 flex items-center justify-center">Loading...</div>}>
          {children}
        </Suspense>
      </main>

      {/* 认证页面不显示底部导航栏 */}
      {!isAuthPage && <AdminBottomNavigation />}
    </div>
  );
}