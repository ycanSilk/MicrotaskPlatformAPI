'use client';
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

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

export default function EarningsDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const router = useRouter();
  const [earning, setEarning] = useState<EarningRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 模拟数据，实际应用中应从API获取
  const mockEarningsData: EarningRecord[] = [
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

  // 模拟获取收益详情
  useEffect(() => {
    const fetchEarningDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // 模拟网络延迟
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // 从模拟数据中查找对应ID的收益记录
        const foundEarning = mockEarningsData.find(e => e.id === id);
        
        if (foundEarning) {
          setEarning(foundEarning);
        } else {
          throw new Error('未找到收益记录');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : '获取收益详情失败');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchEarningDetails();
    }
  }, [id]);

  // 格式化日期时间
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
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

  // 处理关闭按钮点击
  const handleClose = () => {
    router.back();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">加载中...</div>
      </div>
    );
  }

  if (error || !earning) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="text-red-600 mb-4">{error || '收益记录不存在'}</div>
        <button
          onClick={handleClose}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md transition-colors"
        >
          返回
        </button>
      </div>
    );
  }

  const taskTypeInfo = getTaskTypeInfo(earning.type);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航栏 */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800">收益详情</h1>
          <button
            onClick={handleClose}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded transition-colors"
          >
            返回
          </button>
        </div>
      </div>

      {/* 主要内容 */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="font-bold text-gray-800 mb-4 text-lg">收益详情</h3>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-500">任务名称</span>
              <span className="font-medium">{earning.taskName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">收益金额</span>
              <span className="font-medium text-green-600">+¥{earning.amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">任务类型</span>
              <span className={`px-2 py-0.5 rounded-full text-xs ${taskTypeInfo.color}`}>
                {taskTypeInfo.label}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">完成时间</span>
              <span className="font-medium">{formatDateTime(earning.createdAt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">状态</span>
              <span className={`font-medium ${earning.status === 'completed' ? 'text-green-600' : 'text-yellow-600'}`}>
                {earning.status === 'completed' ? '已完成' : '处理中'}
              </span>
            </div>
            {earning.commissionInfo && earning.commissionInfo.hasCommission && (
              <div className="flex justify-between">
                <span className="text-gray-500">佣金信息</span>
                <span className="font-medium">含{earning.commissionInfo.commissionRate * 100}%佣金</span>
              </div>
            )}
            <div>
              <span className="text-gray-500 block mb-1">说明</span>
              <span className="font-medium block">{earning.description}</span>
            </div>
          </div>
          
          <div className="mt-8 flex justify-center">
            <button
              onClick={handleClose}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md transition-colors"
            >
              关闭
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}