'use client'
import React, { useState } from 'react';
import { Card, Button } from '@/components/ui';

// 图表数据模拟
const chartData = {
  dailyActivity: [120, 150, 180, 140, 200, 220, 250],
  revenueData: [1500, 1800, 1600, 2100, 2300, 2500, 2800],
  orderData: [80, 95, 110, 105, 120, 135, 150]
};

// 模拟数据统计卡片组件
interface StatCardProps {
  title: string;
  value: string;
  change: string;
  icon: string;
  trend: string;
}

const StatCard = ({ title, value, change, icon, trend }: StatCardProps) => {
  const getTrendColor = (trend: string) => {
    return trend === 'up' ? 'text-green-600' : 'text-red-600';
  };

  const getTrendIcon = (trend: string) => {
    return trend === 'up' ? '↑' : '↓';
  };

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-medium text-gray-600">{title}</div>
        <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
          {icon}
        </div>
      </div>
      <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
      <div className={`text-xs ${getTrendColor(trend)}`}>
        {getTrendIcon(trend)} {change} 较昨日
      </div>
    </Card>
  );
};

// 图表占位组件
interface ChartPlaceholderProps {
  title: string;
}

const ChartPlaceholder = ({ title }: ChartPlaceholderProps) => {
  return (
    <Card className="p-4 h-full">
      <h3 className="text-base font-medium text-gray-900 mb-4">{title}</h3>
      <div className="h-64 bg-gray-50 rounded-md flex items-center justify-center">
        <div className="text-gray-400">图表数据区域</div>
      </div>
    </Card>
  );
};

export default function ReportsOverviewPage() {
  const [statCards] = useState([
    {
      title: '总用户数',
      value: '12,845',
      change: '+2.3%',
      icon: '👥',
      trend: 'up'
    },
    {
      title: '活跃评论员',
      value: '3,527',
      change: '+1.8%',
      icon: '💬',
      trend: 'up'
    },
    {
      title: '今日新增任务',
      value: '145',
      change: '-0.5%',
      icon: '📝',
      trend: 'down'
    },
    {
      title: '平台总收入',
      value: '¥23,650',
      change: '+3.2%',
      icon: '💰',
      trend: 'up'
    }
  ]);

  return (
    <div className="space-y-4 pb-6">
      {/* 页面标题 */}
      <div className="px-4 pt-4">
        <h1 className="text-xl font-bold text-gray-900 mb-1">报表管理</h1>
        <p className="text-sm text-gray-600">查看平台各项数据统计和趋势分析</p>
      </div>

      {/* 数据统计卡片 */}
      <div className="px-4 grid grid-cols-2 gap-4">
        {statCards.map((card, index) => (
          <StatCard 
            key={index}
            title={card.title}
            value={card.value}
            change={card.change}
            icon={card.icon}
            trend={card.trend}
          />
        ))}
      </div>

      {/* 图表区域 */}
      <div className="px-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <ChartPlaceholder title="用户活跃度趋势" />
        <ChartPlaceholder title="平台收入趋势" />
        <ChartPlaceholder title="任务发布趋势" />
        <ChartPlaceholder title="订单完成率" />
      </div>

      {/* 报表导出 */}
      <div className="px-4">
        <Card className="p-4">
          <h3 className="text-lg font-bold text-gray-900 mb-4">报表导出</h3>
          <div className="flex space-x-4">
            <Button variant="secondary">
              导出用户报表
            </Button>
            <Button variant="secondary">
              导出财务报表
            </Button>
            <Button variant="secondary">
              导出任务报表
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}