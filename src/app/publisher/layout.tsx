'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { PublisherAuthStorage } from '@/auth/publisher/auth';
import Link from 'next/link';
import { PublisherBottomNavigation } from './components/PublisherBottomNavigation';
import { PublisherHeader } from '@/app/publisher/components/PublisherHeader';

export default function PublisherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    let isMounted = true; // 防止组件卸载后的状态更新
    
    // 确保在客户端环境中执行
    if (typeof window === 'undefined') {
      setIsLoading(false);
      return;
    }

    const initializeAuth = async () => {
      if (!isMounted) return;
      
      try {
        console.log('Checking user authentication...');
        // 直接使用派单员认证存储检查，而不是通用检查
        let authSession = PublisherAuthStorage.getAuth();
        
        console.log('Auth session from storage:', authSession);
        
        // 开发环境中提供模拟认证数据
        // 注意：这仅用于开发预览，生产环境中请移除这段代码
        if (process.env.NODE_ENV === 'development' && (!authSession || !authSession.user)) {
          console.log('Development environment detected, using mock authentication data');
          authSession = {
            user: {
              id: 'dev-publisher-123',
              username: '开发者账号',
              role: 'publisher',
              balance: 1000.00,
              status: 'active',
              createdAt: new Date().toISOString()
            },
            token: 'dev-token',
            expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24小时后过期
          };
        }
        
        if (!authSession || !authSession.user) {
          console.log('Publisher Layout: No user found, redirecting to login');
          if (isMounted) {
            router.push('/auth/login/publisherlogin');
          }
          return;
        }
        
        console.log('User role:', authSession.user.role);
        if (authSession.user.role !== 'publisher') {
          console.log('Publisher Layout: Wrong role, redirecting to login. Role:', authSession.user.role);
          if (isMounted) {
            router.push('/auth/login/publisherlogin');
          }
          return;
        }
        
        console.log('Publisher Layout: User authorized, setting user data');
        if (isMounted) {
          setUser(authSession.user);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Publisher Layout: Error checking user:', error);
        if (isMounted) {
          // 在开发环境中，即使有错误也尝试使用模拟数据继续
          if (process.env.NODE_ENV === 'development') {
            console.log('Development environment: Using mock data despite error');
            setUser({
              id: 'dev-publisher-123',
              name: '开发者账号',
              role: 'publisher',
              balance: 1000.00,
            });
            setIsLoading(false);
          } else {
            router.push('/auth/login/publisherlogin');
            setIsLoading(false);
          }
        }
      }
    };
    
    // 立即检查一次
    initializeAuth();
    
    return () => {
      isMounted = false;
    };
  }, [router]); // 只依赖router，避免无限循环

  const handleLogout = async () => {
    console.log('Logging out user');
    try {
      PublisherAuthStorage.clearAuth();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      router.push('/auth/login/publisherlogin');
    }
  };

  // 获取当前页面标题
  const getPageTitle = () => {
    if (pathname?.includes('/orders')) return '订单管理';
    if (pathname?.includes('/create')) return '发布任务';
    if (pathname?.includes('/stats')) return '数据统计';
    if (pathname?.includes('/finance')) return '充值提现';
    if (pathname?.includes('/profile')) return '个人中心';
    return '任务管理';
  };

  // 检查当前路由是否激活
  const isActive = (path: string) => {
    return pathname?.includes(path) || false;
  };

  if (isLoading) {
    console.log('Layout is loading...');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl mb-2">🔄</div>
          <div>加载中...</div>
          <div className="text-xs text-gray-500 mt-2">
            检查用户权限中，请稍候...
          </div>
        </div>
      </div>
    );
  }

  // 如果没有用户数据，显示请登录提示
  if (!user) {
    console.log('No user data, showing login prompt');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl mb-2">🔒</div>
          <div className="text-lg font-medium text-gray-800 mb-2">请登录</div>
          <div className="text-sm text-gray-600 mb-4">
            您需要以派单员身份登录才能访问此页面
          </div>
          <button 
            onClick={() => router.push('/auth/login/publisherlogin')}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            去登录
          </button>
        </div>
      </div>
    );
  }

  console.log('Rendering layout with user:', user);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 使用可复用的顶部导航栏组件 */}
      <PublisherHeader user={user} />

      {/* 主要内容区域 */}
      <main className="flex-1 pb-20">
        {children}
      </main>

      {/* 底部导航栏 - 使用可复用组件 */}
      <PublisherBottomNavigation />
    </div>
    
  );
}