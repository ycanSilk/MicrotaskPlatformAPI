'use client';
import React, { useState } from 'react';
import type { EarningRecord, WithdrawalRecord, CommenterAccount, Stats } from '../page';
import { useRouter } from 'next/navigation';

interface EarningsDetailsProps {
  currentUserAccount: CommenterAccount | null;
  earnings: EarningRecord[];
  stats: Stats;
}

type EarningsViewMode = 'all' | 'task' | 'commission';

const EarningsDetails: React.FC<EarningsDetailsProps> = ({
  currentUserAccount,
  earnings,
  stats
}) => {
  const [viewMode, setViewMode] = useState<EarningsViewMode>('all');
  const router = useRouter();

  // 如果没有传入数据，使用静态数据作为后备
  const earningsToDisplay = earnings && earnings.length > 0 ? earnings : [
    {
      id: 'earning-001',
      userId: 'user-001',
      taskId: 'task-001',
      taskName: '抖音评论任务-产品推广',
      amount: 15.50,
      description: '完成抖音短视频评论任务',
      createdAt: '2023-10-25T14:30:00Z',
      status: 'completed',
      type: 'comment'
    },
    {
      id: 'earning-002',
      userId: 'user-001',
      taskId: 'task-002',
      taskName: '视频推荐任务-美妆教程',
      amount: 8.75,
      description: '完成视频推荐任务',
      createdAt: '2023-10-24T09:15:00Z',
      status: 'completed',
      type: 'video'
    },
    {
      id: 'earning-003',
      userId: 'user-001',
      taskId: 'task-003',
      taskName: '账号出租-游戏账号',
      amount: 50.00,
      description: '账号出租收益',
      createdAt: '2023-10-23T16:45:00Z',
      status: 'completed',
      type: 'account_rental'
    },
    {
      id: 'earning-004',
      userId: 'user-001',
      taskId: 'task-004',
      taskName: '推荐好友完成任务',
      amount: 3.20,
      description: '推荐好友完成任务获得的佣金',
      createdAt: '2023-10-22T11:20:00Z',
      status: 'completed',
      type: 'commission',
      commissionInfo: {
        hasCommission: true,
        commissionRate: 0.1,
        commissionAmount: 3.20,
        commissionRecipient: 'user-001'
      }
    },
    {
      id: 'earning-005',
      userId: 'user-001',
      taskId: 'task-005',
      taskName: '抖音评论任务-美食推荐',
      amount: 12.30,
      description: '完成抖音短视频评论任务',
      createdAt: '2023-10-21T15:10:00Z',
      status: 'completed',
      type: 'comment',
      commissionInfo: {
        hasCommission: false,
        commissionRate: 0,
        commissionAmount: 0,
        commissionRecipient: ''
      }
    },
    {
      id: 'earning-006',
      userId: 'user-001',
      taskId: 'task-006',
      taskName: '视频推荐任务-旅行攻略',
      amount: 9.80,
      description: '完成视频推荐任务',
      createdAt: '2023-10-20T10:35:00Z',
      status: 'completed',
      type: 'video'
    },
    {
      id: 'earning-007',
      userId: 'user-001',
      taskId: 'task-007',
      taskName: '推荐团队完成任务',
      amount: 15.60,
      description: '团队任务佣金分成',
      createdAt: '2023-10-19T13:50:00Z',
      status: 'completed',
      type: 'commission',
      commissionInfo: {
        hasCommission: true,
        commissionRate: 0.15,
        commissionAmount: 15.60,
        commissionRecipient: 'user-001'
      }
    },
    {
      id: 'earning-008',
      userId: 'user-001',
      taskId: 'task-008',
      taskName: '普通任务-数据标注',
      amount: 20.00,
      description: '完成数据标注任务',
      createdAt: '2023-10-18T08:25:00Z',
      status: 'processing',
      type: 'comment'
    }
  ];

  // 静态提现记录数据
  const withdrawalsToDisplay: WithdrawalRecord[] = [
    {
      id: 'withdraw-001',
      userId: 'user-001',
      amount: 100.00,
      fee: 2.00,
      method: 'wechat',
      status: 'approved',
      requestedAt: '2023-10-15T16:30:00Z',
      processedAt: '2023-10-16T09:15:00Z',
      description: '微信提现',
      totalAmount: 102.00
    },
    {
      id: 'withdraw-002',
      userId: 'user-001',
      amount: 50.00,
      fee: 1.00,
      method: 'alipay',
      status: 'approved',
      requestedAt: '2023-10-05T14:20:00Z',
      processedAt: '2023-10-06T11:45:00Z',
      description: '支付宝提现',
      totalAmount: 51.00
    },
    {
      id: 'withdraw-003',
      userId: 'user-001',
      amount: 80.00,
      fee: 1.60,
      method: 'bank',
      status: 'pending',
      requestedAt: '2023-10-26T10:10:00Z',
      description: '银行卡提现',
      totalAmount: 81.60
    }
  ];

  // 确保当前用户账户有默认值，避免页面空白
  const userAccount = currentUserAccount || {
    userId: 'user-001',
    availableBalance: 128.55,
    frozenBalance: 0,
    totalEarnings: 132.15,
    completedTasks: 15,
    lastUpdated: '2023-10-26T10:30:00Z',
    todayEarnings: 0,
    yesterdayEarnings: 15.50,
    weeklyEarnings: 60.85,
    monthlyEarnings: 320.50
  };

  // 根据查看模式过滤收益记录，并只保留最新的10条
  const filteredEarnings = earningsToDisplay
    .filter(earning => {
      if (viewMode === 'all') return true;
      if (viewMode === 'task') return earning.type !== 'commission';
      if (viewMode === 'commission') {
        return earning.type === 'commission' || 
               (earning.commissionInfo && earning.commissionInfo.hasCommission);
      }
      return true;
    })
    .slice(0, 10); // 只显示最新的10条记录

  // 获取任务类型标签信息
  const getTaskTypeInfo = (type?: string) => {
    switch (type) {
      case 'comment':
        return { label: '评论任务', color: 'bg-blue-100 text-blue-800' };
      case 'video':
        return { label: '视频推荐', color: 'bg-green-100 text-green-800' };
      case 'account_rental':
        return { label: '租号任务', color: 'bg-purple-100 text-purple-800' };
      case 'commission':
        return { label: '佣金收入', color: 'bg-yellow-100 text-yellow-800' };
      default:
        return { label: '普通任务', color: 'bg-gray-100 text-gray-800' };
    }
  };

  // 格式化日期时间
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  // 跳转到收益详情页面
  const handleViewEarningDetails = (earningId: string) => {
    router.push(`/commenter/earnings/order-earnings/earnings-detail/${earningId}`);
  };

  // 跳转到全部收益页面
  const handleViewAllEarnings = () => {
    router.push(`/commenter/earnings/order-earnings`);
  };





  // 计算各类收益的总和
  const calculateTotalEarnings = (type: EarningsViewMode) => {
    if (type === 'all') {
      return earningsToDisplay.reduce((sum, earning) => sum + earning.amount, 0);
    } else if (type === 'task') {
      return earningsToDisplay
        .filter(e => e.type !== 'commission')
        .reduce((sum, earning) => sum + earning.amount, 0);
    } else if (type === 'commission') {
      return earningsToDisplay
        .filter(e => e.type === 'commission' || (e.commissionInfo && e.commissionInfo.hasCommission))
        .reduce((sum, earning) => sum + earning.amount, 0);
    }
    return 0;
  };

  return (
    <div className="mx-4 mt-6">
      {/* 收益类型切换 */}
      <div className="bg-white rounded-lg shadow-sm mb-4">
        <div className="p-4 border-b">
          <h3 className="font-bold text-gray-800">收益明细</h3>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-3 gap-2 mb-6">
            <button
              className={`py-2 px-3 rounded-md text-sm font-medium transition-colors ${viewMode === 'all' ? 'bg-blue-500 text-white' : 'bg-white border border-gray-300 text-gray-600 hover:bg-blue-50'}`}
              onClick={() => setViewMode('all')}
            >
              所有收益
            </button>
            <button
              className={`py-2 px-3 rounded-md text-sm font-medium transition-colors ${viewMode === 'task' ? 'bg-blue-500 text-white' : 'bg-white border border-gray-300 text-gray-600 hover:bg-blue-50'}`}
              onClick={() => setViewMode('task')}
            >
              任务收益
            </button>
            <button
              className={`py-2 px-3 rounded-md text-sm font-medium transition-colors ${viewMode === 'commission' ? 'bg-blue-500 text-white' : 'bg-white border border-gray-300 text-gray-600 hover:bg-blue-50'}`}
              onClick={() => setViewMode('commission')}
            >
              佣金收益
            </button>
          </div>
        </div>
        
        {/* 收益总览 */}
        <div className="p-4 border-t bg-gray-50">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {viewMode === 'all' ? '总收益' : viewMode === 'task' ? '任务总收益' : '佣金总收益'}
            </div>
            <div className="text-lg font-bold text-green-600">
              ¥{calculateTotalEarnings(viewMode).toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      {/* 收益记录列表 */}
      <div className="bg-white rounded-lg shadow-sm">
        {/* 查看全部收益按钮 */}
        <div className="p-4 flex justify-end border-b">
          <button
            onClick={handleViewAllEarnings}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors"
          >
            查看全部收益
          </button>
        </div>
        <div className="divide-y">
          {filteredEarnings.length > 0 ? (
            filteredEarnings.map((earning) => {
              const taskTypeInfo = getTaskTypeInfo(earning.type);
              const formattedDate = formatDateTime(earning.createdAt);
              const hasCommission = earning.commissionInfo && earning.commissionInfo.hasCommission;
              
              return (
                <div 
                  key={earning.id} 
                  className="p-4 flex justify-between items-center hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => handleViewEarningDetails(earning.id)}
                >
                  <div className="flex-1">
                    <div className="font-medium text-gray-800 flex items-center justify-between mb-1">
                      <span>{earning.taskName}</span>
                      {hasCommission && (
                        <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded-full">
                          含佣金
                        </span>
                      )}
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="text-xs text-gray-500">{formattedDate}</div>
                      <div className={`text-xs px-2 py-0.5 rounded-full ${taskTypeInfo.color}`}>
                        {taskTypeInfo.label}
                      </div>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <div className="font-bold text-green-600">+¥{earning.amount.toFixed(2)}</div>
                    <div className="text-xs text-gray-500">{earning.status === 'completed' ? '已到账' : '处理中'}</div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-gray-500">
              {viewMode === 'all' ? '暂无收益记录' : 
               viewMode === 'task' ? '暂无任务收益记录' : '暂无佣金收益记录'}
            </div>
          )}
          
          {/* 提现手续费记录已移除 */}
        </div>
      </div>

      {/* 收益详情模态框已移除，改为跳转页面 */}
    </div>
  );
};

export default EarningsDetails;