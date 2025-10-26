'use client';

import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui';

// 用户类型选择卡片组件
interface UserTypeCardProps {
  title: string;
  icon: string;
  description: string;
  route: string;
  count?: string | number;
  colorClass: string;
  textColorClass: string;
}

const UserTypeCard = ({ 
  title, 
  icon, 
  description, 
  route, 
  count = null,
  colorClass,
  textColorClass
}: UserTypeCardProps) => {
  return (
    <Link href={route} className="block hover:opacity-90 transition-opacity transform hover:scale-[1.02] transition-transform duration-200">
      <Card className={`h-full p-6 border border-gray-200 hover:border-blue-300 transition-colors bg-white rounded-xl shadow-sm hover:shadow-md`}>
        <div className="flex items-center justify-between mb-4">
          <div className={`w-12 h-12 ${colorClass} ${textColorClass} rounded-full flex items-center justify-center`}>
            <span className="text-2xl">{icon}</span>
          </div>
          {count !== null && (
            <span className="bg-blue-500 text-white text-sm px-2 py-1 rounded-full">
              {count}
            </span>
          )}
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
        <p className="text-gray-600 mb-4">{description}</p>
        <div className="flex items-center text-blue-600 font-medium text-sm">
          <span>查看详情</span>
          <span className="ml-2">→</span>
        </div>
      </Card>
    </Link>
  );
};

export default function UsersManagementPage() {
  // 模拟用户数量数据
  const userStats = {
    enterprise: 128,
    system: 32,
    personal: 2845
  };

  return (
    <div className="space-y-6 pb-20 px-4 pt-4">
      {/* 页面标题 */}
      <div className="mb-8">
        <div className="flex items-center space-x-2 mb-2">
          <h1 className="text-2xl font-bold text-gray-900">用户类型管理</h1>
          <span className="bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded-full">
            管理中心
          </span>
        </div>
        <p className="text-sm text-gray-600">
          选择用户类型，进入相应的用户管理界面，进行用户信息查看和管理操作
        </p>
      </div>

      {/* 用户类型选择区域 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 企业用户 */}
        <UserTypeCard
          title="企业用户"
          icon="🏢"
          description="管理所有企业账户，查看企业信息、操作记录和权限设置"
          route="/admin/usersManagement/enterprise"
          count={userStats.enterprise}
          colorClass="bg-blue-100"
          textColorClass="text-blue-600"
        />

        {/* 系统用户 */}
        <UserTypeCard
          title="系统用户"
          icon="👨‍💼"
          description="管理系统管理员和运营人员账户，设置角色和操作权限"
          route="/admin/usersManagement/system"
          count={userStats.system}
          colorClass="bg-indigo-100"
          textColorClass="text-indigo-600"
        />

        {/* 个人用户 */}
        <UserTypeCard
          title="个人用户"
          icon="👤"
          description="管理普通个人用户账户，查看用户信息和活动记录"
          route="/admin/usersManagement/personal"
          count={userStats.personal}
          colorClass="bg-sky-100"
          textColorClass="text-sky-600"
        />
      </div>

      {/* 统计概览区域 */}
      <div className="mt-10">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center mr-2">
              📊
            </span>
            用户统计概览
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="text-sm text-gray-500">总用户数</div>
              <div className="text-2xl font-bold text-blue-700">
                {userStats.enterprise + userStats.system + userStats.personal}
              </div>
              <div className="text-xs text-green-600 mt-1">
                <span>↑</span> 本月增长 12.5%
              </div>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="text-sm text-gray-500">活跃用户</div>
              <div className="text-2xl font-bold text-blue-700">1,872</div>
              <div className="text-xs text-green-600 mt-1">
                <span>↑</span> 周环比增长 8.3%
              </div>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="text-sm text-gray-500">新增用户</div>
              <div className="text-2xl font-bold text-blue-700">345</div>
              <div className="text-xs text-red-600 mt-1">
                <span>↓</span> 日环比下降 3.2%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 操作提示区域 */}
      <div className="mt-6 bg-blue-50 border border-blue-100 p-4 rounded-lg">
        <div className="flex">
          <div className="flex-shrink-0">
            <span className="text-blue-500">💡</span>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">操作提示</h3>
            <div className="mt-2 text-sm text-blue-700">
              <ul className="list-disc pl-5 space-y-1">
                <li>点击对应卡片进入各类用户的管理界面</li>
                <li>管理员可以查看、编辑和禁用用户账户</li>
                <li>系统用户具有更高的权限，请谨慎管理</li>
                <li>所有用户操作都会记录在系统日志中</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}