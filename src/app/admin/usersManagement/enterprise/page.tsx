'use client';

import React from 'react';
import { Card } from '@/components/ui';

export default function EnterpriseUsersPage() {
  return (
    <div className="space-y-6 pb-20 px-4 pt-4">
      {/* 页面标题 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">企业用户管理</h1>
        <p className="text-sm text-gray-600">管理平台上所有企业用户账户信息</p>
      </div>

      {/* 主要内容区域 */}
      <Card className="p-6 bg-white border border-gray-200 rounded-xl">
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🏢</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">企业用户管理模块</h2>
          <p className="text-gray-600 mb-6">该模块用于管理平台上所有企业用户账户</p>
          <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg inline-block">
            <p className="text-sm text-blue-700">功能开发中...</p>
          </div>
        </div>
      </Card>
    </div>
  );
}