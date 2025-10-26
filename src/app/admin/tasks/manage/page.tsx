'use client'
import React, { useState } from 'react';
import { Card, Button, Badge } from '@/components/ui';

// 任务项组件
interface TaskType {
  id: string;
  title: string;
  category: string;
  reward?: number;
  status: string;
  createTime?: string;
  dueTime?: string;
  icon: string;
  publisher: string;
  price: number;
  remaining: number;
  total: number;
}

const TaskItem = ({ task }: { task: TaskType }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-600';
      case 'active': return 'bg-green-100 text-green-600';
      case 'completed': return 'bg-blue-100 text-blue-600';
      case 'cancelled': return 'bg-red-100 text-red-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return '待审核';
      case 'active': return '进行中';
      case 'completed': return '已完成';
      case 'cancelled': return '已取消';
      default: return '未知';
    }
  };

  return (
    <div className="flex items-start justify-between py-3 border-b border-gray-100">
      <div className="flex items-start space-x-3">
        <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center">
          <span>{task.icon}</span>
        </div>
        <div className="max-w-md">
          <div className="flex items-center space-x-2">
            <div className="font-medium text-gray-900">{task.title}</div>
            <Badge variant="secondary" size="sm" className={getStatusColor(task.status)}>
              {getStatusLabel(task.status)}
            </Badge>
          </div>
          <div className="text-xs text-gray-500 mt-1">ID: {task.id}</div>
          <div className="text-xs text-gray-500 mt-1">发布者: {task.publisher}</div>
          <div className="text-xs text-gray-500 mt-1">任务类型: {task.category}</div>
        </div>
      </div>
      <div className="flex flex-col items-end space-y-2">
        <div className="font-medium text-gray-900">¥{task.price.toFixed(2)}</div>
        <div className="text-xs text-gray-500">剩余: {task.remaining}/{task.total} 个</div>
        <div className="flex space-x-2">
          <Button variant="ghost" size="sm">
            查看详情
          </Button>
          {task.status === 'pending' && (
            <Button variant="secondary" size="sm">
              审核
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default function TaskManagementPage() {
  const [tasks] = useState([
    {
      id: 't001',
      title: '抖音短视频评论任务',
      category: '短视频评论',
      publisher: '企业推广专员',
      price: 5.00,
      total: 50,
      remaining: 25,
      status: 'active',
      icon: '📱'
    },
    {
      id: 't002',
      title: '微信朋友圈点赞评论',
      category: '社交媒体互动',
      publisher: '派单大师',
      price: 3.50,
      total: 100,
      remaining: 78,
      status: 'pending',
      icon: '👍'
    },
    {
      id: 't003',
      title: '小红书笔记评论',
      category: '内容评论',
      publisher: '任务发布者',
      price: 8.00,
      total: 30,
      remaining: 0,
      status: 'completed',
      icon: '📝'
    },
    {
      id: 't004',
      title: '微博话题互动',
      category: '社交媒体互动',
      publisher: '企业推广专员',
      price: 6.50,
      total: 80,
      remaining: 80,
      status: 'cancelled',
      icon: '🔄'
    },
  ]);

  return (
    <div className="space-y-4 pb-6">
      {/* 页面标题 */}
      <div className="px-4 pt-4">
        <h1 className="text-xl font-bold text-gray-900 mb-1">任务管理</h1>
        <p className="text-sm text-gray-600">管理和审核平台任务</p>
      </div>

      {/* 任务统计卡片 */}
      <div className="px-4 grid grid-cols-2 gap-4">
        <Card className="p-4">
          <div className="text-sm font-medium text-gray-600 mb-1">总任务数</div>
          <div className="text-xl font-bold text-gray-900">{tasks.length}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm font-medium text-gray-600 mb-1">待审核任务</div>
          <div className="text-xl font-bold text-yellow-600">{tasks.filter(t => t.status === 'pending').length}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm font-medium text-gray-600 mb-1">进行中任务</div>
          <div className="text-xl font-bold text-green-600">{tasks.filter(t => t.status === 'active').length}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm font-medium text-gray-600 mb-1">已完成任务</div>
          <div className="text-xl font-bold text-blue-600">{tasks.filter(t => t.status === 'completed').length}</div>
        </Card>
      </div>

      {/* 任务列表 */}
      <div className="px-4">
        <Card className="p-4">
          <h3 className="text-lg font-bold text-gray-900 mb-4">任务列表</h3>
          <div className="space-y-2">
            {tasks.map((task) => (
              <TaskItem key={task.id} task={task} />
            ))}
          </div>
          
          {/* 加载更多 */}
          <div className="mt-4 flex justify-center">
            <Button variant="ghost">
              加载更多
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}