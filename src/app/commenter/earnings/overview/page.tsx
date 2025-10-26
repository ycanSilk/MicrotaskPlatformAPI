'use client';
import React, { useState } from 'react';
import EarningsOverview from '../components/EarningsOverview';
import { CommenterAuthStorage } from '@/auth/commenter/auth';
import { FinanceModelAdapter } from '@/data/commenteruser/finance_model_adapter';
import type { User } from '@/types';
import { useRouter } from 'next/navigation';

// 创建FinanceModelAdapter实例
const financeAdapter = FinanceModelAdapter.getInstance();

// 定义类型接口
export interface DailyEarning {
  date: string;
  amount: number;
}

// 从FinanceModelAdapter导入的数据类型接口
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
  dailyEarnings?: DailyEarning[];
  inviteCode?: string;
  referrerId?: string;
  createdAt?: string;
}

const OverviewPage = () => {
  const router = useRouter();
  const [currentUserAccount, setCurrentUserAccount] = useState<CommenterAccount | null>(null);
  const [dailyEarnings, setDailyEarnings] = useState<DailyEarning[]>([]);
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

        // 获取用户账户信息
        const userAccount = await financeAdapter.getUserAccount(commenterUser.id);
        if (userAccount) {
          setCurrentUserAccount(userAccount);
        }

        // 设置默认统计数据
        setDailyEarnings([]);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : '加载数据失败';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    initializeData();
  }, [router]);

  // 设置默认统计数据
  const stats = {
    todayEarnings: 0,
    yesterdayEarnings: 0,
    weeklyEarnings: 0,
    monthlyEarnings: 0
  };

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

  return (
    <EarningsOverview 
      currentUserAccount={currentUserAccount}
      dailyEarnings={dailyEarnings}
      stats={stats}
      setActiveTab={setActiveTab}
    />
  );
};

export default OverviewPage;