'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

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

const OverviewPage = () => {
  const router = useRouter();
  const [currentUserAccount, setCurrentUserAccount] = useState<CommenterAccount | null>(null);
  const [dailyEarnings, setDailyEarnings] = useState<DailyEarning[]>([]);
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

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
            size: 50 // 请求更多数据以便前端进行筛选
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
        const stats = calculateEarningsStats(data.data.list);
        
        // 构建用户账户信息
        const account: CommenterAccount = {
          userId: '', // 会从token中解析
          availableBalance: data.data.list.length > 0 ? data.data.list[0].afterBalance : 0,
          totalEarnings: stats.totalEarnings,
          todayEarnings: stats.todayEarnings,
          yesterdayEarnings: stats.yesterdayEarnings,
          weeklyEarnings: stats.weeklyEarnings,
          monthlyEarnings: stats.monthlyEarnings,
          completedTasks: data.data.list.filter(t => t.typeDescription.includes('任务')).length
        };

        setCurrentUserAccount(account);

        // 生成每日收益数据（最近7天）
        const last7DaysEarnings = generateDailyEarnings(data.data.list);
        setDailyEarnings(last7DaysEarnings);

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : '加载数据失败';
        setError(errorMessage);
        console.error('获取交易记录失败:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // 立即调用API获取数据
    fetchTransactionData();
  }, []);

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

  // 设置统计数据
  const stats = {
    todayEarnings: currentUserAccount?.todayEarnings || 0,
    yesterdayEarnings: currentUserAccount?.yesterdayEarnings || 0,
    weeklyEarnings: currentUserAccount?.weeklyEarnings || 0,
    monthlyEarnings: currentUserAccount?.monthlyEarnings || 0
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

  // 直接使用从API获取的数据
  const statsData = stats;
  
  // 直接显示佣金数据，不存在则显示0
  const getCommissionData = (): number => {
    // 由于没有直接的佣金数据，这里暂时返回0
    return 0;
  };

  return (
    <>
      {/* 历史收益 */}
      <div className="mx-4 mt-4">
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg p-4 shadow-md">
            <div className="text-center">
              <div className="text-sm">今日收益：¥{statsData.todayEarnings.toFixed(2)}</div>
              <div className="text-sm">任务: ¥{statsData.todayEarnings.toFixed(2)}</div>
              <div className="text-sm">佣金: ¥{getCommissionData().toFixed(2)}</div>
            </div>
          </div>
          <div className="bg-orange-50 border border-orange-100 rounded-lg p-4 text-center shadow-sm">
            <div className="text-sm">昨日收益：¥{statsData.yesterdayEarnings.toFixed(2)}</div>
            <div className="text-sm">任务: ¥{statsData.yesterdayEarnings.toFixed(2)}</div>
            <div className="text-sm">佣金: ¥{getCommissionData().toFixed(2)}</div>
          </div>
          <div className="bg-green-50 border border-green-100 rounded-lg p-4 text-center shadow-sm">
            <div className="text-sm">本周收益：¥{statsData.weeklyEarnings.toFixed(2)}</div>
            <div className="text-sm">任务: ¥{statsData.weeklyEarnings.toFixed(2)}</div>
            <div className="text-sm">佣金: ¥{getCommissionData().toFixed(2)}</div>
          </div>
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-center shadow-sm">
            <div className="text-sm">本月收益：¥{statsData.monthlyEarnings.toFixed(2)}</div>            
            <div className="text-sm">任务: ¥{statsData.monthlyEarnings.toFixed(2)}</div>
            <div className="text-sm">佣金: ¥{getCommissionData().toFixed(2)}</div>
          </div>
        </div>
      </div>

      {/* 可提现金额 */}
      <div className="mx-4 mt-6">
        <div className="bg-white rounded-lg p-4 shadow-sm flex justify-between items-center">
          <div>
            <div style={{  color: '#4A5568' }}>可提现余额</div>
            <div style={{ color: '#2F855A' }}>¥{(currentUserAccount?.availableBalance || 0).toFixed(2)}</div>
          </div>
          {/* 提现功能已移除 */}
        </div>
      </div>

      {/* 收益统计 */}
      <div className="mx-4 mt-6">
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h3 style={{ color: '#1A201C', marginBottom: '16px' }}>收益统计</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded">
              <div style={{ color: '#2B6CB0' }}>¥{(currentUserAccount?.totalEarnings || 0).toFixed(2)}</div>
              <div style={{  color: '#4A5568' }}>累计收益</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded">
              <div style={{ color: '#DD6B20' }}>{currentUserAccount?.completedTasks || 0}</div>
              <div style={{  color: '#4A5568' }}>完成任务</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded">
              <div style={{ color: '#2F855A' }}>¥{getCommissionData().toFixed(2)}</div>
              <div style={{  color: '#4A5568' }}>累计佣金</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default OverviewPage;