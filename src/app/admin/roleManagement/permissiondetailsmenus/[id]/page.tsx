'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { Label } from '@/components/ui';
// 移除可能不存在的组件导入，使用基础HTML元素和Tailwind CSS样式

// 后端API返回数据格式定义
export interface MenuItem {
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
  children?: MenuItem[];
}

export interface PermissionDetailResponse {
  code: number;
  message: string;
  data: {
    id: string;
    roleName: string;
    roleCode: string;
    description: string;
    status: string;
    createTime: string;
    userCount: number;
    menus: MenuItem[];
  };
  success: boolean;
  timestamp: number;
}

// 权限树节点类型
export type PermissionTreeNode = MenuItem & {
  checked?: boolean;
  expanded?: boolean; // 新增展开/折叠状态
};

const PermissionDetailsPage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const roleId = params.id as string;

  // 验证角色ID是否获取成功
  useEffect(() => {
    if (!roleId) {
      // 如果没有角色ID，可能是错误的导航，返回角色管理页面
      router.push('/admin/roleManagement');
      return;
    }
    console.log('角色ID:', roleId);
  }, [roleId, router]);

  // 状态管理
  const [roleName, setRoleName] = useState('');
  const [roleDescription, setRoleDescription] = useState('');
  const [permissions, setPermissions] = useState<PermissionTreeNode[]>([]);
  const [isAllChecked, setIsAllChecked] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // 新增加载状态
  const [loadingError, setLoadingError] = useState<string | null>(null); // 新增错误状态

  // 将API返回的menus转换为前端所需的PermissionTreeNode格式
  const transformMenusToPermissionTree = (menus: MenuItem[]): PermissionTreeNode[] => {
    // 构建ID到节点的映射
    const menuMap: Record<string, PermissionTreeNode> = {};
    const rootNodes: PermissionTreeNode[] = [];

    // 第一步：将所有菜单转换为PermissionTreeNode并存储在映射中
    const transformedMenus = menus.map(menu => ({
      ...menu,
      checked: false,
      expanded: true // 默认展开所有节点
    }));

    transformedMenus.forEach(menu => {
      menuMap[menu.id] = menu;
    });

    // 第二步：构建层级结构
    transformedMenus.forEach(menu => {
      const parentId = menu.parentId;
      if (parentId && menuMap[parentId]) {
        if (!menuMap[parentId].children) {
          menuMap[parentId].children = [];
        }
        menuMap[parentId].children.push(menu);
      } else {
        // 没有父节点或父节点不存在的节点作为根节点
        rootNodes.push(menu);
      }
    });

    return rootNodes;
  };

  // 从后端API获取权限详情菜单数据
  const fetchPermissionDetails = async () => {
    if (!roleId) return;

    setIsLoading(true);
    setLoadingError(null);

    try {
      const response = await fetch('/api/admin/role/systemrole/getpermissiondetailsmenus', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ roleId })
      });

      const data: PermissionDetailResponse = await response.json();

      if (data.success) {
        const { roleName, description, menus } = data.data;

        setRoleName(roleName);
        setRoleDescription(description);
        setPermissions(transformMenusToPermissionTree(menus));
      } else {
        setLoadingError(data.message || '获取权限详情失败');
      }
    } catch (error) {
      setLoadingError('网络错误，请稍后重试');
      console.error('获取权限详情失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 组件挂载后获取数据
  useEffect(() => {
    fetchPermissionDetails();
  }, [roleId]);

  // 重试功能
  const handleRetry = () => {
    fetchPermissionDetails();
  };

  // 表单验证
  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!roleName.trim()) {
      newErrors.roleName = '请输入角色名称';
    }
    
    const selectedPermissions = getSelectedPermissionIds(permissions);
    if (selectedPermissions.length === 0) {
      newErrors.permissions = '请至少选择一个权限';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 处理展开/折叠
  const handleToggleExpand = (nodeId: string) => {
    const toggleExpand = (nodes: PermissionTreeNode[]): PermissionTreeNode[] => {
      return nodes.map(node => {
        if (node.id === nodeId) {
          return { ...node, expanded: !node.expanded };
        } else if (node.children && node.children.length > 0) {
          return {
            ...node,
            children: toggleExpand(node.children)
          };
        }
        return node;
      });
    };

    setPermissions(toggleExpand(permissions));
  };

  // 处理复选框变化
  const handleCheckboxChange = (nodeId: string, checked: boolean) => {
    const updatePermissionTree = (nodes: PermissionTreeNode[]): PermissionTreeNode[] => {
      return nodes.map(node => {
        if (node.id === nodeId) {
          // 更新当前节点及其子节点
          const updatedNode = { ...node, checked };
          if (updatedNode.children && updatedNode.children.length > 0) {
            updatedNode.children = updateChildrenCheck(updatedNode.children, checked);
          }
          return updatedNode;
        } else if (node.children && node.children.length > 0) {
          // 递归更新子节点
          const updatedNode = { ...node };
          updatedNode.children = updatePermissionTree(node.children);
          
          // 更新父节点状态
          const allChecked = updatedNode.children.every(child => child.checked);
          updatedNode.checked = allChecked;
          
          return updatedNode;
        }
        return node;
      });
    };

    const updateChildrenCheck = (children: PermissionTreeNode[], checked: boolean): PermissionTreeNode[] => {
      return children.map(child => {
        const updatedChild = { ...child, checked };
        if (updatedChild.children && updatedChild.children.length > 0) {
          updatedChild.children = updateChildrenCheck(updatedChild.children, checked);
        }
        return updatedChild;
      });
    };

    const newPermissions = updatePermissionTree(permissions);
    setPermissions(newPermissions);
    
    // 重新计算全选状态
    const getAllCheckedIds = (nodes: PermissionTreeNode[]): Set<string> => {
      const ids = new Set<string>();
      nodes.forEach(node => {
        if (node.checked) ids.add(node.id);
        if (node.children) {
          const childIds = getAllCheckedIds(node.children);
          childIds.forEach(id => ids.add(id));
        }
      });
      return ids;
    };
    
    const totalPermissions = permissions.flatMap(n => {
      const getAllIds = (node: PermissionTreeNode): string[] => {
        const ids: string[] = [node.id];
        if (node.children) {
          node.children.forEach(child => {
            ids.push(...getAllIds(child));
          });
        }
        return ids;
      };
      return getAllIds(n);
    }).length;
    
    setIsAllChecked(getAllCheckedIds(newPermissions).size === totalPermissions);
    // 清除权限错误
    if (errors.permissions) {
      setErrors({ ...errors, permissions: '' });
    }
  };

  // 处理全选/取消全选
  const handleSelectAll = (checked: boolean) => {
    const updateAllCheck = (nodes: PermissionTreeNode[]): PermissionTreeNode[] => {
      return nodes.map(node => {
        const updatedNode = { ...node, checked };
        if (updatedNode.children && updatedNode.children.length > 0) {
          updatedNode.children = updateAllCheck(updatedNode.children);
        }
        return updatedNode;
      });
    };

    const newPermissions = updateAllCheck(permissions);
    setPermissions(newPermissions);
    setIsAllChecked(checked);
    // 清除权限错误
    if (errors.permissions) {
      setErrors({ ...errors, permissions: '' });
    }
  };

  // 获取选中的权限ID
  const getSelectedPermissionIds = (nodes: PermissionTreeNode[]): string[] => {
    let ids: string[] = [];
    nodes.forEach(node => {
      if (node.checked) ids.push(node.id);
      if (node.children) {
        ids = [...ids, ...getSelectedPermissionIds(node.children)];
      }
    });
    return ids;
  };

  // 提交表单
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const selectedPermissionIds = getSelectedPermissionIds(permissions);
      
      // 模拟API请求
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('创建角色:', {
        name: roleName,
        description: roleDescription,
        permissions: selectedPermissionIds
      });
      
      // 显示成功提示
      setShowSuccess(true);
      
      // 3秒后跳转回角色列表
      setTimeout(() => {
        router.push('/admin/systemrole');
      }, 3000);
    } catch (error) {
      console.error('创建角色失败:', error);
      setErrors({ submit: '创建角色失败，请稍后重试' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 渲染权限树
  const renderPermissionTree = (nodes: PermissionTreeNode[], level = 0) => {
    // 定义统一的复选框样式类，添加选中状态的外边框效果
    const checkboxClass = "h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 focus:ring-offset-1 transition-all duration-150 ease-in-out";
    
    // 统一的标签样式，根据层级调整
    const getLabelClass = (currentLevel: number) => {
      // 保持文字大小统一规范
      return "ml-2 text-sm font-medium cursor-pointer select-none";
    };
    
    // 统一的展开/折叠按钮图标尺寸
    const getIconSize = (currentLevel: number) => {
      return currentLevel === 0 ? "w-4 h-4" : "w-3 h-3";
    };
    
    // 一级菜单 - 单列布局，每个独占一行
    if (level === 0) {
      return nodes.map(node => (
        <div key={node.id} className="mb-4">
          <div className="flex items-center w-full">
            {/* 展开/折叠按钮 */}
            {node.children && node.children.length > 0 && (
              <button
                type="button"
                onClick={() => handleToggleExpand(node.id)}
                className="mr-2 text-gray-500 hover:text-blue-500 transition-colors"
                aria-label={node.expanded ? '折叠' : '展开'}
              >
                <svg
                  className={`${getIconSize(level)} transform transition-transform ${node.expanded ? 'rotate-90' : 'rotate-0'}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
            <input
              type="checkbox"
              checked={node.checked || false}
              onChange={(e) => handleCheckboxChange(node.id, e.target.checked)}
              className={checkboxClass}
              id={`permission-${node.id}`}
              style={{
                // 添加选中状态下的外边框显示效果
                boxShadow: (node.checked || false) ? '0 0 0 2px #e2e8f0, 0 0 0 4px #93c5fd' : 'none'
              }}
            />
            <label 
              htmlFor={`permission-${node.id}`}
              className={getLabelClass(level)}
            >
              {node.name}
            </label>
          </div>
          
          {/* 二级菜单 - 双列网格布局，两个字符缩进 */}
          {node.children && node.children.length > 0 && node.expanded && (
            <div className="mt-3 pl-6"> {/* 两个字符缩进 (约6px) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {node.children.map(childNode => (
                  <div key={childNode.id} className="flex items-center">
                    {childNode.children && childNode.children.length > 0 && (
                      <button
                        type="button"
                        onClick={() => handleToggleExpand(childNode.id)}
                        className="mr-2 text-gray-500 hover:text-blue-500 transition-colors"
                        aria-label={childNode.expanded ? '折叠' : '展开'}
                      >
                        <svg
                          className={`${getIconSize(level + 1)} transform transition-transform ${childNode.expanded ? 'rotate-90' : 'rotate-0'}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    )}
                    <input
                      type="checkbox"
                      checked={childNode.checked || false}
                      onChange={(e) => handleCheckboxChange(childNode.id, e.target.checked)}
                      className={checkboxClass}
                      id={`permission-${childNode.id}`}
                      style={{
                        // 添加选中状态下的外边框显示效果
                        boxShadow: (childNode.checked || false) ? '0 0 0 2px #e2e8f0, 0 0 0 4px #93c5fd' : 'none'
                      }}
                    />
                    <label 
                      htmlFor={`permission-${childNode.id}`}
                      className={getLabelClass(level + 1)}
                    >
                      {childNode.name}
                    </label>
                  </div>
                ))}
              </div>
              
              {/* 三级菜单 - 递归渲染 */}
              {node.children.map(childNode => (
                childNode.children && childNode.children.length > 0 && childNode.expanded && (
                  <div key={`${childNode.id}-children`} className="mt-2 pl-6">
                    {renderPermissionTree([childNode], level + 1)}
                  </div>
                )
              ))}
            </div>
          )}
        </div>
      ));
    } else if (level === 1) {
      // 三级及以下菜单 - 保持原有布局，但调整缩进
      return nodes.map(node => (
        <div key={node.id} className="mb-2">
          <div className="flex items-center">
            {node.children && node.children.length > 0 && (
              <button
                type="button"
                onClick={() => handleToggleExpand(node.id)}
                className="mr-2 text-gray-500 hover:text-blue-500 transition-colors"
                aria-label={node.expanded ? '折叠' : '展开'}
              >
                <svg
                  className={`${getIconSize(level)} transform transition-transform ${node.expanded ? 'rotate-90' : 'rotate-0'}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
            <input
              type="checkbox"
              checked={node.checked || false}
              onChange={(e) => handleCheckboxChange(node.id, e.target.checked)}
              className={checkboxClass}
              id={`permission-${node.id}`}
              style={{
                // 添加选中状态下的外边框显示效果
                boxShadow: (node.checked || false) ? '0 0 0 2px #e2e8f0, 0 0 0 4px #93c5fd' : 'none'
              }}
            />
            <label 
              htmlFor={`permission-${node.id}`}
              className={getLabelClass(level)}
            >
              {node.name}
            </label>
          </div>
          {node.children && node.children.length > 0 && node.expanded && (
            <div className="mt-1 pl-6">
              {renderPermissionTree(node.children, level + 1)}
            </div>
          )}
        </div>
      ));
    } else {
      // 更深层级菜单 - 保持统一的复选框和文字大小
      return nodes.map(node => (
        <div key={node.id} className="mb-1 flex items-center">
            <input
              type="checkbox"
              checked={node.checked || false}
              onChange={(e) => handleCheckboxChange(node.id, e.target.checked)}
              className={checkboxClass}
              id={`permission-${node.id}`}
              style={{
                // 添加选中状态下的外边框显示效果
                boxShadow: (node.checked || false) ? '0 0 0 2px #e2e8f0, 0 0 0 4px #93c5fd' : 'none'
              }}
            />
            <label 
              htmlFor={`permission-${node.id}`}
              className={getLabelClass(level)}
            >
              {node.name}
            </label>
          </div>
      ));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">权限详情</h1>
          <button 
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md transition-colors"
            onClick={() => router.back()}
          >
            返回列表
          </button>
        </div>
        <div className="mb-4">角色ID: {roleId}</div>
        
        {/* 加载状态 */}
        {isLoading ? (
          <div className="bg-white rounded-lg shadow-lg p-8 flex justify-center items-center">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-600">正在加载权限详情...</p>
            </div>
          </div>
        ) : loadingError ? (
          {/* 错误状态 */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex items-start mb-4">
              <div className="text-red-500 mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">加载失败</h3>
                <p className="text-gray-700 mb-4">{loadingError}</p>
                <button 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
                  onClick={handleRetry}
                >
                  重试
                </button>
              </div>
            </div>
          </div>
        ) : showSuccess ? (
          <div className="bg-green-50 border-green-200 text-green-800 p-4 rounded-md border flex items-start">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <p className="ml-2">
              角色创建成功！3秒后自动返回角色列表...
            </p>
          </div>
        ) : (
          <div className="overflow-hidden border-0 shadow-lg bg-white rounded-lg">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="pb-2 px-6 pt-6">
                <h2 className="text-xl font-bold">基本信息</h2>
                <p className="text-gray-600">请填写角色的基本信息和权限设置</p>
              </div>
               
              <div className="space-y-6 px-6">
                {/* 角色名称 */}
                <div className="space-y-2">
                  <label htmlFor="roleName" className="text-base block">角色名称 <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    id="roleName"
                    value={roleName}
                    onChange={(e) => {
                      setRoleName(e.target.value);
                      if (errors.roleName) {
                        setErrors({ ...errors, roleName: '' });
                      }
                    }}
                    placeholder="请输入角色名称"
                    className={`w-full px-3 py-2 border rounded-md ${errors.roleName ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'} focus:outline-none transition-all`}
                  />
                  {errors.roleName && (
                    <p className="text-red-500 text-sm mt-1">{errors.roleName}</p>
                  )}
                </div>
                
                {/* 角色描述 */}
                <div className="space-y-2">
                  <label htmlFor="roleDescription" className="block">角色描述</label>
                  <textarea
                    id="roleDescription"
                    value={roleDescription}
                    onChange={(e) => setRoleDescription(e.target.value)}
                    placeholder="请输入角色描述（可选）"
                    className="w-full min-h-[100px] resize-y px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                </div>
                
                <div className="border-t border-gray-200 my-4"></div>
                
                {/* 权限设置 */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label className="text-base">权限设置 <span className="text-red-500">*</span></Label>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={isAllChecked}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        id="select-all"
                      />
                      <label 
                        htmlFor="select-all"
                        className="ml-2 text-sm font-medium cursor-pointer select-none"
                      >
                        全选
                      </label>
                    </div>
                  </div>
                  
                  {errors.permissions && (
                    <p className="text-red-500 text-sm">{errors.permissions}</p>
                  )}
                  
                  {/* 权限树 - 响应式布局 */}
                  <div className="bg-gray-50 rounded-lg p-4 max-h-[400px] overflow-y-auto border border-gray-200">
                    {/* 统一的权限树渲染，优先适配移动设备 */}
                    {renderPermissionTree(permissions.slice(0, 4))} {/* 最多显示4个一级权限项 */}
                  </div>
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
                  ) : '创建角色'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default PermissionDetailsPage;