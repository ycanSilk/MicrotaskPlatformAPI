'use client';
import React, { useState } from 'react';
import EarningsDetails from '../components/EarningsDetails';
import { CommenterAuthStorage } from '@/auth/commenter/auth';
import { FinanceModelAdapter } from '@/data/commenteruser/finance_model_adapter';
import type { User } from '@/types';
import { useRouter } from 'next/navigation';

// 创建FinanceModelAdapter实例
const financeAdapter = FinanceModelAdapter.getInstance();

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

  // 初始化数据
  React.useEffect(() => {
    const initializeData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // 获取当前用户
        const commenterUser = CommenterAuthStorage.getCurrentUser();
        if (!commenterUser) {
          router.push('/auth/login/commenterlogin');
          return;
        }

        // 获取收益记录
        const earningRecords = await financeAdapter.getUserEarningsRecords(commenterUser.id);
        if (earningRecords) {
          setEarnings(earningRecords);
        }

        // 获取提现记录
        const withdrawalRecords = await financeAdapter.getUserWithdrawalRecords(commenterUser.id);
        if (withdrawalRecords) {
          setWithdrawals(withdrawalRecords);
        }

        // 如果没有数据，设置默认模拟数据
        if (!earningRecords || earningRecords.length === 0) {
          setEarnings([
            {
              id: '1',
              userId: commenterUser.id,
              taskId: 'task-1',
              taskName: '评论任务',
              amount: 12.5,
              type: 'task',
              description: '完成评论任务',
              createdAt: new Date(Date.now() - 86400000).toISOString()
            },
            {
              id: '2',
              userId: commenterUser.id,
              taskId: 'task-2',
              taskName: '点赞任务',
              amount: 8.0,
              type: 'task',
              description: '完成点赞任务',
              createdAt: new Date(Date.now() - 172800000).toISOString()
            }
          ]);
        }

        if (!withdrawalRecords || withdrawalRecords.length === 0) {
          setWithdrawals([
            {
              id: '1',
              userId: commenterUser.id,
              amount: 100.0,
              fee: 0.5,
              method: '微信',
              status: 'approved',
              requestedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
              processedAt: new Date(Date.now() - 2 * 86400000).toISOString()
            }
          ]);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : '加载数据失败';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    initializeData();
  }, [router]);

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

  // 准备stats数据
  const stats = {
    todayEarnings: 0,
    yesterdayEarnings: 0,
    weeklyEarnings: 0,
    monthlyEarnings: 0
  };
  
  return (
    <EarningsDetails
      currentUserAccount={null}
      earnings={earnings}
      stats={stats}
    />
  );
};

export default DetailsPage;