'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { UserOutlined } from '@ant-design/icons';
import { CustomerServiceButton } from '../../../components/button/CustomerServiceButton';
import SearchBar from '../../../components/button/SearchBar';
import { BellOutlined } from '@ant-design/icons';

// 导入路由配置
import { 
  getFlatRouteTitleMap, 
  firstLevelPages, 
  routeHierarchyMap, 
  dynamicRoutePatterns 
} from '../config/routes';

interface TopNavigationBarProps {
  user: any | null;
}

export default function TopNavigationBar({ user }: TopNavigationBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [pageTitle, setPageTitle] = useState('接单中心');
  const [isClient, setIsClient] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // 点击外部关闭下拉菜单 - 确保只有一个事件监听器
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    // 监听全局点击事件
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      // 清理事件监听器
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    setIsClient(true);
    if (pathname) {
      updatePageTitle(pathname);
    }
  }, [pathname]);

  // 更新页面标题
  const updatePageTitle = (currentPath: string) => {
    const flatRouteTitleMap = getFlatRouteTitleMap();
    
    // 尝试精确匹配
    if (flatRouteTitleMap[currentPath]) {
      setPageTitle(flatRouteTitleMap[currentPath]);
      return;
    }

    // 尝试匹配动态路由模式
    for (const pattern of dynamicRoutePatterns) {
      const pathWithoutSlash = currentPath.startsWith('/') ? currentPath.slice(1) : currentPath;
      if (pattern.pattern.test(pathWithoutSlash)) {
        const targetPath = pattern.target;
        if (flatRouteTitleMap[targetPath]) {
          setPageTitle(flatRouteTitleMap[targetPath]);
          return;
        }
      }
    }

    // 尝试基于路径段进行匹配
    const pathParts = currentPath.split('/').filter(Boolean);
    
    // 优先匹配更长的路由模式
    const sortedRoutes = Object.entries(flatRouteTitleMap).sort(([a], [b]) => b.length - a.length);
    
    for (const [route, title] of sortedRoutes) {
      // 处理动态路由的特殊逻辑
      if (route.includes('[id]')) {
        // 创建动态路由的正则表达式模式
        const dynamicRoutePattern = route.replace(/\[id\]/g, '(\\d+)');
        const regexPattern = new RegExp(`^${dynamicRoutePattern}$`);
        
        if (regexPattern.test(currentPath)) {
          setPageTitle(title);
          return;
        }
      } else {
        // 对于非动态路由，检查路径是否以该路由开头
        if (currentPath.startsWith(route) && 
            (currentPath.length === route.length || currentPath[route.length] === '/')) {
          setPageTitle(title);
          return;
        }
      }
    }

    // 默认标题
    setPageTitle('接单中心');
  };

  // 处理返回按钮点击事件
  const handleBack = () => {
    if (!pathname) return;

    // 检查当前页面是否为一级页面
    if (firstLevelPages.includes(pathname)) {
      // 如果是一级页面，返回接单中心主页
      router.push('/commenter');
      return;
    }

    // 检查是否在路由层级映射中定义了返回路径
    if (routeHierarchyMap[pathname]) {
      router.push(routeHierarchyMap[pathname]);
      return;
    }

    // 尝试匹配动态路由模式
    const pathWithoutSlash = pathname.startsWith('/') ? pathname.slice(1) : pathname;
    for (const pattern of dynamicRoutePatterns) {
      if (pattern.pattern.test(pathWithoutSlash)) {
        router.push(pattern.target);
        return;
      }
    }

    // 提取上一级路由路径
    const pathParts = pathname.split('/').filter(Boolean);
    if (pathParts.length > 0) {
      // 检查是否为commenter模块的多层级路径
      if (pathParts[0] === 'commenter' && pathParts.length > 1) {
        // 尝试返回到上一级路由
        const parentPath = '/' + pathParts.slice(0, -1).join('/');
        router.push(parentPath);
        return;
      }
    }

    // 默认返回接单中心主页
    router.push('/commenter');
  };

  // 检查是否显示返回按钮
  const shouldShowBackButton = () => {
    return pathname !== '/commenter';
  };

  const handleLogout = async () => {
    try {
      // 调用退出登录API
      const response = await fetch('/api/commenter/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include' // 包含Cookie信息
      });

      // 解析响应数据
      const data = await response.json();
      
      // 无论成功还是失败，都清除本地认证状态并跳转登录页
      // 在实际应用中，可以根据响应状态提供不同的用户反馈
      if (data.success) {
        console.log('退出登录成功', data);
      } else {
        console.warn('退出登录时遇到问题', data);
        // 即使API返回错误，也继续执行本地登出逻辑
      }
    } catch (error) {
      console.error('退出登录请求失败', error);
      // 即使请求失败，也执行本地登出逻辑
    } finally {
      // 清除本地状态并跳转到登录页面
      router.push('/commenter/auth/login');
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-blue-500 text-white px-4 py-3 flex items-center justify-between shadow-md">
      <div className="flex items-center space-x-2">
        {shouldShowBackButton() && (
          <button 
            onClick={handleBack} 
            className="text-white p-1 hover:bg-blue-600 rounded-full"
            aria-label="返回"
          >
            <span className="sr-only">返回</span>
            {/* 简单的返回箭头 */}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        <div className="flex items-center space-x-1">
          {isClient && <span className="text-xl font-medium">{pageTitle}</span>}
        </div>
      </div>
      <div className="flex items-center space-x-3" ref={dropdownRef}>
        <CustomerServiceButton 
          buttonText="联系客服" 
          modalTitle="在线客服"
          userId={user?.id || 'guest'}
          className="text-white"
        />
      
        <div className="mr-2 relative">
          <BellOutlined className="text-3xl text-white rounded-full p-1" />
          {/* 通知数量提示 */}
          <div className="absolute top-0 left-5 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
            3
          </div>
        </div>

        {/* 用户头像和下拉菜单 */}
        <div className="relative ml-3">
          <button 
            onClick={() => setShowDropdown(!showDropdown)}
            className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors duration-200"
            aria-label="用户菜单"
          >
            <img 
              src={user?.avatar || '/images/0e92a4599d02a7.jpg'} 
              alt="用户头像" 
              className="w-full h-full rounded-full object-cover"
            />
          </button>
          
          {/* 下拉菜单 */}
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 overflow-hidden z-10 transform transition-all duration-200 origin-top-right animate-fade-in-down">
              {/* 个人中心按钮 */}
              <button 
                onClick={() => {
                  router.push('/commenter/profile/settings');
                  setShowDropdown(false);
                }}
                className="w-full text-left px-4 py-3 border-b border-gray-100 text-gray-800 font-medium text-sm hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
              >
                个人中心
              </button>
              
              {/* 退出登录按钮 */}
              <button 
                onClick={() => {
                  handleLogout();
                  setShowDropdown(false);
                }}
                className="w-full text-left px-4 py-3 text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors duration-200 text-sm"
              >
                退出登录
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}