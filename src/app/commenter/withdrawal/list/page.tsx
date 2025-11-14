'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface WithdrawalRecord {
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

const WithdrawalListPage = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'PENDING' | 'SUCCESS'>('PENDING');
  const [records, setRecords] = useState<WithdrawalRecord[]>([]);
  const [loading, setLoading] = useState(false);

  // 获取提现记录数据
  useEffect(() => {
    const fetchWithdrawalRecords = async () => {
      setLoading(true);
      try {
        // 调用真实API获取提现记录
        const response = await fetch('/api/public/walletmanagement/transactionrecord', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            transactionType: 'WITHDRAW',
            page: 1,
            size: 10
          })
        });

        if (!response.ok) {
          throw new Error('获取提现记录失败');
        }

        const data = await response.json();
        setRecords(data.data.list || []);
      } catch (error) {
        console.error('获取提现记录失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWithdrawalRecords();
  }, []);

  // 根据当前选项卡筛选记录
  const filteredRecords = records.filter(record => {
    if (activeTab === 'PENDING') {
      return record.status === 'PENDING';
    } else {
      return record.status === 'SUCCESS';
    }
  });

  // 获取状态文本和样式
  const getStatusInfo = (status: string, statusDescription: string) => {
    // 根据status设置颜色
    let color = 'bg-gray-100 text-gray-800 border-gray-200';
    if (status === 'PENDING' || status.includes('PENDING') || status.includes('processing')) {
      color = 'bg-yellow-100 text-yellow-800 border-yellow-200';
    } else if (status === 'SUCCESS' || status.includes('success') || status.includes('SUCCESS')) {
      color = 'bg-green-100 text-green-800 border-green-200';
    } else if (status === 'FAILED' || status.includes('failed') || status.includes('error')) {
      color = 'bg-red-100 text-red-800 border-red-200';
    } else if (status === 'CANCELLED' || status.includes('cancelled') || status.includes('cancel')) {
      color = 'bg-gray-100 text-gray-800 border-gray-200';
    }
    // 使用statusDescription作为显示文本，如果没有则使用默认
    const text = statusDescription || '未知状态';
    return { text, color };
  };



  // 处理记录点击，跳转到详情页并传递数据
  const handleRecordClick = (record: WithdrawalRecord) => {
    console.log('【列表页】准备传递的数据:', record);
    console.log('【列表页】路由push参数:', {
      pathname: `/commenter/withdrawal/detail/${record.orderNo}`,
      state: record
    });
    (router as any).push(`/commenter/withdrawal/detail/${record.orderNo}`, { state: record });
  };

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
          <h1 className="text-xl font-medium">提现记录</h1>
        </div>
      </div>

      {/* 选项卡 */}
      <div className="flex border-b mb-6">
        <button
          className={`py-3 px-6 font-medium text-sm transition-colors ${activeTab === 'PENDING' 
            ? 'border-b-2 border-blue-600 text-blue-600' 
            : ' hover:text-gray-700'}`}
          onClick={() => setActiveTab('PENDING')}
        >
          待审核
        </button>
        <button
          className={`py-3 px-6 font-medium text-sm transition-colors ${activeTab === 'SUCCESS' 
            ? 'border-b-2 border-blue-600 text-blue-600' 
            : ' hover:text-gray-700'}`}
          onClick={() => setActiveTab('SUCCESS')}
        >
          已提现
        </button>
      </div>

      {/* 提现记录列表 */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <p className="">加载中...</p>
        </div>
      ) : filteredRecords.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-lg">
          <p className="">暂无提现记录</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRecords.map(record => {
            const statusInfo = getStatusInfo(record.status, record.statusDescription);
            return (
              <Card 
                key={record.orderNo}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleRecordClick(record)}
              >
                <div className="">
                  <div className="flex justify-end mb-1">
                    <span className={`px-2 py-1 rounded text-xs ${statusInfo.color}`}>{statusInfo.text}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="overflow-hidden text-ellipsis whitespace-nowrap max-w-[200px]">{record.channel === 'ALIPAY' ? '支付宝 ' : '银行卡 '}{record.description}</span>
                    <span className="text-lg font-medium">¥{record.amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm ">
                    <span>申请时间: {record.createTime}</span>
                    <span>余额: {record.afterBalance.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>订单号: {record.orderNo}</span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default WithdrawalListPage;