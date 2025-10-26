'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getCurrentLoggedInUser, commonLogout } from '@/auth/common';
import Link from 'next/link';
import { CommenterAuthStorage } from '@/auth/commenter/auth';
import AlertModal from '../../components/ui/AlertModal';
// 移除外部返回按钮导入，改为在页面内实现
import { ReloadOutlined, UserOutlined, HomeOutlined, FileTextOutlined, DollarOutlined, PropertySafetyOutlined, UserAddOutlined, WarningOutlined } from '@ant-design/icons';
import TopNavigationBar from './components/TopNavigationBar';
import BottomNavigationBar from './components/BottomNavigationBar';

export default function CommenterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // 显示功能暂未开放提示
  const showNotAvailableAlert = () => {
    setShowAlertModal(true);
  };

  useEffect(() => {
    // 完全移除登录验证逻辑
    // 对于任务详情页面，直接设置isLoading为false，允许页面显示
    if (pathname?.includes('/commenter/task-detail')) {
      console.log('任务详情页面，跳过所有认证检查，直接加载');
      setIsLoading(false);
      return;
    }
    
    // 对于其他页面，保留简化的认证流程
    const initializeAuth = async () => {
      // 确保在客户端执行
      if (typeof window === 'undefined') {
        setIsLoading(false);
        return;
      }

      try {
        console.log('初始化评论员界面');
        
        // 尝试获取用户信息，但不强制要求
        const auth = CommenterAuthStorage.getAuth();
        if (auth && auth.user && auth.user.role === 'commenter') {
          setUser(auth.user);
        } else {
          // 尝试获取通用登录用户
          const currentUser = getCurrentLoggedInUser();
          if (currentUser && currentUser.role === 'commenter') {
            setUser(currentUser);
          }
        }
      } catch (error) {
        console.error('初始化界面出错:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // 使用setTimeout确保在DOM加载完成后执行
    setTimeout(() => {
      initializeAuth();
    }, 100);
  }, [router, pathname]);

  const handleLogout = () => {
    commonLogout();
    router.push('/auth/login/commenterlogin');
  };

  // 获取当前页面标题
  const getPageTitle = () => {
    // 更精确的路由匹配逻辑
    if (pathname === '/commenter/order-management') return '订单管理';
    if (pathname?.startsWith('/commenter/order-management/')) return '订单详情';
    if (pathname === '/commenter/hall') return '评论抢单';
    if (pathname === '/commenter/tasks') return '我的任务';
    if (pathname === '/commenter/earnings') return '收益中心';
    if (pathname === '/commenter/invite') return '邀请好友';
    if (pathname === '/commenter/profile') return '个人中心';
    if (pathname?.startsWith('/commenter/bank-cards/')) return '银行卡管理';
    
    // 回退匹配逻辑
    if (pathname?.includes('/order-management')) return '订单管理';
    if (pathname?.includes('/hall')) return '评论抢单';
    if (pathname?.includes('/tasks')) return '我的任务';
    if (pathname?.includes('/earnings')) return '收益中心';
    if (pathname?.includes('/invite')) return '邀请好友';
    if (pathname?.includes('/profile')) return '个人中心';
    if (pathname?.includes('/bank-cards')) return '银行卡管理';
    
    return '评论员中心';
  };
  
  // 处理返回上一页 - 优化路由跳转逻辑
  const handleBack = () => {
    // 特殊路由处理
    if (pathname?.startsWith('/commenter/bank-cards/')) {
      // 银行卡详情页返回到银行卡列表
      router.push('/commenter/bank-cards');
    } else if (pathname?.startsWith('/commenter/order-management/')) {
      // 订单详情页返回到订单管理
      router.push('/commenter/order-management');
    } else if (pathname?.includes('/commenter/task-detail/')) {
      // 任务详情页返回到任务大厅
      router.push('/commenter/hall');
    } else {
      // 其他情况使用默认的返回上一级
      router.back();
    }
  };

  // 检查当前路由是否激活
  const isActive = (path: string) => {
    return pathname?.includes(path) ?? false;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">

          <div>加载中...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部余额栏 */}
      <TopNavigationBar user={user} />

      {/* 页面标题和返回按钮 */}
      <div className="bg-white px-4 py-4">
        <div className="flex items-center">
          {/* 返回按钮 */}
          <button 
            className="p-2 rounded-full transition-colors text-white mr-3" 
            aria-label="返回上一页"
            onClick={handleBack}
            style={{ backgroundColor: '#ff4d4f' }}
          >
            <span role="img" aria-label="left" className="anticon anticon-left text-white">
              <svg viewBox="64 64 896 896" focusable="false" data-icon="left" width="1em" height="1em" fill="currentColor" aria-hidden="true">
                <path d="M724 218.3V141c0-6.7-7.7-10.4-12.9-6.3L260.3 486.8a31.86 31.86 0 000 50.3l450.8 352.1c5.3 4.1 12.9.4 12.9-6.3v-77.3c0-4.9-2.3-9.6-6.1-12.6l-360-281 360-281.1c3.8-3 6.1-7.7 6.1-12.6z"></path>
              </svg>
            </span>
          </button>
          
          {/* 动态页面标题 */}
          <h2 className="text-lg font-bold text-gray-800">
            {getPageTitle()}
          </h2>
        </div>
      </div>

      {/* 主要内容区域 - 添加底部内边距避免被底部导航栏遮挡 */}
      <main className="flex-1 pb-20">
        {children}
      </main>

      {/* 底部导航栏 */}
      <BottomNavigationBar />

    </div>
  );
}