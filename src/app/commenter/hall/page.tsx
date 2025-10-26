'use client';
import React from 'react';
import CommenterHallContentPage from '../hall-content/page';
import TopNavigationBar from '../components/TopNavigationBar';

// 直接从localStorage获取用户信息的辅助函数
const getCurrentUser = () => {
  if (typeof localStorage === 'undefined') return null;
  try {
    const authDataStr = localStorage.getItem('commenter_auth_data');
    if (authDataStr) {
      const authData = JSON.parse(authDataStr);
      // 构建用户信息对象
      return {
        id: authData.userId || '',
        username: authData.username || '',
        role: 'commenter',
        ...(authData.userInfo || {})
      };
    }
  } catch (error) {
    console.error('获取用户信息失败:', error);
  }
  return null;
};

export default function CommenterHallPage() {
  // 获取当前登录用户信息
  const currentUser = getCurrentUser();
  
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


