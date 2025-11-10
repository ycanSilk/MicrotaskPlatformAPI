'use client';
import React, { useState } from 'react';
import EarningsDetails from '../components/EarningsDetails';
import { useRouter } from 'next/navigation';

// 定义类型接口
export interface EarningRecord {
  id: string;
  userId: string;
  taskId: string;
  taskName?: string;
  amount: number;
  description: string;
  createdAt: string;
  status?: string;
  type?: string;
  commissionInfo?: {
    hasCommission: boolean;
    commissionRate: number;
    commissionAmount: number;
    commissionRecipient: string;
  };
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

const DetailsPage = () => {
  const router = useRouter();
  const [earnings, setEarnings] = useState<EarningRecord[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // 初始化数据 - 使用静态数据
  React.useEffect(() => {
    const initializeData = () => {
      try {
        setIsLoading(true);
        setError(null);

        // 设置默认收益记录（静态数据）
        setEarnings([
          {
            id: '1',
            userId: 'mock-user-id',
            taskId: 'task-1',
            taskName: '评论任务',
            amount: 12.5,
            type: 'task',
            description: '完成评论任务',
            createdAt: new Date(Date.now() - 86400000).toISOString()
          },
          {
            id: '2',
            userId: 'mock-user-id',
            taskId: 'task-2',
            taskName: '点赞任务',
            amount: 8.0,
            type: 'task',
            description: '完成点赞任务',
            createdAt: new Date(Date.now() - 172800000).toISOString()
          },
          {
            id: '3',
            userId: 'mock-user-id',
            taskId: 'task-3',
            taskName: '转发任务',
            amount: 15.0,
            type: 'task',
            description: '完成转发任务',
            createdAt: new Date(Date.now() - 259200000).toISOString()
          },
          {
            id: '4',
            userId: 'mock-user-id',
            taskId: 'task-4',
            taskName: '关注任务',
            amount: 6.0,
            type: 'task',
            description: '完成关注任务',
            createdAt: new Date(Date.now() - 345600000).toISOString()
          }
        ]);

        // 设置默认提现记录（静态数据）
        setWithdrawals([
          {
            id: '1',
            userId: 'mock-user-id',
            amount: 100.0,
            fee: 0.5,
            method: '微信',
            status: 'approved',
            requestedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
            processedAt: new Date(Date.now() - 2 * 86400000).toISOString()
          },
          {
            id: '2',
            userId: 'mock-user-id',
            amount: 50.0,
            fee: 0.3,
            method: '支付宝',
            status: 'pending',
            requestedAt: new Date(Date.now() - 1 * 86400000).toISOString()
          }
        ]);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : '加载数据失败';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

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

  // 计算总收益
  const totalEarnings = earnings.reduce((sum, record) => sum + record.amount, 0);

  // 准备stats数据 - 使用静态数据
  const stats = {
    todayEarnings: 12.5,
    yesterdayEarnings: 8.0,
    weeklyEarnings: 65.5,
    monthlyEarnings: 180.0
  };
  
  // 设置默认用户账户信息（静态数据）
  const defaultAccount = {
    userId: 'mock-user-id',
    availableBalance: 150.5,
    frozenBalance: 50,
    totalEarnings: totalEarnings
  };

  return (
    <EarningsDetails
      currentUserAccount={defaultAccount}
      earnings={earnings}
      stats={stats}
    />
  );
};

export default DetailsPage;