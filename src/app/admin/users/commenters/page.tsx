'use client'
import { Card, Button, Badge } from '@/components/ui';
import { useState } from 'react';

// 评论员卡片组件
const CommenterCard = ({ user }: { user: any }) => {
  return (
    <Card>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <span className="text-lg">{user.avatar || '💬'}</span>
          </div>
          <div>
            <div className="font-medium text-gray-900">{user.nickname}</div>
            <div className="text-sm text-gray-500">ID: {user.id}</div>
          </div>
        </div>
        
        <div className="flex flex-col items-end space-y-1">
          <Badge variant="secondary" size="sm" className="bg-green-100 text-green-600">
            评论员
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
          <div className="text-xs text-gray-500 mb-1">完成任务</div>
          <div className="font-medium text-gray-900">{user.completedTasks}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500 mb-1">好评率</div>
          <div className="font-medium text-gray-900">{user.rating}%</div>
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

export default function CommenterManagementPage() {
  const [commenters] = useState([
    {
      id: '001',
      nickname: '抖音达人小王',
      avatar: '👨',
      isOnline: true,
      balance: 156.80,
      completedTasks: 23,
      rating: 98,
      status: 'active'
    },
    {
      id: '003',
      nickname: '评论专家',
      avatar: '🧑',
      isOnline: true,
      balance: 89.20,
      completedTasks: 45,
      rating: 96,
      status: 'active'
    },
    {
      id: '005',
      nickname: '短视频评论王',
      avatar: '👧',
      isOnline: false,
      balance: 234.50,
      completedTasks: 67,
      rating: 97,
      status: 'active'
    },
  ]);

  return (
    <div className="space-y-4 pb-6">
      {/* 页面标题 */}
      <div className="px-4 pt-4">
        <h1 className="text-xl font-bold text-gray-900 mb-1">评论员管理</h1>
        <p className="text-sm text-gray-600">管理和审核评论员账号</p>
      </div>

      {/* 搜索栏 */}
      <div className="px-4">
        <div className="relative">
          <input
            type="text"
            placeholder="搜索评论员昵称或ID..."
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-admin-500 focus:border-transparent"
          />
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            🔍
          </div>
        </div>
      </div>

      {/* 评论员列表 */}
      <div className="px-4 space-y-3">
        {commenters.map((commenter) => (
          <CommenterCard key={commenter.id} user={commenter} />
        ))}
      </div>

      {/* 加载更多 */}
      <div className="px-4">
        <Button variant="ghost" className="w-full">
          加载更多评论员
        </Button>
      </div>
    </div>
  );
}