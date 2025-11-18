'use client';

import React, { useState, useEffect } from 'react';
import { calculateProgress } from '@/lib/utils';

// 定义与后端API返回数据一致的接口类型
type PlatformStatsResponse = {
  code: number;
  message: string;
  data: {
    totalTasks: number;
    totalSubTasks: number;
    completedSubTasks: number;
    totalTransactionAmount: number;
    totalRewardAmount: number;
    activePublishers: number;
    activeWorkers: number;
    platformRevenue: number;
    statsTime: string;
    platformDistribution: { [key: string]: number };
    taskTypeDistribution: { [key: string]: number };
    revenueDistribution: { [key: string]: number };
  };
  success: boolean;
  timestamp: number;
};

// 定义页面使用的状态类型
type DashboardStats = {
  totalTasks: number;
  totalSubTasks: number;
  completedSubTasks: number;
  totalTransactionAmount: number;
  totalRewardAmount: number;
  activePublishers: number;
  activeWorkers: number;
  platformRevenue: number;
  statsTime: string;
  platformDistribution: { [key: string]: number };
  taskTypeDistribution: { [key: string]: number };
  revenueDistribution: { [key: string]: number };
};


export default function AdminDashboardPage() {
  const [dateRange, setDateRange] = useState('today');
  
  // 添加API数据状态
  const [statsData, setStatsData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 将dateRange转换为API所需的startDate和endDate
  const getDateRangeParams = () => {
    const today = new Date();
    let startDate: string;
    let endDate: string = today.toISOString().split('T')[0];

    switch (dateRange) {
      case 'today':
        startDate = endDate;
        break;
      case 'week':
        const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        startDate = oneWeekAgo.toISOString().split('T')[0];
        break;
      case 'month':
        const oneMonthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        startDate = oneMonthAgo.toISOString().split('T')[0];
        break;
      default:
        startDate = endDate;
    }

    return { startDate, endDate };
  };

  // 页面加载和dateRange变化时调用后端API
  useEffect(() => {
    const fetchPlatformStats = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // 获取日期范围参数
        const { startDate, endDate } = getDateRangeParams();
        
        // 调用后端API，传递startDate和endDate参数
        const response = await fetch(`/api/public/taskmodule/tasksplatformstats?startDate=${startDate}&endDate=${endDate}`);
        
        const responseData = await response.json();
        
        if(response.ok){
          console.log('请求成功')
          console.log('请求url:', response.url)
          console.log('响应结果:', responseData)
        }
        if (!response.ok) {
          console.log('请求失败')
        }
        
        const data: PlatformStatsResponse = responseData;
        
        if (data.success) {
          setStatsData(data.data);
        } else {
          throw new Error(data.message || 'Failed to fetch platform stats');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('Error fetching platform stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlatformStats();
  }, [dateRange]);

        

  // 基于API数据计算财务数据
  const currentFinanceData = {
    transactionCount: statsData?.totalTasks || 0,
    revenue: statsData?.platformRevenue || 0,
    withdrawalAmount: statsData?.totalRewardAmount || 0
  };

  // 基于API数据计算运营数据
  const currentOperationData = {
    complaints: {
      total: 0,
      pending: 0,
      processing: 0,
      resolved: 0,
      resolutionRate: 0
    },
    withdrawals: {
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
      processingTime: 0
    }
  };

  // 空的用户分布数据（等待API提供）
  const userStats = {
    commenter: { count: 0, active: 0, growth: '0%' },
    publisher: { count: 0, active: 0, growth: '0%' },
    admin: { count: 0, active: 0, growth: '0%' }
  };

  // 空的最近活动数据（等待API提供）
  const recentActivities: Array<{ id: number, type: string, action: string, user: string, time: string, icon: string }> = [];

  // 自定义进度条组件
  const ProgressBar = ({ value, max = 100, color = 'bg-blue-500' }: { value: number, max?: number, color?: string }) => {
    const percentage = Math.min((value / max) * 100, 100);
    return (
      <div className="bg-gray-200 h-2 rounded">
        <div className={`h-2 rounded ${color}`} style={{ width: `${percentage}%` }}></div>
      </div>
    );
  };

  // 自定义环形图组件
  const RingChart = ({ data }: { data: Array<{ name: string, value: number, color: string, icon?: string }> }) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    let startAngle = 0;
    
    return (
      <div className="relative w-full aspect-square flex items-center justify-center">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-2xl font-bold">{total}</div>
        </div>
        {data.map((item, index) => {
          const percentage = (item.value / total) * 100;
          const angle = (item.value / total) * 360;
          const endAngle = startAngle + angle;
          const largeArcFlag = angle > 180 ? 1 : 0;
          
          // 计算SVG路径
          const x1 = 50 + 45 * Math.cos((startAngle - 90) * Math.PI / 180);
          const y1 = 50 + 45 * Math.sin((startAngle - 90) * Math.PI / 180);
          const x2 = 50 + 45 * Math.cos((endAngle - 90) * Math.PI / 180);
          const y2 = 50 + 45 * Math.sin((endAngle - 90) * Math.PI / 180);
          
          const pathData = `M 50 50 L ${x1} ${y1} A 45 45 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
          startAngle = endAngle;
          
          return (
            <g key={index}>
              <path d={pathData} fill={item.color} fillOpacity="0.8" stroke="white" strokeWidth="2"/>
            </g>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {loading ? (
        <div className="flex items-center justify-center h-screen">
          <div className="text-xl">Loading...</div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center h-screen text-red-600">Error: {error}</div>
      ) : !statsData ? (
        <div className="flex items-center justify-center h-screen">No data available</div>
      ) : (
        <div className="pb-20">
      {/* 时间范围选择 */}
      <div className="mx-4 mt-4 grid grid-cols-3 gap-2">
        <button
          onClick={() => setDateRange('today')}
          className={`py-3 px-4 rounded font-medium transition-colors ${
            dateRange === 'today' ? 'bg-purple-500 text-white shadow-md' : 'bg-white border border-gray-300 text-gray-600 hover:bg-purple-50'
          }`}
        >
          今日
        </button>
        <button
          onClick={() => setDateRange('week')}
          className={`py-3 px-4 rounded font-medium transition-colors ${
            dateRange === 'week' ? 'bg-purple-500 text-white shadow-md' : 'bg-white border border-gray-300 text-gray-600 hover:bg-purple-50'
          }`}
        >
          本周
        </button>
        <button
          onClick={() => setDateRange('month')}
          className={`py-3 px-4 rounded font-medium transition-colors ${
            dateRange === 'month' ? 'bg-purple-500 text-white shadow-md' : 'bg-white border border-gray-300 text-gray-600 hover:bg-purple-50'
          }`}
        >
          本月
        </button>
      </div>

      {/* 1. 平台概览数据 */}
      <div className="mx-4 mt-6">
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-4">平台概览</h3>
          <div className="grid grid-cols-4 gap-3">
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-blue-600">{statsData ? (statsData.activePublishers + statsData.activeWorkers) || 0 : 0}</div>
                <div className="text-xs text-blue-700">总活跃用户</div>
              </div>
              <div className="bg-green-50 border border-green-100 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-green-600">{statsData?.activePublishers || 0}</div>
                <div className="text-xs text-green-700">活跃发布者</div>
              </div>
              <div className="bg-orange-50 border border-orange-100 rounded-lg p-3">
                <div className="text-center mb-2">
                  <div className="text-lg font-bold text-orange-600">{statsData?.activeWorkers || 0}</div>
                  <div className="text-xs text-orange-700">活跃工作者</div>
                </div>
                <div className="flex justify-between items-center">
                   <span className="text-xs text-gray-600">活跃占比</span>
                   <span className="text-xs font-medium text-orange-600">
                     {statsData ? (
                       ((statsData.activePublishers + statsData.activeWorkers) > 0 
                         ? ((statsData.activeWorkers / (statsData.activePublishers + statsData.activeWorkers)) * 100).toFixed(1) 
                         : 0)
                     ) : 0}%
                   </span>
                 </div>
                 <ProgressBar 
                   value={statsData ? (
                     ((statsData.activePublishers + statsData.activeWorkers) > 0 
                       ? ((statsData.activeWorkers / (statsData.activePublishers + statsData.activeWorkers)) * 100) 
                       : 0)
                   ) : 0} 
                   color="bg-orange-500" 
                 />
              </div>
              <div className="bg-purple-50 border border-purple-100 rounded-lg p-3">
                <div className="text-center mb-2">
                   <div className="text-lg font-bold text-purple-600">
                     {statsData ? (
                       statsData.totalTransactionAmount > 0 
                         ? ((statsData.platformRevenue / statsData.totalTransactionAmount) * 100).toFixed(1) 
                         : 0
                     ) : 0}%
                   </div>
                   <div className="text-xs text-purple-700">收入率</div>
                 </div>
                <div className="text-center text-xs text-gray-600">
                  统计时间: {statsData?.statsTime || ''}
                </div>
              </div>
            </div>
        </div>
      </div>

      {/* 2. 今日财务数据 */}
      <div className="mx-4 mt-6">
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-4">财务数据</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-3">
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-blue-600">¥{statsData?.totalTransactionAmount?.toLocaleString() || 0}</div>
                <div className="text-xs text-blue-700">总交易金额</div>
              </div>
              <div className="bg-green-50 border border-green-100 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-green-600">¥{statsData?.totalRewardAmount?.toLocaleString() || 0}</div>
                <div className="text-xs text-green-700">总奖励金额</div>
              </div>
              <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-yellow-600">¥{statsData?.platformRevenue?.toLocaleString() || 0}</div>
                <div className="text-xs text-yellow-700">平台收入</div>
              </div>
              <div className="bg-purple-50 border border-purple-100 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-purple-600">¥{statsData?.platformRevenue?.toLocaleString() || 0}</div>
                <div className="text-xs text-purple-700">净收入</div>
              </div>
            </div>
            
            {/* 交易概况 - 优化为分隔式布局 */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">交易概况</span>
                <span className="text-xs text-gray-500">{currentFinanceData.transactionCount}笔交易</span>
              </div>
              
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                  <div className="text-xs text-blue-700 mb-1">提现金额</div>
                  <div className="text-sm font-bold text-blue-600">¥{currentFinanceData.withdrawalAmount.toLocaleString()}</div>
                </div>
                
                <div className="bg-green-50 border border-green-100 rounded-lg p-3">
                  <div className="text-xs text-green-700 mb-1">净收入</div>
                  <div className="text-sm font-bold text-green-600">¥{(currentFinanceData.revenue - currentFinanceData.withdrawalAmount).toLocaleString()}</div>
                </div>
                
                <div className={`bg-${(currentFinanceData.revenue - currentFinanceData.withdrawalAmount) >= 0 ? 'green' : 'red'}-50 border border-${(currentFinanceData.revenue - currentFinanceData.withdrawalAmount) >= 0 ? 'green' : 'red'}-100 rounded-lg p-3`}>
                  <div className={`text-xs text-${(currentFinanceData.revenue - currentFinanceData.withdrawalAmount) >= 0 ? 'green' : 'red'}-700 mb-1`}>资金流向</div>
                  <div className={`text-sm font-bold text-${(currentFinanceData.revenue - currentFinanceData.withdrawalAmount) >= 0 ? 'green' : 'red'}-600`}>
                    {(currentFinanceData.revenue - currentFinanceData.withdrawalAmount) >= 0 ? '流入' : '流出'}
                  </div>
                </div>
              </div>
              
              {/* 新增查看全部交易记录按钮 */}
              <div className="flex justify-end">
                <a href="/admin/transactions" className="text-xs text-blue-600 hover:text-blue-800 font-medium">
                  查看全部交易记录 &gt;
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. 今日任务数据 */}
      <div className="mx-4 mt-6">
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-4">任务数据</h3>
          <div className="space-y-4">
            {/* 任务总量 */}
            <div className="text-center bg-blue-50 border border-blue-100 rounded-lg p-3">
              <div className="text-2xl font-bold text-blue-600">{statsData?.totalTasks || 0}</div>
              <div className="text-sm text-blue-700">任务总数量</div>
            </div>
            
            {/* 任务分类统计 */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">任务分类统计</h4>
              <div className="space-y-2">
                {/* 暂时使用空数据，等待API提供完整数据 */}
                {([] as Array<{ name: string, count: number, icon: string }>).map((category, index) => {
                  const totalTasks = statsData?.totalTasks || 0;
                  const percentage = totalTasks > 0 ? (category.count / totalTasks) * 100 : 0;
                  return (
                    <div key={index}>
                      <div className="flex justify-between items-center mb-1">
                        <div className="flex items-center space-x-2">
                          <span>{category.icon}</span>
                          <span className="text-sm text-gray-700">{category.name}</span>
                        </div>
                        <span className="text-sm font-medium text-gray-800">{category.count} ({percentage.toFixed(1)}%)</span>
                      </div>
                      <ProgressBar 
                        value={category.count} 
                        max={totalTasks || category.count}
                        color={index % 5 === 0 ? 'bg-pink-500' : index % 5 === 1 ? 'bg-blue-500' : index % 5 === 2 ? 'bg-green-500' : index % 5 === 3 ? 'bg-purple-500' : 'bg-orange-500'}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* 任务状态统计 */}
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">任务状态统计</h4>
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-2 text-center">
                  <div className="text-sm font-bold text-yellow-600">{statsData?.totalTasks - (statsData?.completedSubTasks || 0) || 0}</div>
                  <div className="text-xs text-yellow-700">待接单</div>
                </div>
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-2 text-center">
                  <div className="text-sm font-bold text-blue-600">{statsData?.totalSubTasks - (statsData?.completedSubTasks || 0) || 0}</div>
                  <div className="text-xs text-blue-700">进行中</div>
                </div>
                <div className="bg-green-50 border border-green-100 rounded-lg p-2 text-center">
                  <div className="text-sm font-bold text-green-600">{statsData?.completedSubTasks || 0}</div>
                  <div className="text-xs text-green-700">已完成</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. 运营处理数据 */}
      <div className="mx-4 mt-6">
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-4">运营处理数据</h3>
          
          {/* 运营处理数据 - 优化为分隔式布局 */}
          <div className="space-y-4">
            {/* 投诉处理数据 */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">投诉处理</span>
                <span className="text-xs text-gray-500">总投诉: {currentOperationData.complaints.total}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-red-50 border border-red-100 rounded-lg p-3">
                  <div className="text-xs text-red-700 mb-1">待处理</div>
                  <div className="text-sm font-bold text-red-600">{currentOperationData.complaints.pending}</div>
                </div>
                
                <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-3">
                  <div className="text-xs text-yellow-700 mb-1">处理中</div>
                  <div className="text-sm font-bold text-yellow-600">{currentOperationData.complaints.processing}</div>
                </div>
                
                <div className="bg-green-50 border border-green-100 rounded-lg p-3">
                  <div className="text-xs text-green-700 mb-1">已解决</div>
                  <div className="text-sm font-bold text-green-600">{currentOperationData.complaints.resolved}</div>
                </div>
                
                <div className="bg-green-50 border border-green-100 rounded-lg p-3">
                  <div className="text-xs text-green-700 mb-1">解决率</div>
                  <div className="text-sm font-bold text-green-600">{currentOperationData.complaints.resolutionRate}%</div>
                </div>
              </div>
              
              <div className="mt-2">
                <ProgressBar value={currentOperationData.complaints.resolutionRate} color="bg-green-500" />
              </div>
            </div>
            
            {/* 提现处理数据 */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">提现处理</span>
                <span className="text-xs text-gray-500">总申请: {currentOperationData.withdrawals.total}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-3">
                  <div className="text-xs text-yellow-700 mb-1">待审核</div>
                  <div className="text-sm font-bold text-yellow-600">{currentOperationData.withdrawals.pending}</div>
                </div>
                
                <div className="bg-green-50 border border-green-100 rounded-lg p-3">
                  <div className="text-xs text-green-700 mb-1">已通过</div>
                  <div className="text-sm font-bold text-green-600">{currentOperationData.withdrawals.approved}</div>
                </div>
                
                <div className="bg-red-50 border border-red-100 rounded-lg p-3">
                  <div className="text-xs text-red-700 mb-1">已拒绝</div>
                  <div className="text-sm font-bold text-red-600">{currentOperationData.withdrawals.rejected}</div>
                </div>
                
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                  <div className="text-xs text-blue-700 mb-1">平均处理时间</div>
                  <div className="text-sm font-bold text-blue-600">{currentOperationData.withdrawals.processingTime}分钟</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 最近操作记录 */}
      <div className="mx-4 mt-6">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-4 border-b">
            <h3 className="font-bold text-gray-800">最近操作记录</h3>
          </div>
          <div className="divide-y max-h-64 overflow-y-auto">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="p-3">
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{activity.icon}</span>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-800">
                      {activity.action}
                    </div>
                    <div className="text-xs text-gray-500">
                      {activity.user} · {activity.time}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 快捷操作 */}
      <div className="mx-4 mt-6">
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
          <h3 className="font-bold text-gray-800 mb-3">快捷操作</h3>
          <div className="grid grid-cols-2 gap-2">
            <button className="bg-white border border-gray-300 text-gray-700 py-2 px-3 rounded text-sm hover:bg-gray-50">
              📋 审核任务
            </button>
            <button className="bg-white border border-gray-300 text-gray-700 py-2 px-3 rounded text-sm hover:bg-gray-50">
              👥 管理用户
            </button>
            <button className="bg-white border border-gray-300 text-gray-700 py-2 px-3 rounded text-sm hover:bg-gray-50">
              💰 财务审批
            </button>
            <button className="bg-white border border-gray-300 text-gray-700 py-2 px-3 rounded text-sm hover:bg-gray-50">
              ⚙️ 系统设置
            </button>
          </div>
        </div>
      </div>
      </div>

  )} 
</div> 
);
}