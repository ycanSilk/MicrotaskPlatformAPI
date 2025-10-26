'use client'
import React, { useState } from 'react';
import { Card, Button, Badge } from '@/components/ui';

// 派单员卡片组件
const PublisherCard = ({ user }: { user: any }) => {
  return (
    <Card>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-lg">{user.avatar || '📋'}</span>
          </div>
          <div>
            <div className="font-medium text-gray-900">{user.nickname}</div>
            <div className="text-sm text-gray-500">ID: {user.id}</div>
          </div>
        </div>
        
        <div className="flex flex-col items-end space-y-1">
          <Badge variant="secondary" size="sm" className="bg-blue-100 text-blue-600">
            派单员
          </Badge>
          {user.isOnline && (
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-xs text-green-600">在线</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-3 text-center">
        <div>
          <div className="text-xs text-gray-500 mb-1">发布任务</div>
          <div className="font-medium text-gray-900">{user.publishedTasks}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500 mb-1">成功率</div>
          <div className="font-medium text-gray-900">{user.successRate}%</div>
        </div>
        <div>
          <div className="text-xs text-gray-500 mb-1">余额</div>
          <div className="font-medium text-gray-900">¥{user.balance.toFixed(2)}</div>
        </div>
      </div>

      <div className="flex space-x-2">
        <Button variant="secondary" size="sm" className="flex-1">
          查看详情
        </Button>
        <Button variant="ghost" size="sm" className="flex-1">
          {user.status === 'active' ? '禁用' : '启用'}
        </Button>
      </div>
    </Card>
  );
};

export default function PublisherManagementPage() {
  const [publishers] = useState([
    {
      id: '002', 
      nickname: '派单大师',
      avatar: '👩',
      isOnline: false,
      balance: 2340.50,
      publishedTasks: 156,
      successRate: 95,
      status: 'active'
    },
    {
      id: '007',
      nickname: '任务发布者',
      avatar: '👨‍💼',
      isOnline: true,
      balance: 890.25,
      publishedTasks: 78,
      successRate: 92,
      status: 'active'
    },
    {
      id: '010',
      nickname: '企业推广专员',
      avatar: '💼',
      isOnline: true,
      balance: 5678.90,
      publishedTasks: 345,
      successRate: 98,
      status: 'active'
    },
  ]);

  return (
    <div className="space-y-4 pb-6">
      {/* 页面标题 */}
      <div className="px-4 pt-4">
        <h1 className="text-xl font-bold text-gray-900 mb-1">派单员管理</h1>
        <p className="text-sm text-gray-600">管理和审核派单员账号</p>
      </div>

      {/* 搜索栏 */}
      <div className="px-4">
        <div className="relative">
          <input
            type="text"
            placeholder="搜索派单员昵称或ID..."
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-admin-500 focus:border-transparent"
          />
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            🔍
          </div>
        </div>
      </div>

      {/* 派单员列表 */}
      <div className="px-4 space-y-3">
        {publishers.map((publisher) => (
          <PublisherCard key={publisher.id} user={publisher} />
        ))}
      </div>

      {/* 加载更多 */}
      <div className="px-4">
        <Button variant="ghost" className="w-full">
          加载更多派单员
        </Button>
      </div>
    </div>
  );
}