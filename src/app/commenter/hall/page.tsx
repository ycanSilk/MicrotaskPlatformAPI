'use client';
import React from 'react';
import CommenterHallContentPage from '../hall-content/page';
import TopNavigationBar from '../components/TopNavigationBar';
import { CommenterAuthStorage } from '@/auth/commenter/auth';

export default function CommenterHallPage() {
  // 获取当前登录用户信息
  const currentUser = CommenterAuthStorage.getCurrentUser();
  
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


