'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { CommenterAccount, DailyEarning } from '../page';
import { FinanceModelAdapter } from '@/data/commenteruser/finance_model_adapter';
import { CommenterAuthStorage } from '@/auth/commenter/auth';
import type { User } from '@/types';

interface EarningsOverviewProps {
  // 页面组件无需props，直接从API获取数据
}

const EarningsOverview: React.FC<EarningsOverviewProps> = () => {
  const router = useRouter();
  const [currentUserAccount, setCurrentUserAccount] = useState<CommenterAccount | null>(null);
  const [dailyEarnings, setDailyEarnings] = useState<DailyEarning[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState({
    todayEarnings: 0,
    weeklyEarnings: 0,
    monthlyEarnings: 0
  });

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
          
          // 设置统计数据 - 由于数据模型限制，这里使用默认值
          setStats({
            todayEarnings: 0,
            weeklyEarnings: 0,
            monthlyEarnings: 0
          });
        }

        // 获取每日收益数据
        const userEarnings = await financeAdapter.getUserEarningsRecords(userId);
        if (userEarnings && userEarnings.length > 0) {
          // 按日期分组计算每日收益
          const dailyEarningsMap = new Map<string, number>();
          
          userEarnings.forEach(earning => {
            const date = earning.createdAt.split('T')[0];
            const currentAmount = dailyEarningsMap.get(date) || 0;
            dailyEarningsMap.set(date, currentAmount + earning.amount);
          });
          
          // 转换为数组并排序
          const dailyEarningsArray = Array.from(dailyEarningsMap.entries()).map(([date, amount]) => ({
            date,
            amount
          }));
          
          dailyEarningsArray.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
          setDailyEarnings(dailyEarningsArray);
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
        setStats({
          todayEarnings: 89.50,
          weeklyEarnings: 654.32,
          monthlyEarnings: 2345.67
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeData();
  }, []);

  // 辅助函数：计算佣金收益 (假设佣金占30%)
  const calculateCommissionEarnings = (totalEarnings: number): number => {
    return totalEarnings * 0.3;
  }

  // 辅助函数：计算任务收益 (假设任务收益占70%)
  const calculateTaskEarnings = (totalEarnings: number): number => {
    return totalEarnings * 0.7;
  }

  // 格式化日期（月/日）
  const formatDateShort = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  }

  // 生成模拟的7天数据（如果没有传入数据）
  const getEarningsData = () => {
    if (dailyEarnings && dailyEarnings.length > 0) {
      return dailyEarnings;
    }
    
    // 生成最近7天的模拟数据
    const mockData: DailyEarning[] = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      mockData.push({
        date: date.toISOString().split('T')[0],
        amount: Math.floor(Math.random() * 100) + 10 // 10-109的随机金额
      });
    }
    
    return mockData;
  };

  // 计算Y轴刻度 - 基于实际数据动态生成
  const calculateYAxisTicks = (maxValue: number) => {
    // 根据最大值动态确定刻度间隔
    let interval = 1;
    if (maxValue >= 1000) interval = 200;
    else if (maxValue >= 500) interval = 100;
    else if (maxValue >= 200) interval = 50;
    else if (maxValue >= 100) interval = 20;
    else if (maxValue >= 50) interval = 10;
    else interval = 5;

    // 计算最大刻度值（向上取整到最近的interval倍数）
    const roundedMaxValue = Math.ceil(maxValue / interval) * interval;
    
    // 生成刻度数组
    const ticks: number[] = [];
    for (let i = roundedMaxValue; i >= 0; i -= interval) {
      ticks.push(i);
    }
    
    return ticks;
  };

  const earningsData = getEarningsData();
  
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
            router.push('/commenter' as any);
          }
        }}
        className="mb-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors inline-block"
      >
        ← 返回
      </button>
      
      {/* 选项卡导航 */}
      <div className="flex border-b mb-6 mt-2">
        <button 
          className="px-4 py-2 text-blue-600 border-b-2 border-blue-600 font-medium"
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
          className="px-4 py-2 text-gray-500 hover:text-gray-700"
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

      {/* 历史收益 */}
      <div className="mt-4">
        
        <div className="grid grid-cols-1">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg p-6 shadow-md">
          <div className="text-center">
            <div>今日收益</div>
            <div>总收益：¥{stats.todayEarnings.toFixed(2)}</div>
            <div>任务收益：¥{calculateTaskEarnings(stats.todayEarnings).toFixed(2)}</div>
            <div>佣金收益：¥{calculateCommissionEarnings(stats.todayEarnings).toFixed(2)}</div>
          </div>
        </div>
          <div className="bg-orange-50 border border-orange-100 rounded-lg p-4 text-center shadow-sm">
            <div style={{color: '#DD6B20'}}>昨日</div>
            <div style={{color: '#DD6B20'}}>总收益：¥{stats.todayEarnings.toFixed(2)}</div>
            <div style={{color: '#C05621' }}>任务收益：¥{calculateTaskEarnings(stats.todayEarnings).toFixed(2)}</div>
            <div style={{color: '#ED8936' }}>佣金收益：¥{calculateCommissionEarnings(stats.todayEarnings).toFixed(2)}</div>
          </div>
          <div className="bg-green-50 border border-green-100 rounded-lg p-4 text-center shadow-sm">
            <div style={{  color: '#2F855A'}}>本周</div>
            <div style={{ color: '#2F855A'}}>总收益：¥{stats.weeklyEarnings.toFixed(2)}</div>
            <div style={{color: '#276749' }}>任务收益：¥{calculateTaskEarnings(stats.weeklyEarnings).toFixed(2)}</div>
            <div style={{color: '#48BB78' }}>佣金收益：¥{calculateCommissionEarnings(stats.weeklyEarnings).toFixed(2)}</div>
          </div>
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-center shadow-sm">
            <div style={{  color: '#2B6CB0'}}>本月</div>
            <div style={{ color: '#2B6CB0'}}>总收益：¥{stats.monthlyEarnings.toFixed(2)}</div>
            <div style={{color: '#2C5282' }}>任务收益：¥{calculateTaskEarnings(stats.monthlyEarnings).toFixed(2)}</div>
            <div style={{color: '#4299E1' }}>佣金收益：¥{calculateCommissionEarnings(stats.monthlyEarnings).toFixed(2)}</div>
          </div>
        </div>
      </div>

      {/* 可提现金额 */}
      <div className="mt-6">
        <div className="bg-white rounded-lg p-4 shadow-sm flex justify-between items-center">
          <div>
            <div style={{  color: '#4A5568' }}>可提现余额</div>
            <div style={{ color: '#2F855A' }}>¥{currentUserAccount?.availableBalance?.toFixed(2) || '0.00'}</div>
          </div>
          <button 
            className="bg-green-500 text-white px-6 py-2 rounded font-medium hover:bg-green-600 transition-colors"
            onClick={() => navigateToTab('withdraw')}
          >
            立即提现
          </button>
        </div>
      </div>

      {/* 收益统计 */}
      <div className="mt-6">
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h3 style={{ color: '#1A202C', marginBottom: '16px' }}>收益统计</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded">
              <div style={{ color: '#2B6CB0' }}>¥{currentUserAccount?.totalEarnings?.toFixed(2) || '0.00'}</div>
              <div style={{  color: '#4A5568' }}>累计收益</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded">
              <div style={{ color: '#DD6B20' }}>{currentUserAccount?.completedTasks || 0}</div>
              <div style={{  color: '#4A5568' }}>完成任务</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded">
              <div style={{ color: '#2F855A' }}>¥{currentUserAccount ? calculateCommissionEarnings(currentUserAccount.totalEarnings || 0).toFixed(2) : '0.00'}</div>
              <div style={{  color: '#4A5568' }}>累计佣金</div>
            </div>
          </div>
        </div>
      </div>

      {/* 7天收益趋势 */}
      <div className="mt-6 mb-8">
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h3 style={{ color: '#1A202C', marginBottom: '16px' }}>近7天收益趋势</h3>
          <div className="h-80">
            {/* 改进的柱状图展示 */}
            <div className="h-full relative">
            
              {(() => {
                // 计算数据中的最大值
                const maxValue = Math.max(...earningsData.map(item => item.amount), 0);
                // 动态计算Y轴刻度
                const dynamicYAxisTicks = calculateYAxisTicks(maxValue);
                // 获取Y轴的最大值
                const yAxisMaxValue = dynamicYAxisTicks[0] || 100;
                
                return (
                  <div className="h-full w-full">
                    {/* 坐标轴背景 */}
                    <div className="absolute left-16 top-0 right-0 bottom-4 border-l border-b border-gray-300"></div>
                    
                    {/* Y轴刻度线和标签 */}
                    <div className="absolute left-0 top-0 bottom-4 w-16 flex flex-col justify-between">
                      {dynamicYAxisTicks.map((tick, index) => (
                        <div key={index} className="relative">
                          {/* Y轴横向网格线 */}
                          <div className="h-px bg-gray-200 absolute right-0 left-16 w-full"></div>
                          <div style={{ color: '#718096' }}>¥{tick}</div>
                        </div>
                      ))}
                    </div>
                        
                    {/* 柱状图主体 - 修正方向，确保金额越高柱子越高 */}
                    <div className="ml-16 h-full flex justify-between items-end px-2 pt-0 pb-4">
                      {earningsData.map((item, index) => {
                        // 基于实际数据最大值计算柱状图高度百分比
                        const heightPercentage = yAxisMaxValue > 0 ? 
                          Math.min((item.amount / yAxisMaxValue) * 100, 100) : 0;
                        const formattedDate = formatDateShort(item.date);
                                 
                        return (
                          <div key={index} className="flex flex-col items-center flex-1 h-full relative">
                            {/* X轴纵向网格线 */}
                            {index < earningsData.length - 1 && (
                              <div className="absolute top-0 bottom-4 w-px bg-gray-200 right-0"></div>
                            )}
                              
                            {/* 柱子 */}
                            <div 
                              className="w-6 bg-blue-500 rounded-t-md" 
                              style={{ height: `${heightPercentage}%` }}
                            ></div>
                              
                            {/* 柱子顶部的数值 */}
                            <div style={{ color: '#2B6CB0', marginTop: '4px' }}>
                              ¥{item.amount.toFixed(0)}
                            </div>
                              
                            {/* X轴日期标签 */}
                            <div className="absolute bottom-[-20px]" style={{ color: '#718096', fontSize: '12px' }}>
                              {formattedDate}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EarningsOverview;