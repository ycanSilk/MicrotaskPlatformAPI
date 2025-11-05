'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import OrderHeaderTemplate from '../components/OrderHeaderTemplate';

// 订单状态映射
type OrderStatus = 'IN_PROGRESS' | 'IN_REVIEW' | 'IN_COMPLETED';
const STATUS_MAPPING: Record<OrderStatus, string> = {
  'IN_PROGRESS': '进行中',
  'IN_REVIEW': '待审核',
  'IN_COMPLETED': '完成'
};

// 任务数据类型定义
interface Task {
  id: string;
  title: string;
  description?: string;
  status: OrderStatus;
  createTime: string;
  unitPrice: number;
  totalQuantity: number;
  deadline?: string;
  platform: string;
  taskType: string;
}

// API响应数据类型
interface ApiResponse {
  success: boolean;
  message: string;
  code: number;
  data: {
    list?: any[];
    total: number;
    page: number;
    size: number;
    totalPages: number;
  };
}

export default function ActiveTabPage() {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTasks, setActiveTasks] = useState<Task[]>([]);

  // 定义fetchDashboardData函数
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // 构建请求参数
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
      
      console.log('请求API参数:', requestParams);
      
      // 调用后端API获取数据
      const response = await fetch('/api/publisher/publishertasks/mypublishedlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestParams)
      });
      
      if (!response.ok) {
        throw new Error(`API请求失败: ${response.status}`);
      }
      
      const result: ApiResponse = await response.json();
      console.log('API返回结果:', result);
      
      // 检查API响应
      if (result.success && result.data && Array.isArray(result.data.list)) {
        // 只筛选status为IN_PROGRESS的数据
        const filteredTasks = result.data.list.filter((task: any) => 
          task.status === 'IN_PROGRESS'
        ) as Task[];
        setActiveTasks(filteredTasks);
      }
    } catch (error) {
      console.error("获取数据失败:", error);
      setActiveTasks([]);
    } finally {
      setLoading(false);
    }
  };

  // 获取仪表板数据 - 只在组件挂载时获取一次
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // 显示加载状态
  if (loading) {
    return (
      <div className="pb-20 flex items-center justify-center h-64">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  // 简单的任务卡片组件
  const TaskCard: React.FC<{ task: Task }> = ({ task }) => {
    return (
      <div className="p-3 rounded-lg shadow-sm hover:shadow-md transition-shadow mb-1 bg-white">
        <div className="flex items-center mb-1 overflow-hidden">
          <div className="flex-1 mr-2 whitespace-nowrap overflow-hidden text-truncate text-black text-sm">
            任务ID：{task.id || '未知ID'}
          </div>
        </div>
        <div className="flex items-center space-x-3 mb-1 pb-1">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-sm bg-blue-100 text-blue-700`}>
            {STATUS_MAPPING[task.status] || task.status}
          </span>
          {task.taskType && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm bg-blue-100 text-blue-700">
              {task.taskType}
            </span>
          )}
        </div>
        {task.title && (
          <div className="mb-1 text-sm font-medium text-black">
            任务标题：{task.title}
          </div>
        )}
        <div className="mb-1 text-sm text-black">
          单价：¥{task.unitPrice}
        </div>
        <div className="mb-1 text-sm text-black">
          总数量：{task.totalQuantity}
        </div>
        <div className="mb-1 text-sm text-gray-600">
          创建时间：{new Date(task.createTime).toLocaleString('zh-CN')}
        </div>
        {task.deadline && (
          <div className="mb-1 text-sm text-gray-600">
            截止时间：{new Date(task.deadline).toLocaleString('zh-CN')}
          </div>
        )}
        <div className="flex justify-end">
          <button 
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors"
            onClick={() => router.push(`/publisher/orders/task-detail/${task.id}`)}
          >
            查看详情
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="mx-4 mt-6 space-y-4">
      {/* 使用标准模板组件 */}
      <OrderHeaderTemplate
        title="进行中的任务"
        totalCount={activeTasks.length}
      />
      
      {/* 任务列表 */}
      <div>
        {activeTasks.length > 0 ? (
          activeTasks.map((task) => (
            <TaskCard key={task.id || `temp-${Math.random().toString(36).substr(2, 9)}`} task={task} />
          ))
        ) : (
          <div className="text-center py-8 bg-white rounded-lg shadow-sm">
            <p className="text-gray-500">暂无相关任务</p>
          </div>
        )}
      </div>
    </div>
  );
}