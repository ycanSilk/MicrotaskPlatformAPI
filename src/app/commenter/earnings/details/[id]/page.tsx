'use client';
import React from 'react';
import { useRouter } from 'next/navigation';

interface EarningDetailsProps {
  params: {
    id: string;
  };
}

// 静态收益详情数据
interface EarningRecord {
  id: string;
  userId: string;
  taskId: string;
  taskName: string;
  amount: number;
  description: string;
  createdAt: string;
  status: string;
  type: string;
  commissionInfo?: {
    hasCommission: boolean;
    commissionRate: number;
    commissionAmount: number;
    commissionRecipient: string;
  };
}

const EarningDetailsPage: React.FC<EarningDetailsProps> = ({ params }) => {
  const router = useRouter();
  
  // 直接定义静态收益详情数据，不进行数据验证
  const earningDetails: EarningRecord = {
    id: params.id || 'earning-001',
    userId: 'user12345',
    taskId: 'task-12345',
    taskName: '抖音评论任务 - 产品体验反馈',
    amount: 15.80,
    description: '完成产品体验评论任务，提供优质反馈内容',
    createdAt: '2024-03-18T14:30:45Z',
    status: 'completed',
    type: 'comment',
    commissionInfo: {
      hasCommission: true,
      commissionRate: 0.08,
      commissionAmount: 1.26,
      commissionRecipient: 'system'
    }
  };
  
  // 使用mock-1的数据作为备用
  if (params.id === 'mock-1') {
    earningDetails.taskName = '抖音评论任务 - 产品体验反馈';
    earningDetails.amount = 12.50;
    earningDetails.description = '完成产品体验评论任务';
    earningDetails.createdAt = '2024-03-15T10:23:45Z';
    earningDetails.commissionInfo!.commissionRate = 0.1;
    earningDetails.commissionInfo!.commissionAmount = 1.25;
  }

  // 格式化日期时间
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}年${String(date.getMonth() + 1).padStart(2, '0')}月${String(date.getDate()).padStart(2, '0')}日 ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  // 获取任务类型标签信息
  const getTaskTypeLabel = (type?: string) => {
    switch (type) {
      case 'comment':
        return '评论任务';
      case 'video':
        return '视频推荐';
      case 'account_rental':
        return '租号任务';
      case 'commission':
        return '佣金收入';
      default:
        return '普通任务';
    }
  };

  // 获取状态显示文本
  const getStatusText = (status?: string) => {
    if (!status) return '未知';
    switch (status) {
      case 'completed':
        return '已到账';
      case 'processing':
        return '处理中';
      case 'pending':
        return '待处理';
      case 'failed':
        return '失败';
      default:
        return status;
    }
  };

  // 获取状态显示样式
  const getStatusStyle = (status?: string) => {
    if (!status) return 'text-gray-600 bg-gray-50';
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50';
      case 'processing':
        return 'text-blue-600 bg-blue-50';
      case 'pending':
        return 'text-orange-600 bg-orange-50';
      case 'failed':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  // 处理返回按钮点击
  const handleBack = () => {
    // 优先返回上一页，如果没有历史记录则跳转到收益页面的明细选项卡
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/commenter/earnings?tab=details');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 pb-20">
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
        {/* 顶部导航 */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={handleBack}
            className="p-2 rounded-full hover:bg-gray-100 focus:outline-none"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 className="text-lg font-medium text-gray-900">收益详情</h2>
          <div className="w-8"></div> {/* 占位元素，保持标题居中 */}
        </div>

        {/* 收益金额卡片 */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6">
          <div className="p-6">
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-2">收益金额</p>
              <div className="text-4xl font-bold text-green-600">¥{earningDetails.amount.toFixed(2)}</div>
            </div>
            
            {/* 状态标签 */}
            <div className="mt-4 flex justify-center">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusStyle(earningDetails.status)}`}>
                {getStatusText(earningDetails.status)}
              </span>
            </div>
          </div>
        </div>

        {/* 详细信息 */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-4">交易详情</h3>
            
            {/* 交易信息列表 */}
            <div className="space-y-4">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">交易类型</span>
                <span className="text-sm font-medium text-gray-900">{getTaskTypeLabel(earningDetails.type)}</span>
              </div>
              
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">任务名称</span>
                <span className="text-sm font-medium text-gray-900">{earningDetails.taskName}</span>
              </div>
              
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">任务编号</span>
                <span className="text-sm font-medium text-gray-900">{earningDetails.taskId}</span>
              </div>
              
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">描述</span>
                <span className="text-sm font-medium text-gray-900">{earningDetails.description}</span>
              </div>
              
              {/* 佣金信息（如果有） */}
              {earningDetails.commissionInfo && earningDetails.commissionInfo.hasCommission && (
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-500">佣金信息</span>
                  <span className="text-sm font-medium text-yellow-600">
                    {earningDetails.commissionInfo.commissionAmount.toFixed(2)} ({earningDetails.commissionInfo.commissionRate * 100}%)
                  </span>
                </div>
              )}
              
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">交易时间</span>
                <span className="text-sm font-medium text-gray-900">{formatDateTime(earningDetails.createdAt)}</span>
              </div>
              
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">交易单号</span>
                <span className="text-sm font-medium text-gray-900">{earningDetails.id}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EarningDetailsPage;