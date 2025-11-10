'use client';
import React, { useState } from 'react';
import WithdrawalPage from '../components/WithdrawalPage';
import { useRouter } from 'next/navigation';

// 定义类型接口
export interface WithdrawalRequest {
  amount: number;
  method: string;
  accountInfo: string;
}

export interface WithdrawalRecord {
  id: string;
  userId: string;
  amount: number;
  fee: number;
  method: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
  processedAt?: string;
}

export interface CommenterAccount {
  userId: string;
  availableBalance: number;
  frozenBalance?: number;
  totalEarnings?: number;
  completedTasks?: number;
  lastUpdated?: string;
  todayEarnings?: number;
  yesterdayEarnings?: number;
  weeklyEarnings?: number;
  monthlyEarnings?: number;
  dailyEarnings?: Array<{date: string, amount: number}>;
  inviteCode?: string;
  referrerId?: string;
  createdAt?: string;
}

const WithdrawPage = () => {
  const router = useRouter();
  const [currentUserAccount, setCurrentUserAccount] = useState<CommenterAccount | null>(null);
  const [withdrawalRecords, setWithdrawalRecords] = useState<WithdrawalRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // 为WithdrawalPage组件添加所需的状态
  const [withdrawalAmount, setWithdrawalAmount] = useState<string>('');
  const [withdrawalMethod, setWithdrawalMethod] = useState<'wechat' | 'alipay' | 'bank'>('wechat');
  const [withdrawalLoading, setWithdrawalLoading] = useState<boolean>(false);
  const [withdrawalSuccess, setWithdrawalSuccess] = useState<boolean>(false);
  const [withdrawalError, setWithdrawalError] = useState<string | null>(null);

  // 初始化数据 - 使用静态数据
  React.useEffect(() => {
    const initializeData = () => {
      try {
        setIsLoading(true);
        setError(null);

        // 设置默认账户数据
        setCurrentUserAccount({
          userId: 'mock-user-id',
          availableBalance: 150.5,
          frozenBalance: 50,
          totalEarnings: 200.5
        });

        // 设置默认提现记录
        setWithdrawalRecords([
          {
            id: '1',
            userId: 'mock-user-id',
            amount: 100.0,
            fee: 0.5,
            method: '微信',
            status: 'approved',
            requestedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
            processedAt: new Date(Date.now() - 2 * 86400000).toISOString()
          }
        ]);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : '加载数据失败';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    }

    initializeData();
  }, []);

  // 处理选项卡切换
  const setActiveTab = (tab: 'overview' | 'details' | 'withdraw') => {
    switch (tab) {
      case 'overview':
        router.push('/commenter/earnings/overview');
        break;
      case 'details':
        router.push('/commenter/earnings/details');
        break;
      case 'withdraw':
        router.push('/commenter/earnings/withdraw');
        break;
    }
  };

  // 处理提现请求 - 使用模拟实现
  const handleWithdrawal = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      // 使用表单状态中的值
      const amount = parseFloat(withdrawalAmount);
      if (isNaN(amount) || amount <= 0) {
        setError('请输入有效的提现金额');
        return;
      }

      // 模拟异步操作
      return new Promise<void>((resolve) => {
        // 模拟成功处理
        setTimeout(() => {
          // 显示成功消息
          setWithdrawalSuccess(true);
          setWithdrawalError(null);
          
          // 模拟成功提交
          alert('提现请求已提交，请等待审核');
          
          // 延迟后跳转到详情页
          setTimeout(() => {
            router.push('/commenter/earnings/details');
          }, 1000);
          
          resolve();
        }, 500);
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '提现请求处理失败';
      setError(errorMessage);
      return Promise.resolve();
    } finally {
      setIsLoading(false);
    }
  };

  // 加载状态显示
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  // 错误状态显示
  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-screen p-4">
        <h2 className="text-xl font-bold mb-2 text-red-600">错误</h2>
        <p className="text-gray-600 mb-4">{error}</p>
        <button 
          onClick={() => router.push('/')}
          className="bg-blue-500 text-white px-6 py-2 rounded font-medium hover:bg-blue-600 transition-colors"
        >
          返回首页
        </button>
      </div>
    );
  }

  // 默认账户数据（用于模拟）
  const defaultAccount = currentUserAccount || {
    userId: 'mock-user-id',
    availableBalance: 150.5,
    frozenBalance: 50,
    totalEarnings: 200.5
  };

  return (
    <WithdrawalPage 
      currentUserAccount={defaultAccount}
      currentWithdrawals={withdrawalRecords}
      withdrawalAmount={withdrawalAmount}
      setWithdrawalAmount={setWithdrawalAmount}
      withdrawalMethod={withdrawalMethod}
      setWithdrawalMethod={setWithdrawalMethod}
      handleWithdrawal={handleWithdrawal}
      withdrawalLoading={withdrawalLoading}
      withdrawalSuccess={withdrawalSuccess}
      withdrawalError={withdrawalError}
    />
  );
};

export default WithdrawPage;