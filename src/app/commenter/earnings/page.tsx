'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import EarningsOverview from './components/EarningsOverview';
import EarningsDetails from './components/EarningsDetails';

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
  description?: string;
  totalAmount?: number;
}

// 统计数据类型定义
export interface Stats {
  todayEarnings: number;
  yesterdayEarnings: number;
  weeklyEarnings: number;
  monthlyEarnings: number;
}

export default function CommenterEarningsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUserAccount, setCurrentUserAccount] = useState<CommenterAccount | null>(null);
  const [currentEarnings, setCurrentEarnings] = useState<EarningRecord[]>([]);
  const [currentWithdrawals, setCurrentWithdrawals] = useState<WithdrawalRecord[]>([]);
  const [dailyEarnings, setDailyEarnings] = useState<DailyEarning[]>([]);
  const [stats, setStats] = useState({
    todayEarnings: 0,
    yesterdayEarnings: 0,
    weeklyEarnings: 0,
    monthlyEarnings: 0
  });
  const [activeTab, setActiveTab] = useState<'overview' | 'details'>('overview');

  // 初始化数据 - 使用静态数据
  useEffect(() => {
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
        
        // 设置统计数据
        setStats({
          todayEarnings: 12.5,
          yesterdayEarnings: 8.0,
          weeklyEarnings: 65.5,
          monthlyEarnings: 180.0
        });
        
        // 设置每日收益数据
        setDailyEarnings([
          { date: new Date(Date.now() - 7 * 86400000).toISOString(), amount: 5.5 },
          { date: new Date(Date.now() - 6 * 86400000).toISOString(), amount: 8.0 },
          { date: new Date(Date.now() - 5 * 86400000).toISOString(), amount: 12.0 },
          { date: new Date(Date.now() - 4 * 86400000).toISOString(), amount: 9.5 },
          { date: new Date(Date.now() - 3 * 86400000).toISOString(), amount: 15.0 },
          { date: new Date(Date.now() - 2 * 86400000).toISOString(), amount: 8.0 },
          { date: new Date(Date.now() - 1 * 86400000).toISOString(), amount: 12.5 }
        ]);

        // 设置默认收益记录
        setCurrentEarnings([
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
          }
        ]);

        // 设置默认提现记录
        setCurrentWithdrawals([
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
      } catch (err) {
        setError(err instanceof Error ? err.message : '加载数据失败');
        console.error('初始化数据错误:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeData();
  }, []);

  // 处理选项卡切换
  const handleTabChange = (tab: 'overview' | 'details') => {
    setActiveTab(tab);
    // 只更新URL哈希值而不进行完整的路由跳转，这样可以保持在当前页面并保留顶部栏
    window.location.hash = tab;
  };

  // 初始化时，从URL hash中恢复选项卡状态
  useEffect(() => {
    const hash = window.location.hash;
    if (hash === '#details') {
      setActiveTab('details');
    } else {
      setActiveTab('overview');
    }
  }, []);

  // 监听hash变化，确保从其他页面跳转过来时也能正确显示对应选项卡
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === '#details') {
        setActiveTab('details');
      } else {
        setActiveTab('overview');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);



  // 格式化日期（月/日）
  const formatDateShort = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  }



  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <p className="mt-4 text-gray-600">加载中...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="">
        {/* 收益类型切换 */}
        <div className="mx-4 mt-4 grid grid-cols-2 gap-2">
          <button 
            onClick={() => handleTabChange('overview')}
            className={`py-3 px-4 rounded font-medium transition-colors ${activeTab === 'overview' ? 'bg-blue-500 text-white shadow-md' : 'bg-white border border-gray-300 text-gray-600 hover:bg-blue-50'}`}
          >
            概览
          </button>
          <button 
            onClick={() => handleTabChange('details')}
            className={`py-3 px-4 rounded font-medium transition-colors ${activeTab === 'details' ? 'bg-blue-500 text-white shadow-md' : 'bg-white border border-gray-300 text-gray-600 hover:bg-blue-50'}`}
          >
            明细
          </button>

        </div>
      </div>
      
      {error && (
        <div className="mx-4 bg-red-100 text-red-700 p-4 rounded-md mb-6">
          {error}
        </div>
      )}
    
      {/* 根据activeTab渲染不同组件 */}
      {activeTab === 'overview' && (
        <EarningsOverview 
          currentUserAccount={currentUserAccount}
          dailyEarnings={dailyEarnings}
          stats={stats}
          setActiveTab={setActiveTab}
        />
      )}
      
      {activeTab === 'details' && (
        <EarningsDetails 
          currentUserAccount={currentUserAccount}
          earnings={currentEarnings}
          stats={stats}
        />
      )}
      

    </div>
  );
}