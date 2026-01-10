'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// 定义API响应数据类型
interface TransactionRecord {
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

interface ApiResponse {
  code: number;
  message: string;
  data: {
    list: TransactionRecord[];
    total: number;
    page: number;
    size: number;
    pages: number;
  };
  success: boolean;
  timestamp: number;
}

export default function AdminProcessWithdrawPage() {
  const router = useRouter();
  // 状态管理
  const [transactionRecords, setTransactionRecords] = useState<TransactionRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 获取交易流水记录
  const fetchTransactionRecords = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api//walletmanagement/transactionrecord', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            transactionType: 'RECHARGE',
            page: 1,
            size: 10
          })
        });
      console.log('请求URL:', '/api//walletmanagement/transactionrecord');
      console.log('请求体:', JSON.stringify({
        transactionType: 'RECHARGE',
        page: 1,
        size: 10
      }));
      console.log('响应状态:', response.status);
      
      // 只读取一次response body
      const data: ApiResponse = await response.json();
      console.log('响应体:', data);
      console.log('API响应:', data);
      if (data.success) {
        setTransactionRecords(data.data.list);
      } else {
        setError(data.message || '获取数据失败');
      }
    } catch (err) {
      setError('网络请求失败，请稍后重试');
      console.error('API请求失败：', err);
    } finally {
      setLoading(false);
    }
  };

  // 在组件挂载时获取数据
  useEffect(() => {
    fetchTransactionRecords();
  }, []);

  

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-blue-100 text-blue-600';
      case 'SUCCESS': return 'bg-green-100 text-green-600';
      case 'CANCELLED': return 'bg-green-100 text-green-600';
      case 'FAILED': return 'bg-red-100 text-red-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  // 处理复制订单编号
  const handleCopyOrderNo = (orderNo: string) => {
    navigator.clipboard.writeText(orderNo)
      .then(() => {
        // 可以添加一个复制成功的提示
        console.log('订单编号已复制');
      })
      .catch(err => {
        console.error('复制失败:', err);
      });
  };

  return (
    <div className="pb-20">
      
      {/* 充值申请列表 */}
      <div className="mx-4 mt-6">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-4 border-b">
            <h3 className="font-bold text-gray-800">充值申请管理</h3>
          </div>
          <div className="divide-y max-h-96 overflow-y-auto">
            {/* 加载状态 */}
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                <span className="ml-2 text-gray-600">加载中...</span>
              </div>
            ) : error ? (
              /* 错误状态 */
              <div className="flex justify-center items-center py-8">
                <span className="text-red-600">{error}</span>
              </div>
            ) : transactionRecords.length > 0 ? (
              /* 交易记录列表 */
              transactionRecords.map((record) => (
                <div key={record.orderNo} className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-gray-800">{record.description}</span>
                        <span className={`text-xs px-2 py-1 rounded ${getStatusColor(record.status)}`}>
                          {record.statusDescription}
                        </span>
                      </div>
                      <div className="text-sm space-y-1">
                        <div>充值申请编号：{record.orderNo} <button onClick={() => handleCopyOrderNo(record.orderNo)} className="text-blue-500 hover:text-blue-700 ml-2 text-xs">复制</button></div>
                        <div>充值金额：¥{record.amount.toFixed(2)}</div>
                        <div>充值到：{record.channel === 'ALIPAY' ? '支付宝 ' : '银行卡 '}</div>
                        <div>申请时间：{record.createTime}</div>
                        <div>处理时间：{record.updateTime}</div>                
                      </div>
                    </div>
                  </div>

                  {/* 充值按钮 */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => router.push(`/admin/recharge?orderNo=${record.orderNo}`)}
                      className="flex-1 bg-blue-500 text-white py-2 rounded font-medium hover:bg-blue-600 transition-colors text-sm"
                    >
                      💳 充值
                    </button>
                  </div>
                </div>
              ))
            ) : (
              /* 空数据状态 */
              <div className="flex justify-center items-center py-8">
                <span className="text-gray-500">暂无待充值记录</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 充值统计 */}
      <div className="mx-4 mt-6">
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-4">充值统计</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-3 bg-orange-50 rounded">
              <div className="text-lg font-bold text-orange-600">2</div>
              <div className="text-xs text-gray-500">待审核</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded">
              <div className="text-lg font-bold text-green-600">¥15,678</div>
              <div className="text-xs text-gray-500">今日已处理</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded">
              <div className="text-lg font-bold text-blue-600">95.6%</div>
              <div className="text-xs text-gray-500">通过率</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded">
              <div className="text-lg font-bold text-purple-600">2.4小时</div>
              <div className="text-xs text-gray-500">平均处理时间</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
