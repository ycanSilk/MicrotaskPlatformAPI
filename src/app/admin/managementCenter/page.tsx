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
          title=" 充值"
          icon="📊"
          description="管理系统中的所有充值申请"
          route="/admin/recharge"
        />
        <FeatureCard
          title=" 充值审核"
          icon="📊"
          description="管理系统中的所有充值申请"
          route="/admin/rechargelist"
        />
        <FeatureCard
          title=" 充值管理"
          icon="📊"
          description="管理系统中的所有充值申请"
          route="/admin/finance"
        />
        <FeatureCard
          title="提现管理"
          icon="👥"
          description="管理系统中的所有提现申请"
          route="/admin/processwithdraw"
        />
        <FeatureCard
          title="充值记录"
          icon="💰"
          description="管理系统中的所有充值记录"
          route="/admin/rechargerecord"
        />
        <FeatureCard
          title="提现记录"
          icon="📝"
          description="管理系统中的所有提现记录"
          route="/admin/withdrawalrecord"
          count="125"
        />
      </FeatureSection>

      {/* 用户管理 */}
      <FeatureSection title="用户管理">
        <FeatureCard
          title="接单用户管理"
          icon="💬"
          description="管理接单用户管理"
          route="/admin/managementCenter/commenters"
        />
        <FeatureCard
          title="派单用户管理"
          icon="📋"
          description="管理派单用户"
          route="/admin/managementCenter/publishers"
          count="234"
        />
      </FeatureSection>

      {/* 系统管理 */}
      <FeatureSection title="系统管理">
        <FeatureCard
          title="角色管理"
          icon="🔑"
          description="管理系统角色"
          route="/admin/roleManagement"
        />
        <FeatureCard
          title="创建角色"
          icon="🔑"
          description="管理系统角色"
          route="/admin/roleManagement/createrole"
        />
        <FeatureCard
          title="角色权限"
          icon="🔑"
          description="管理系统角色权限"
          route="/admin/roleManagement/rolepermissions"
        />
        <FeatureCard
          title="菜单管理"
          icon="🔑"
          description="管理系统菜单"
          route="/admin/menuManagement"
        />
        <FeatureCard
          title="创建菜单"
          icon="🔑"
          description="创建系统菜单"
          route="/admin/menuManagement/createmenu"
        />      
      </FeatureSection>
    </div>
  );
};