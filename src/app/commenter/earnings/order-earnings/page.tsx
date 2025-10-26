'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/hooks/useUser';

// 定义收益记录类型
interface EarningRecord {
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

// 定义统计数据类型
type EarningsViewMode = 'all' | 'task' | 'commission';

// 定义用户账户类型
interface CommenterAccount {
  id: string;
  balance: number;
  totalEarnings: number;
  availableForWithdrawal: number;
}

// 定义统计数据类型
interface Stats {
  totalEarnings: number;
  taskEarnings: number;
  commissionEarnings: number;
}

interface EarningsDetailsProps {
  currentUserAccount: CommenterAccount | null;
  earnings: EarningRecord[];
  stats: Stats;
}

export default function OrderEarningsPage() {
  const [viewMode, setViewMode] = useState<EarningsViewMode>('all');
  const router = useRouter();
  const { user } = useUser();

  // 模拟数据，实际应用中应从API获取
  const earningsToDisplay: EarningRecord[] = [
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
    },
    {
      id: 'earning-009',
      userId: 'user-001',
      taskId: 'task-009',
      taskName: '图文评论任务-电商评价',
      amount: 5.50,
      description: '完成电商产品评价任务',
      createdAt: '2023-10-17T16:20:00Z',
      status: 'completed',
      type: 'comment'
    },
    {
      id: 'earning-010',
      userId: 'user-001',
      taskId: 'task-010',
      taskName: '推荐新用户注册',
      amount: 10.00,
      description: '推荐新用户注册奖励',
      createdAt: '2023-10-16T11:45:00Z',
      status: 'completed',
      type: 'commission',
      commissionInfo: {
        hasCommission: true,
        commissionRate: 1.0,
        commissionAmount: 10.00,
        commissionRecipient: 'user-001'
      }
    },
    {
      id: 'earning-011',
      userId: 'user-001',
      taskId: 'task-011',
      taskName: '长视频观看任务',
      amount: 12.00,
      description: '完成长视频观看任务',
      createdAt: '2023-10-15T14:30:00Z',
      status: 'completed',
      type: 'video'
    },
    {
      id: 'earning-012',
      userId: 'user-001',
      taskId: 'task-012',
      taskName: '问卷填写任务',
      amount: 25.00,
      description: '完成市场调研问卷',
      createdAt: '2023-10-14T10:15:00Z',
      status: 'completed',
      type: 'comment'
    }
  ];

  // 格式化日期时间
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  // 跳转到收益详情页面
  const handleViewEarningDetails = (earningId: string) => {
    router.push(`/commenter/earnings/order-earnings/earnings-detail/${earningId}`);
  };

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

  // 根据查看模式过滤收益记录
  const filteredEarnings = earningsToDisplay.filter(earning => {
    if (viewMode === 'all') return true;
    if (viewMode === 'task') return earning.type !== 'commission';
    if (viewMode === 'commission') {
      return earning.type === 'commission' || 
             (earning.commissionInfo && earning.commissionInfo.hasCommission);
    }
    return true;
  });

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
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航栏 */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800">全部收益</h1>
          <button
            onClick={() => router.back()}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded transition-colors"
          >
            返回
          </button>
        </div>
      </div>

      {/* 主要内容 */}
      <div className="max-w-7xl mx-auto px-4 py-6">
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
          </div>
        </div>
      </div>
    </div>
  );
}