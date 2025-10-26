'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { CommenterAccount, WithdrawalRecord } from '../page';
import { FinanceModelAdapter } from '@/data/commenteruser/finance_model_adapter';
import { CommenterAuthStorage } from '@/auth/commenter/auth';
import type { User } from '@/types';

interface WithdrawalPageProps {
  // 页面组件无需props，直接从API获取数据
}

const WithdrawalPage: React.FC<WithdrawalPageProps> = () => {
  const router = useRouter();
  const [currentUserAccount, setCurrentUserAccount] = useState<CommenterAccount | null>(null);
  const [currentWithdrawals, setCurrentWithdrawals] = useState<WithdrawalRecord[]>([]);
  const [withdrawalAmount, setWithdrawalAmount] = useState<string>('');
  const [withdrawalMethod, setWithdrawalMethod] = useState<'wechat' | 'alipay' | 'bank'>('wechat');
  const [withdrawalLoading, setWithdrawalLoading] = useState<boolean>(false);
  const [withdrawalError, setWithdrawalError] = useState<string | null>(null);
  const [withdrawalSuccess, setWithdrawalSuccess] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // 初始化数据
  useEffect(() => {
    const initializeData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // 获取用户信息
        const commenterUser = CommenterAuthStorage.getCurrentUser();
        if (!commenterUser) {
          setError('请先登录');
          setIsLoading(false);
          return;
        }
        setUser(commenterUser);
        
        const financeAdapter = FinanceModelAdapter.getInstance();
        const userId = commenterUser.id;
        
        // 获取用户账户信息
        const userAccount = await financeAdapter.getUserAccount(userId);
        if (userAccount) {
          setCurrentUserAccount(userAccount);
        }

        // 获取用户提现记录
        const userWithdrawals = await financeAdapter.getUserWithdrawalRecords(userId);
        if (userWithdrawals && userWithdrawals.length > 0) {
          setCurrentWithdrawals(userWithdrawals);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : '加载数据失败');
        // 使用模拟数据
        setCurrentUserAccount({
          userId: 'mock-user',
          availableBalance: 1234.56,
          totalEarnings: 5678.90,
          completedTasks: 123
        });
        setCurrentWithdrawals(getMockWithdrawals());
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeData();
  }, []);

  // 辅助函数：获取今日是否可提现 - 移除时间限制，始终可提现
  const canWithdrawToday = (): boolean => {
    return true;
  };

  // 辅助函数：获取提现配置 - 移除所有限制
  const getWithdrawalConfig = () => {
    return {
      minAmount: 0,
      fee: 0,
      allowedDays: [0, 1, 2, 3, 4, 5, 6], // 所有天数
      maxAmount: Infinity
    };
  };

  // 丰富的模拟提现记录数据
  const getMockWithdrawals = (): WithdrawalRecord[] => {
    return [
      {
        id: 'wd-1',
        userId: 'user1',
        amount: 100.00,
        fee: 0,
        method: 'wechat',
        status: 'approved',
        requestedAt: '2024-03-10T10:00:00Z',
        processedAt: '2024-03-10T11:30:00Z',
        description: '微信提现'
      },
      {
        id: 'wd-2',
        userId: 'user1',
        amount: 50.00,
        fee: 0,
        method: 'alipay',
        status: 'approved',
        requestedAt: '2024-02-28T15:30:00Z',
        processedAt: '2024-02-29T09:00:00Z',
        description: '支付宝提现'
      },
      {
        id: 'wd-3',
        userId: 'user1',
        amount: 200.00,
        fee: 0,
        method: 'bank',
        status: 'pending',
        requestedAt: '2024-03-15T14:20:00Z',
        processedAt: undefined,
        description: '银行卡提现'
      },
      {
        id: 'wd-4',
        userId: 'user1',
        amount: 150.00,
        fee: 0,
        method: 'wechat',
        status: 'approved',
        requestedAt: '2024-03-05T09:15:00Z',
        processedAt: '2024-03-05T10:00:00Z',
        description: '微信提现 - 日常开销'
      },
      {
        id: 'wd-5',
        userId: 'user1',
        amount: 75.50,
        fee: 0,
        method: 'alipay',
        status: 'approved',
        requestedAt: '2024-03-01T16:40:00Z',
        processedAt: '2024-03-02T08:30:00Z',
        description: '支付宝提现 - 购物'
      },
      {
        id: 'wd-6',
        userId: 'user1',
        amount: 300.00,
        fee: 0,
        method: 'bank',
        status: 'rejected',
        requestedAt: '2024-02-25T11:20:00Z',
        processedAt: '2024-02-26T09:30:00Z',
        description: '银行卡提现 - 失败'
      },
      {
        id: 'wd-7',
        userId: 'user1',
        amount: 88.88,
        fee: 0,
        method: 'wechat',
        status: 'approved',
        requestedAt: '2024-02-20T14:50:00Z',
        processedAt: '2024-02-20T15:30:00Z',
        description: '微信提现 - 零花钱'
      }
    ];
  };

  // 使用传入的数据，如果为空则使用静态数据
  const withdrawalsToDisplay = currentWithdrawals.length > 0 ? currentWithdrawals : getMockWithdrawals();

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

  // 处理提现请求
  const handleWithdrawal = async () => {
    try {
      setWithdrawalLoading(true);
      setWithdrawalError(null);
      
      // 验证金额
      const amount = parseFloat(withdrawalAmount);
      if (isNaN(amount) || amount <= 0) {
        setWithdrawalError('请输入有效的提现金额');
        return;
      }
      
      // 验证余额
      const availableBalance = currentUserAccount?.availableBalance || 0;
      if (amount > availableBalance) {
        setWithdrawalError('余额不足');
        return;
      }
      
      // 调用API提交提现申请
      const financeAdapter = FinanceModelAdapter.getInstance();
      const result = await financeAdapter.createWithdrawal(
        user?.id || '',
        amount,
        withdrawalMethod
      );
      
      if (result) {
        setWithdrawalSuccess(true);
        setShowSuccessModal(true);
        setWithdrawalAmount('');
        setWithdrawalMethod('wechat');
        setCurrentUserAccount(prev => prev ? { ...prev, availableBalance: prev.availableBalance - amount } : prev);
      }
    } catch (error) {
      console.error('提现失败:', error);
      setWithdrawalError(error instanceof Error ? error.message : '提现申请失败，请重试');
    } finally {
      setWithdrawalLoading(false);
    }
  };

  // 处理提现点击事件
  const handleWithdrawalClick = async () => {
    try {
      await handleWithdrawal();
    } catch (error) {
      console.error('提现失败:', error);
    }
  };

  // 处理查看提现记录详情
  const handleViewWithdrawalDetails = (id: string) => {
    router.push(`/commenter/earnings/withdrawal-details/${id}`);
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

  // 处理导航到其他选项卡
  const navigateToTab = (tab: string) => {
    router.push(`/commenter/earnings/${tab}` as any);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <p className="mt-4 text-gray-600">加载中...</p>
      </div>
    );
  }

  return (
    <div className="mx-4 pb-20">
        {/* 返回按钮 */}
        <button
          onClick={() => {
            if (window.history.length > 1) {
              router.back();
            } else {
              router.push('/commenter/earnings');
            }
          }}
          className="mb-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors inline-block"
        >
          ← 返回
        </button>
        
        {/* 选项卡导航 */}
        <div className="flex border-b mb-6 mt-2">
          <button 
            className="px-4 py-2 text-gray-500 hover:text-gray-700"
            onClick={() => navigateToTab('overview')}
          >
            收益概览
          </button>
          <button 
            className="px-4 py-2 text-gray-500 hover:text-gray-700"
            onClick={() => navigateToTab('details')}
          >
            收益明细
          </button>
          <button 
            className="px-4 py-2 text-blue-600 border-b-2 border-blue-600 font-medium"
            onClick={() => navigateToTab('withdraw')}
          >
            提现管理
          </button>
        </div>

      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-md mb-6">
          {error}
        </div>
      )}

      {/* 提现申请 */}
      <div className="bg-white rounded-lg shadow-sm mb-6">
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
          <div className="mb-6">
            <label className="block font-medium text-gray-700 mb-2" style={{ fontSize: '14px' }}>提现金额</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">¥</span>
              <input
                type="number"
                value={withdrawalAmount}
                onChange={(e) => setWithdrawalAmount(e.target.value)}
                placeholder="请输入提现金额"
                className="block w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                style={{ fontSize: '14px' }}
                min="0"
                step="0.01"
              />
            </div>
            <div className="mt-1 text-gray-500" style={{ fontSize: '14px' }}>
              可提现余额：¥{currentUserAccount?.availableBalance?.toFixed(2) || '0.00'}
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
                className={`p-3 border-2 rounded-md text-left ${withdrawalMethod === 'wechat' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
                onClick={() => setWithdrawalMethod('wechat')}
              >
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-2">
                    <span className="text-green-600 font-bold">微信</span>
                  </div>
                  <div>
                    <div className="font-medium">微信</div>
                    <div className="text-xs text-gray-500">实时到账</div>
                  </div>
                </div>
              </button>
              
              <button
                className={`p-3 border-2 rounded-md text-left ${withdrawalMethod === 'alipay' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
                onClick={() => setWithdrawalMethod('alipay')}
              >
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                    <span className="text-blue-600 font-bold">支付</span>
                  </div>
                  <div>
                    <div className="font-medium">支付宝</div>
                    <div className="text-xs text-gray-500">实时到账</div>
                  </div>
                </div>
              </button>
              
              <button
                className={`p-3 border-2 rounded-md text-left ${withdrawalMethod === 'bank' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
                onClick={() => setWithdrawalMethod('bank')}
              >
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center mr-2">
                    <span className="text-purple-600 font-bold">银行</span>
                  </div>
                  <div>
                    <div className="font-medium">银行卡</div>
                    <div className="text-xs text-gray-500">1-3个工作日</div>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* 提现按钮 */}
          <button
            onClick={handleWithdrawalClick}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={withdrawalLoading || !canWithdrawToday()}
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

      {/* 提现记录 */}
      <div className="bg-white rounded-lg shadow-sm mb-8">
        <div className="p-4 border-b">
          <h3 className="font-bold text-gray-800">提现记录</h3>
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
            <div className="text-center py-12">
              <div className="text-gray-400 text-lg mb-2">💰</div>
              <div className="text-gray-500">暂无提现记录</div>
            </div>
          )}
        </div>
      </div>

      {/* 成功提示模态框 */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="text-center">
              <div className="text-green-500 text-4xl mb-4">✅</div>
              <h3 className="text-xl font-bold mb-2">提现申请提交成功</h3>
              <p className="text-gray-600 mb-6">我们会尽快处理您的提现申请，请耐心等待</p>
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md transition-colors"
                onClick={() => setShowSuccessModal(false)}
              >
                确定
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WithdrawalPage;