'use client';
import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import type { WithdrawalRecord } from '../../page';

interface WithdrawalDetailsPageProps {
  // 这里可以定义页面需要的props
}

// 丰富的静态提现明细数据
const mockWithdrawalDetails: Record<string, WithdrawalRecord> = {
  'wd-1': {
    id: 'wd-1',
    userId: 'user1',
    amount: 100.50,
    fee: 2.00,
    method: 'wechat',
    status: 'approved',
    requestedAt: '2024-03-10T10:25:30Z',
    processedAt: '2024-03-10T11:45:15Z',
    description: '月度提现 - 生活费用',
    totalAmount: 998.50
  },
  'wd-2': {
    id: 'wd-2',
    userId: 'user1',
    amount: 50.00,
    fee: 1.00,
    method: 'alipay',
    status: 'approved',
    requestedAt: '2024-02-28T15:30:00Z',
    processedAt: '2024-02-29T09:00:00Z',
    description: '购物消费',
    totalAmount: 499.00
  },
  'wd-3': {
    id: 'wd-3',
    userId: 'user1',
    amount: 20.00,
    fee: 0.50,
    method: 'bank',
    status: 'pending',
    requestedAt: '2024-03-15T14:20:00Z',
    processedAt: undefined,
    description: '房租支付',
    totalAmount: 199.50
  }
};

// 默认提现详情数据，用于任何未找到的ID
const defaultWithdrawalDetails: WithdrawalRecord = {
  id: 'default-wd',
  userId: 'user1',
  amount: 88.88,
  fee: 1.50,
  method: 'wechat',
  status: 'approved',
  requestedAt: '2024-03-12T14:30:00Z',
  processedAt: '2024-03-12T16:15:00Z',
  description: '测试提现记录',
  totalAmount: 87.38
};

// 格式化日期时间
const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

// 获取提现方式标签
const getWithdrawalMethodLabel = (method: string) => {
  switch (method) {
    case 'wechat':
      return '微信';
    case 'alipay':
      return '支付宝';
    case 'bank':
      return '银行卡';
    default:
      return '其他';
  }
};

// 获取提现状态信息
const getStatusInfo = (status: string) => {
  switch (status) {
    case 'completed':
    case 'approved':
      return {
        label: '已完成',
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        icon: (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        )
      };
    case 'pending':
      return {
        label: '处理中',
        color: 'text-orange-600',
        bgColor: 'bg-orange-100',
        icon: (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      };
    case 'rejected':
    case 'failed':
      return {
        label: '已拒绝',
        color: 'text-red-600',
        bgColor: 'bg-red-100',
        icon: (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        )
      };
    default:
      return {
        label: '未知',
        color: 'text-gray-600',
        bgColor: 'bg-gray-100',
        icon: null
      };
  }
};

const WithdrawalDetailsPage: React.FC<WithdrawalDetailsPageProps> = () => {
  const router = useRouter();
  const params = useParams();
  const withdrawalId = params?.id as string || 'default';
  
  // 直接使用静态数据，不进行异步加载和验证
  // 如果找不到对应ID的数据，使用默认数据
  const withdrawalDetails = mockWithdrawalDetails[withdrawalId] || defaultWithdrawalDetails;
  
  // 返回上一页 - 优化返回逻辑
  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/commenter/earnings');
    }
  };
  
  
  const methodLabel = getWithdrawalMethodLabel(withdrawalDetails.method);
  const statusInfo = getStatusInfo(withdrawalDetails.status);
  const formattedRequestedAt = formatDateTime(withdrawalDetails.requestedAt);
  const formattedProcessedAt = withdrawalDetails.processedAt ? formatDateTime(withdrawalDetails.processedAt) : '处理中...';
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8 pb-20">
        {/* 页面头部 */}
        <div className="flex items-center mb-6">
          <button 
            onClick={handleBack} 
            className="mr-2 text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="返回"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-bold text-gray-900">提现详情</h1>
        </div>
        
        {/* 提现状态卡片 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col items-center justify-center">
            <div className={`inline-flex items-center justify-center h-16 w-16 rounded-full ${statusInfo.bgColor} ${statusInfo.color} mb-4`}>
              {statusInfo.icon || (
                <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">{methodLabel}提现</h2>
            <div className={`text-sm font-medium ${statusInfo.color} mb-4`}>
              {statusInfo.label}
            </div>
            <div className="text-3xl font-bold text-gray-900">
              ¥{withdrawalDetails.amount.toFixed(2)}
            </div>
          </div>
        </div>
        
        {/* 交易详情列表 */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="divide-y">
            {/* 提现方式 */}
            <div className="p-4 flex justify-between items-center">
              <div className="text-sm text-gray-500">提现方式</div>
              <div className="text-sm font-medium text-gray-900">
                {methodLabel}
              </div>
            </div>
            
            {/* 提现账号 */}
            <div className="p-4 flex justify-between items-center">
              <div className="text-sm text-gray-500">提现账号</div>
              <div className="text-sm font-medium text-gray-900">
                {withdrawalDetails.method === 'wechat' ? '微信昵称：微用户888' : 
                 withdrawalDetails.method === 'alipay' ? '支付宝账号：user***@example.com' : 
                 '银行卡：招商银行(尾号8888)'}
              </div>
            </div>
            
            {/* 实际到账金额 */}
            {withdrawalDetails.totalAmount !== undefined && (
              <div className="p-4 flex justify-between items-center">
                <div className="text-sm text-gray-500">实际到账</div>
                <div className="text-sm font-medium text-green-600">
                  ¥{withdrawalDetails.totalAmount.toFixed(2)}
                </div>
              </div>
            )}
            
            {/* 交易单号 */}
            <div className="p-4 flex justify-between items-center">
              <div className="text-sm text-gray-500">提现单号</div>
              <div className="text-sm font-medium text-gray-900">
                {withdrawalDetails.id}
              </div>
            </div>
            
            {/* 提现金额 */}
            <div className="p-4 flex justify-between items-center">
              <div className="text-sm text-gray-500">提现金额</div>
              <div className="text-sm font-medium text-gray-900">
                ¥{withdrawalDetails.amount.toFixed(2)}
              </div>
            </div>
            
            {/* 手续费 */}
            {withdrawalDetails.fee > 0 && (
              <div className="p-4 flex justify-between items-center">
                <div className="text-sm text-gray-500">手续费</div>
                <div className="text-sm font-medium text-gray-900">
                  ¥{withdrawalDetails.fee.toFixed(2)}
                </div>
              </div>
            )}
            
            {/* 申请时间 */}
            <div className="p-4 flex justify-between items-center">
              <div className="text-sm text-gray-500">申请时间</div>
              <div className="text-sm font-medium text-gray-900">
                {formattedRequestedAt}
              </div>
            </div>
            
            {/* 处理时间 */}
            {(withdrawalDetails.status === 'approved' || withdrawalDetails.status === 'rejected') && (
              <div className="p-4 flex justify-between items-center">
                <div className="text-sm text-gray-500">处理时间</div>
                <div className="text-sm font-medium text-gray-900">
                  {formattedProcessedAt}
                </div>
              </div>
            )}
            
            {/* 提现说明 */}
            {withdrawalDetails.description && (
              <div className="p-4 flex justify-between items-center">
                <div className="text-sm text-gray-500">提现说明</div>
                <div className="text-sm font-medium text-gray-900">
                  {withdrawalDetails.description}
                </div>
              </div>
            )}
            

          </div>
        </div>
        
        {/* 底部操作按钮 */}
        <div className="flex justify-center space-x-4 pt-4">
          {withdrawalDetails.status === 'pending' && (
            <button
              type="button"
              className="inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              取消申请
            </button>
          )}
          <button
            type="button"
            className="inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            onClick={() => {
              if (window.history.length > 1) {
                router.back();
              } else {
                router.push('/commenter/earnings');
              }
            }}
          >
            返回提现页
          </button>
        </div>
      </div>
    </div>
  );
};

export default WithdrawalDetailsPage;