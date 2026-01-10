'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/Toast';


interface MenuTree {
    id: string;
    menuName: string;
    menuCode: string;
    parentId: string;
    menuType: string;
    menuUrl: string;
    icon: string;
    sortOrder: number;
    status: string;
    createTime: string;
    children: MenuTree[];
}

interface MenuApiResponse {
  code?: number;
  success: boolean;
  message: string;
  data?: MenuTree[];
  timestamp?: number;
}

export default function MenuManagementPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [menus, setMenus] = useState<MenuTree[]>([]); 
  const [loading, setLoading] = useState<boolean>(true); 
  const [error, setError] = useState<string | null>(null); 
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set()); 
  const [updatingMenus, setUpdatingMenus] = useState<Set<string>>(new Set()); 

  // 获取菜单列表 - 调用后端API
  const fetchMenuList = async () => {
    // 添加详细日志，帮助调试API调用
    console.log('开始调用菜单API:', new Date().toISOString());
    setLoading(true);
    setError(null);
    
    try {
      // 添加时间戳参数确保每次请求都是唯一的，避免缓存问题
      const timestamp = new Date().getTime();
      const url = `/api/menumanagement/getmenutree?_t=${timestamp}`;
      
      console.log('API请求URL:', url);
      
      // 添加缓存控制，确保每次都从服务器获取最新数据
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        credentials: 'include' // 包含凭证，确保会话一致性
      });   
      
      console.log('API响应状态:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const result: MenuApiResponse = await response.json();
      
      console.log('API响应数据:', result);
      
      if (result.success && result.data) {
        setMenus(result.data);
        console.log('菜单数据更新成功');
      } else {
        throw new Error(result.message || '获取菜单数据失败');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '加载失败，请稍后重试';
      setError(errorMessage);
      addToast({ message: errorMessage, type: 'error' });
      console.error('菜单数据加载失败:', err);
    } finally {
      setLoading(false);
      console.log('API调用完成:', new Date().toISOString());
    }
  };
  
  // 确保组件挂载和页面刷新时都调用API
  useEffect(() => {
    console.log('组件挂载，初始化API调用');
    // 直接调用API获取数据
    fetchMenuList();
    
    // 添加窗口焦点事件，当用户切换回此标签页时刷新数据
    const handleFocus = () => {
      console.log('窗口获得焦点，刷新菜单数据');
      fetchMenuList();
    };
    
    // 添加窗口加载事件，确保页面刷新时调用API
    const handleLoad = () => {
      console.log('页面加载/刷新，获取菜单数据');
      fetchMenuList();
    };
    
    // 添加beforeunload事件，确保页面刷新前可以做必要的清理
    const handleBeforeUnload = () => {
      console.log('页面即将刷新/关闭');
    };
    
    window.addEventListener('focus', handleFocus);
    window.addEventListener('load', handleLoad);
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      console.log('组件卸载，清理事件监听器');
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('load', handleLoad);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);
  
  // 添加页面可见性变化事件监听，确保在页面重新变为可见时刷新数据
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('页面变为可见，刷新菜单数据');
        fetchMenuList();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const toggleMenuExpand = (menuId: string) => {
    setExpandedMenus(prev => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(menuId)) {
        newExpanded.delete(menuId);
      } else {
        newExpanded.add(menuId);
      }
      return newExpanded;
    });
  };

  // 定义API响应接口
  interface ApiResponse {
    code?: number;
    message: string;
    success: boolean;
    timestamp?: number;
  }

  // 通用的菜单状态更新函数
  const updateMenuStatus = async (menuId: string, action: 'enable' | 'disable') => {
    // 验证菜单ID
    if (!menuId || typeof menuId !== 'string') {
      addToast({
        message: '无效的菜单ID',
        type: 'error'
      });
      return;
    }
    
    // 设置加载状态
    setUpdatingMenus(prev => new Set(prev).add(menuId));
    
    try {
      // 获取对应的API端点
      const apiEndpoint = action === 'enable' 
        ? '/api/menumanagement/enablemenu'
        : '/api/menumanagement/disablemenu';
      
      // 设置请求超时
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1000); // 30秒超时
      
      // 发送请求
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ menuId }),
        signal: controller.signal
      });
      
      // 清除超时计时器
      clearTimeout(timeoutId);
      
      // 检查响应状态
      if (!response.ok) {
        // 根据不同的HTTP状态码提供更具体的错误信息
        let errorMsg = '服务器错误';
        switch (response.status) {
          case 400:
            errorMsg = '请求参数错误';
            break;
          case 401:
            errorMsg = '未授权，请重新登录';
            break;
          case 403:
            errorMsg = '没有操作权限';
            break;
          case 404:
            errorMsg = '请求的资源不存在';
            break;
          case 500:
            errorMsg = '服务器内部错误';
            break;
        }
        throw new Error(`${errorMsg} (${response.status})`);
      }
      
      // 解析响应
      let result: ApiResponse;
      try {
        result = await response.json();
        
        // 验证响应格式
        if (!result || typeof result.success !== 'boolean') {
          throw new Error('无效的响应格式');
        }
      } catch (parseError) {
        throw new Error('响应数据解析失败');
      }
      
      // 根据响应结果显示提示
      if (result.success) {
        addToast({
          message: action === 'enable' ? '菜单启用成功' : '菜单禁用成功',
          type: 'success'
        });
        
        // 刷新菜单数据以更新状态
        await fetchMenuList();
      } else {
        // 显示后端返回的错误信息
        const errorMessage = result.message || (action === 'enable' ? '菜单启用失败' : '菜单禁用失败');
        addToast({
          message: errorMessage,
          type: 'error'
        });
      }
    } catch (error) {
        // 网络错误或其他异常处理
        let errorMessage: string;
        
        if (error instanceof Error && error.name === 'AbortError') {
          errorMessage = '请求超时，请检查网络连接';
        } else if (error instanceof Error) {
          errorMessage = error.message;
        } else {
          errorMessage = '未知错误';
        }
      
      addToast({
        message: `${action === 'enable' ? '菜单启用失败' : '菜单禁用失败'}: ${errorMessage}`,
        type: 'error'
      });
      
      // 详细日志记录
      console.error(`${action} menu error for ID ${menuId}:`, error);
    } finally {
      // 确保清除加载状态
      setUpdatingMenus(prev => {
        const newSet = new Set(prev);
        newSet.delete(menuId);
        return newSet;
      });
    }
  };

  // 启用菜单函数
  const enableMenu = (menuId: string) => {
    updateMenuStatus(menuId, 'enable');
  };

  // 禁用菜单函数
  const disableMenu = (menuId: string) => {
    updateMenuStatus(menuId, 'disable');
  };

  // 递归渲染菜单的辅助函数
  const renderMenuItems = (menuItems: MenuTree[], level = 0) => {
    // 安全检查，确保menuItems是数组
    if (!Array.isArray(menuItems)) {
      return null;
    }

    return menuItems.map((menu) => {
      // 安全检查，确保menu对象有效
      if (!menu || !menu.id) {
        return null;
      }
      
      // 确保无论菜单状态如何都显示

      const isExpanded = expandedMenus.has(menu.id);
      return (
        <React.Fragment key={menu.id}>
          <div 
            className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 hover:border-gray-300 mb-3 overflow-hidden" 
            style={{ marginLeft: `${level * 20}px` }}
          >
            {/* 菜单标题部分 */}
            <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 border-b border-gray-100 cursor-pointer w-full ${menu.status === 'DISABLED' ? 'opacity-80' : ''}`} onClick={() => toggleMenuExpand(menu.id)}>
              <div className="flex items-center w-full sm:w-auto mb-2 sm:mb-0">
                <h3 className="text-lg font-medium text-gray-900">{menu.menuName || '未命名菜单'}</h3>
              </div>
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-start sm:justify-end">
                <span className={`px-2 py-1 rounded-md text-xs font-medium ${menu.status === 'ENABLED' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {menu.status === 'ENABLED' ? '启用' : '禁用'}
                </span>
                <button 
                  className="text-sm px-3 py-1 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors w-full sm:w-auto text-center"
                  onClick={(e) => {
                    e.stopPropagation(); // 防止触发父元素的点击事件
                    toggleMenuExpand(menu.id);
                  }}
                >
                  {isExpanded ? '收起详情' : '查看详情'}
                </button>
              </div>
            </div>

            {/* 菜单详细信息 - 添加展开/折叠动画效果 */}
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
              {isExpanded && (
                <div className="p-3">
                  {/* 操作按钮区域 */}
                  <div className="flex justify-end mb-3">
                    {(level > 0 && menu.parentId && menu.parentId !== '无') && (
                      menu.status === 'ENABLED' ? (
                          <button 
                            className={`bg-red-500 hover:bg-red-600 text-white text-sm px-3 py-1 rounded mr-2 transition-colors ${updatingMenus.has(menu.id) ? 'opacity-70 cursor-not-allowed' : ''}`}
                            onClick={(e) => {
                              e.stopPropagation(); // 防止触发父元素的点击事件
                              if (!updatingMenus.has(menu.id)) {
                                disableMenu(menu.id);
                              }
                            }}
                            disabled={updatingMenus.has(menu.id)}
                            title="点击禁用此菜单"
                          >
                            {updatingMenus.has(menu.id) ? (
                              <span className="flex items-center">
                                <span className="inline-block animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></span>
                                禁用中...
                              </span>
                            ) : (
                              '禁用菜单'
                            )}
                          </button>
                        ) : (
                          <button 
                            className={`bg-green-500 hover:bg-green-600 text-white text-sm px-3 py-1 rounded mr-2 transition-colors ${updatingMenus.has(menu.id) ? 'opacity-70 cursor-not-allowed' : ''}`}
                            onClick={(e) => {
                              e.stopPropagation(); // 防止触发父元素的点击事件
                              if (!updatingMenus.has(menu.id)) {
                                enableMenu(menu.id);
                              }
                            }}
                            disabled={updatingMenus.has(menu.id)}
                            title="点击启用此菜单"
                          >
                            {updatingMenus.has(menu.id) ? (
                              <span className="flex items-center">
                                <span className="inline-block animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></span>
                                启用中...
                              </span>
                            ) : (
                              '启用菜单'
                            )}
                          </button>
                        )
                    )}
 
                    <button 
                      className="bg-purple-500 hover:bg-purple-600 text-white text-sm px-3 py-1 rounded mr-2 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/admin/menuManagement/createmenu?parentId=${menu.id}`);
                      }}
                      title="点击为此菜单创建子菜单"
                    >
                      创建子菜单
                    </button>
                    <button className="bg-blue-500 hover:bg-blue-600 text-white text-sm px-3 py-1 rounded transition-colors">
                      编辑菜单
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 text-sm">
                    <div className="flex items-center">
                      <span className="w-1/3 text-gray-600">菜单编码：</span>
                      <span className="w-2/3 text-gray-900">{menu.menuCode || '-'}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-1/3 text-gray-600">菜单类型：</span>
                      <span className="w-2/3 text-gray-900">{menu.menuType || '-'}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-1/3 text-gray-600">父菜单ID：</span>
                      <span className="w-2/3 text-gray-900">{menu.parentId || '无'}</span>
                    </div>
                    <div className="flex items-start col-span-1 md:col-span-2">
                      <span className="w-1/3 md:w-1/6 text-gray-600">菜单URL：</span>
                      <span className="w-2/3 md:w-5/6 text-gray-900 word-break">{menu.menuUrl || '无'}</span>
                    </div>
                    <div className="flex items-center col-span-1 md:col-span-2">
                      <span className="w-1/3 md:w-1/6 text-gray-600">创建时间：</span>
                      <span className="w-2/3 md:w-5/6 text-gray-900">{menu.createTime || '-'}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* 递归渲染子菜单 - 优化响应式布局 */}
          <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[2000px] opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
            {isExpanded && Array.isArray(menu.children) && menu.children.length > 0 && (
              <div className="pl-2 pl-2">
                {renderMenuItems(menu.children, level + 1)}
              </div>
            )}
          </div>
        </React.Fragment>
      );
    });
  };
  

  return (
    <div className="space-y-6 pb-20 px-4 pt-4">
      {/* 页面标题 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">菜单管理</h1>
        <p className="text-sm text-gray-600">管理平台上所有菜单信息</p>
      </div>
      
      {/* 菜单卡片列表 */}
      <div className="space-y-4 mt-6" suppressHydrationWarning={true}>
        {/* Loading state */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-3"></div>
            <p className="text-gray-600">正在加载菜单数据...</p>
          </div>
        ) : error ? (
          /* Error state */
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
            <p className="text-red-700">{error}</p>
          </div>
        ) : menus.length === 0 ? (
          /* Empty state */
          <div className="text-center py-12 bg-white border border-gray-200 rounded-xl">
            <p className="text-gray-600">暂无菜单数据</p>
          </div>
        ) : (
          renderMenuItems(menus)
        )}
      </div>
    </div>
  );
}