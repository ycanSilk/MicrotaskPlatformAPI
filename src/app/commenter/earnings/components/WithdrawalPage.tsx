
'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { CommenterAccount, WithdrawalRecord } from '../page';

interface WithdrawalPageProps {
  currentUserAccount: CommenterAccount | null;
  currentWithdrawals: WithdrawalRecord[];
  withdrawalAmount: string;
  setWithdrawalAmount: (amount: string) => void;
  withdrawalMethod: 'wechat' | 'alipay' | 'bank';
  setWithdrawalMethod: (method: 'wechat' | 'alipay' | 'bank') => void;
  handleWithdrawal: () => Promise<void>;
  withdrawalLoading: boolean;
  withdrawalSuccess: boolean;
  withdrawalError: string | null;
}

const WithdrawalPage: React.FC<WithdrawalPageProps> = ({
  currentUserAccount,
  currentWithdrawals,
  withdrawalAmount,
  setWithdrawalAmount,
  withdrawalMethod,
  setWithdrawalMethod,
  handleWithdrawal,
  withdrawalLoading,
  withdrawalSuccess,
  withdrawalError
}) => {
  const router = useRouter();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  


  // 静态提现记录数据，当没有传入数据时使用
  const staticWithdrawalRecords: WithdrawalRecord[] = [
    {
      id: 'wd-1',
      userId: 'user1',
      amount: 100.50,
      fee: 2.00,
      method: 'wechat',
      status: 'approved',
      requestedAt: '2024-03-10T10:25:30Z',
      processedAt: '2024-03-10T11:45:15Z',
      description: '月度提现 - 生活费用',
      totalAmount: 998.50
    },
    {
      id: 'wd-2',
      userId: 'user1',
      amount: 50.00,
      fee: 1.00,
      method: 'alipay',
      status: 'approved',
      requestedAt: '2024-02-28T15:30:00Z',
      processedAt: '2024-02-29T09:00:00Z',
      description: '购物消费',
      totalAmount: 499.00
    },
    {
      id: 'wd-3',
      userId: 'user1',
      amount: 20.00,
      fee: 0.50,
      method: 'bank',
      status: 'pending',
      requestedAt: '2024-03-15T14:20:00Z',
      processedAt: undefined,
      description: '房租支付',
      totalAmount: 199.50
    }
  ];

  // 使用传入的数据，如果没有则使用静态数据
  const withdrawalsToDisplay = currentWithdrawals && currentWithdrawals.length > 0 ? currentWithdrawals : staticWithdrawalRecords;

  // 格式化日期时间
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  // 获取提现方式中文名称
  const getWithdrawalMethodLabel = (method: string) => {
    switch (method) {
      case 'wechat':
        return '微信';
      case 'alipay':
        return '支付宝';
      case 'bank':
        return '银行卡';
      default:
        return '其他';
    }
  };

  // 处理提现点击事件
  const handleWithdrawalClick = async () => {
    try {
      await handleWithdrawal();
      // 显示成功提示模态框
      setShowSuccessModal(true);
    } catch (error) {
      console.error('提现失败:', error);
      // 错误处理已在父组件中处理
    }
  };

  const [selectedWithdrawal, setSelectedWithdrawal] = useState<WithdrawalRecord | null>(null);
  const [showWithdrawalDetails, setShowWithdrawalDetails] = useState(false);

  // 处理查看提现记录详情
  const handleViewWithdrawalDetails = (id: string) => {
    const withdrawal = withdrawalsToDisplay.find(w => w.id === id);
    if (withdrawal) {
      setSelectedWithdrawal(withdrawal);
      setShowWithdrawalDetails(true);
    }
  };

  // 获取提现状态信息
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return { label: '处理中', color: 'bg-yellow-100 text-yellow-800' };
      case 'approved':
        return { label: '已完成', color: 'bg-green-100 text-green-800' };
      case 'rejected':
        return { label: '已拒绝', color: 'bg-red-100 text-red-800' };
      default:
        return { label: '未知', color: 'bg-gray-100 text-gray-800' };
    }
  };

  return (
    <div className="mx-4 mt-6">
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-4 border-b">
          <h3 className="font-bold text-gray-800">提现申请</h3>
        </div>
        
        <div className="p-4">
          {/* 提现时间提示 */}
          <div className="mb-4">
            <div className="text-green-600" style={{ fontSize: '14px' }}>
              <span>随时可提现，无时间限制</span>
            </div>
          </div>

          {/* 提现金额输入 */}
          <div className="mb-4">
            <label className="block font-medium text-gray-700 mb-1" style={{ fontSize: '14px' }}>提现金额</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500" style={{ fontSize: '14px' }}>¥</span>
              </div>
              <input
                type="number"
                value={withdrawalAmount}
                onChange={(e) => setWithdrawalAmount(e.target.value)}
                className="pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
                placeholder="请输入提现金额"
                min="0"
                step="0.01"
                style={{ fontSize: '14px' }}
              />
            </div>
            {withdrawalError && (
              <p className="mt-1 text-red-600" style={{ fontSize: '14px' }}>{withdrawalError}</p>
            )}
          </div>

          {/* 提现方式选择 */}
          <div className="mb-6">
            <label className="block font-medium text-gray-700 mb-2" style={{ fontSize: '14px' }}>提现方式</label>
            <div className="grid grid-cols-3 gap-4">
              <button
                type="button"
                onClick={() => setWithdrawalMethod('wechat')}
                className={`p-3 border rounded-md flex flex-col items-center justify-center transition-all ${withdrawalMethod === 'wechat' ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-300'}`}
              >
                <span className="mb-1" style={{ fontSize: '14px' }}>微信</span>
                <span className="text-gray-500" style={{ fontSize: '14px' }}>微信转账</span>
              </button>
              <button
                type="button"
                onClick={() => setWithdrawalMethod('alipay')}
                className={`p-3 border rounded-md flex flex-col items-center justify-center transition-all ${withdrawalMethod === 'alipay' ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-300'}`}
              >
                <span className="mb-1" style={{ fontSize: '14px' }}>支付宝</span>
                <span className="text-gray-500" style={{ fontSize: '14px' }}>支付宝转账</span>
              </button>
              <button
                type="button"
                onClick={() => setWithdrawalMethod('bank')}
                className={`p-3 border rounded-md flex flex-col items-center justify-center transition-all ${withdrawalMethod === 'bank' ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-300'}`}
              >
                <span className="mb-1" style={{ fontSize: '14px' }}>银行卡</span>
                <span className="text-gray-500" style={{ fontSize: '14px' }}>银行卡转账</span>
              </button>
            </div>
          </div>

          {/* 提现说明 */}
          <div className="mb-6">
            <div className="text-gray-500" style={{ fontSize: '14px' }}>
              <p>• 预计到账时间：1-2个工作日</p>
            </div>
          </div>

          {/* 提现按钮 */}
          <div>
            <button
              onClick={handleWithdrawalClick}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={withdrawalLoading}
              style={{ fontSize: '14px' }}
            >
              {withdrawalLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  处理中...
                </span>
              ) : (
                '提交提现申请'
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 提现记录 */}
      <div className="bg-white rounded-lg shadow-sm mt-6">
        <div className="p-4 border-b">
          <h3 className="font-bold text-gray-800" style={{ fontSize: '14px' }}>提现记录</h3>
        </div>
        <div className="p-4">
          {withdrawalsToDisplay.length > 0 ? (
            <div className="space-y-4">
              {withdrawalsToDisplay.map((withdrawal) => {
                const statusInfo = getStatusInfo(withdrawal.status);
                const methodLabel = getWithdrawalMethodLabel(withdrawal.method);
                
                return (
                  <div 
                    key={withdrawal.id} 
                    className="p-3 border border-gray-200 rounded-md hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleViewWithdrawalDetails(withdrawal.id)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center">
                        <span className={`font-medium px-2 py-0.5 rounded-full ${statusInfo.color}`} style={{ fontSize: '14px' }}>
                          {statusInfo.label}
                        </span>
                        <span className="ml-2 text-gray-600" style={{ fontSize: '14px' }}>{methodLabel}</span>
                      </div>
                      <span className="font-bold" style={{ fontSize: '14px', fontFamily: 'SimHei, Microsoft YaHei, sans-serif' }}>
                        -{withdrawal.amount.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-gray-500" style={{ fontSize: '14px' }}>
                      <span>{withdrawal.description || '无说明'}</span>
                      <span>{formatDateTime(withdrawal.requestedAt)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500" style={{ fontSize: '14px' }}>
              暂无提现记录
            </div>
          )}
        </div>
      </div>

      {/* 提现成功提示模态框 */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
              </div>
              <h3 className="font-semibold mb-2" style={{ fontSize: '14px' }}>提现申请提交成功</h3>
              <p className="text-gray-600 mb-6" style={{ fontSize: '14px' }}>您的提现申请已提交，资金将尽快到账</p>
              <button
                onClick={() => setShowSuccessModal(false)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md transition-colors"
                style={{ fontSize: '14px' }}
              >
                我知道了
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 提现详情模态框 */}
      {showWithdrawalDetails && selectedWithdrawal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="mb-4">
              <h3 className="font-bold text-gray-800 mb-4" style={{ fontSize: '16px' }}>提现详情</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500" style={{ fontSize: '14px' }}>提现金额</span>
                  <span className="font-medium" style={{ fontSize: '14px' }}>-¥{selectedWithdrawal.amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500" style={{ fontSize: '14px' }}>手续费</span>
                  <span className="font-medium" style={{ fontSize: '14px' }}>-¥{selectedWithdrawal.fee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500" style={{ fontSize: '14px' }}>提现方式</span>
                  <span className="font-medium" style={{ fontSize: '14px' }}>{getWithdrawalMethodLabel(selectedWithdrawal.method)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500" style={{ fontSize: '14px' }}>状态</span>
                  <span className={`font-medium px-2 py-0.5 rounded-full ${getStatusInfo(selectedWithdrawal.status).color}`} style={{ fontSize: '14px' }}>
                    {getStatusInfo(selectedWithdrawal.status).label}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500" style={{ fontSize: '14px' }}>申请时间</span>
                  <span className="font-medium" style={{ fontSize: '14px' }}>{formatDateTime(selectedWithdrawal.requestedAt)}</span>
                </div>
                {selectedWithdrawal.processedAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-500" style={{ fontSize: '14px' }}>处理时间</span>
                    <span className="font-medium" style={{ fontSize: '14px' }}>{formatDateTime(selectedWithdrawal.processedAt)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500" style={{ fontSize: '14px' }}>说明</span>
                  <span className="font-medium" style={{ fontSize: '14px' }}>{selectedWithdrawal.description || '无说明'}</span>
                </div>
              </div>
            </div>
            <div className="flex justify-center">
              <button
                onClick={() => setShowWithdrawalDetails(false)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md transition-colors"
                style={{ fontSize: '14px' }}
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WithdrawalPage;