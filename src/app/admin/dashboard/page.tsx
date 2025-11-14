'use client';

import React, { useState } from 'react';

export default function AdminDashboardPage() {
  const [dateRange, setDateRange] = useState('today');
  
  // 模拟平台概览数据
  const platformOverviewData = {
    today: {
      totalUsers: 12345,
      newUsers: 234,
      activeUsers: 3120,
      activeRate: 25.3,
      avgDailyActive: 2850,
      retentionRate: 68.5
    },
    week: {
      totalUsers: 12345,
      newUsers: 1234,
      activeUsers: 8970,
      activeRate: 72.7,
      avgDailyActive: 3010,
      retentionRate: 71.2
    },
    month: {
      totalUsers: 12345,
      newUsers: 4567,
      activeUsers: 10230,
      activeRate: 82.9,
      avgDailyActive: 3250,
      retentionRate: 75.8
    }
  };

  // 模拟今日财务数据
  const financeData = {
    today: {
      depositAmount: 23500.50,
      taskAmount: 18750.75,
      commissionAmount: 12500.20,
      revenue: 6250.55,
      withdrawalAmount: 8300.10,
      transactionCount: 125
    },
    week: {
      depositAmount: 145200.20,
      taskAmount: 115350.45,
      commissionAmount: 78500.30,
      revenue: 36850.15,
      withdrawalAmount: 52300.60,
      transactionCount: 845
    },
    month: {
      depositAmount: 585600.80,
      taskAmount: 465800.95,
      commissionAmount: 315200.60,
      revenue: 150600.35,
      withdrawalAmount: 210800.40,
      transactionCount: 3520
    }
  };

  // 模拟今日任务数据
  const taskData = {
    today: {
      totalTasks: 285,
      taskByCategory: [
        { name: '评论任务', count: 85, icon: '💄' },
        { name: '账户租赁', count: 65, icon: '📱' },
        { name: '其他', count: 52, icon: '📦' }
      ],
      taskStatus: {
        pending: 125,
        inProgress: 85,
        completed: 75
      }
    },
    week: {
      totalTasks: 1845,
      taskByCategory: [
        { name: '美妆', count: 540, icon: '💄' },
        { name: '数码', count: 420, icon: '📱' },
        { name: '美食', count: 310, icon: '🍔' },
        { name: '旅游', count: 225, icon: '✈️' },
        { name: '其他', count: 350, icon: '📦' }
      ],
      taskStatus: {
        pending: 820,
        inProgress: 540,
        completed: 485
      }
    },
    month: {
      totalTasks: 7580,
      taskByCategory: [
        { name: '美妆', count: 2250, icon: '💄' },
        { name: '数码', count: 1780, icon: '📱' },
        { name: '美食', count: 1250, icon: '🍔' },
        { name: '旅游', count: 980, icon: '✈️' },
        { name: '其他', count: 1320, icon: '📦' }
      ],
      taskStatus: {
        pending: 3250,
        inProgress: 2280,
        completed: 2050
      }
    }
  };

  // 模拟运营处理数据
  const operationData = {
    today: {
      complaints: {
        total: 15,
        pending: 5,
        processing: 4,
        resolved: 6,
        resolutionRate: 75.0
      },
      withdrawals: {
        total: 32,
        pending: 12,
        approved: 15,
        rejected: 5,
        processingTime: 45
      }
    },
    week: {
      complaints: {
        total: 98,
        pending: 15,
        processing: 25,
        resolved: 58,
        resolutionRate: 82.5
      },
      withdrawals: {
        total: 185,
        pending: 35,
        approved: 125,
        rejected: 25,
        processingTime: 38
      }
    },
    month: {
      complaints: {
        total: 385,
        pending: 45,
        processing: 95,
        resolved: 245,
        resolutionRate: 86.5
      },
      withdrawals: {
        total: 752,
        pending: 85,
        approved: 585,
        rejected: 82,
        processingTime: 32
      }
    }
  };

  // 获取当前时间范围的数据
  const currentOverviewData = platformOverviewData[dateRange as keyof typeof platformOverviewData];
  const currentFinanceData = financeData[dateRange as keyof typeof financeData];
  const currentTaskData = taskData[dateRange as keyof typeof taskData];
  const currentOperationData = operationData[dateRange as keyof typeof operationData];

  // 用户分布数据
  const userStats = {
    commenter: { count: 8567, active: 6234, growth: '+12.5%' },
    publisher: { count: 1234, active: 890, growth: '+8.3%' },
    admin: { count: 12, active: 8, growth: '0%' }
  };

  // 最近活动
  const recentActivities = [
    { id: 1, type: 'user', action: '新用户注册', user: '评论员小李', time: '5分钟前', icon: '👤' },
    { id: 2, type: 'task', action: '任务完成', user: '派单员小王', time: '8分钟前', icon: '✅' },
    { id: 3, type: 'review', action: '任务审核', user: '管理员A', time: '12分钟前', icon: '📋' },
    { id: 4, type: 'withdraw', action: '提现申请', user: '评论员小张', time: '15分钟前', icon: '💰' },
    { id: 5, type: 'system', action: '系统维护', user: '系统', time: '30分钟前', icon: '⚙️' }
  ];

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
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-blue-600">{currentOverviewData.totalUsers.toLocaleString()}</div>
              <div className="text-xs text-blue-700">总用户数</div>
            </div>
            <div className="bg-green-50 border border-green-100 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-green-600">{currentOverviewData.newUsers}</div>
              <div className="text-xs text-green-700">新增用户</div>
            </div>
            <div className="bg-orange-50 border border-orange-100 rounded-lg p-3">
              <div className="text-center mb-2">
                <div className="text-lg font-bold text-orange-600">{currentOverviewData.activeUsers.toLocaleString()}</div>
                <div className="text-xs text-orange-700">活跃用户</div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">活跃占比</span>
                <span className="text-xs font-medium text-orange-600">{currentOverviewData.activeRate}%</span>
              </div>
              <ProgressBar value={currentOverviewData.activeRate} color="bg-orange-500" />
            </div>
            <div className="bg-purple-50 border border-purple-100 rounded-lg p-3">
              <div className="text-center mb-2">
                <div className="text-lg font-bold text-purple-600">{currentOverviewData.retentionRate}%</div>
                <div className="text-xs text-purple-700">留存率</div>
              </div>
              <div className="text-center text-xs text-gray-600">
                平均日活: {currentOverviewData.avgDailyActive}
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
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-blue-600">¥{currentFinanceData.depositAmount.toLocaleString()}</div>
                <div className="text-xs text-blue-700">充值金额</div>
              </div>
              <div className="bg-green-50 border border-green-100 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-green-600">¥{currentFinanceData.taskAmount.toLocaleString()}</div>
                <div className="text-xs text-green-700">任务金额</div>
              </div>
              <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-yellow-600">¥{currentFinanceData.commissionAmount.toLocaleString()}</div>
                <div className="text-xs text-yellow-700">佣金金额</div>
              </div>
              <div className="bg-purple-50 border border-purple-100 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-purple-600">¥{currentFinanceData.revenue.toLocaleString()}</div>
                <div className="text-xs text-purple-700">平台收入</div>
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
              <div className="text-2xl font-bold text-blue-600">{currentTaskData.totalTasks}</div>
              <div className="text-sm text-blue-700">任务总数量</div>
            </div>
            
            {/* 任务分类统计 */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">任务分类统计</h4>
              <div className="space-y-2">
                {currentTaskData.taskByCategory.map((category, index) => {
                  const percentage = (category.count / currentTaskData.totalTasks) * 100;
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
                        max={currentTaskData.totalTasks} 
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
                  <div className="text-sm font-bold text-yellow-600">{currentTaskData.taskStatus.pending}</div>
                  <div className="text-xs text-yellow-700">待接单</div>
                </div>
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-2 text-center">
                  <div className="text-sm font-bold text-blue-600">{currentTaskData.taskStatus.inProgress}</div>
                  <div className="text-xs text-blue-700">进行中</div>
                </div>
                <div className="bg-green-50 border border-green-100 rounded-lg p-2 text-center">
                  <div className="text-sm font-bold text-green-600">{currentTaskData.taskStatus.completed}</div>
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
  );
}