'use client'
import React, { useState } from 'react';
import { Card, Button, Badge } from '@/components/ui';

// 订单项组件
interface OrderType {
  id: string;
  title: string;
  user: string;
  amount: number;
  createTime: string;
  status: string;
}

const OrderItem = ({ order }: { order: OrderType }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-600';
      case 'paid': return 'bg-green-100 text-green-600';
      case 'processing': return 'bg-blue-100 text-blue-600';
      case 'completed': return 'bg-purple-100 text-purple-600';
      case 'cancelled': return 'bg-red-100 text-red-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return '待支付';
      case 'paid': return '已支付';
      case 'processing': return '处理中';
      case 'completed': return '已完成';
      case 'cancelled': return '已取消';
      default: return '未知';
    }
  };

  return (
    <div className="flex items-start justify-between py-3 border-b border-gray-100">
      <div className="flex items-start space-x-3">
        <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
          <span>🛒</span>
        </div>
        <div className="max-w-md">
          <div className="flex items-center space-x-2">
            <div className="font-medium text-gray-900">{order.title}</div>
            <Badge variant="secondary" size="sm" className={getStatusColor(order.status)}>
              {getStatusLabel(order.status)}
            </Badge>
          </div>
          <div className="text-xs text-gray-500 mt-1">订单号: {order.id}</div>
          <div className="text-xs text-gray-500 mt-1">用户: {order.user}</div>
          <div className="text-xs text-gray-500 mt-1">创建时间: {order.createTime}</div>
        </div>
      </div>
      <div className="flex flex-col items-end space-y-2">
        <div className="font-medium text-gray-900">¥{order.amount.toFixed(2)}</div>
        <div className="flex space-x-2">
          <Button variant="ghost" size="sm">
            查看详情
          </Button>
        </div>
      </div>
    </div>
  );
};

export default function OrderManagementPage() {
  const [orders] = useState([
    {
      id: 'ORD202408150001',
      title: '抖音短视频评论任务',
      user: '抖音达人小王',
      amount: 100.00,
      createTime: '2024-08-15 14:30',
      status: 'completed'
    },
    {
      id: 'ORD202408150002',
      title: '微信朋友圈点赞评论',
      user: '评论专家',
      amount: 70.00,
      createTime: '2024-08-15 11:20',
      status: 'processing'
    },
    {
      id: 'ORD202408150003',
      title: '小红书笔记评论',
      user: '短视频评论王',
      amount: 240.00,
      createTime: '2024-08-15 09:15',
      status: 'paid'
    },
    {
      id: 'ORD202408140001',
      title: '微博话题互动',
      user: '企业推广专员',
      amount: 520.00,
      createTime: '2024-08-14 18:45',
      status: 'pending'
    },
  ]);

  return (
    <div className="space-y-4 pb-6">
      {/* 页面标题 */}
      <div className="px-4 pt-4">
        <h1 className="text-xl font-bold text-gray-900 mb-1">订单管理</h1>
        <p className="text-sm text-gray-600">查看和管理平台订单</p>
      </div>

      {/* 订单统计卡片 */}
      <div className="px-4 grid grid-cols-2 gap-4">
        <Card className="p-4">
          <div className="text-sm font-medium text-gray-600 mb-1">今日订单</div>
          <div className="text-xl font-bold text-gray-900">3</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm font-medium text-gray-600 mb-1">今日订单金额</div>
          <div className="text-xl font-bold text-gray-900">¥410.00</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm font-medium text-gray-600 mb-1">待处理订单</div>
          <div className="text-xl font-bold text-yellow-600">1</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm font-medium text-gray-600 mb-1">本月订单总额</div>
          <div className="text-xl font-bold text-gray-900">¥15,680.00</div>
        </Card>
      </div>

      {/* 订单列表 */}
      <div className="px-4">
        <Card className="p-4">
          <h3 className="text-lg font-bold text-gray-900 mb-4">订单列表</h3>
          <div className="space-y-2">
            {orders.map((order) => (
              <OrderItem key={order.id} order={order} />
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