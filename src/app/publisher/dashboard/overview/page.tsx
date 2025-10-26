'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

// 根据图片要求定义新的数据类型
interface DashboardData {
  totalTasks: number;
  inProgress: number;
  totalSpent: number;
  avgOrderValue: number;
  subOrders: {
    inProgress: number;
    completed: number;
    pendingReview: number;
    pendingTake: number;
  };
}

// 任务订单接口
interface TaskOrder {
  id: string;
  requirements: string;
  publishTime: string;
  price: number;
  status: 'pending' | 'inProgress' | 'completed' | 'pendingReview';
}

export default function OverviewTabPage() {
  const router = useRouter();
  // 时间范围状态
  const [timeRange, setTimeRange] = useState<'today' | 'yesterday' | 'beforeYesterday'>('today');
  
  // 模拟数据 - 实际项目中应从API获取
  // 这里使用了图片中显示的数值
  const dashboardData: DashboardData = {
    totalTasks: 2,
    inProgress: 0,
    totalSpent: 106.00,
    avgOrderValue: 53.00,
    subOrders: {
      inProgress: 1,
      completed: 5,
      pendingReview: 0,
      pendingTake: 2
    }
  };
  
  // 模拟最近派发的任务订单数据
  const recentTaskOrders: TaskOrder[] = [
    {
      id: '1001',
      requirements: '查看抖音评论任务订单1，查看抖音评论任务订单1，',
      publishTime: '2025-10-21 14:30',
      price: 50.00,
      status: 'inProgress'
    },
    {
      id: '1002',
      requirements: '查看抖音评论任务订单2，查看抖音评论任务订单2，',
      publishTime: '2025-10-21 14:30',
      price: 80.00,
      status: 'completed'
    },
    {
      id: '1003',
      requirements: '查看抖音评论任务订单3查看抖音评论任务订单3',
      publishTime: '2025-10-21 14:30',
      price: 60.00,
      status: 'pendingReview'
    }
  ];
  
  // 根据订单状态获取对应样式和文本
  const getStatusInfo = (status: TaskOrder['status']) => {
    switch(status) {
      case 'pending':
        return { text: '待领取', className: 'bg-yellow-100 text-yellow-600', buttonText: '查看详情' };
      case 'inProgress':
        return { text: '进行中', className: 'bg-blue-100 text-blue-600', buttonText: '查看详情' };
      case 'completed':
        return { text: '已完成', className: 'bg-green-100 text-green-600', buttonText: '查看详情' };
      case 'pendingReview':
        return { text: '待审核', className: 'bg-orange-100 text-orange-600', buttonText: '查看详情' };
      default:
        return { text: '未知状态', className: 'bg-gray-100 text-gray-600', buttonText: '查看详情' };
    }
  };
  
  // 格式化金额显示
  const formatCurrency = (amount: number) => {
    return `¥${amount.toFixed(2)}`;
  };

  return (
    <div className="mx-4 mt-6 space-y-6">
      {/* 我的数据部分 */}
      <div className='bg-white p-3 rounded-md shadow-md'>
        <h2 className="text-md mb-3">我的数据</h2>
        
        {/* 时间切换按钮 */}
        <div className="flex space-x-2 mb-4">
          <button
            onClick={() => setTimeRange('today')}
            className={`px-4 py-2 rounded-md text-sm ${timeRange === 'today' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
          >
            今天
          </button>
          <button
            onClick={() => setTimeRange('yesterday')}
            className={`px-4 py-2 rounded-md text-sm ${timeRange === 'yesterday' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
          >
            昨天
          </button>
          <button
            onClick={() => setTimeRange('beforeYesterday')}
            className={`px-4 py-2 rounded-md text-sm ${timeRange === 'beforeYesterday' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
          >
            前天
          </button>
        </div>
        
        {/* 数据统计卡片 - 2x2网格布局 */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-green-50 p-2 rounded-md flex flex-col items-center justify-center text-center border border-green-300">
            <div className="text-sm text-green-600 mb-1">总任务数</div>
            <div className="text-xl text-green-600">{dashboardData.totalTasks}</div>
          </div>
          
          <div className="bg-blue-50 p-2 rounded-md flex flex-col items-center justify-center text-center border border-blue-300">
            <div className="text-sm text-blue-600 mb-1">进行中</div>
            <div className="text-xl text-blue-600">{dashboardData.inProgress}</div>
          </div>
          
          <div className="bg-orange-50 p-2 rounded-md flex flex-col items-center justify-center text-center border border-orange-300">
            <div className="text-sm text-orange-600 mb-1">总投入</div>
            <div className="text-xl text-orange-600">{formatCurrency(dashboardData.totalSpent)}</div>
          </div>
          
          <div className="bg-purple-50 p-2 rounded-md flex flex-col items-center justify-center text-center border border-purple-300">
            <div className="text-sm text-purple-600 mb-1">平均客单价</div>
            <div className="text-xl text-purple-600">{formatCurrency(dashboardData.avgOrderValue)}</div>
          </div>
        </div>
      </div>
      
      {/* 子订单统计部分 */}
      <div className='bg-white p-3 rounded-md shadow-md'>
        <h2 className="text-md mb-3">子订单统计</h2>
        
        {/* 子订单统计卡片 - 4列网格布局 */}
        <div className="grid grid-cols-4 gap-3">
          <div className="bg-blue-50 p-2 rounded-md flex flex-col items-center justify-center text-center border border-blue-300">
            <div className="text-xl text-blue-600 mb-1">{dashboardData.subOrders.inProgress}</div>
            <div className="text-xs text-blue-600">进行中</div>
          </div>
          
          <div className="bg-green-50 p-2 rounded-md flex flex-col items-center justify-center text-center border border-green-300">
            <div className="text-xl text-green-600 mb-1">{dashboardData.subOrders.completed}</div>
            <div className="text-xs text-green-600">已完成</div>
          </div>
          
          <div className="bg-orange-50 p-2 rounded-md flex flex-col items-center justify-center text-center border border-orange-300">
            <div className="text-xl text-orange-600 mb-1">{dashboardData.subOrders.pendingReview}</div>
            <div className="text-xs text-orange-600">待审核</div>
          </div>
          
          <div className="bg-yellow-50 p-2 rounded-md flex flex-col items-center justify-center text-center border border-yellow-300">
            <div className="text-xl text-yellow-600 mb-1">{dashboardData.subOrders.pendingTake}</div>
            <div className="text-xs text-yellow-600">待领取</div>
          </div>
        </div>
      </div>
      
      {/* 最近派发的任务订单部分 */}
      <div className='bg-white p-3 rounded-md shadow-md'>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-md">最近派发的任务订单</h2>
          <button 
            className="text-sm text-blue-500 hover:text-blue-600"
            onClick={() => router.push('/publisher/orders')}
          >
            查看全部
          </button>
        </div>
        
        {/* 任务订单卡片列表 */}
        <div className="space-y-3">
          {recentTaskOrders.map((order) => {
            const statusInfo = getStatusInfo(order.status);
            return (
              <div 
                key={order.id} 
                className="border border-gray-200 rounded-md p-3 hover:shadow-sm transition-shadow"
              >
                <div className="flex justify-between items-start mb-1">
                  <div className="flex-1">
                    <p className="text-sm text-gray-800 line-clamp-2 mb-1">
                      {order.requirements}
                    </p>
                    <div className="flex items-center text-xs text-gray-500 mb-1">
                      <span>发布时间: {order.publishTime}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="text-sm font-medium text-orange-600">
                        {formatCurrency(order.price)}
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`text-xs px-2 py-1 rounded ${statusInfo.className}`}>
                          {statusInfo.text}
                        </span>
                        <button 
                          className="text-xs px-3 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors"
                          onClick={() => router.push(`/publisher/orders/task-detail/${order.id}`)}
                        >
                          {statusInfo.buttonText}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
