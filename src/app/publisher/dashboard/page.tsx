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

// 定义待审核订单相关类型
interface PaginationData {
  list: any[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
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
  // 添加订单统计状态
  const [orderStats, setOrderStats] = useState<{
    acceptedCount: number;
    submittedCount: number;
    completedCount: number;
  }>({
    acceptedCount: 0,
    submittedCount: 0,
    completedCount: 0
  });
  // 添加待审核订单数据状态
  const [pendingOrders, setPendingOrders] = useState<any[]>([]);
  const [pendingOrdersPagination, setPendingOrdersPagination] = useState<PaginationData | null>(null);

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
        //调用后端API获取任务
        const requestParams = {
          page: 0,
          size: 10,
          sortField: 'createTime',
          sortOrder: 'DESC',
          platform: 'DOUYIN',
          taskType: 'COMMENT',
          minPrice: 1,
          maxPrice: 999999,
          keyword: ''
        };
        
        console.log('请求参数:', requestParams);
        
        // 调用后端API
        const taskresponse = await fetch('/api/publisher/publishertasks/mypublishedlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestParams)
        });

        // 解析任务列表
        const taskData = await taskresponse.json();
        console.log('这是获取任务列表的API返回的日志输出:', taskData);
        if (!taskresponse.ok) {
          throw new Error(`HTTP error! status: ${taskresponse.status}`);
        }
        
        // 创建订单状态统计方法（仅统计进行中和已完成订单）
        const countOrderByStatus = () => {
          const stats = {
            acceptedCount: 0,
            submittedCount: 0, // 这个将从pendingverifylist API获取
            completedCount: 0
          };
          
          // 验证data.list是否为有效的数组
          if (taskData.data && Array.isArray(taskData.data.list)) {
            // 遍历数组中的每个元素
            taskData.data.list.forEach((item: { status?: string }) => {
              // 确保元素有status属性且为字符串
              if (item && typeof item.status === 'string') {
                // 根据状态进行统计
                switch (item.status) {
                  case 'IN_PROGRESS':
                    stats.acceptedCount += 1;
                    break;
                  case 'COMPLETED':
                    stats.completedCount += 1;
                    break;
                  default:
                    break;
                }
              }
            });
          }
          
          return stats;
        };
        
        // 执行统计
        if (taskData.data) {
          const stats = countOrderByStatus();
          setOrderStats(prev => ({ ...prev, ...stats }));
          console.log('订单状态统计:', stats);
        }
        
        // 调用待审核订单API
        const pendingParams = {
          page: 0,
          size: 10,
          sortField: 'createTime',
          sortOrder: 'DESC',
          platform: 'DOUYIN',
          taskType: 'COMMENT',
          keyword: ''
        };
        
        console.log('开始调用待审核订单API:', {
          endpoint: '/api/publisher/publishertasks/pendingverifylist',
          method: 'POST',
          requestData: pendingParams
        });
        
        const pendingResponse = await fetch('/api/publisher/publishertasks/pendingverifylist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(pendingParams)
        });
        
        const pendingData: ApiResponse<PaginationData> = await pendingResponse.json();
        
        console.log('待审核订单API响应数据:', {
          success: pendingData.success,
          code: pendingData.code,
          totalCount: pendingData.data?.total,
          taskCount: pendingData.data?.list.length
        });
        
        if (pendingData.success && pendingData.data) {
          setPendingOrders(pendingData.data.list || []);
          setPendingOrdersPagination(pendingData.data);
          
          // 更新submittedCount字段
          setOrderStats(prev => ({
            ...prev,
            submittedCount: pendingData.data.total || 0
          }));
        } else {
          console.error('获取待审核订单失败:', pendingData.message);
        }

        // 调用后端API获取任务统计数据
        const response = await fetch('/api/publisher/publishertasks/taskcount', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
       console.log('这是获取任务统计数据的API返回的日志输出:', response);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data: TaskStatsResponse = await response.json();
        
        if (data.success) {
          // 直接使用后端返回的统计数据，不与订单统计数据合并
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
          <div className="flex flex-col items-center">
            <div className={activeTab === 'active' ? 'text-lg font-bold text-white' : 'text-lg font-bold text-blue-500'}>
              {orderStats.acceptedCount}
            </div>
            <span>进行中</span>
          </div>
        </button>
        <button
          onClick={() => handleTabChange('audit')}
          className={`py-3 px-2 rounded text-sm font-medium transition-colors ${activeTab === 'audit' ? 'bg-blue-500 text-white shadow-md' : 'bg-white border border-gray-300 text-gray-600 hover:bg-blue-50'}`}
        >
          <div className="flex flex-col items-center">
            <div className={activeTab === 'audit' ? 'text-lg font-bold text-white' : 'text-lg font-bold text-orange-500'}>
              {orderStats.submittedCount}
            </div>
            <span>待审核</span>
          </div>
        </button>
        <button
          onClick={() => handleTabChange('completed')}
          className={`py-3 px-2 rounded text-sm font-medium transition-colors ${activeTab === 'completed' ? 'bg-blue-500 text-white shadow-md' : 'bg-white border border-gray-300 text-gray-600 hover:bg-blue-50'}`}
        >
          <div className="flex flex-col items-center">
            <div className={activeTab === 'completed' ? 'text-lg font-bold text-white' : 'text-lg font-bold text-green-500'}>
              {orderStats.completedCount}
            </div>
            <span>已完成</span>
          </div>
        </button>
      </div>

      

      {/* 直接嵌入4个对应状态的页面组件 */}
      {activeTab === 'overview' && (
        <OverviewTabPage 
          taskStats={taskStats} 
          loading={loading} 
          error={error} 
          orderStats={orderStats}
        />
      )}
      {activeTab === 'active' && <ActiveTabPage />}
      {activeTab === 'audit' && (
        <AuditTabPage 
          pendingOrders={pendingOrders}
          paginationData={pendingOrdersPagination}
          loading={loading}
        />
      )}
      {activeTab === 'completed' && <CompletedTabPage />}
    </div>
  );
}