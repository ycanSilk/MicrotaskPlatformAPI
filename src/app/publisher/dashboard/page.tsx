'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

// 导入四个对应状态的页面组件
import OverviewTabPage from './overview/page';
import ActiveTabPage from './active/page';
import AuditTabPage from './audit/page';
import CompletedTabPage from './completed/page';

// 定义API响应数据类型
interface TaskStatsData {
  publishedCount: number;
  acceptedCount: number;
  submittedCount: number;
  completedCount: number;
  totalEarnings: number;
  pendingEarnings: number;
  todayEarnings: number;
  monthEarnings: number;
  passedCount: number;
  rejectedCount: number;
  passRate: number;
  avgCompletionTime: number;
  ranking: number;
  agentTasksCount: number;
  agentEarnings: number;
  invitedUsersCount: number;
}

interface TaskStatsResponse {
  code: number;
  message: string;
  data: TaskStatsData;
  success: boolean;
  timestamp: number;
}

export default function PublisherDashboardPage() {
  const searchParams = useSearchParams();
  const tabFromUrl = searchParams?.get('tab') || 'overview';
  const [activeTab, setActiveTab] = useState(tabFromUrl);
  
  // 添加API数据状态
  const [taskStats, setTaskStats] = useState<TaskStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 处理选项卡切换并更新URL参数
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    
    // 使用URL参数格式更新当前页面的选项卡状态
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set('tab', tab);
    window.history.replaceState({}, '', newUrl.toString());
  };

  // 在组件挂载时获取任务统计数据
  useEffect(() => {
    const fetchTaskStats = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // 调用后端API获取任务统计数据
        const response = await fetch('/api/publisher/publishertasks/taskcount', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
       });
        
       console.log('这是获取任务统计数据的API返回的日志输出:', response);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data: TaskStatsResponse = await response.json();
        
        if (data.success) {
          setTaskStats(data.data);
        } else {
          setError(data.message || '获取任务统计数据失败');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : '网络请求失败，请稍后重试');
        console.error('获取任务统计数据失败:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTaskStats();
  }, []);

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
      {activeTab === 'overview' && (
        <OverviewTabPage 
          taskStats={taskStats} 
          loading={loading} 
          error={error} 
        />
      )}
      {activeTab === 'active' && <ActiveTabPage />}
      {activeTab === 'audit' && <AuditTabPage />}
      {activeTab === 'completed' && <CompletedTabPage />}
    </div>
  );
}