'use client';

import { useEffect, useState, lazy, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import EarningsDetails from './components/EarningsDetails';

// 动态导入overview页面
const OverviewPage = lazy(() => import('./overview/page'));

// 定义交易记录数据类型接口
export interface TransactionItem {
  orderNo: string;
  transactionType: string;
  typeDescription: string;
  amount: number;
  beforeBalance: number;
  afterBalance: number;
  status: string;
  statusDescription: string;
  description: string;
  channel: string;
  createTime: string;
  updateTime: string;
}

// 定义API响应数据类型接口
export interface TransactionResponse {
  code: number;
  message: string;
  data: {
    list: TransactionItem[];
    total: number;
    page: number;
    size: number;
    pages: number;
  };
  success: boolean;
  timestamp: number;
}

// 定义每日收益类型接口
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
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [stats, setStats] = useState({
    todayEarnings: 0,
    yesterdayEarnings: 0,
    weeklyEarnings: 0,
    monthlyEarnings: 0
  });
  const [activeTab, setActiveTab] = useState<'overview' | 'details'>('overview');

  // 计算不同时间维度的收益统计
  const calculateEarningsStats = (transactions: TransactionItem[]) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    let totalEarnings = 0;
    let todayEarnings = 0;
    let yesterdayEarnings = 0;
    let weeklyEarnings = 0;
    let monthlyEarnings = 0;

    transactions.forEach(transaction => {
      // 只统计收益类型的交易（任务奖励）
      if (transaction.transactionType === 'TASK_REWARD' && transaction.status === 'SUCCESS') {
        const transactionDate = new Date(transaction.createTime);
        const amount = transaction.amount;
        
        totalEarnings += amount;
        
        // 今天的收益
        if (transactionDate >= today) {
          todayEarnings += amount;
          weeklyEarnings += amount;
          monthlyEarnings += amount;
        }
        // 昨天的收益
        else if (transactionDate >= yesterday && transactionDate < today) {
          yesterdayEarnings += amount;
          weeklyEarnings += amount;
          monthlyEarnings += amount;
        }
        // 本周的其他日期
        else if (transactionDate >= weekStart && transactionDate < yesterday) {
          weeklyEarnings += amount;
          monthlyEarnings += amount;
        }
        // 本月的其他日期
        else if (transactionDate >= monthStart && transactionDate < weekStart) {
          monthlyEarnings += amount;
        }
      }
    });

    return {
      totalEarnings,
      todayEarnings,
      yesterdayEarnings,
      weeklyEarnings,
      monthlyEarnings
    };
  };

  // 生成最近7天的每日收益数据
  const generateDailyEarnings = (transactions: TransactionItem[]) => {
    const dailyMap = new Map<string, number>();
    const now = new Date();
    
    // 初始化最近7天的数据
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      dailyMap.set(dateStr, 0);
    }
    
    // 统计每日收益
    transactions.forEach(transaction => {
      if (transaction.transactionType === 'TASK_REWARD' && transaction.status === 'SUCCESS') {
        const dateStr = transaction.createTime.split(' ')[0];
        if (dailyMap.has(dateStr)) {
          dailyMap.set(dateStr, (dailyMap.get(dateStr) || 0) + transaction.amount);
        }
      }
    });
    
    // 转换为数组格式
    const earnings: DailyEarning[] = [];
    dailyMap.forEach((amount, date) => {
      earnings.push({ date: date + 'T00:00:00.000Z', amount });
    });
    
    return earnings;
  };

  // 将交易记录转换为收益记录格式
  const convertToEarningRecords = (transactions: TransactionItem[]): EarningRecord[] => {
    return transactions
      .filter(t => t.transactionType === 'TASK_REWARD' && t.status === 'SUCCESS')
      .map((t, index) => ({
        id: t.orderNo || index.toString(),
        userId: '',
        taskId: t.orderNo,
        taskName: t.typeDescription,
        amount: t.amount,
        type: 'task',
        description: t.description,
        createdAt: t.createTime
      }));
  };

  // 获取交易记录并统计收益
  useEffect(() => {
    const fetchTransactionData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // 调用后端API获取交易记录
        const response = await fetch('/api/public/walletmanagement/transactionrecord', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            userId: '',
            transactionType: '',
            status: '',
            startDate: '',
            endDate: '',
            page: 1,
            size: 50
          }),
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error('API请求失败');
        }

        const data: TransactionResponse = await response.json();

        if (!data.success || data.code !== 200) {
          throw new Error(data.message || '获取交易记录失败');
        }

        // 保存交易记录
        setTransactions(data.data.list);

        // 计算收益统计数据
        const statsData = calculateEarningsStats(data.data.list);
        setStats(statsData);
        
        // 构建用户账户信息
        const account: CommenterAccount = {
          userId: '',
          availableBalance: data.data.list.length > 0 ? data.data.list[0].afterBalance : 0,
          totalEarnings: statsData.totalEarnings,
          todayEarnings: statsData.todayEarnings,
          yesterdayEarnings: statsData.yesterdayEarnings,
          weeklyEarnings: statsData.weeklyEarnings,
          monthlyEarnings: statsData.monthlyEarnings,
          completedTasks: data.data.list.filter(t => t.typeDescription.includes('任务')).length
        };

        setCurrentUserAccount(account);

        // 生成每日收益数据
        const last7DaysEarnings = generateDailyEarnings(data.data.list);
        setDailyEarnings(last7DaysEarnings);

        // 转换为收益记录格式
        const earnings = convertToEarningRecords(data.data.list);
        setCurrentEarnings(earnings);

        // 提取提现记录（如果有）
        // 这里简化处理，实际可能需要从其他API或单独处理
        setCurrentWithdrawals([]);

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : '加载数据失败';
        setError(errorMessage);
        console.error('获取交易记录失败:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTransactionData();
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
        <Suspense fallback={<div className="mx-4 mt-6">加载中...</div>}>
          <OverviewPage />
        </Suspense>
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