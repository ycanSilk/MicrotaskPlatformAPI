'use client';
import React from 'react';
import type { CommenterAccount, DailyEarning } from '../page';

interface EarningsOverviewProps {
  currentUserAccount: CommenterAccount | null;
  dailyEarnings: DailyEarning[];
  stats: {
    todayEarnings: number;
    yesterdayEarnings: number;
    weeklyEarnings: number;
    monthlyEarnings: number;
  };
  setActiveTab: (tab: 'overview' | 'details') => void;
}

// 默认用户账户数据，确保组件始终有数据可显示
const defaultUserAccount: CommenterAccount = {
  userId: 'com001',
  availableBalance: 1234.56,
  totalEarnings: 5678.90,
  completedTasks: 123,
  frozenBalance: 0,
  lastUpdated: new Date().toISOString()
};

// 默认统计数据，确保组件始终有数据可显示
const defaultStats = {
  todayEarnings: 123.45,
  yesterdayEarnings: 105.67,
  weeklyEarnings: 890.12,
  monthlyEarnings: 3456.78
};

const EarningsOverview: React.FC<EarningsOverviewProps> = ({
  currentUserAccount,
  dailyEarnings,
  stats,
  setActiveTab
}) => {
  // 使用传入的数据或默认数据
  const accountData = currentUserAccount || defaultUserAccount;
  const statsData = stats || defaultStats;
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
    
    // 生成最近7天的模拟数据（使用固定的示例数据而不是随机数，确保展示效果稳定）
    const mockData: DailyEarning[] = [];
    const today = new Date();
    
    // 预设的模拟数据，展示不同金额的分布
    const presetAmounts = [68, 92, 45, 105, 88, 73, 96];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      mockData.push({
        date: date.toISOString().split('T')[0],
        amount: presetAmounts[6 - i] // 使用预设的金额数据
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
  return (
    <>
      {/* 历史收益 */}
      <div className="mx-4 mt-4">
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg p-4 shadow-md">
            <div className="text-center">
              <div className="text-base mb-1">今日收益：¥{statsData.todayEarnings.toFixed(2)}</div>
              <div className="text-xs opacity-90">任务: ¥{calculateTaskEarnings(statsData.todayEarnings).toFixed(2)}</div>
              <div className="text-xs opacity-90">佣金: ¥{calculateCommissionEarnings(statsData.todayEarnings).toFixed(2)}</div>
            </div>
          </div>
          <div className="bg-orange-50 border border-orange-100 rounded-lg p-4 text-center shadow-sm">
            <div style={{color: '#DD6B20', fontSize: '16px', marginBottom: '4px'}}>昨日收益：¥{statsData.yesterdayEarnings.toFixed(2)}</div>
            <div style={{color: '#C05621', fontSize: '12px'}}>任务: ¥{calculateTaskEarnings(statsData.yesterdayEarnings).toFixed(2)}</div>
            <div style={{color: '#ED8936', fontSize: '12px'}}>佣金: ¥{calculateCommissionEarnings(statsData.yesterdayEarnings).toFixed(2)}</div>
          </div>
          <div className="bg-green-50 border border-green-100 rounded-lg p-4 text-center shadow-sm">
            <div style={{color: '#2F855A', fontSize: '16px', marginBottom: '4px'}}>本周收益：¥{statsData.weeklyEarnings.toFixed(2)}</div>
            <div style={{color: '#276749', fontSize: '12px'}}>任务: ¥{calculateTaskEarnings(statsData.weeklyEarnings).toFixed(2)}</div>
            <div style={{color: '#48BB78', fontSize: '12px'}}>佣金: ¥{calculateCommissionEarnings(statsData.weeklyEarnings).toFixed(2)}</div>
          </div>
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-center shadow-sm">
            <div style={{color: '#2B6CB0', fontSize: '16px', marginBottom: '4px'}}>本月收益：¥{statsData.monthlyEarnings.toFixed(2)}</div>            
            <div style={{color: '#2C5282', fontSize: '12px'}}>任务: ¥{calculateTaskEarnings(statsData.monthlyEarnings).toFixed(2)}</div>
            <div style={{color: '#4299E1', fontSize: '12px'}}>佣金: ¥{calculateCommissionEarnings(statsData.monthlyEarnings).toFixed(2)}</div>
          </div>
        </div>
      </div>

      {/* 可提现金额 */}
      <div className="mx-4 mt-6">
        <div className="bg-white rounded-lg p-4 shadow-sm flex justify-between items-center">
          <div>
            <div style={{  color: '#4A5568' }}>可提现余额</div>
            <div style={{ color: '#2F855A' }}>¥{accountData.availableBalance.toFixed(2)}</div>
          </div>
          {/* 提现功能已移除 */}
        </div>
      </div>

      {/* 收益统计 */}
      <div className="mx-4 mt-6">
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h3 style={{ color: '#1A202C', marginBottom: '16px' }}>收益统计</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded">
              <div style={{ color: '#2B6CB0' }}>¥{(accountData.totalEarnings || 0).toFixed(2)}</div>
              <div style={{  color: '#4A5568' }}>累计收益</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded">
              <div style={{ color: '#DD6B20' }}>{accountData.completedTasks}</div>
              <div style={{  color: '#4A5568' }}>完成任务</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded">
              <div style={{ color: '#2F855A' }}>¥{calculateCommissionEarnings(accountData.totalEarnings || 0).toFixed(2)}</div>
              <div style={{  color: '#4A5568' }}>累计佣金</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EarningsOverview;