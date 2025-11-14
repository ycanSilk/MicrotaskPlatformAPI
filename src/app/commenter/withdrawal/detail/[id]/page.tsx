'use client';
import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

// 调试日志辅助函数
const log = (message: string, data?: any) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`, data || '');
};

// 与列表页统一的数据接口定义
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

const WithdrawalDetailPage = () => {
  const router = useRouter();
  const params = useParams() as { id: string };
  const orderNo = params.id;
  const [record, setRecord] = useState<WithdrawalRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // 从API获取提现记录数据
  useEffect(() => {
    log('提现详情页初始化');
    log('获取的orderNo:', orderNo);
    
    const fetchRecord = async () => {
      try {
        const response = await fetch('/api/public/walletmanagement/transactionrecord', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ orderNo, page: 1, size: 1 }),
        });
        
        const result = await response.json();
        log('API响应:', result);
        
        // 首先检查HTTP响应是否成功
        if (!response.ok) {
          log('API请求失败，HTTP状态:', response.status);
          setError(true);
        } else {
          // 检查API返回的业务码
          if (result.code === 200 && result.data && result.data.list && result.data.list.length > 0) {
            log('设置record:', result.data.list[0]);
            setRecord(result.data.list[0]);
          } else {
            log('API返回业务码:', result.code);
            setError(true);
          }
        }
      } catch (err) {
        log('API请求失败:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    
    if (orderNo) {
      fetchRecord();
    } else {
      setLoading(false);
      setError(true);
    }
  }, [orderNo]);
  
  // 如果正在加载，显示加载中
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
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-lg">
          <p className="text-gray-500">加载中...</p>
        </div>
      </div>
    );
  }
  
  // 如果没有数据，返回找不到记录页面
  if (!record) {
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
  
  // 提取需要的字段和转换逻辑
  const method = record.channel === 'ALIPAY' ? 'alipay' : 'bank';
  const targetName = record.description.split(' ')[1] || '';
  const target = record.description.split(' ')[2] || '';
  const completeTime = record.status === 'SUCCESS' ? record.updateTime : undefined;
  const balanceAfter = record.afterBalance;
  const orderId = record.orderNo;

  // 计算费用（示例逻辑，根据实际需求修改）
  const fee = 0.00;
  
  // 处理时间信息
  const getProcessTime = () => {
    if (record.status === 'SUCCESS' || record.status === 'FAILED') {
      return completeTime || record.updateTime || '-';
    } else if (record.status === 'PENDING') {
      return '处理中';
    } else {
      return '-';
    }
  };
  
  const processTime = getProcessTime();
  
  // 处理状态颜色
  const getStatusColor = () => {
    switch (record.status) {
      case 'SUCCESS':
        return '#4CAF50';
      case 'FAILED':
        return '#F44336';
      case 'PENDING':
        return '#FFC107';
      case 'CANCELLED':
        return '#9E9E9E';
      default:
        return '#9E9E9E';
    }
  };
  

  // 与列表页统一的状态文本和样式获取函数
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

  // 获取时间线数据
  const getTimelineItems = () => {
    if (!record) return [];
    const items = [
      { title: '发起提现', time: record.createTime, completed: true },
      { title: '银行处理中', time: record.createTime, completed: record.status === 'PENDING' },
      { title: '到账', completed: record.status === 'SUCCESS' }
    ];
    return items;
  };



  const statusInfo = getStatusInfo(record.status, record.statusDescription);
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
          <div className="w-12 h-12 rounded-full bg-yellow-200 flex items-center justify-center border border-yellow-500 border-[5px] mb-5">
              <span className="text-yellow-600">¥</span>
          </div>      
          <div className="items-center">
               余额提现-到{method === 'bank' ? '银行卡' : '支付宝'}
          </div>
          <div className="text-4xl font-medium text-gray-900 mb-2">
            {record.amount.toFixed(2)}
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
        <div className="">
          <div className="space-y-3">
            <div className="flex justify-between py-1 border-b border-gray-100">
              <span className="text-gray-500">提现金额</span>
              <span>¥{record.amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-gray-100">
              <span className="text-gray-500">手续费</span>
              <span>¥3.00</span>
            </div>
            <div className="flex justify-between py-1 border-b border-gray-100">
              <span className="text-gray-500">申请时间</span>
              <span>{record.createTime}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-gray-100">
              <span className="text-gray-500">到账时间</span>
              <span>{record.updateTime}</span>
            </div>
            {completeTime && (
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-500">到账时间</span>
                <span>{completeTime}</span>
              </div>
            )}
            <div className="flex justify-between py-1 border-b border-gray-100">
              <span className="text-gray-500">{method === 'bank' ? '银行账号' : '支付宝'}</span>
              <span>{target}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-gray-100">
              <span className="text-gray-500">提现单号</span>
              <span className="text-sm">{record.orderNo}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-gray-100">
              <span className="text-gray-500">账户余额</span>
              <span className="text-sm text-right">{record.beforeBalance.toFixed(2)}</span>
            </div>
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