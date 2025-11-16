'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import MainOrderCard from '../../../../components/task/main-order/Main-Order';
import type { Order } from '@/types';

interface Stats {
  totalTasks: number;
  activeTasks: number;
  completedTasks: number;
  totalSpent: number;
  totalInProgressSubOrders: number;
  totalCompletedSubOrders: number;
  totalPendingReviewSubOrders: number;
  totalPendingSubOrders: number;
  averageOrderValue: number;
}

interface DispatchedTask {
  id: string;
  title: string;
  status: string;
  statusText: string;
  participants: number;
  maxParticipants: number;
  time: string;
  completed: number;
  inProgress: number;
  pending: number;
  pendingReview?: number;
  price: number;
  orderNumber: string;
  taskType: string;
  taskRequirements: string;
  updatedTime?: string;
}

interface OverviewTabProps {
  stats: Stats;
  dispatchedTasks: DispatchedTask[];
  statsTimeRange: string;
  setStatsTimeRange: (range: string) => void;
}

const OverviewTab: React.FC<OverviewTabProps> = ({
  stats,
  dispatchedTasks,
  statsTimeRange,
  setStatsTimeRange
}) => {
  const router = useRouter();

  // 复制订单号功能
  const handleCopyOrderNumber = (orderNumber: string) => {
    navigator.clipboard.writeText(orderNumber).then(() => {
      // 创建临时提示元素
      const tooltip = document.createElement('div');
      tooltip.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50';
      tooltip.innerText = '订单号已复制';
      document.body.appendChild(tooltip);
      // 2秒后移除提示
      setTimeout(() => {
        document.body.removeChild(tooltip);
      }, 2000);
    }).catch(() => {
      // 静默处理复制失败
    });
  };

  return (
    <>
      {/* 数据概览 */}
      <div className="mx-4 mt-6">
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800">我的数据</h3>
            {/* 时间范围切换 */}
            <div className="flex bg-gray-100 rounded-lg p-2">
              <button
                onClick={() => setStatsTimeRange('today')}
                className={`px-4 py-2 text-sm rounded-md transition-colors ${statsTimeRange === 'today' ? 'bg-green-500 text-white' : 'text-black hover:bg-white'}`}
              >
                今天
              </button>
              <button
                onClick={() => setStatsTimeRange('yesterday')}
                className={`px-4 py-2 text-sm rounded-md transition-colors ${statsTimeRange === 'yesterday' ? 'bg-green-500 text-white' : 'text-black hover:bg-white'}`}
              >
                昨天
              </button>
              <button
                onClick={() => setStatsTimeRange('dayBeforeYesterday')}
                className={`px-4 py-2 text-sm rounded-md transition-colors ${statsTimeRange === 'dayBeforeYesterday' ? 'bg-green-500 text-white' : 'text-black hover:bg-white'}`}
              >
                前天
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-green-50 border border-green-100 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-green-600">{stats.totalTasks}</div>
              <div className="text-xs text-green-700">总任务数</div>
            </div>
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-blue-600">{stats.activeTasks}</div>
              <div className="text-xs text-blue-700">进行中</div>
            </div>
            <div className="bg-orange-50 border border-orange-100 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-orange-600">¥{stats.totalSpent.toFixed(2)}</div>
              <div className="text-xs text-orange-700">总投入</div>
            </div>
            <div className="bg-purple-50 border border-purple-100 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-purple-600">¥{stats.averageOrderValue.toFixed(2)}</div>
              <div className="text-xs text-purple-700">平均客单价</div>
            </div>
          </div>
        </div>
      </div>

      {/* 新增的子订单统计数据 */}
      <div className="mx-4 mt-6">
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-3">子订单统计</h3>
          <div className="grid grid-cols-4 gap-3">
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-blue-600">{stats.totalInProgressSubOrders}</div>
              <div className="text-xs text-blue-700">进行中</div>
            </div>
            <div className="bg-green-50 border border-green-100 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-green-600">{stats.totalCompletedSubOrders}</div>
              <div className="text-xs text-green-700">已完成</div>
            </div>
            <div className="bg-orange-50 border border-orange-100 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-orange-600">{stats.totalPendingReviewSubOrders}</div>
              <div className="text-xs text-orange-700">待审核</div>
            </div>
            <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-yellow-600">{stats.totalPendingSubOrders || 0}</div>
              <div className="text-xs text-yellow-700">待领取</div>
            </div>
          </div>
        </div>
      </div>

      {/* 派发的任务列表 */}
      <div className="mx-4 mt-6">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-800">派发的任务</h3>
              <button 
                onClick={() => router.push('/publisher/orders')}
                className="text-sm text-blue-500 hover:text-blue-700"
              >
                查看全部订单 →
              </button>
            </div>
          </div>
          <div className="space-y-4 overflow-y-auto p-4">
            {dispatchedTasks.slice(0, 10).map((task, index) => {
              // 转换数据格式以适配MainOrderCard组件
              const order: Order = {
                id: task.id,
                orderNumber: task.orderNumber || 'N/A',
                title: task.title,
                description: task.taskRequirements,
                status: task.status as Order['status'],
                createdAt: new Date(task.time).toLocaleString('zh-CN'),
                updatedAt: new Date(task.updatedTime || task.time).toLocaleString('zh-CN'),
                budget: typeof task.price === 'number' && typeof task.maxParticipants === 'number' ? task.price * task.maxParticipants : 0,
                type: 'other', // 根据实际任务类型映射
                subOrders: [
                  // 构建子订单数据，这里简化处理
                  { id: `sub-${task.id}-1`, orderId: task.id, userId: '', userName: '', status: 'pending', reward: typeof task.price === 'number' ? task.price : 0 },
                  ...Array.from({ length: task.completed || 0 }).map((_, i) => ({
                    id: `sub-${task.id}-completed-${i}`,
                    orderId: task.id,
                    userId: '',
                    userName: '',
                    status: 'completed' as const,
                    reward: typeof task.price === 'number' ? task.price : 0
                  })),
                  ...Array.from({ length: task.inProgress || 0 }).map((_, i) => ({
                    id: `sub-${task.id}-processing-${i}`,
                    orderId: task.id,
                    userId: '',
                    userName: '',
                    status: 'processing' as const,
                    reward: typeof task.price === 'number' ? task.price : 0
                  })),
                  ...Array.from({ length: task.pendingReview || 0 }).map((_, i) => ({
                    id: `sub-${task.id}-reviewing-${i}`,
                    orderId: task.id,
                    userId: '',
                    userName: '',
                    status: 'reviewing' as const,
                    reward: typeof task.price === 'number' ? task.price : 0
                  }))
                ]
              };
              
              // 映射任务类型
              switch(task.taskType) {
                case 'comment_middle':
                  order.type = 'comment';
                  break;
                case 'account_rental':
                  order.type = 'other';
                  break;
                case 'video_send':
                  order.type = 'share';
                  break;
                default:
                  order.type = 'other';
              }
              
              return (
                <MainOrderCard 
                  key={`dispatched-${task.id}-${index}`}
                  order={order}
                  onCopyOrderNumber={handleCopyOrderNumber}
                  onViewDetails={(orderId) => {
                    if (order.type === 'comment') {
                      router.push(`/publisher/orders/task-detail/${orderId}`);
                    } else {
                      router.push(`/publisher/orders/account-rental/${orderId}`);
                    }
                  }}
                />
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export default OverviewTab;