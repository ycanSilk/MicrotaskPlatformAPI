'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { LeftOutlined } from '@ant-design/icons';
import { CustomerServiceButton } from '../../../components/button/CustomerServiceButton';
import { 
  getFlatRouteTitleMap, 
  routeHierarchyMap, 
  firstLevelPages,
  dynamicRoutePatterns 
} from '../config/routes';

interface PublisherHeaderProps {
  user: {
    id: string;
    username?: string;
    name?: string;
    role: string;
    balance: number;
    status?: string;
    createdAt?: string;
  };
}

export const PublisherHeader: React.FC<PublisherHeaderProps> = ({ user }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [showUserName, setShowUserName] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [pageTitle, setPageTitle] = useState('发布者中心');

  // 定义路由到标题的映射关系
  const routeTitleMap: Record<string, string> = {
    // 主页面
    '/publisher': '发布者中心',
    '/publisher/dashboard': '评论订单',
    '/publisher/dashboard/active': '活跃任务',
    '/publisher/dashboard/completed': '已完成任务',
    '/publisher/dashboard/audit': '审核中任务',
    '/publisher/dashboard/overview': '任务概览',
    '/publisher/dashboard/task-detail': '任务详情',
    '/publisher/dashboard/account-rental-detail': '账号租赁详情',
    
    // 发布任务相关
    '/publisher/create/platformtype': '发布评论',
    '/publisher/create/platform-task/douyin': '发布抖音评论',
    '/publisher/create/publish-top-comment': '发布上评评论',
    '/publisher/create/publish-nakahiro': '发布中评评论',
    '/publisher/create/task-combination-middle-bottom': '发布中下评评论',
    '/publisher/create/task-combination-top-middle': '发布上中评评论',
    '/publisher/create/task-combination-all': '发布全类型评论',
    '/publisher/create/search-keyword-task': '放大镜搜索',
    '/publisher/create/supplementaryorder': '补充订单',
    '/publisher/create/video-send': '视频发送',
    '/publisher/create/video-task': '视频任务',
    
    // 个人中心相关
    '/publisher/profile': '我的',
    '/publisher/profile/data-stats': '数据统计',
    '/publisher/profile/personal-info': '个人信息',
    '/publisher/profile/settings': '个人资料',
    '/publisher/profile/verification': '身份认证',
    
    // 订单相关
    '/publisher/order-management': '订单管理选择',
    '/publisher/orders': '订单管理',
    '/publisher/orders/active': '活跃订单',
    '/publisher/orders/task-detail': '订单详情',
    '/publisher/orders/account-rental': '账号租赁订单',
    
    // 财务相关
    '/publisher/balance': '余额',
    '/publisher/balance/transaction-list': '余额记录',
    '/publisher/balance/transaction-details': '账单详情',
    '/publisher/finance': '充值',
    '/publisher/transactions': '充值记录',
    '/publisher/bank-cards': '银行卡管理',
    '/publisher/bind-bank-card': '绑定银行卡',
    
    // 其他
    '/publisher/notification': '通知提醒',
    '/publisher/douyin-version': '下载中心',
    '/publisher/stats': '统计报表',
    '/publisher/tasks/history': '任务历史'
  };

  // 定义发布者模块的一级页面
  const firstLevelPages = [
    '/publisher',
    '/publisher/dashboard',
    '/publisher/profile',
    '/publisher/order-management',
    '/publisher/orders',
    '/publisher/notification',
    '/publisher/douyin-version',
    '/publisher/finance',
    '/publisher/transactions',
    '/publisher/bank-cards',
    '/publisher/stats',
    '/publisher/tasks/history'
  ];

  // 定义路由层级关系和返回路径映射
  const routeHierarchyMap: Record<string, string> = {
    // 创建任务相关路由层级
    '/publisher/create/platform-task/douyin': '/publisher/create/platformtype',
    '/publisher/create/publish-top-comment': '/publisher/create/platform-task/douyin',
    '/publisher/create/publish-nakahiro': '/publisher/create/platform-task/douyin',
    '/publisher/create/task-combination-middle-bottom': '/publisher/create/platform-task/douyin',
    '/publisher/create/task-combination-top-middle': '/publisher/create/platform-task/douyin',
    '/publisher/create/task-combination-all': '/publisher/create/platform-task/douyin',
    '/publisher/create/search-keyword-task': '/publisher/create/platform-task/douyin',
    '/publisher/create/supplementaryorder': '/publisher/orders',
    '/publisher/create/video-send': '/publisher/create/platform-task/douyin',
    '/publisher/create/video-task': '/publisher/create/platform-task/douyin',
    
    // 订单相关路由层级
    '/publisher/orders/task-detail': '/publisher/orders',
    '/publisher/orders/task-detail/[id]': '/publisher/orders',
    '/publisher/orders/active': '/publisher/orders',
    '/publisher/orders/account-rental': '/publisher/orders',
    '/publisher/orders/account-rental/[id]': '/publisher/orders/account-rental',
    
    // Dashboard相关路由层级
    '/publisher/dashboard/active': '/publisher/dashboard',
    '/publisher/dashboard/completed': '/publisher/dashboard',
    '/publisher/dashboard/audit': '/publisher/dashboard',
    '/publisher/dashboard/overview': '/publisher/dashboard',
    '/publisher/dashboard/task-detail': '/publisher/dashboard',
    '/publisher/dashboard/account-rental-detail': '/publisher/dashboard',
    
    // 个人资料相关路由层级
    '/publisher/profile/data-stats': '/publisher/profile',
    '/publisher/profile/personal-info': '/publisher/profile',
    '/publisher/profile/settings': '/publisher/profile',
    '/publisher/profile/verification': '/publisher/profile',
    
    // 财务相关路由层级
    '/publisher/balance': '/publisher/profile',
    '/publisher/balance/transaction-list': '/publisher/balance',
    '/publisher/balance/transaction-details': '/publisher/balance/transaction-list',
    '/publisher/balance/transaction-details/[id]': '/publisher/balance/transaction-list',
    '/publisher/bank-cards': '/publisher/profile',
    '/publisher/bank-cards/bank-cardlist': '/publisher/bank-cards',
    '/publisher/bank-cards/bank-cardlist/[id]': '/publisher/bank-cards',
    '/publisher/bind-bank-card': '/publisher/bank-cards',
    
    // 其他路由层级
    '/publisher/transactions/[id]': '/publisher/transactions',
    '/publisher/tasks/history': '/publisher/dashboard'
  };

  // 处理返回按钮点击事件
  const handleBack = () => {
    if (!pathname) return;

    // 获取不包含查询参数的路径
    const pathWithoutQuery = pathname.split('?')[0];
    
    // 检查当前页面是否为一级页面
    if (firstLevelPages.includes(pathWithoutQuery)) {
      // 如果是一级页面，返回发布者主页
      router.push('/publisher/dashboard');
      return;
    }

    // 检查是否有明确的层级映射（精确匹配）
    if (routeHierarchyMap[pathWithoutQuery]) {
      router.push(routeHierarchyMap[pathWithoutQuery]);
      return;
    }

    // 处理动态路由（包含ID或特定格式的路径）
    const pathParts = pathWithoutQuery.split('/').filter(Boolean);
    if (pathParts.length > 0) {
      // 检查动态路由模式
      const dynamicPatterns = dynamicRoutePatterns;

      for (const { pattern, target } of dynamicPatterns) {
        if (pattern.test(pathParts.join('/'))) {
          if (typeof target === 'function') {
            router.push(target(pathParts.join('/')));
          } else {
            router.push(target);
          }
          return;
        }
      }

      // 检查是否存在部分匹配的路由层级映射（基于目录结构）
      // 从最长路径开始尝试匹配
      for (let i = pathParts.length; i >= 2; i--) {
        const partialPath = '/' + pathParts.slice(0, i).join('/');
        if (routeHierarchyMap[partialPath]) {
          router.push(routeHierarchyMap[partialPath]);
          return;
        }
      }

      // 通用的层级返回逻辑
      if (pathParts.length > 2) {
        // 对于创建任务相关的路由
        if (pathParts[0] === 'publisher' && pathParts[1] === 'create') {
          // 检查是否为平台类型选择页面
          if (pathParts.length >= 3 && pathParts[2] === 'platformtype') {
            router.push('/publisher/dashboard');
            return;
          }
          // 检查是否为平台任务页面
          if (pathParts.length >= 4 && pathParts[2] === 'platform-task') {
            router.push('/publisher/create/platformtype');
            return;
          }
          // 其他创建任务的子页面返回平台任务选择页面
          router.push('/publisher/create/platform-task/douyin');
          return;
        }

        // 对于Dashboard相关的路由
        if (pathParts[0] === 'publisher' && pathParts[1] === 'dashboard') {
          router.push('/publisher/dashboard');
          return;
        }

        // 对于个人资料相关的路由
        if (pathParts[0] === 'publisher' && pathParts[1] === 'profile') {
          router.push('/publisher/profile');
          return;
        }

        // 对于订单相关的路由
        if (pathParts[0] === 'publisher' && pathParts[1] === 'orders') {
          router.push('/publisher/orders');
          return;
        }

        // 对于余额相关的路由
        if (pathParts[0] === 'publisher' && pathParts[1] === 'balance') {
          // 检查是否为余额主页面
          if (pathParts.length === 2) {
            router.push('/publisher/profile');
          } else {
            router.push('/publisher/balance');
          }
          return;
        }
      }

      // 标准的上一级路径返回
      if (pathParts.length > 1) {
        const parentPath = '/' + pathParts.slice(0, -1).join('/');
        router.push(parentPath);
      } else {
        // 如果只有一级路径，则返回发布者主页
        router.push('/publisher/dashboard');
      }
    } else {
      // 如果已经是根路径，则返回首页
      router.push('/');
    }
  };

  // 检查是否显示返回按钮
  const shouldShowBackButton = () => {
    if (!pathname) return false;
    // 在首页不显示，在其他页面显示
    return pathname !== '/publisher/dashboard' && pathname !== '/publisher';
  };

  useEffect(() => {
    setIsClient(true);
    
    // 在客户端计算页面标题
    if (pathname) {
      // 移除查询参数
      const pathWithoutQuery = pathname.split('?')[0];
      
      // 1. 尝试精确匹配
      if (routeTitleMap[pathWithoutQuery]) {
        setPageTitle(routeTitleMap[pathWithoutQuery]);
        return;
      }

      // 2. 优先匹配更长的路由模式，以避免匹配到更短的通用路径
      const sortedRoutes = Object.entries(routeTitleMap).sort(([a], [b]) => b.length - a.length);
      
      // 处理动态路由的特殊逻辑
      const pathParts = pathWithoutQuery.split('/').filter(Boolean);
      
      // 3. 处理带ID参数的动态路由
      for (const [route, title] of sortedRoutes) {
        // 检查是否是动态路由模式（包含[ID]或类似参数）
        if (route.includes('[id]')) {
          // 创建动态路由的正则表达式模式，支持数字和字符串ID
          const dynamicRoutePattern = route
            .replace(/\[id\]/g, '([\\w-]+)')
            .replace(/\//g, '\\/');
          const regexPattern = new RegExp(`^${dynamicRoutePattern}$`);
          
          if (regexPattern.test(pathWithoutQuery)) {
            setPageTitle(title);
            return;
          }
        }
      }
      
      // 4. 尝试前缀匹配（包含子路径的情况）
      for (const [route, title] of sortedRoutes) {
        // 对于非动态路由，检查路径是否以该路由开头
        if (pathWithoutQuery.startsWith(route + '/')) {
          setPageTitle(title);
          return;
        }
        // 检查路径是否完全包含该路由
        if (pathWithoutQuery.includes(route + '/')) {
          setPageTitle(title);
          return;
        }
      }
      
      // 5. 尝试基于路径段进行部分匹配
      if (pathParts.length >= 3) {
        // 构建可能的父级路径段组合
        for (let i = pathParts.length; i >= 2; i--) {
          const partialPath = '/' + pathParts.slice(0, i).join('/');
          if (routeTitleMap[partialPath]) {
            setPageTitle(routeTitleMap[partialPath]);
            return;
          }
        }
        
        // 尝试匹配倒数第二个路径段（对于详情页面）
        if (pathParts.length >= 4) {
          const secondLastSegment = pathParts[pathParts.length - 2];
          for (const [route, title] of sortedRoutes) {
            if (route.includes(secondLastSegment)) {
              setPageTitle(title);
              return;
            }
          }
        }
      }
      
      // 6. 如果所有匹配都失败，根据主要目录设置默认标题
      if (pathParts.length >= 2) {
        const mainCategory = pathParts[1];
        switch (mainCategory) {
          case 'create':
            setPageTitle('发布任务');
            break;
          case 'dashboard':
            setPageTitle('评论订单');
            break;
          case 'profile':
            setPageTitle('我的');
            break;
          case 'orders':
            setPageTitle('订单管理');
            break;
          case 'balance':
            setPageTitle('余额');
            break;
          case 'finance':
            setPageTitle('充值');
            break;
          case 'transactions':
            setPageTitle('充值记录');
            break;
          case 'bank-cards':
            setPageTitle('银行卡管理');
            break;
          case 'notification':
            setPageTitle('通知提醒');
            break;
          case 'stats':
            setPageTitle('统计报表');
            break;
          default:
            setPageTitle('发布者中心');
        }
      } else {
        setPageTitle('发布者中心');
      }
    }
  }, [pathname]);

  const handleLogout = async () => {
    console.log('Logging out user');
    try {
      // 在实际应用中，这里会调用认证相关的方法来清除登录状态
      // PublisherAuthStorage.clearAuth();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      router.push('/auth/login/publisherlogin');
    }
  };

  const handleUserAvatarClick = () => {
    setShowUserName(!showUserName);
  };

  return (
    <div className="bg-blue-500 border-b border-[#9bcfffff] px-4 py-3 flex items-center justify-between h-[60px] box-border">
      <div className="flex items-center flex-1">
        {isClient && shouldShowBackButton() && (
          <button 
            onClick={handleBack}
            className="p-2 rounded-full transition-colors text-white"
            aria-label="返回上一页"
          >
            <LeftOutlined size={20} className="text-white" />
          </button>
        )}
        <h1 className="text-md text-white ml-1">
          {pageTitle}
        </h1>
      </div>
      <div className="flex items-center relative">
        {isClient && (
          <CustomerServiceButton 
            buttonText="联系客服" 
            modalTitle="在线客服" 
            userId={user?.id || 'guest'} 
            className="text-white mr-1 font-bold text-lg mr-2"
          />
        )}
        
        {isClient && user && (user.username || user.name) && (
            <div className="relative mr-2">
              <button
                onClick={handleUserAvatarClick}
                onMouseEnter={() => setShowUserName(true)}
                onMouseLeave={() => {
                  setTimeout(() => setShowUserName(false), 300);
                }}
                className="w-[20px] h-[20px] cursor-pointer flex items-center justify-center text-white transition-all duration-300 ease"
                aria-label="用户信息"
              >
                <div className="">
                  <img 
                    src="/images/0e92a4599d02a7.jpg" 
                    alt="用户头像" 
                    className="w-[20px] h-[20px] rounded-full object-cover"
                  />
                </div>
              </button>
              {showUserName && (
                <div
                  className="absolute top-[44px] right-0 bg-white border border-[#e8e8e8] rounded-md p-2 shadow-lg z-50 min-w-[120px] text-center"
                >
                  <span className="text-sm">
                    {user.username || user.name}
                  </span>
                </div>
              )}
            </div>
          )}
      </div>
    </div>
  );
};