'use client';

import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation';

// 导入四个对应状态的页面组件
import OverviewTabPage from './overview/page';
import ActiveTabPage from './active/page';
import AuditTabPage from './audit/page';
import CompletedTabPage from './completed/page';

export default function PublisherDashboardPage() {
  const searchParams = useSearchParams();
  const tabFromUrl = searchParams?.get('tab') || 'overview';
  const [activeTab, setActiveTab] = useState(tabFromUrl);

  // 处理选项卡切换并更新URL参数
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    
    // 使用URL参数格式更新当前页面的选项卡状态
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set('tab', tab);
    window.history.replaceState({}, '', newUrl.toString());
  };

  return (
    <div className="pb-20">
      {/* 只保留这4个切换按钮的布局和框架 */}
      <div className="mx-4 mt-4 grid grid-cols-4 gap-1">
        <button
          onClick={() => handleTabChange('overview')}
          className={`py-3 px-2 rounded text-sm font-medium transition-colors ${activeTab === 'overview' ? 'bg-blue-500 text-white shadow-md' : 'bg-white border border-gray-300 text-gray-600 hover:bg-blue-50'}`}
        >
          概览
        </button>
        <button
          onClick={() => handleTabChange('active')}
          className={`py-3 px-2 rounded text-sm font-medium transition-colors ${activeTab === 'active' ? 'bg-blue-500 text-white shadow-md' : 'bg-white border border-gray-300 text-gray-600 hover:bg-blue-50'}`}
        >
          进行中
        </button>
        <button
          onClick={() => handleTabChange('audit')}
          className={`py-3 px-2 rounded text-sm font-medium transition-colors ${activeTab === 'audit' ? 'bg-blue-500 text-white shadow-md' : 'bg-white border border-gray-300 text-gray-600 hover:bg-blue-50'}`}
        >
          待审核
        </button>
        <button
          onClick={() => handleTabChange('completed')}
          className={`py-3 px-2 rounded text-sm font-medium transition-colors ${activeTab === 'completed' ? 'bg-blue-500 text-white shadow-md' : 'bg-white border border-gray-300 text-gray-600 hover:bg-blue-50'}`}
        >
          已完成
        </button>
      </div>

      {/* 直接嵌入4个对应状态的页面组件 */}
      {activeTab === 'overview' && <OverviewTabPage />}
      {activeTab === 'active' && <ActiveTabPage />}
      {activeTab === 'audit' && <AuditTabPage />}
      {activeTab === 'completed' && <CompletedTabPage />}
    </div>
  );
}