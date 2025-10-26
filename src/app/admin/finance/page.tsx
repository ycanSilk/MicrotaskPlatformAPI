'use client';

import React, { useState } from 'react';

export default function AdminFinancePage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState('today'); // 'today' | 'week' | 'month'
  
  // 模拟财务数据
  const financeData = {
    today: {
      totalIncome: 1234.56,
      totalExpense: 856.20,
      profit: 378.36,
      transactions: 45,
      platformFee: 123.45,
      withdrawals: 2500.00
    },
    week: {
      totalIncome: 8654.32,
      totalExpense: 6234.80,
      profit: 2419.52,
      transactions: 312,
      platformFee: 865.43,
      withdrawals: 15800.00
    },
    month: {
      totalIncome: 34567.89,
      totalExpense: 24890.45,
      profit: 9677.44,
      transactions: 1456,
      platformFee: 3456.78,
      withdrawals: 68900.00
    }
  };

  const currentData = financeData[dateRange as keyof typeof financeData];

  // 提现申请列表
  const withdrawalRequests = [
    {
      id: 1,
      user: '评论员小王',
      userType: 'commenter',
      amount: 156.80,
      method: '微信支付',
      applyTime: '2024-01-15 14:30',
      status: 'pending',
      fee: 2.00
    },
    {
      id: 2,
      user: '派单员小李',
      userType: 'publisher',
      amount: 2500.00,
      method: '银行卡',
      applyTime: '2024-01-15 10:20',
      status: 'pending',
      fee: 0.00
    },
    {
      id: 3,
      user: '评论员小张',
      userType: 'commenter',
      amount: 89.50,
      method: '支付宝',
      applyTime: '2024-01-15 09:15',
      status: 'approved',
      fee: 2.00,
      processTime: '2024-01-15 09:30'
    },
    {
      id: 4,
      user: '派单员小刘',
      userType: 'publisher',
      amount: 1200.00,
      method: '银行卡',
      applyTime: '2024-01-14 16:45',
      status: 'completed',
      fee: 0.00,
      processTime: '2024-01-14 17:00',
      completeTime: '2024-01-15 09:00'
    }
  ];

  // 平台费用明细
  const feeDetails = [
    {
      id: 1,
      type: 'task_fee',
      description: '任务服务费',
      amount: 45.60,
      rate: '5%',
      baseAmount: 912.00,
      time: '2024-01-15 14:30'
    },
    {
      id: 2,
      type: 'withdraw_fee',
      description: '提现手续费',
      amount: 8.00,
      rate: '2元/笔',
      baseAmount: 0,
      time: '2024-01-15 10:20'
    },
    {
      id: 3,
      type: 'invite_fee',
      description: '邀请佣金费用',
      amount: 23.45,
      rate: '10%',
      baseAmount: 234.50,
      time: '2024-01-15 09:15'
    }
  ];

  const handleApproveWithdrawal = (id: number) => {
    alert(`批准提现申请 ${id}`);
  };

  const handleRejectWithdrawal = (id: number) => {
    const reason = prompt('请输入拒绝原因：');
    if (reason) {
      alert(`拒绝提现申请 ${id}：${reason}`);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-orange-100 text-orange-600';
      case 'approved': return 'bg-blue-100 text-blue-600';
      case 'completed': return 'bg-green-100 text-green-600';
      case 'rejected': return 'bg-red-100 text-red-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return '待审核';
      case 'approved': return '已批准';
      case 'completed': return '已完成';
      case 'rejected': return '已拒绝';
      default: return '未知';
    }
  };

  const getUserTypeText = (type: string) => {
    switch (type) {
      case 'commenter': return '评论员';
      case 'publisher': return '派单员';
      case 'admin': return '管理员';
      default: return '未知';
    }
  };

  return (
    <div className="pb-20">
      {/* 功能切换 */}
      <div className="mx-4 mt-4 grid grid-cols-3 gap-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`py-3 px-4 rounded font-medium transition-colors ${
            activeTab === 'overview' ? 'bg-purple-500 text-white shadow-md' : 'bg-white border border-gray-300 text-gray-600 hover:bg-purple-50'
          }`}
        >
          财务概览
        </button>
        <button
          onClick={() => setActiveTab('withdrawals')}
          className={`py-3 px-4 rounded font-medium transition-colors ${
            activeTab === 'withdrawals' ? 'bg-purple-500 text-white shadow-md' : 'bg-white border border-gray-300 text-gray-600 hover:bg-purple-50'
          }`}
        >
          提现管理
        </button>
        <button
          onClick={() => setActiveTab('fees')}
          className={`py-3 px-4 rounded font-medium transition-colors ${
            activeTab === 'fees' ? 'bg-purple-500 text-white shadow-md' : 'bg-white border border-gray-300 text-gray-600 hover:bg-purple-50'
          }`}
        >
          费用明细
        </button>
      </div>

      {activeTab === 'overview' && (
        <>
          {/* 时间范围选择 */}
          <div className="mx-4 mt-6 grid grid-cols-3 gap-2">
            <button
              onClick={() => setDateRange('today')}
              className={`py-2 px-3 rounded text-sm transition-colors ${
                dateRange === 'today' ? 'bg-purple-100 text-purple-600' : 'bg-white border border-gray-300 text-gray-600'
              }`}
            >
              今日
            </button>
            <button
              onClick={() => setDateRange('week')}
              className={`py-2 px-3 rounded text-sm transition-colors ${
                dateRange === 'week' ? 'bg-purple-100 text-purple-600' : 'bg-white border border-gray-300 text-gray-600'
              }`}
            >
              本周
            </button>
            <button
              onClick={() => setDateRange('month')}
              className={`py-2 px-3 rounded text-sm transition-colors ${
                dateRange === 'month' ? 'bg-purple-100 text-purple-600' : 'bg-white border border-gray-300 text-gray-600'
              }`}
            >
              本月
            </button>
          </div>

          {/* 核心财务数据 */}
          <div className="mx-4 mt-6">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h3 className="font-bold text-gray-800 mb-4">财务概览</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-green-50 border border-green-100 rounded-lg p-3 text-center">
                  <div className="text-lg font-bold text-green-600">¥{currentData.totalIncome.toFixed(2)}</div>
                  <div className="text-xs text-green-700">总收入</div>
                </div>
                <div className="bg-red-50 border border-red-100 rounded-lg p-3 text-center">
                  <div className="text-lg font-bold text-red-600">¥{currentData.totalExpense.toFixed(2)}</div>
                  <div className="text-xs text-red-700">总支出</div>
                </div>
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-center">
                  <div className="text-lg font-bold text-blue-600">¥{currentData.profit.toFixed(2)}</div>
                  <div className="text-xs text-blue-700">净利润</div>
                </div>
                <div className="bg-orange-50 border border-orange-100 rounded-lg p-3 text-center">
                  <div className="text-lg font-bold text-orange-600">{currentData.transactions}</div>
                  <div className="text-xs text-orange-700">交易笔数</div>
                </div>
              </div>
            </div>
          </div>

          {/* 平台收益分析 */}
          <div className="mx-4 mt-6">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h3 className="font-bold text-gray-800 mb-4">平台收益</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="border border-gray-100 rounded-lg p-3">
                  <div className="text-sm text-gray-500 mb-1">平台手续费</div>
                  <div className="font-bold text-gray-800">¥{currentData.platformFee.toFixed(2)}</div>
                  <div className="text-xs text-green-600">↗️ +12.5%</div>
                </div>
                <div className="border border-gray-100 rounded-lg p-3">
                  <div className="text-sm text-gray-500 mb-1">用户提现</div>
                  <div className="font-bold text-gray-800">¥{currentData.withdrawals.toFixed(2)}</div>
                  <div className="text-xs text-red-500">↘️ -3.2%</div>
                </div>
              </div>
            </div>
          </div>

          {/* 收益趋势图表 */}
          <div className="mx-4 mt-6">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h3 className="font-bold text-gray-800 mb-4">收益趋势</h3>
              
              {/* 简化的图表显示 */}
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">收入增长</span>
                    <span className="text-sm font-medium text-green-600">+18.5%</span>
                  </div>
                  <div className="bg-gray-200 h-2 rounded">
                    <div className="bg-green-500 h-2 rounded" style={{width: '78.5%'}}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">利润率</span>
                    <span className="text-sm font-medium text-blue-600">28.4%</span>
                  </div>
                  <div className="bg-gray-200 h-2 rounded">
                    <div className="bg-blue-500 h-2 rounded" style={{width: '28.4%'}}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">用户活跃度</span>
                    <span className="text-sm font-medium text-orange-600">85.2%</span>
                  </div>
                  <div className="bg-gray-200 h-2 rounded">
                    <div className="bg-orange-500 h-2 rounded" style={{width: '85.2%'}}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'withdrawals' && (
        <>
          {/* 提现申请列表 */}
          <div className="mx-4 mt-6">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-4 border-b">
                <h3 className="font-bold text-gray-800">提现申请管理</h3>
              </div>
              <div className="divide-y max-h-96 overflow-y-auto">
                {withdrawalRequests.map((request) => (
                  <div key={request.id} className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-gray-800">{request.user}</span>
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                            {getUserTypeText(request.userType)}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded ${getStatusColor(request.status)}`}>
                            {getStatusText(request.status)}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <div>提现方式：{request.method}</div>
                          <div>申请时间：{request.applyTime}</div>
                          {request.processTime && (
                            <div>处理时间：{request.processTime}</div>
                          )}
                          {request.completeTime && (
                            <div>完成时间：{request.completeTime}</div>
                          )}
                          {request.fee > 0 && (
                            <div>手续费：¥{request.fee.toFixed(2)}</div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-800">¥{request.amount.toFixed(2)}</div>
                        <div className="text-xs text-gray-500">
                          实到：¥{(request.amount - request.fee).toFixed(2)}
                        </div>
                      </div>
                    </div>

                    {/* 操作按钮（仅在待审核状态显示） */}
                    {request.status === 'pending' && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleApproveWithdrawal(request.id)}
                          className="flex-1 bg-green-500 text-white py-2 rounded font-medium hover:bg-green-600 transition-colors text-sm"
                        >
                          ✅ 批准
                        </button>
                        <button
                          onClick={() => handleRejectWithdrawal(request.id)}
                          className="flex-1 bg-red-500 text-white py-2 rounded font-medium hover:bg-red-600 transition-colors text-sm"
                        >
                          ❌ 拒绝
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 提现统计 */}
          <div className="mx-4 mt-6">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h3 className="font-bold text-gray-800 mb-4">提现统计</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 bg-orange-50 rounded">
                  <div className="text-lg font-bold text-orange-600">2</div>
                  <div className="text-xs text-gray-500">待审核</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded">
                  <div className="text-lg font-bold text-green-600">¥15,678</div>
                  <div className="text-xs text-gray-500">今日已处理</div>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded">
                  <div className="text-lg font-bold text-blue-600">95.6%</div>
                  <div className="text-xs text-gray-500">通过率</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded">
                  <div className="text-lg font-bold text-purple-600">2.4小时</div>
                  <div className="text-xs text-gray-500">平均处理时间</div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'fees' && (
        <>
          {/* 费用明细 */}
          <div className="mx-4 mt-6">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-4 border-b">
                <h3 className="font-bold text-gray-800">平台费用明细</h3>
              </div>
              <div className="divide-y">
                {feeDetails.map((fee) => (
                  <div key={fee.id} className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium text-gray-800 mb-1">{fee.description}</div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <div>费率：{fee.rate}</div>
                          {fee.baseAmount > 0 && (
                            <div>基础金额：¥{fee.baseAmount.toFixed(2)}</div>
                          )}
                          <div>时间：{fee.time}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-600">+¥{fee.amount.toFixed(2)}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 费用统计 */}
          <div className="mx-4 mt-6">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h3 className="font-bold text-gray-800 mb-4">费用统计</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded"></div>
                    <span className="text-sm text-gray-600">任务服务费</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-gray-800">¥456.78</div>
                    <div className="text-xs text-gray-500">65.2%</div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded"></div>
                    <span className="text-sm text-gray-600">提现手续费</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-gray-800">¥123.45</div>
                    <div className="text-xs text-gray-500">17.6%</div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-orange-500 rounded"></div>
                    <span className="text-sm text-gray-600">邀请佣金费用</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-gray-800">¥120.32</div>
                    <div className="text-xs text-gray-500">17.2%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}