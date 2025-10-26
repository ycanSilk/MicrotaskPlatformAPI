'use client'
import React, { useState } from 'react';
import { Card, Badge } from '@/components/ui';

// 在线用户项组件
interface OnlineUser {
  id: string;
  nickname: string;
  avatar: string;
  email?: string;
  role: string;
  lastActive: string;
  status?: string;
}

const OnlineUserItem = ({ user }: { user: OnlineUser }) => {
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'commenter': return 'bg-green-100 text-green-600';
      case 'publisher': return 'bg-blue-100 text-blue-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'commenter': return '评论员';
      case 'publisher': return '派单员';
      default: return '用户';
    }
  };

  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100">
      <div className="flex items-center space-x-3">
        <div className="relative">
          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
            <span className="text-lg">{user.avatar || '👤'}</span>
          </div>
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
        </div>
        <div>
          <div className="font-medium text-gray-900">{user.nickname}</div>
          <div className="text-xs text-gray-500">ID: {user.id}</div>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Badge variant="secondary" size="sm" className={getRoleColor(user.role)}>
          {getRoleLabel(user.role)}
        </Badge>
        <div className="text-xs text-gray-500">活跃中</div>
      </div>
    </div>
  );
};

export default function OnlineUsersMonitorPage() {
  const [onlineUsers] = useState([
    {
      id: '001',
      nickname: '抖音达人小王',
      avatar: '👨',
      role: 'commenter',
      lastActive: '刚刚'
    },
    {
      id: '003',
      nickname: '评论专家',
      avatar: '🧑',
      role: 'commenter',
      lastActive: '1分钟前'
    },
    {
      id: '007',
      nickname: '任务发布者',
      avatar: '👨‍💼',
      role: 'publisher',
      lastActive: '3分钟前'
    },
    {
      id: '010',
      nickname: '企业推广专员',
      avatar: '💼',
      role: 'publisher',
      lastActive: '5分钟前'
    },
  ]);

  return (
    <div className="space-y-4 pb-6">
      {/* 页面标题 */}
      <div className="px-4 pt-4">
        <h1 className="text-xl font-bold text-gray-900 mb-1">在线用户监控</h1>
        <p className="text-sm text-gray-600">实时监控在线用户活动</p>
      </div>

      {/* 在线用户统计卡片 */}
      <div className="px-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">当前在线用户</h3>
            <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
              <span>🟢</span>
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">{onlineUsers.length}</div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">今日最高在线</h3>
            <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
              <span>📊</span>
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">23</div>
          <div className="text-xs text-gray-500">今日 10:30 达到峰值</div>
        </Card>
      </div>

      {/* 在线用户列表 */}
      <div className="px-4">
        <Card className="p-4">
          <h3 className="text-lg font-bold text-gray-900 mb-4">在线用户列表</h3>
          <div className="space-y-2">
            {onlineUsers.map((user) => (
              <OnlineUserItem key={user.id} user={user} />
            ))}
          </div>
          
          {/* 实时状态指示 */}
          <div className="mt-4 flex items-center justify-center space-x-2 text-xs text-gray-500">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>实时更新中，最后更新于 1分钟前</span>
          </div>
        </Card>
      </div>
    </div>
  );
}