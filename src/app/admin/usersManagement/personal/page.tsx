'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Define TypeScript interfaces for API response
interface User {
  id: string;
  username: string;
  email: string;
  phone: string;
  invitationCode: string;
  createTime: string;
}

interface ApiResponse {
  code: number;
  message: string;
  data: {
    list: User[];
    total: number;
    page: number;
    size: number;
    pages: number;
  };
  success: boolean;
  timestamp: number;
}

// Define TypeScript interface for API request body
interface ApiRequestBody {
  page?: number;
  size?: number;
  sortField?: string;
  sortOrder?: string;
  username?: string;
  email?: string;
  phone?: string;
}

export default function PersonalUsersPage() {
  const router = useRouter();
  const [copiedUserId, setCopiedUserId] = useState<string | null>(null);
  const [searchPhone, setSearchPhone] = useState<string>('');
  const [filteredPhone, setFilteredPhone] = useState<string>(''); // 用于存储实际筛选的手机号
  const [users, setUsers] = useState<User[]>([]); // 存储从API获取的用户数据
  const [loading, setLoading] = useState<boolean>(true); // 加载状态
  const [error, setError] = useState<string | null>(null); // 错误信息

  // Copy user ID to clipboard
  const copyUserID = (id: string) => {
    navigator.clipboard.writeText(id)
      .then(() => {
        setCopiedUserId(id);
        // Reset copy status after 2 seconds
        setTimeout(() => setCopiedUserId(null), 2000);
      })
      .catch(err => {
        console.error('Failed to copy user ID:', err);
      });
  };

  // Fetch user data from API
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const requestBody: ApiRequestBody = {
        page: 0,
        size: 10,
        sortField: "createTime",
        sortOrder: "DESC",
        username: "",
        email: "",
        phone: filteredPhone
      };
      
      const response = await fetch('/api//users/induser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody),
        credentials: 'include'
      });
      
      
      const data: ApiResponse = await response.json();
      
      if (response.ok) {
        console.log('调用获取个人用户列表API成功。Response OK:', data);
      } else {
        console.log(`API请求失败，状态码: ${response.status}`, data);
      }
      
      if (data.success && data.data) {
        setUsers(data.data.list);
      } else {
        setError(data.message || `获取用户数据失败（状态码: ${response.status}）`);
      }
    } catch (err) {
      setError('网络错误，请稍后重试');
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on component mount and when filteredPhone changes
  useEffect(() => {
    fetchUsers();
  }, [filteredPhone]);

  return (
    <div className="space-y-6 pb-20 px-4 pt-4">
      {/* 页面标题 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">个人用户管理</h1>
        <p className="text-sm text-gray-600">管理平台上所有个人用户账户信息</p>
      </div>

      {/* 标签页导航 */}
      <div className="flex items-center space-x-8">
        <div className="flex items-center space-x-2">
          <span className="text-lg font-semibold text-gray-900">个人用户列表</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-lg text-gray-500">企业用户</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-lg text-gray-500">管理用户</span>
        </div>
      </div>

      {/* 手机号搜索框 */}
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">手机号搜索</label>
        <div className="max-w-md flex items-center space-x-2">
          <input
            type="text"
            value={searchPhone}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const filteredValue: string = e.target.value.replace(/[^\d]/g, '');
              setSearchPhone(filteredValue);
            }}
            onInput={(e: React.FormEvent<HTMLInputElement>) => {
              const inputElement = e.target as HTMLInputElement;
              inputElement.value = inputElement.value.replace(/[^\d]/g, '');
            }}
            placeholder="输入手机号搜索"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
          <button
            onClick={() => setFilteredPhone(searchPhone)}
            className="px-4 py-2 bg-blue-500 text-white font-medium rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all"
          >
            查询
          </button>
        </div>
      </div>

      {/* 用户卡片列表 */}
      <div className="space-y-4 mt-6" suppressHydrationWarning={true}>
        {/* Loading state */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-3"></div>
            <p className="text-gray-600">正在加载用户数据...</p>
          </div>
        ) : error ? (
          /* Error state */
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
            <p className="text-red-700">{error}</p>
          </div>
        ) : users.length === 0 ? (
          /* Empty state */
          <div className="text-center py-12 bg-white border border-gray-200 rounded-xl">
            <p className="text-gray-600">暂无用户数据</p>
          </div>
        ) : (
          /* Filter users by phone number */
          users.map((user) => (
            <div key={user.id} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow relative">
              {/* 用户ID行 */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center w-full pr-24">
                  <span className="w-1/3 text-sm font-medium text-gray-700">用户ID</span>
                  <div className="flex items-center w-2/3">
                    <span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-sm text-gray-900">{user.id}</span>
                    <button
                      onClick={() => copyUserID(user.id)}
                      className={`ml-2 bg-blue-600 text-white hover:bg-blue-700 text-xs sm:text-sm px-2 sm:px-3 py-1 rounded-md whitespace-nowrap transition-all duration-200 ${copiedUserId === user.id ? 'bg-green-600' : ''}`}
                    >
                      {copiedUserId === user.id ? '已复制' : '复制'}
                    </button>
                  </div>
                </div>
                {/* 充值按钮 - 右上角 */}
                <div className='absolute top-6 right-6'>
                  <button className="bg-blue-600 hover:bg-blue-700 text-white border border-gray-300 rounded-md text-xs sm:text-sm px-2 sm:px-3 py-1 transition-all duration-200" onClick={() => router.push(`/admin/recharge/${user.id}`)}>充值</button>
                </div>
              </div> 

              {/* 其他信息行 - 各自独占一行 */}
              <div className="flex flex-col space-y-3">
                {/* 用户名 */}
                <div className="flex items-center">
                  <span className="w-1/3 text-sm font-medium text-gray-700">用户名</span>
                  <span className="w-2/3 overflow-hidden text-ellipsis whitespace-nowrap text-sm text-gray-900">{user.username}</span>
                </div>
                {/* 邮箱 */}
                <div className="flex items-center">
                  <span className="w-1/3 text-sm font-medium text-gray-700">邮箱</span>
                  <span className="w-2/3 overflow-hidden text-ellipsis whitespace-nowrap text-sm text-gray-900">{user.email}</span>
                </div>
                {/* 邀请码 */}
                <div className="flex items-center">
                  <span className="w-1/3 text-sm font-medium text-gray-700">邀请码</span>
                  <span className="w-2/3 overflow-hidden text-ellipsis whitespace-nowrap text-sm text-gray-900">{user.invitationCode}</span>
                </div>
                {/* 手机号码 */}
                <div className="flex items-center">
                  <span className="w-1/3 text-sm font-medium text-gray-700">手机号码</span>
                  <span className="w-2/3 overflow-hidden text-ellipsis whitespace-nowrap text-sm text-gray-900">{user.phone}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}