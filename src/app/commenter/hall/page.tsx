'use client';
import React, { useEffect, useState } from 'react';
import CommenterHallContentPage from '../hall-content/page';
import TopNavigationBar from '../components/TopNavigationBar';
import axios from 'axios';
import { saveUserInfo } from '@/hooks/useUser';
import type { User } from '@/types';


export default function CommenterHallPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // 页面加载时获取用户信息
    const fetchUserInfo = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // 从localStorage获取token信息（仅用于日志显示）
        const tokenStorage = localStorage.getItem('commenterAuthToken');
        console.log('获取用户信息开始，本地存储的token信息：', tokenStorage ? JSON.parse(tokenStorage) : null);
       
        const response = await axios.get<{
          success: boolean;
          data?: {
            userInfo?: {
              id: string;
              username: string;
              email?: string | null;
              phone?: string;
              createTime?: string;
              avatar?: string;
              invitationCode?: string;
            };
          };
          message?: string;
        }>('/api/commenter/user/getloginuserinfo', { withCredentials: true });
        const data = response.data;

        if (data.success && data.data?.userInfo) {
          // 构建符合User类型的用户信息对象
          const userInfo: User = {
            id: data.data.userInfo.id,
            username: data.data.userInfo.username,
            email: data.data.userInfo.email || undefined,
            phone: data.data.userInfo.phone || undefined,
            role: 'commenter',
            status: 'active',
            createdAt: data.data.userInfo.createTime || new Date().toISOString(),
            balance: 0, // 假设后端返回的用户信息中包含balance，如果没有则设为默认值
            avatar: data.data.userInfo.avatar || undefined,
            invitationCode: data.data.userInfo.invitationCode || undefined
          };

          // 保存到localStorage
          saveUserInfo(userInfo);
          setCurrentUser(userInfo);
          console.log('用户信息保存到localStorage:', userInfo);
        } else {
          console.error('API请求失败:', data.message || '获取用户信息失败');
          throw new Error(data.message || '获取用户信息失败');
        }
      } catch (err) {
        console.error('获取用户信息异常:', err);
        // 如果API请求失败，尝试从localStorage获取作为后备
        try {
          const authDataStr = localStorage.getItem('commenter_auth_data');
          if (authDataStr) {
            const authData = JSON.parse(authDataStr);
            const userInfo: User = {
              id: authData.userId || '',
              username: authData.username || '',
              role: 'commenter',
              status: 'active',
              createdAt: new Date().toISOString(),
              balance: 0
            };
            setCurrentUser(userInfo);
          }
        } catch (localStorageErr) {
          console.error('从localStorage获取用户信息失败:', localStorageErr);
          setError('获取用户信息失败，请稍后重试');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserInfo();
  }, []);

  // 如果加载失败且没有后备数据，显示错误信息
  if (error && !currentUser) {
    return (
      <div className="bg-gray-50 min-h-screen flex justify-center items-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* 使用固定的顶部导航栏 */}
      <TopNavigationBar user={currentUser} />
      
      {/* 主内容区域，添加padding-top避免被固定导航栏遮挡 */}
      <div className="pt-5">
        {/* 页面标题区域 */}
        <div className="px-4 py-3">
            <h1 className="text-sm text-red-500 p-3 bg-white">重要提示!：请在“我的”找到抖音版本下载，便可以使用抖音视频链接进行任务（不影响抖音正常使用）</h1>
        </div>
        
        {/* 引入抢单内容页面 */}
        <CommenterHallContentPage />
      </div>
    </div>
  );
}


