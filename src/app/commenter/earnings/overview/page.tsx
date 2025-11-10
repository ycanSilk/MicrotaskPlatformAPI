'use client';
import React, { useState } from 'react';
import EarningsOverview from '../components/EarningsOverview';
import { useRouter } from 'next/navigation';

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

  // 初始化数据 - 使用静态数据
  React.useEffect(() => {
    const initializeData = () => {
      try {
        setIsLoading(true);
        setError(null);

        // 设置默认用户账户信息（静态数据）
        setCurrentUserAccount({
          userId: 'mock-user-id',
          availableBalance: 150.5,
          frozenBalance: 50,
          totalEarnings: 200.5,
          todayEarnings: 12.5,
          yesterdayEarnings: 8.0,
          weeklyEarnings: 65.5,
          monthlyEarnings: 180.0,
          completedTasks: 25
        });

        // 设置默认每日收益数据（静态数据）
        setDailyEarnings([
          { date: new Date(Date.now() - 7 * 86400000).toISOString(), amount: 5.5 },
          { date: new Date(Date.now() - 6 * 86400000).toISOString(), amount: 8.0 },
          { date: new Date(Date.now() - 5 * 86400000).toISOString(), amount: 12.0 },
          { date: new Date(Date.now() - 4 * 86400000).toISOString(), amount: 9.5 },
          { date: new Date(Date.now() - 3 * 86400000).toISOString(), amount: 15.0 },
          { date: new Date(Date.now() - 2 * 86400000).toISOString(), amount: 8.0 },
          { date: new Date(Date.now() - 1 * 86400000).toISOString(), amount: 12.5 }
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

  // 设置统计数据 - 从用户账户信息获取或使用默认值
  const stats = {
    todayEarnings: currentUserAccount?.todayEarnings || 12.5,
    yesterdayEarnings: currentUserAccount?.yesterdayEarnings || 8.0,
    weeklyEarnings: currentUserAccount?.weeklyEarnings || 65.5,
    monthlyEarnings: currentUserAccount?.monthlyEarnings || 180.0
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