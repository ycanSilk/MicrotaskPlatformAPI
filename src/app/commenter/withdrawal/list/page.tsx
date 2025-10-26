'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface WithdrawalRecord {
  id: string;
  amount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  method: 'bank' | 'alipay';
  target: string; // 银行卡号或支付宝账号
  applyTime: string;
  processTime?: string;
  completeTime?: string;
  fee?: number;
  orderId: string;
  balanceAfter?: number; // 提现后的余额
}

const WithdrawalListPage = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending');
  const [records, setRecords] = useState<WithdrawalRecord[]>([]);
  const [loading, setLoading] = useState(false);

  // 模拟获取提现记录数据
  useEffect(() => {
    const fetchWithdrawalRecords = async () => {
      setLoading(true);
      try {
        // 模拟网络请求延迟
        await new Promise(resolve => setTimeout(resolve, 800));

        // 模拟提现记录数据
        const mockRecords: WithdrawalRecord[] = [
          {
            id: '1',
            amount: 500,
            status: 'pending',
            method: 'bank',
            target: '工商银行 ****5678',
            applyTime: '2024-01-15 14:30:25',
            orderId: 'WD202401150001',
            balanceAfter: 798.00
          },
          {
            id: '2',
            amount: 300,
            status: 'processing',
            method: 'alipay',
            target: '138****5678',
            applyTime: '2024-01-14 09:15:42',
            processTime: '2024-01-14 09:16:00',
            orderId: 'WD202401140002',
            balanceAfter: 1098.00
          },
          {
            id: '3',
            amount: 1000,
            status: 'completed',
            method: 'bank',
            target: '建设银行 ****1234',
            applyTime: '2024-01-10 16:45:18',
            processTime: '2024-01-10 16:46:00',
            completeTime: '2024-01-11 09:30:00',
            fee: 2.5,
            orderId: 'WD202401100003',
            balanceAfter: 252.52
          },
          {
            id: '4',
            amount: 200,
            status: 'completed',
            method: 'alipay',
            target: '138****5678',
            applyTime: '2024-01-05 11:20:33',
            processTime: '2024-01-05 11:21:00',
            completeTime: '2024-01-05 11:30:00',
            fee: 0.5,
            orderId: 'WD202401050004',
            balanceAfter: 0.00
          },
          {
            id: '5',
            amount: 100,
            status: 'failed',
            method: 'bank',
            target: '工商银行 ****5678',
            applyTime: '2024-01-01 15:00:00',
            processTime: '2024-01-01 15:01:00',
            orderId: 'WD202401010005',
            balanceAfter: 200.50
          }
        ];

        setRecords(mockRecords);
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
    if (activeTab === 'pending') {
      return record.status === 'pending' || record.status === 'processing';
    } else {
      return record.status === 'completed' || record.status === 'failed';
    }
  });

  // 获取状态文本和样式
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return { text: '待处理', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
      case 'processing':
        return { text: '处理中', color: 'bg-blue-100 text-blue-800 border-blue-200' };
      case 'completed':
        return { text: '已完成', color: 'bg-green-100 text-green-800 border-green-200' };
      case 'failed':
        return { text: '已失败', color: 'bg-red-100 text-red-800 border-red-200' };
      default:
        return { text: '未知', color: 'bg-gray-100 text-gray-800 border-gray-200' };
    }
  };

  // 获取提现方式文本
  const getMethodText = (method: string) => {
    return method === 'bank' ? '银行卡' : '支付宝';
  };

  // 处理记录点击，跳转到详情页
  const handleRecordClick = (id: string) => {
    router.push(`/commenter/withdrawal/detail/${id}`);
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
          className={`py-3 px-6 font-medium text-sm transition-colors ${activeTab === 'pending' 
            ? 'border-b-2 border-blue-600 text-blue-600' 
            : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('pending')}
        >
          待提现
        </button>
        <button
          className={`py-3 px-6 font-medium text-sm transition-colors ${activeTab === 'completed' 
            ? 'border-b-2 border-blue-600 text-blue-600' 
            : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('completed')}
        >
          已提现
        </button>
      </div>

      {/* 提现记录列表 */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <p className="text-gray-500">加载中...</p>
        </div>
      ) : filteredRecords.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-lg">
          <p className="text-gray-500">暂无提现记录</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRecords.map(record => {
            const statusInfo = getStatusInfo(record.status);
            return (
              <Card 
                key={record.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleRecordClick(record.id)}
              >
                <div className="">
                    <div className="flex justify-between items-center mb-3">
                      <span className="overflow-hidden text-ellipsis whitespace-nowrap max-w-[200px]">{record.method === 'alipay' ? '支付宝 ' : ''}{record.target.replace(/^\w+\s/, '')}</span>
                      <span className="text-lg font-medium">¥{record.amount.toFixed(2)}</span>
                    </div>
                  
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>{record.applyTime}</span>
                    {record.balanceAfter !== undefined && (
                      <span>余额 {record.balanceAfter.toFixed(2)}</span>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* 底部操作按钮 */}
      <div className="mt-8">
        <Button
          onClick={() => router.push('/commenter/withdrawal')}
          className="w-full py-6 text-lg font-medium bg-blue-600 hover:bg-blue-700 text-white"
        >
          申请提现
        </Button>
      </div>
    </div>
  );
};

export default WithdrawalListPage;