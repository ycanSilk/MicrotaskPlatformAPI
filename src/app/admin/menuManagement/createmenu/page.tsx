'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Label } from '@/components/ui';
// 移除可能不存在的组件导入，使用基础HTML元素和Tailwind CSS样式

const CreateMenuPage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [menuName, setMenuName] = useState('');
  const [description, setDescription] = useState('');
  const [roleCode, setRoleCode] = useState('');
  const [parentId, setParentId] = useState('');
  const [menuType, setMenuType] = useState('');
  const [menuUrl, setMenuUrl] = useState('');
  const [icon, setIcon] = useState('');
  const [sortOrder, setSortOrder] = useState<number | ''>('');
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('菜单创建成功！');
  const [loadingSortOrder, setLoadingSortOrder] = useState(false);
  
  // 从URL参数中获取parentId
  useEffect(() => {
    if (searchParams) {
      const parentIdParam = searchParams.get('parentId');
      if (parentIdParam) {
        setParentId(parentIdParam);
      }
    }
  }, [searchParams, parentId]);
  
  // 自动填充sortOrder
  const autoFillSortOrder = async () => {
    setLoadingSortOrder(true);
    try {
      // 获取菜单列表以计算最大序号
      const timestamp = new Date().getTime();
      const response = await fetch(`/api/menumanagement/getmenutree?_t=${timestamp}`, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success && result.data) {
        // 递归查找最大的sortOrder值
        const findMaxSortOrder = (menus: any[], parentIdToFind: string, maxOrder: number = 0): number => {
          menus.forEach(menu => {
            if (menu.parentId === parentIdToFind && menu.sortOrder > maxOrder) {
              maxOrder = menu.sortOrder;
            }
            if (menu.children && menu.children.length > 0) {
              maxOrder = findMaxSortOrder(menu.children, parentIdToFind, maxOrder);
            }
          });
          return maxOrder;
        };
        
        const currentParentId = parentId || '无';
        const maxOrder = findMaxSortOrder(result.data, currentParentId);
        setSortOrder(maxOrder + 1); // 在最大序号上加1
      }
    } catch (error) {
      console.error('获取菜单列表失败:', error);
      // 如果获取失败，默认设置为1
      setSortOrder(1);
    } finally {
      setLoadingSortOrder(false);
    }
  };
  
  // 当组件加载和parentId变化时，尝试自动填充sortOrder
  useEffect(() => {
    autoFillSortOrder();
  }, [parentId]);
  
  // 处理menuCode输入，实现大写转换
  const handleMenuCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    setRoleCode(value); // 保持变量名兼容性
    
    // 清除错误提示
    if (errors.roleCode) {
      setErrors({ ...errors, roleCode: '' });
    }
  };

  // 表单验证
  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!menuName.trim()) {
      newErrors.menuName = '请输入菜单名称';
    }
    
    if (!roleCode.trim()) {
      newErrors.menuCode = '请输入菜单代码';
    } else if (!/^[A-Z_]+$/.test(roleCode)) {
      newErrors.menuCode = '菜单代码只能包含大写字母和下划线';
    }
    
    if (!menuType.trim()) {
      newErrors.menuType = '请输入菜单类型';
    }
    
    if (!menuUrl.trim()) {
      newErrors.menuUrl = '请输入菜单URL';
    }
    
    if (sortOrder === '' || sortOrder === null || sortOrder === undefined) {
      newErrors.sortOrder = '请输入排序序号';
    } else if (sortOrder < 0) {
      newErrors.sortOrder = '排序序号不能为负数';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 提交表单
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 清除之前的提交错误
    if (errors.submit) {
      setErrors({ ...errors, submit: '' });
    }
    
    // 确保表单验证通过
    if (!validateForm()) {
      console.log('表单验证失败');
      return;
    }
    
    // 设置提交中状态
    setIsSubmitting(true);
    
    try {
      // 准备请求数据，确保字段名称与后端一致
      const requestData = {
        menuName: menuName.trim(),
        menuCode: roleCode.trim(), // 使用roleCode变量但提交为menuCode
        description: description.trim(),
        parentId: parentId || '无',
        menuType: menuType.trim(),
        menuUrl: menuUrl.trim(),
        icon: icon.trim(),
        sortOrder: typeof sortOrder === 'number' ? sortOrder : 0
      };
      
      console.log('提交菜单数据:', requestData);
      
      // 调用实际的后端API
      const response = await fetch('/api/menumanagement/createmenu', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
        credentials: 'include' // 确保包含Cookie信息
      });
      
      // 检查响应是否成功
      if (!response.ok) {
        throw new Error(`HTTP错误! 状态码: ${response.status}`);
      }
      
      // 解析响应数据
      const responseData = await response.json();
      console.log('API响应数据:', responseData);
      
      // 检查API响应状态
      if (responseData.success || responseData.code === 1) {
        // 显示成功提示，使用API返回的消息
        setSuccessMessage(responseData.message || '菜单创建成功！');
        setShowSuccess(true);
        
        // 1秒后跳转回菜单列表
        setTimeout(() => {
          router.push('/admin/menuManagement');
        }, 1000);
      } else {
        // 显示错误信息，使用API返回的消息
        const errorMessage = responseData.message || '创建菜单失败，请稍后重试';
        console.error('API返回错误:', errorMessage);
        setErrors({ submit: errorMessage });
      }
    } catch (error) {
      // 处理网络错误和异常
      console.error('创建菜单失败:', error);
      
      let errorMessage = '创建菜单失败，请稍后重试';
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMessage = '请求超时，请检查网络连接';
        } else if (error.message.includes('Failed to fetch')) {
          errorMessage = '无法连接到服务器，请检查网络';
        } else {
          errorMessage = error.message;
        }
      }
      
      setErrors({ submit: errorMessage });
    } finally {
      // 确保无论成功失败都重置提交状态
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">创建新菜单</h1>
          <button 
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md transition-colors"
            onClick={() => router.back()}
          >
            返回列表
          </button>
        </div>
        
        {showSuccess ? (
          <div className="bg-green-50 border-green-200 text-green-800 p-4 rounded-md border flex items-start">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <p className="ml-2">
              {successMessage} 1秒后自动返回菜单列表...
            </p>
          </div>
        ) : (
          <div className="overflow-hidden border-0 shadow-lg bg-white rounded-lg">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="pb-2 px-6 pt-6">
                <h2 className="text-xl font-bold">基本信息</h2>
                <p className="text-gray-600">请填写菜单的基本信息和权限设置</p>
              </div>
               
              <div className="space-y-6 px-6">
                {/* 父菜单ID */}
                <div className="space-y-2">
                  <label htmlFor="parentId" className="text-base block">父菜单ID</label>
                  <input
                    type="text"
                    id="parentId"
                    value={parentId || '无'}
                    readOnly
                    className="w-full px-3 py-2 border rounded-md bg-gray-50 border-gray-300 focus:outline-none transition-all"
                  />
                </div>
                
                {/* 菜单名称 */}
                <div className="space-y-2">
                  <label htmlFor="menuName" className="text-base block">菜单名称 <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    id="menuName"
                    value={menuName}
                    onChange={(e) => {
                      setMenuName(e.target.value);
                      if (errors.menuName) {
                        setErrors({ ...errors, menuName: '' });
                      }
                    }}
                    placeholder="请输入菜单名称"
                    className={`w-full px-3 py-2 border rounded-md ${errors.menuName ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'} focus:outline-none transition-all`}
                  />
                  {errors.menuName && (
                    <p className="text-red-500 text-sm mt-1">{errors.menuName}</p>
                  )}
                </div>
                
                {/* 菜单代码 */}
                <div className="space-y-2">
                  <label htmlFor="menuCode" className="text-base block">菜单代码 <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    id="menuCode"
                    value={roleCode}
                    onChange={handleMenuCodeChange}
                    placeholder="请输入菜单代码（大写字母和下划线）"
                    className={`w-full px-3 py-2 border rounded-md ${errors.menuCode ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'} focus:outline-none transition-all`}
                  />
                  {errors.menuCode && (
                    <p className="text-red-500 text-sm mt-1">{errors.menuCode}</p>
                  )}
                </div>
                
                {/* 菜单类型 */}
                <div className="space-y-2">
                  <label htmlFor="menuType" className="text-base block">菜单类型 <span className="text-red-500">*</span></label>
                  <select
                    id="menuType"
                    value={menuType}
                    onChange={(e) => {
                      setMenuType(e.target.value);
                      if (errors.menuType) {
                        setErrors({ ...errors, menuType: '' });
                      }
                    }}
                    className={`w-full px-3 py-2 border rounded-md ${errors.menuType ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'} focus:outline-none transition-all`}
                  >
                    <option value="">请选择菜单类型</option>
                    <option value="MENU">菜单</option>
                    <option value="BUTTON">按钮</option>
                  </select>
                  {errors.menuType && (
                    <p className="text-red-500 text-sm mt-1">{errors.menuType}</p>
                  )}
                </div>
                
                {/* 菜单URL */}
                <div className="space-y-2">
                  <label htmlFor="menuUrl" className="text-base block">菜单URL <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    id="menuUrl"
                    value={menuUrl}
                    onChange={(e) => {
                      setMenuUrl(e.target.value);
                      if (errors.menuUrl) {
                        setErrors({ ...errors, menuUrl: '' });
                      }
                    }}
                    placeholder="请输入菜单URL"
                    className={`w-full px-3 py-2 border rounded-md ${errors.menuUrl ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'} focus:outline-none transition-all`}
                  />
                  {errors.menuUrl && (
                    <p className="text-red-500 text-sm mt-1">{errors.menuUrl}</p>
                  )}
                </div>
                
                {/* 图标 */}
                <div className="space-y-2">
                  <label htmlFor="icon" className="text-base block">图标</label>
                  <input
                    type="text"
                    id="icon"
                    value={icon}
                    onChange={(e) => setIcon(e.target.value)}
                    placeholder="请输入图标名称"
                    className="w-full px-3 py-2 border rounded-md border-gray-300 focus:ring-blue-500 focus:outline-none transition-all"
                  />
                </div>
                
                {/* 排序序号 */}
                <div className="space-y-2">
                  <label htmlFor="sortOrder" className="text-base block">排序序号 <span className="text-red-500">*</span></label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      id="sortOrder"
                      value={sortOrder}
                      onChange={(e) => {
                        const value = e.target.value === '' ? '' : Number(e.target.value);
                        setSortOrder(value);
                        if (errors.sortOrder) {
                          setErrors({ ...errors, sortOrder: '' });
                        }
                      }}
                      placeholder="请输入排序序号"
                      className={`flex-1 px-3 py-2 border rounded-md ${errors.sortOrder ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'} focus:outline-none transition-all`}
                      min="0"
                      disabled={loadingSortOrder}
                    />
                    <button
                      type="button"
                      onClick={autoFillSortOrder}
                      disabled={loadingSortOrder}
                      className={`bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-md transition-colors whitespace-nowrap`}
                    >
                      {loadingSortOrder ? (
                        <span className="flex items-center">
                          <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1"></span>
                          自动填充中...
                        </span>
                      ) : (
                        '自动填充'
                      )}
                    </button>
                  </div>
                  {errors.sortOrder && (
                    <p className="text-red-500 text-sm mt-1">{errors.sortOrder}</p>
                  )}
                </div>
              
                {errors.submit && (
                  <div className="bg-red-50 border-red-200 text-red-800 p-4 rounded-md border">
                    <p>{errors.submit}</p>
                  </div>
                )}
              </div>
               
              <div className="px-6 pb-6 flex flex-col sm:flex-row sm:justify-end gap-3">
                <button 
                  type="button" 
                  className="bg-gray-200 text-gray-800 hover:bg-gray-300 px-4 py-2 rounded-md transition-colors"
                  onClick={() => router.back()}
                  disabled={isSubmitting}
                >
                  取消
                </button>
                <button 
                  type="submit" 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      提交中...
                    </>
                  ) : '创建菜单'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateMenuPage;