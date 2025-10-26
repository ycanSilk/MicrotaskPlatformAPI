'use client'
import React, { useState } from 'react';
import { Card, Button, Badge } from '@/components/ui';

// 封禁用户项组件
interface BannedUser {
  id: string;
  nickname: string;
  reason: string;
  banTime: string;
  avatar?: string;
  appeal?: boolean;
}

const BannedUserItem = ({ user }: { user: BannedUser }) => {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100">
      <div className="flex items-start space-x-3">
        <div className="w-10 h-10 bg-red-100 text-red-600 rounded-full flex items-center justify-center">
          <span>{user.avatar || '🚫'}</span>
        </div>
        <div>
          <div className="font-medium text-gray-900">{user.nickname}</div>
          <div className="text-xs text-gray-500">ID: {user.id}</div>
          <div className="text-xs text-gray-500">封禁原因: {user.reason}</div>
          <div className="text-xs text-gray-500">封禁时间: {user.banTime}</div>
          {user.appeal && (
            <Badge variant="secondary" size="sm" className="mt-1 bg-yellow-100 text-yellow-600">
              有申诉
            </Badge>
          )}
        </div>
      </div>
      <div className="flex flex-col items-end space-y-2">
        <div className="font-medium text-red-600">已封禁</div>
        <div className="flex space-x-2">
          <Button variant="ghost" size="sm">
            查看详情
          </Button>
          <Button variant="secondary" size="sm">
            解封
          </Button>
        </div>
      </div>
    </div>
  );
};

export default function BannedUsersPage() {
  const [bannedUsers] = useState([
    {
      id: '015',
      nickname: '违规用户1',
      avatar: '👤',
      reason: '发布违规评论内容',
      banTime: '2024-08-10 15:30',
      appeal: true
    },
    {
      id: '022',
      nickname: '恶意注册账号',
      avatar: '👥',
      reason: '恶意注册多个账号',
      banTime: '2024-08-08 10:20',
      appeal: false
    },
    {
      id: '031',
      nickname: '虚假评论',
      avatar: '💬',
      reason: '发布大量虚假评论',
      banTime: '2024-08-05 18:45',
      appeal: true
    },
  ]);

  return (
    <div className="space-y-4 pb-6">
      {/* 页面标题 */}
      <div className="px-4 pt-4">
        <h1 className="text-xl font-bold text-gray-900 mb-1">用户封禁管理</h1>
        <p className="text-sm text-gray-600">管理已封禁用户和申诉处理</p>
      </div>

      {/* 封禁用户列表 */}
      <div className="px-4">
        <Card className="p-4">
          <h3 className="text-lg font-bold text-gray-900 mb-4">已封禁用户 ({bannedUsers.length})</h3>
          <div className="space-y-2">
            {bannedUsers.map((user) => (
              <BannedUserItem key={user.id} user={user} />
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

      {/* 申诉处理 */}
      <div className="px-4">
        <Card className="p-4">
          <h3 className="text-lg font-bold text-gray-900 mb-4">待处理申诉 ({bannedUsers.filter(u => u.appeal).length})</h3>
          {bannedUsers.filter(u => u.appeal).length > 0 ? (
            <div className="space-y-4">
              {bannedUsers.filter(u => u.appeal).map((user) => (
                <div key={user.id} className="p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium text-gray-900">{user.nickname} 的申诉</div>
                    <div className="text-xs text-gray-500">提交时间: 2024-08-14 10:15</div>
                  </div>
                  <div className="text-sm text-gray-600 mb-3">
                    我对账号封禁有异议，我认为我的评论内容符合平台规定，请管理员重新审核。
                  </div>
                  <div className="flex space-x-2 justify-end">
                    <Button variant="ghost" size="sm">
                      驳回
                    </Button>
                    <Button variant="secondary" size="sm">
                      解封
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500">
              暂无待处理的申诉
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}