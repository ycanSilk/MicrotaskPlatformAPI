'use client'
import React, { useState } from 'react';
import { Card, Button } from '@/components/ui';

// 充值记录项组件
interface DepositItemType {
  id: string;
  userName: string;
  userId: string;
  amount: number;
  status: string;
  method?: string;
  time: string;
}

const DepositItem = ({ item }: { item: DepositItemType }) => {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
          <span>💳</span>
        </div>
        <div>
          <div className="font-medium text-gray-900">{item.userName}</div>
          <div className="text-xs text-gray-500">ID: {item.userId}</div>
        </div>
      </div>
      <div className="flex flex-col items-end space-y-1">
        <div className="font-medium text-green-600">+¥{item.amount.toFixed(2)}</div>
        <div className="text-xs text-gray-500">{item.time}</div>
      </div>
    </div>
  );
};

export default function DepositsPage() {
  const [deposits] = useState([
    {
      id: 'd1',
      userId: '001',
      userName: '抖音达人小王',
      amount: 500.00,
      time: '2024-08-15 14:30',
      status: 'completed'
    },
    {
      id: 'd2',
      userId: '003',
      userName: '评论专家',
      amount: 200.00,
      time: '2024-08-15 11:20',
      status: 'completed'
    },
    {
      id: 'd3',
      userId: '005',
      userName: '短视频评论王',
      amount: 1000.00,
      time: '2024-08-15 09:15',
      status: 'completed'
    },
    {
      id: 'd4',
      userId: '010',
      userName: '企业推广专员',
      amount: 5000.00,
      time: '2024-08-14 18:45',
      status: 'completed'
    },
  ]);

  return (
    <div className="space-y-4 pb-6">
      {/* 页面标题 */}
      <div className="px-4 pt-4">
        <h1 className="text-xl font-bold text-gray-900 mb-1">充值记录</h1>
        <p className="text-sm text-gray-600">查看用户充值明细</p>
      </div>

      {/* 充值记录列表 */}
      <div className="px-4">
        <Card className="p-4">
          <div className="space-y-2">
            {deposits.map((deposit) => (
              <DepositItem key={deposit.id} item={deposit} />
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