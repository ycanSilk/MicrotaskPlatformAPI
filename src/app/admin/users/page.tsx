'use client'
import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui';

// 功能模块卡片组件
interface FeatureCardProps {
  title: string;
  icon: string;
  description: string;
  route: any;
  count?: string | number | null;
}

const FeatureCard = ({ title, icon, description, route, count = null }: FeatureCardProps) => {
  return (
    <Link href={route} className="block hover:opacity-90 transition-opacity">
      <Card className="h-full p-4 border border-gray-200 hover:border-purple-300 transition-colors">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-xl">{icon}</span>
          </div>
          <div>
            <h3 className="font-bold text-gray-800">{title}</h3>
            {count !== null && (
              <span className="text-xs bg-purple-500 text-white px-2 py-0.5 rounded-full">
                {count}
              </span>
            )}
          </div>
        </div>
        <p className="text-sm text-gray-600">{description}</p>
      </Card>
    </Link>
  );
};

// 功能分类区块组件
interface FeatureSectionProps {
  title: string;
  children: React.ReactNode;
}

const FeatureSection = ({ title, children }: FeatureSectionProps) => {
  return (
    <div className="mb-6">
      <h2 className="text-lg font-bold text-gray-800 mb-4 pl-2 border-l-4 border-purple-500">
        {title}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {children}
      </div>
    </div>
  );
};

export default function AdminControlPanel() {
  return (
    <div className="space-y-6 pb-20 px-4 pt-4">
      {/* 页面标题 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">管理中心</h1>
        <p className="text-sm text-gray-600">集成所有系统操作功能，高效管理平台</p>
      </div>

      {/* 快速入口 */}
      <FeatureSection title="快速入口">
        <FeatureCard
          title="数据总览"
          icon="📊"
          description="查看平台运营数据和关键指标"
          route="/admin/dashboard"
        />
        <FeatureCard
          title="用户管理"
          icon="👥"
          description="管理系统中的所有用户和角色"
          route="/admin/usersManagement"
          count="1234"
        />
        <FeatureCard
          title="财务管理"
          icon="💰"
          description="查看收入、支出和平台收益"
          route="/admin/finance/overview"
        />
        <FeatureCard
          title="交易记录"
          icon="📝"
          description="查看和管理所有交易明细"
          route="/admin/transactions"
          count="125"
        />
      </FeatureSection>

      {/* 用户管理 */}
      <FeatureSection title="用户管理">
        <FeatureCard
          title="评论员管理"
          icon="💬"
          description="管理和审核评论员账号"
          route="/admin/users/commenters"
          count="856"
        />
        <FeatureCard
          title="派单员管理"
          icon="📋"
          description="管理和审核派单员账号"
          route="/admin/users/publishers"
          count="234"
        />
        <FeatureCard
          title="用户封禁管理"
          icon="🚫"
          description="管理已封禁用户和申诉处理"
          route="/admin/users/banned"
        />
        <FeatureCard
          title="在线用户监控"
          icon="🟢"
          description="实时监控在线用户活动"
          route="/admin/users/online"
          count="156"
        />
      </FeatureSection>

      {/* 财务管理 */}
      <FeatureSection title="财务管理">
        <FeatureCard
          title="提现审核"
          icon="✅"
          description="处理用户提现申请"
          route="/admin/finance/withdrawal-review"
          count="5"
        />
        <FeatureCard
          title="充值记录"
          icon="💳"
          description="查看用户充值明细"
          route="/admin/finance/deposits"
        />
        <FeatureCard
          title="资金流水"
          icon="💹"
          description="查看平台资金流向和明细"
          route="/admin/finance/transactions"
        />
        <FeatureCard
          title="佣金结算"
          icon="🧾"
          description="管理平台佣金和结算规则"
          route="/admin/finance/commission"
        />
      </FeatureSection>

      {/* 订单与任务管理 */}
      <FeatureSection title="订单与任务管理">
        <FeatureCard
          title="任务管理"
          icon="📋"
          description="管理和审核平台任务"
          route="/admin/tasks/manage"
          count="285"
        />
        <FeatureCard
          title="任务分类管理"
          icon="📂"
          description="管理平台任务分类和标签"
          route="/admin/tasks/categories"
        />
        <FeatureCard
          title="订单管理"
          icon="🛒"
          description="查看和管理平台订单"
          route="/admin/orders/manage"
        />
        <FeatureCard
          title="订单审核"
          icon="🔍"
          description="审核平台任务订单"
          route="/admin/orders/review"
        />
      </FeatureSection>

      {/* 报表管理 */}
      <FeatureSection title="报表管理">
        <FeatureCard
          title="运营报表"
          icon="📈"
          description="查看平台运营数据分析报表"
          route="/admin/reports/operation"
        />
        <FeatureCard
          title="财务报表"
          icon="💰"
          description="查看平台财务数据分析报表"
          route="/admin/reports/finance"
        />
        <FeatureCard
          title="用户行为分析"
          icon="👣"
          description="分析用户行为和活跃情况"
          route="/admin/reports/user-behavior"
        />
        <FeatureCard
          title="任务完成率分析"
          icon="✅"
          description="分析任务完成率和质量"
          route="/admin/reports/task-complete-rate"
        />
      </FeatureSection>

      {/* 系统管理 */}
      <FeatureSection title="系统管理">
        <FeatureCard
          title="系统设置"
          icon="⚙️"
          description="管理系统各项设置参数"
          route="/admin/settings/system"
        />
        <FeatureCard
          title="公告管理"
          icon="📢"
          description="发布和管理系统公告"
          route="/admin/settings/announcements"
        />
        <FeatureCard
          title="权限管理"
          icon="🔑"
          description="管理系统角色和权限"
          route="/admin/settings/permissions"
        />
        <FeatureCard
          title="日志管理"
          icon="📋"
          description="查看系统操作日志和审计记录"
          route="/admin/settings/logs"
        />
      </FeatureSection>
    </div>
  );
};