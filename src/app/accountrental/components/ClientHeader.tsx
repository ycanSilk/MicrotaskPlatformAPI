'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePathname,useRouter, useSearchParams } from 'next/navigation';
import { CustomerServiceButton } from '../../../components/button/CustomerServiceButton';
import { UserOutlined, LeftOutlined } from '@ant-design/icons';

interface User {
  id: string;
  username?: string;
  name?: string;
  role: string;
  balance: number;
  status?: string;
  createdAt?: string;
}

interface ClientHeaderProps {
  user?: User | null;
}

const ClientHeader: React.FC<ClientHeaderProps> = ({ user }) => {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showUserName, setShowUserName] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [pageTitle, setPageTitle] = useState('账户租赁');
  const headerRef = useRef<HTMLDivElement>(null);

  // 定义路由到标题的映射关系
  const routeTitleMap: Record<string, string> = {
    '/accountrental': '账户租赁',
    '/accountrental/account-rental-market': '出租市场',
    '/accountrental/account-rental-requests': '求租市场',
    '/accountrental/account-rental-publish': '发布租赁',
    '/accountrental/my-account-rental': '我的租赁',
    '/accountrental/account-rental-market/market-detail': '出租账号详情',
    '/accountrental/account-rental-requests/request-detail': '求租信息详情',
    '/accountrental/account-rental-requests/requests-detail': '求租信息详情',
    '/accountrental/account-rental-publish/publish-for-rent': '发布出租信息',
    '/accountrental/account-rental-publish/publish-requests': '发布求租信息',
    '/accountrental/my-account-rental/forrentorder': '出租订单',
    '/accountrental/my-account-rental/rentalorder': '租用订单',
    '/accountrental/my-account-rental/rentaloffer': '出租信息',
    '/accountrental/my-account-rental/rentalrequest': '求租信息',
    '/accountrental/my-account-rental/rentalrequest/rentalrequest-detail/[id]': '求租信息详情',
    '/accountrental/my-account-rental/rentaloffer/rentaloffer-detail/[id]': '出租信息详情',
    '/accountrental/my-account-rental/forrentorder/forrentorder-detail/[id]': '出租订单详情',
    '/accountrental/my-account-rental/rentalorder/rentalorder-detail/[id]': '租用订单详情'
  };

  // 定义账号租赁模块的一级页面
  const firstLevelPages = [
    '/accountrental',
    '/accountrental/account-rental-market',
    '/accountrental/account-rental-requests',
    '/accountrental/account-rental-publish',
    '/accountrental/my-account-rental'
  ];

  // 处理返回按钮点击事件
  const handleBack = () => {
    if (!pathname) return;

    // 检查当前页面是否为一级页面
    if (firstLevelPages.includes(pathname)) {
      // 如果是一级页面，返回账户租赁主页
      router.push('/accountrental');
      return;
    }

    // 定义动态路由到列表页面的映射关系
    const dynamicRouteMap: Record<string, string> = {
      '/accountrental/account-rental-market/market-detail': '/accountrental/account-rental-market',
      '/accountrental/account-rental-requests/requests-detail': '/accountrental/account-rental-requests',
      '/accountrental/my-account-rental/forrentorder/forrentorder-detail': '/accountrental/my-account-rental/forrentorder',
      '/accountrental/my-account-rental/rentalorder/rentalorder-detail': '/accountrental/my-account-rental/rentalorder',
      '/accountrental/my-account-rental/rentaloffer/rentaloffer-detail': '/accountrental/my-account-rental/rentaloffer',
      '/accountrental/my-account-rental/rentalrequest/rentalrequest-detail': '/accountrental/my-account-rental/rentalrequest',
      '/accountrental/my-account-rental/rented/rented-detail': '/accountrental/my-account-rental/rented',
    };

    // 检查当前路径是否匹配动态路由模式
    for (const [routePattern, targetPath] of Object.entries(dynamicRouteMap)) {
      if (pathname.includes(routePattern)) {
        // 对于动态路由，返回到对应的列表页面
        router.push(targetPath);
        return;
      }
    }

    // 不是一级页面和动态路由页面，提取上一级路由路径
    const pathParts = pathname.split('/').filter(Boolean);
    if (pathParts.length > 0) {
      // 检查是否为多层级路径
      if (pathParts.length > 1) {
        // 对于账号租赁模块的特殊处理
        if (pathParts[0] === 'accountrental') {
          // 检查是否为accountrental的二级页面
          const secondLevelPath = '/' + pathParts.slice(0, 2).join('/');
          if (firstLevelPages.includes(secondLevelPath)) {
            router.push(secondLevelPath);
            return;
          }
        }
      }
      const parentPath = '/' + pathParts.slice(0, -1).join('/');
      router.push(parentPath);
    } else {
      // 如果已经是根路径，则返回首页
      router.push('/');
    }
  };

  // 检查是否显示返回按钮
  const shouldShowBackButton = () => {
    if (!pathname) return false;
    // 在首页不显示，在其他页面显示
    return pathname !== '/accountrental';
  };

  useEffect(() => {
    setIsClient(true);
    
    // 在客户端计算页面标题
    if (pathname) {
      // 尝试精确匹配
      if (routeTitleMap[pathname]) {
        setPageTitle(routeTitleMap[pathname]);
        return;
      }

      // 尝试匹配路径前缀（移除查询参数后的路径）
      const pathWithoutQuery = pathname.split('?')[0];
      if (routeTitleMap[pathWithoutQuery]) {
        setPageTitle(routeTitleMap[pathWithoutQuery]);
        return;
      }

      // 优先匹配更长的路由模式，以避免匹配到更短的通用路径
      const sortedRoutes = Object.entries(routeTitleMap).sort(([a], [b]) => b.length - a.length);
      
      // 处理动态路由的特殊逻辑
      const pathParts = pathWithoutQuery.split('/').filter(Boolean);
      
      for (const [route, title] of sortedRoutes) {
        // 检查是否是动态路由模式（包含[ID]或类似参数）
        if (route.includes('[id]')) {
          // 创建动态路由的正则表达式模式
          // 将 [id] 替换为匹配任何非斜杠字符的模式 (\d+ 匹配数字ID)
          const dynamicRoutePattern = route.replace(/\[id\]/g, '(\\d+)');
          const regexPattern = new RegExp(`^${dynamicRoutePattern}$`);
          
          if (regexPattern.test(pathWithoutQuery)) {
            setPageTitle(title);
            return;
          }
        } else {
          // 对于非动态路由，检查路径是否以该路由开头或者包含该路由后跟斜杠或结尾
          const routePattern = new RegExp(`^${route}(/.*)?$`);
          if (pathWithoutQuery.includes(route) || routePattern.test(pathWithoutQuery)) {
            setPageTitle(title);
            return;
          }
        }
      }
      
      // 如果没有找到匹配项，尝试基于路径段进行匹配
      // 例如: /accountrental/my-account-rental/rentalrequest/rentalrequest-detail/1 应该匹配到 rentalrequest-detail
      if (pathParts.length >= 4) {
        // 对于详细页面，尝试匹配倒数第二个路径段
        const detailPathSegment = pathParts[pathParts.length - 2];
        for (const [route, title] of sortedRoutes) {
          if (route.includes(detailPathSegment)) {
            setPageTitle(title);
            return;
          }
        }
      }
    }
  }, [pathname]);

  const handleDashboardClick = () => {
    // 获取 URL 中的 from 参数 - 安全处理可能为 null 的情况
    const fromSource = searchParams?.get('from');
    
    console.log('来源参数:', fromSource); // 调试信息
    
    // 优先根据来源参数决定跳转目标
    if (fromSource === 'commenter-hall') {
      // 来自接单模块，返回接单模块
      router.push('/commenter/hall');
    } else if (fromSource === 'publisher-dashboard') {
      // 来自派单模块，返回派单模块
      router.push('/publisher/dashboard');
    } else if (user?.role === 'commenter') {
      // 评论员角色跳转到接单模块
      router.push('/commenter/hall');
    } else if (user?.role === 'publisher') {
      // 发布者角色跳转到派单模块
      router.push('/publisher/dashboard');
    } else {
      // 默认跳转到首页
      router.push('/');
    }
  };

  const handleUserAvatarClick = () => {
    setShowUserName(!showUserName);
  };

  return (
    <div ref={headerRef} className="bg-blue-500 border-b border-[#9bcfffff] px-4 py-3 flex items-center justify-between h-[60px] box-border">
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
        
        {isClient && user && user.username && (
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
                {/* 图片头像显示 */}
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
                    {user.username}
                  </span>
                </div>
              )}
            </div>
          )}
        <button
          onClick={handleDashboardClick}
          className="text-sm cursor-pointer text-white transition-all duration-300 ease"
        >
          退出
        </button>
      </div>
    </div>
  );
};

export default ClientHeader;