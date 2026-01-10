'use client';

import React, { useState } from 'react';

// 导入外部组件
import RechargeList from '../rechargelist/page';
import RechargeForm from '../recharge/page';

export default function AdminFinancePage() {
  const [activeTab, setActiveTab] = useState('rechargeApplications');

  return (
    <div className="pb-20">
      {/* 功能切换 */}
      <div className="mx-4 mt-4 grid grid-cols-2 gap-2">
        <button
          onClick={() => setActiveTab('rechargeApplications')}
          className={`py-3 px-4 rounded font-medium transition-colors ${activeTab === 'rechargeApplications' ? 'bg-purple-500 text-white shadow-md' : 'bg-white border border-gray-300 text-gray-600 hover:bg-purple-50'}`}
        >
          充值审核
        </button>
        <button
          onClick={() => setActiveTab('recharge')}
          className={`py-3 px-4 rounded font-medium transition-colors ${activeTab === 'recharge' ? 'bg-purple-500 text-white shadow-md' : 'bg-white border border-gray-300 text-gray-600 hover:bg-purple-50'}`}
        >
          账户充值
        </button>
      </div>



      {activeTab === 'rechargeApplications' && (
        <div className="bg-white rounded-lg shadow-md p-4">
          <RechargeList />
        </div>
      )}

      {activeTab === 'recharge' && (
        <div className="bg-white rounded-lg shadow-md p-4">
          <RechargeForm />
        </div>
      )}
    </div>
  );
}