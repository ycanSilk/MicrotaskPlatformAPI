'use client'
import React, { useState } from 'react';
import { Card } from '@/components/ui';

// 财务卡片组件
interface FinanceCardProps {
  title: string;
  value: string;
  change: string;
  icon: string;
  trend?: 'up' | 'down';
}

const FinanceCard = ({ title, value, change, icon, trend = 'up' }: FinanceCardProps) => {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center">
          <span className="text-sm">{icon}</span>
        </div>
      </div>
      <div className="flex items-end space-x-2">
        <div className="text-xl font-bold text-gray-900">{value}</div>
        <div className={`text-xs ${
          trend === 'up' ? 'text-green-600' : 'text-red-600'
        }`}>
          {trend === 'up' ? '↑' : '↓'} {change}
        </div>
      </div>
    </Card>
  );
};

export default function FinanceOverviewPage() {
  const [financialData] = useState({
    totalRevenue: '¥128,560.30',
    revenueChange: '12.5%',
    platformFee: '¥32,140.08',
    feeChange: '8.3%',
    totalWithdrawal: '¥96,420.22',
    withdrawalChange: '15.2%',
    netIncome: '¥32,140.08',
    netIncomeChange: '8.3%',
  });

  return (
    <div className="space-y-4 pb-6">
      {/* 页面标题 */}
      <div className="px-4 pt-4">
        <h1 className="text-xl font-bold text-gray-900 mb-1">财务管理</h1>
        <p className="text-sm text-gray-600">查看收入、支出和平台收益</p>
      </div>

      {/* 财务概览卡片 */}
      <div className="px-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FinanceCard
          title="总收入"
          value={financialData.totalRevenue}
          change={financialData.revenueChange}
          icon="💰"
          trend="up"
        />
        <FinanceCard
          title="平台手续费"
          value={financialData.platformFee}
          change={financialData.feeChange}
          icon="💸"
          trend="up"
        />
        <FinanceCard
          title="总提现金额"
          value={financialData.totalWithdrawal}
          change={financialData.withdrawalChange}
          icon="💳"
          trend="up"
        />
        <FinanceCard
          title="净收入"
          value={financialData.netIncome}
          change={financialData.netIncomeChange}
          icon="📈"
          trend="up"
        />
      </div>

      {/* 最近交易记录 */}
      <div className="px-4">
        <Card className="p-4">
          <h3 className="text-lg font-bold text-gray-900 mb-4">最近交易记录</h3>
          <div className="space-y-3">
            {/* 交易记录项 */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                  <span>💳</span>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">用户充值</div>
                  <div className="text-xs text-gray-500">抖音达人小王 · 2024-08-15 14:30</div>
                </div>
              </div>
              <div className="text-sm font-medium text-green-600">+¥500.00</div>
            </div>
            
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center">
                  <span>💸</span>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">用户提现</div>
                  <div className="text-xs text-gray-500">派单大师 · 2024-08-15 13:45</div>
                </div>
              </div>
              <div className="text-sm font-medium text-red-600">-¥1200.00</div>
            </div>
            
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                  <span>📋</span>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">任务发布</div>
                  <div className="text-xs text-gray-500">企业推广专员 · 2024-08-15 12:10</div>
                </div>
              </div>
              <div className="text-sm font-medium text-blue-600">-¥2000.00</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}