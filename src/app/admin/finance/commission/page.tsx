'use client'
import React, { useState } from 'react';
import { Card, Button, Badge } from '@/components/ui';

// 佣金规则项组件
interface RuleType {
  id: string;
  name: string;
  description: string;
  rate: number;
  status?: boolean;
  icon: string;
  isActive: boolean;
}

const CommissionRuleItem = ({ rule }: { rule: RuleType }) => {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100">
      <div className="flex items-start space-x-3">
        <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center">
          <span>{rule.icon}</span>
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <div className="font-medium text-gray-900">{rule.name}</div>
            <Badge variant="secondary" size="sm" className={`${rule.isActive ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}>
              {rule.isActive ? '启用' : '禁用'}
            </Badge>
          </div>
          <div className="text-sm text-gray-600">{rule.description}</div>
        </div>
      </div>
      <div className="font-medium text-gray-900">{rule.rate}%</div>
    </div>
  );
};

export default function CommissionManagementPage() {
  const [commissionRules] = useState([
    {
      id: 'r1',
      name: '基础任务佣金',
      description: '普通评论任务的平台抽成比例',
      rate: 20,
      icon: '💰',
      isActive: true
    },
    {
      id: 'r2',
      name: '高级任务佣金',
      description: '高级评论任务的平台抽成比例',
      rate: 15,
      icon: '💎',
      isActive: true
    },
    {
      id: 'r3',
      name: '企业订单佣金',
      description: '企业级订单的平台抽成比例',
      rate: 10,
      icon: '💼',
      isActive: true
    },
    {
      id: 'r4',
      name: 'VIP用户佣金',
      description: 'VIP用户的平台抽成比例',
      rate: 5,
      icon: '👑',
      isActive: true
    },
  ]);

  const [recentSettlements] = useState([
    {
      id: 's1',
      userId: '001',
      userName: '抖音达人小王',
      amount: 120.50,
      period: '2024-08-01至2024-08-15',
      status: 'completed'
    },
    {
      id: 's2',
      userId: '003',
      userName: '评论专家',
      amount: 320.75,
      period: '2024-08-01至2024-08-15',
      status: 'completed'
    },
  ]);

  return (
    <div className="space-y-4 pb-6">
      {/* 页面标题 */}
      <div className="px-4 pt-4">
        <h1 className="text-xl font-bold text-gray-900 mb-1">佣金结算</h1>
        <p className="text-sm text-gray-600">管理平台佣金和结算规则</p>
      </div>

      {/* 佣金规则 */}
      <div className="px-4">
        <Card className="p-4">
          <h3 className="text-lg font-bold text-gray-900 mb-4">佣金规则设置</h3>
          <div className="space-y-2">
            {commissionRules.map((rule) => (
              <CommissionRuleItem key={rule.id} rule={rule} />
            ))}
          </div>
          
          <div className="mt-4 flex justify-end">
            <Button variant="secondary">
              添加规则
            </Button>
          </div>
        </Card>
      </div>

      {/* 最近结算记录 */}
      <div className="px-4">
        <Card className="p-4">
          <h3 className="text-lg font-bold text-gray-900 mb-4">最近结算记录</h3>
          <div className="space-y-2">
            {recentSettlements.map((settlement) => (
              <div key={settlement.id} className="flex items-center justify-between py-3 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                    <span>🧾</span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{settlement.userName}</div>
                    <div className="text-xs text-gray-500">结算周期: {settlement.period}</div>
                  </div>
                </div>
                <div className="font-medium text-green-600">¥{settlement.amount.toFixed(2)}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}