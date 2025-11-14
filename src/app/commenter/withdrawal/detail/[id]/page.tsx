'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

interface WithdrawalDetail extends WithdrawalRecord {
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED';
  fee?: number;
  balanceAfter?: number;
  remark?: string;
}

interface WithdrawalRecord {
  id: string;
  amount: number;
  method: 'bank' | 'alipay';
  target: string;
  targetName?: string;
  applyTime: string;
  processTime?: string;
  completeTime?: string;
  orderId: string;
}

const WithdrawalDetailPage = () => {
  const router = useRouter();
  const params = useParams();
  const { id } = params as { id: string };
  const [detail, setDetail] = useState<WithdrawalDetail | null>(null);
  const [loading, setLoading] = useState(true);

  // 从API获取提现详情数据
  useEffect(() => {
    const fetchWithdrawalDetail = async () => {
      setLoading(true);
      try {
        // 调用真实API获取提现详情
        const response = await fetch('/api/public/walletmanagement/transactionrecord', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            transactionType: 'withdrawal',
            page: 1,
            size: 100
          })
        });

        if (!response.ok) {
          throw new Error('获取提现详情失败');
        }

        const data = await response.json();
        // 在所有记录中查找当前ID对应的记录
        const record = data.data.records.find((record: any) => record.id === id);
        setDetail(record || null);
      } catch (error) {
        console.error('获取提现详情失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWithdrawalDetail();
  }, [id]);

  // 获取状态文本和样式
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'PENDING':
        return { text: '待处理', color: 'text-yellow-500' };
      case 'SUCCESS':
        return { text: '已完成', color: 'text-green-500' };
      case 'FAILED':
        return { text: '已失败', color: 'text-red-500' };
      case 'CANCELLED':
        return { text: '已取消', color: 'text-gray-500' };
      default:
        return { text: '未知', color: 'text-gray-500' };
    }
  };

  // 获取时间线数据
  const getTimelineItems = () => {
    if (!detail) return [];

    const items = [
      {
        title: '发起提现',
        time: detail.applyTime,
        completed: true
      },
      {
        title: '银行处理中',
        time: detail.processTime,
        completed: detail.status !== 'PENDING'
      },
      {
        title: '到账',
        time: detail.completeTime,
        completed: detail.status === 'SUCCESS'
      }
    ];

    return items;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-4 px-3">
        <div className="flex items-center mb-6">
          <button 
            onClick={() => router.back()} 
            className="mr-2 p-1 rounded-full hover:bg-gray-200"
          >
            ←
          </button>
          <h1 className="text-xl font-medium">提现详情</h1>
        </div>
        <div className="flex justify-center items-center py-12">
          <p className="text-gray-500">加载中...</p>
        </div>
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="min-h-screen bg-gray-50 py-4 px-3">
        <div className="flex items-center mb-6">
          <button 
            onClick={() => router.back()} 
            className="mr-2 p-1 rounded-full hover:bg-gray-200"
          >
            ←
          </button>
          <h1 className="text-xl font-medium">提现详情</h1>
        </div>
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-lg">
          <p className="text-gray-500">找不到该提现记录</p>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo(detail.status);
  const timelineItems = getTimelineItems();

  return (
    <div className="min-h-screen bg-gray-50 py-4 px-3">
      {/* 页面标题 */}
      <div className="mb-6">
        <div className="flex items-center mb-2">
          <button 
            onClick={() => router.back()} 
            className="mr-2 p-1 rounded-full hover:bg-gray-200"
          >
            ←
          </button>
          <h1 className="text-xl font-medium">提现详情</h1>
        </div>
      </div>

      {/* 提现金额和状态 */}
      <Card className="mb-6">
        <div className="p-6 flex flex-col items-center">
          <div className="text-4xl font-medium text-gray-900 mb-2">
            -¥{detail.amount.toFixed(2)}
          </div>
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center mr-2">
              <span className="text-yellow-600">¥</span>
            </div>
            <div>
              <div className="font-medium">
                {detail.method === 'bank' ? '银行卡提现' : '支付宝提现'}
                -{detail.targetName}
              </div>
              <div className={`text-sm ${statusInfo.color} font-medium`}>
                {statusInfo.text}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* 状态时间线 */}
      <Card className="mb-6">
        <div className="p-4">
          <h2 className="text-base font-medium mb-4">当前状态</h2>
          <div className="relative">
            {timelineItems.map((item, index) => {
              const isLast = index === timelineItems.length - 1;
              return (
                <div key={index} className="flex mb-6">
                  <div className="flex flex-col items-center mr-4">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${item.completed ? 'bg-green-500' : 'bg-gray-200'}`}>
                      {item.completed && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
                    </div>
                    {!isLast && (
                      <div className={`w-0.5 flex-grow ${item.completed && timelineItems[index + 1].completed ? 'bg-green-500' : 'bg-gray-200'}`} />
                    )}
                  </div>
                  <div className="flex-1 pb-6">
                    <div className={`font-medium ${item.completed ? 'text-gray-900' : 'text-gray-500'}`}>
                      {item.title}
                    </div>
                    {item.time && (
                      <div className="text-sm text-gray-500 mt-1">
                        {item.time}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* 提现信息详情 */}
      <Card className="mb-6">
        <div className="p-4">
          <h2 className="text-base font-medium mb-4">提现信息</h2>
          <div className="space-y-3">
            <div className="flex justify-between py-1 border-b border-gray-100">
              <span className="text-gray-500">提现金额</span>
              <span>¥{detail.amount.toFixed(2)}</span>
            </div>
            {detail.fee !== undefined && (
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-500">服务费</span>
                <span>¥{detail.fee.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between py-1 border-b border-gray-100">
              <span className="text-gray-500">申请时间</span>
              <span>{detail.applyTime}</span>
            </div>
            {detail.completeTime && (
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-500">到账时间</span>
                <span>{detail.completeTime}</span>
              </div>
            )}
            <div className="flex justify-between py-1 border-b border-gray-100">
              <span className="text-gray-500">提现{detail.method === 'bank' ? '银行' : '账户'}</span>
              <span>{detail.targetName}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-gray-100">
              <span className="text-gray-500">{detail.method === 'bank' ? '银行卡号' : '支付宝账号'}</span>
              <span>{detail.target}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-gray-100">
              <span className="text-gray-500">提现单号</span>
              <span className="text-sm">{detail.orderId}</span>
            </div>
            {detail.balanceAfter !== undefined && (
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-500">零钱余额</span>
                <span>{detail.balanceAfter.toFixed(2)}</span>
              </div>
            )}
            {detail.remark && (
              <div className="py-1 border-b border-gray-100">
                <div className="text-gray-500 mb-1">备注</div>
                <div className="text-red-500">{detail.remark}</div>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* 底部提示 */}
      <div className="mt-6 text-center text-xs text-gray-500">
        <p>如有疑问，请联系客服</p>
      </div>
    </div>
  );
};

export default WithdrawalDetailPage;