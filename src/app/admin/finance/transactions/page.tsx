'use client'
import React, { useState } from 'react';
import { Card, Button, Badge } from '@/components/ui';

// 交易记录项组件
interface TransactionItemType {
  id: string;
  userName: string;
  userId: string;
  type: string;
  amount: number;
  orderId?: string;
  time: string;
  icon: string;
}

const TransactionItem = ({ item }: { item: TransactionItemType }) => {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'deposit': return 'bg-green-100 text-green-600';
      case 'withdrawal': return 'bg-red-100 text-red-600';
      case 'task_payment': return 'bg-blue-100 text-blue-600';
      case 'task_income': return 'bg-purple-100 text-purple-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'deposit': return '用户充值';
      case 'withdrawal': return '用户提现';
      case 'task_payment': return '任务付款';
      case 'task_income': return '任务收入';
      default: return '其他交易';
    }
  };

  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100">
      <div className="flex items-start space-x-3">
        <div className={`w-10 h-10 ${getTypeColor(item.type)} rounded-full flex items-center justify-center`}>
          <span>{item.icon}</span>
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <div className="font-medium text-gray-900">{item.userName}</div>
            <Badge variant="secondary" size="sm" className={getTypeColor(item.type)}>
              {getTypeLabel(item.type)}
            </Badge>
          </div>
          <div className="text-xs text-gray-500">订单号: {item.orderId}</div>
          <div className="text-xs text-gray-500">{item.time}</div>
        </div>
      </div>
      <div className={`font-medium ${item.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
        {item.amount > 0 ? '+' : ''}¥{Math.abs(item.amount).toFixed(2)}
      </div>
    </div>
  );
};

export default function FinancialTransactionsPage() {
  const [transactions] = useState([
    {
      id: 't1',
      orderId: 'ORD202408150001',
      userId: '001',
      userName: '抖音达人小王',
      amount: 500.00,
      type: 'deposit',
      icon: '💳',
      time: '2024-08-15 14:30',
      status: 'completed'
    },
    {
      id: 't2',
      orderId: 'ORD202408150002',
      userId: '002',
      userName: '派单大师',
      amount: -1200.00,
      type: 'withdrawal',
      icon: '💸',
      time: '2024-08-15 13:45',
      status: 'completed'
    },
    {
      id: 't3',
      orderId: 'ORD202408150003',
      userId: '010',
      userName: '企业推广专员',
      amount: -2000.00,
      type: 'task_payment',
      icon: '📋',
      time: '2024-08-15 12:10',
      status: 'completed'
    },
    {
      id: 't4',
      orderId: 'ORD202408150004',
      userId: '003',
      userName: '评论专家',
      amount: 150.00,
      type: 'task_income',
      icon: '💰',
      time: '2024-08-15 11:30',
      status: 'completed'
    },
    {
      id: 't5',
      orderId: 'ORD202408150005',
      userId: '003',
      userName: '评论专家',
      amount: 200.00,
      type: 'deposit',
      icon: '💳',
      time: '2024-08-15 11:20',
      status: 'completed'
    },
  ]);

  return (
    <div className="space-y-4 pb-6">
      {/* 页面标题 */}
      <div className="px-4 pt-4">
        <h1 className="text-xl font-bold text-gray-900 mb-1">资金流水</h1>
        <p className="text-sm text-gray-600">查看平台资金流向和明细</p>
      </div>

      {/* 资金流水列表 */}
      <div className="px-4">
        <Card className="p-4">
          <div className="space-y-2">
            {transactions.map((transaction) => (
              <TransactionItem key={transaction.id} item={transaction} />
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