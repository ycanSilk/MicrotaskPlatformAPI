'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/Toast';

// Define TypeScript interfaces for API response
interface RoleList {
    id: string;
    roleName: string;
    roleCode: string;
    description: string;
    status: string;
    createTime: string;
    userCount: number;
    menus: string;
}

interface ApiResponse {
  code: number;
  message: string;
  data: {
    list: RoleList[];
    total: number;
    page: number;
    size: number;
    pages: number;
  };
  success: boolean;
  timestamp: number;
}

interface ApiRequestBody {
    page?: number;
    size?: number;
    status?: string;
}





export default function RoleManagementPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [roles, setRoles] = useState<RoleList[]>([]); // 存储从API获取的角色数据
  const [loading, setLoading] = useState<boolean>(true); // 加载状态
  const [error, setError] = useState<string | null>(null); // 错误信息

  // Fetch user data from API
  const fetchRoleList = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const requestBody: ApiRequestBody = {
        page: 0,
        size: 10,
        status: ""
      };
      
      const response = await fetch('/api/role/systemrole/getrolelist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody),
        credentials: 'include'
      });
      
      
      const data: ApiResponse = await response.json();
      
      if (response.ok) {
        console.log('调用获取角色列表API成功。Response OK:', data);
      } else {
        console.log(`API请求失败，状态码: ${response.status}`, data);
      }
      
      if (data.success && data.data) {
        setRoles(data.data.list);
      } else {
        setError(data.message || `获取角色数据失败（状态码: ${response.status}）`);
      }
    } catch (err) {
      setError('网络错误，请稍后重试');
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle role status change
  const handleRoleStatusChange = async (roleId: string, newStatus: string) => {
    setLoading(true);
    setError(null);
    
    try {
        const action = newStatus === 'DISABLED' ? '禁用' : '启用';
        const endpoint = newStatus === 'DISABLED' ? '/api/role/systemrole/disabledrole' : '/api/role/systemrole/enablerole';
        
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ roleId }),
          credentials: 'include'
        });

        const data = await response.json();
        
        if (data.success) {
          addToast({ message: `角色${action}成功`, type: 'success' });
          // Refresh role list after status change
          fetchRoleList();
        } else {
          const errorMsg = data.message || `角色${action}失败`;
          addToast({ message: errorMsg, type: 'error' });
          setError(errorMsg);
        }
      } catch (err) {
        const action = newStatus === 'DISABLED' ? '禁用' : '启用';
        const errorMsg = `角色${action}失败: 网络错误，请稍后重试`;
        addToast({ message: errorMsg, type: 'error' });
        setError(errorMsg);
        console.error('Failed to change role status:', err);
      } finally {
      setLoading(false);
    }
  };

  // Fetch data on component mount and when filteredPhone changes
  useEffect(() => {
    fetchRoleList();
  }, []);

  return (
    <div className="space-y-6 pb-20 px-4 pt-4">
      {/* 页面标题 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">角色管理</h1>
        <p className="text-sm text-gray-600">管理平台上所有角色信息</p>
      </div>
      {/* 用户卡片列表 */}
      <div className="space-y-4 mt-6" suppressHydrationWarning={true}>
        {/* Loading state */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-3"></div>
            <p className="text-gray-600">正在加载角色数据...</p>
          </div>
        ) : error ? (
          /* Error state */
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
            <p className="text-red-700">{error}</p>
          </div>
        ) : roles.length === 0 ? (
          /* Empty state */
          <div className="text-center py-12 bg-white border border-gray-200 rounded-xl">
            <p className="text-gray-600">暂无角色数据</p>
          </div>
        ) : (
          roles.map((role) => (
            <div key={role.id} className="bg-white border border-gray-200 rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow relative">
              {/* 角色信息行 */}
              <div className="flex items-center justify-between mb-4">
                {/* 状态显示和编辑按钮 - 右上角 */}
                <div className='absolute top-3 right-5 flex items-center'>
                  {/* 角色状态显示 */}
                  <span className={`px-2 py-1 rounded-md text-xs font-medium ${role.status === 'ENABLED' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {role.status === 'ENABLED' ? '启用' : '禁用'}
                  </span> 
                </div>
              </div> 

              <div className="flex flex-col space-y-3 ml-2">
                <div className="flex items-center">
                  <span className="w-1/4 text-sm font-medium text-gray-700">角色名称</span>
                  <span className="w-3/4 overflow-hidden text-ellipsis whitespace-nowrap text-sm text-gray-900">{role.roleName}</span>
                </div>
                <div className="flex items-center">
                  <span className="w-1/4 text-sm font-medium text-gray-700">角色介绍</span>
                  <span className="w-3/4 overflow-hidden text-ellipsis whitespace-nowrap text-sm text-gray-900">{role.description}</span>
                </div>
                <div className="flex items-center">
                  <span className="w-1/4 text-sm font-medium text-gray-700">成员数量</span>
                  <span className="w-3/4 overflow-hidden text-ellipsis whitespace-nowrap text-sm text-gray-900">{role.userCount}</span>
                </div>
              </div>
              <div className="flex justify-end space-x-2 mt-3">
                  <button 
                      className={`${role.status === 'ENABLED' ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded-md px-2 py-2`}
                      onClick={() => handleRoleStatusChange(role.id, role.status === 'ENABLED' ? 'DISABLED' : 'ENABLED')}
                  >
                      {role.status === 'ENABLED' ? '禁用角色' : '启用角色'}
                  </button>
                  <button className="bg-blue-600 hover:bg-blue-700 text-white rounded-md px-2 py-2" onClick={() => router.push(`/admin/roleManagement/getpermissionmenus/${role.id}`)}>编辑权限</button>
              </div>
            </div>

          ))
        )}
        <div className="flex justify-center">
          <button className="bg-blue-600 hover:bg-blue-700 text-white rounded-md px-10 py-3" onClick={() => router.push(`/admin/roleManagement/createrole`)}>添加角色</button>
        </div>
      </div>
    </div>
  );
}