'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getCurrentLoggedInUser, commonLogout } from '@/auth/common';
import Link from 'next/link';
import { AdminBottomNavigation } from './components/AdminBottomNavigation';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // 确保在客户端环境中执行
    if (typeof window === 'undefined') {
      setIsLoading(false);
      return;
    }

    const initializeAuth = async () => {
      try {
        // 使用新认证系统获取当前登录用户
        const currentUser = await getCurrentLoggedInUser();
        
        if (!currentUser || currentUser.role !== 'admin') {
          router.push('/auth/login/adminlogin');
          return;
        }
        
        setUser(currentUser);
        setIsLoading(false);
      } catch (error) {
        console.error('认证初始化失败:', error);
        router.push('/auth/login/adminlogin');
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, [router]);

  const handleLogout = async () => {
    try {
      await commonLogout();
    } catch (error) {
      console.error('登出失败:', error);
    } finally {
      router.push('/auth/login/adminlogin');
    }
  };

  // 获取当前页面标题
  const getPageTitle = () => {
    if (pathname?.includes('/dashboard')) return '数据总览';
    if (pathname?.includes('/users')) return '用户管理';
    if (pathname?.includes('/finance')) return '财务管理';
    if (pathname?.includes('/settings')) return '系统设置';
    return '管理员中心';
  };

  // 检查当前路由是否激活
  const isActive = (path: string) => {
    return pathname?.includes(path) ?? false;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl mb-2">🔄</div>
          <div>加载中...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部管理栏 */}
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

      {/* 页面标题 */}
      <div className="bg-white px-4 py-4">
        <h2 className="text-lg font-bold text-gray-800">
          {getPageTitle()}
        </h2>
      </div>

      {/* 主要内容区域 */}
      <main className="flex-1 pb-20">
        {children}
      </main>

      {/* 底部导航栏 - 使用可复用组件 */}
      <AdminBottomNavigation />
    </div>
  );
}