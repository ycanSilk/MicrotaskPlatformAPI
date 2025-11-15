'use client'
import { Card, Button, Badge } from '@/components/ui';
import { useState } from 'react';

// 用户筛选组件
const UserFilters = ({ onFilterChange }: { onFilterChange: (filters: any) => void }) => {
  const [activeFilter, setActiveFilter] = useState('all');
  
  const filters = [
    { key: 'all', label: '全部用户', count: 1234 },
    { key: 'commenter', label: '评论员', count: 856 },
    { key: 'publisher', label: '派单员', count: 234 },
    { key: 'online', label: '在线用户', count: 156 },
  ];

  return (
    <Card>
      <div className="grid grid-cols-2 gap-2">
        {filters.map((filter) => (
          <button
            key={filter.key}
            onClick={() => {
              setActiveFilter(filter.key);
              onFilterChange({ type: filter.key });
            }}
            className={`p-3 rounded-lg text-center transition-colors ${
              activeFilter === filter.key
                ? 'bg-admin-100 text-admin-600 border border-admin-300'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }}`}
          >
            <div className="font-bold text-lg">{filter.count}</div>
            <div className="text-xs">{filter.label}</div>
          </button>
        ))}
      </div>
    </Card>
  );
};

// 用户卡片组件
const UserCard = ({ user }: { user: any }) => {
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
    <Card>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
            <span className="text-lg">{user.avatar || '👤'}</span>
          </div>
          <div>
            <div className="font-medium text-gray-900">{user.nickname}</div>
            <div className="text-sm text-gray-500">ID: {user.id}</div>
          </div>
        </div>
        
        <div className="flex flex-col items-end space-y-1">
          <Badge variant="secondary" size="sm" className={getRoleColor(user.role)}>
            {getRoleLabel(user.role)}
          </Badge>
          {user.isOnline && (
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-xs text-green-600">在线</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-3">
        <div>
          <div className="text-xs text-gray-500 mb-1">余额</div>
          <div className="font-medium text-gray-900">¥{user.balance.toFixed(2)}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500 mb-1">任务数</div>
          <div className="font-medium text-gray-900">{user.taskCount}</div>
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

export default function UserManagementPage() {
  const [users] = useState([
    {
      id: '001',
      nickname: '抖音达人小王',
      avatar: '👨',
      role: 'commenter',
      isOnline: true,
      balance: 156.80,
      taskCount: 23,
      status: 'active'
    },
    {
      id: '002', 
      nickname: '派单大师',
      avatar: '👩',
      role: 'publisher',
      isOnline: false,
      balance: 2340.50,
      taskCount: 156,
      status: 'active'
    },
    {
      id: '003',
      nickname: '评论专家',
      avatar: '🧑',
      role: 'commenter',
      isOnline: true,
      balance: 89.20,
      taskCount: 45,
      status: 'active'
    },
  ]);

  return (
    <div className="space-y-4 pb-6">
      {/* 页面标题 */}
      <div className="px-4 pt-4">
        <h1 className="text-xl font-bold text-gray-900 mb-1">用户管理</h1>
        <p className="text-sm text-gray-600">管理系统中的所有用户</p>
      </div>

      {/* 筛选器 */}
      <div className="px-4">
        <UserFilters onFilterChange={(filters) => console.log(filters)} />
      </div>

      {/* 搜索栏 */}
      <div className="px-4">
        <div className="relative">
          <input
            type="text"
            placeholder="搜索用户昵称或ID..."
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-admin-500 focus:border-transparent"
          />
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            🔍
          </div>
        </div>
      </div>

      {/* 用户列表 */}
      <div className="px-4 space-y-3">
        {users.map((user) => (
          <UserCard key={user.id} user={user} />
        ))}
      </div>

      {/* 加载更多 */}
      <div className="px-4">
        <Button variant="ghost" className="w-full">
          加载更多用户
        </Button>
      </div>
    </div>
  );
}