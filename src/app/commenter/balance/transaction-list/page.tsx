'use client';
import * as React from 'react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card } from 'antd';

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

interface TransactionResponse {
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

const TransactionListPage = () => {
  const router = useRouter();
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('all');

  // 从createTime中提取日期和时间
  const extractDateTime = (createTime: string) => {
    const date = new Date(createTime);
    return {
      date: date.toISOString().split('T')[0],
      time: date.toTimeString().split(' ')[0].substring(0, 5)
    };
  };

  // 格式化日期显示
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return '今天';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return '昨天';
    } else {
      return date.toLocaleDateString('zh-CN', {
        month: '2-digit',
        day: '2-digit'
      });
    }
  };

  // 获取交易图标（统一使用￥符号和黄色背景）
  const getTransactionIcon = () => {
    return {
      icon: '￥',
      color: 'text-white',
      bgColor: 'bg-yellow-500'
    };
  };

  // 处理查看交易详情
  const handleViewTransaction = (orderNo: string) => {
    router.push(`/commenter/balance/transaction-details/${orderNo}` as any);
  };


  // 获取交易记录数据
  useEffect(() => {
    const fetchTransactionRecords = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // 调用后端API获取交易记录
        const response = await fetch(
          '/api/public/walletmanagement/transactionrecord',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              page: 1,
              size: 50, // 请求更多数据以便筛选
              sort: 'createTime',
              order: 'desc'
            })
          }
        );
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data: TransactionResponse = await response.json();
        
        if (!data.success) {
          throw new Error(data.message || '获取交易记录失败');
        }
        
        // 按创建时间倒序排序
        // 计算一年前的日期
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        
        const sortedTransactions = data.data.list
          // 只保留最近一年的记录
          .filter(transaction => new Date(transaction.createTime) >= oneYearAgo)
          // 按创建时间倒序排序
          .sort((a, b) => new Date(b.createTime).getTime() - new Date(a.createTime).getTime())
        
        setTransactions(sortedTransactions);
      } catch (err) {
        setError(err instanceof Error ? err.message : '获取交易记录失败');
        console.error('获取交易记录失败:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactionRecords();
  }, []);

  // 返回上一页
  const handleBack = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-gray-50">
     
      {/* 交易记录 */}
      <div className="mt-3 bg-white">
        <div className="px-4 py-3 border-b border-gray-100">
          <div className="grid w-full grid-cols-3 border-b border-gray-100">
            <button 
              className={`py-2 px-4 text-sm ${activeTab === 'all' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
              onClick={() => setActiveTab('all')}
            >
              全部明细
            </button>
            <button 
              className={`py-2 px-4 text-sm ${activeTab === 'recharge' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
              onClick={() => setActiveTab('recharge')}
            >
              收入明细
            </button>
            <button 
              className={`py-2 px-4 text-sm ${activeTab === 'withdraw' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
              onClick={() => setActiveTab('withdraw')}
            >
              支出明细
            </button>
          </div>
        </div>

        {/* 交易记录列表 */}
        <div>
          {loading ? (
            // 加载状态 - 优化为显示8个骨架屏，更接近实际内容数量
            <div className="px-4 py-3">
              <div className="flex justify-between items-center mb-2">
                <div className="text-xs text-gray-500 animate-pulse">加载中...</div>
                <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="space-y-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="flex items-center py-3 animate-pulse">
                    <div className="h-8 w-8 rounded-full bg-yellow-100 mr-3" />
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-2">
                        <div className="h-4 bg-gray-200 rounded w-1/3" />
                        <div className="h-4 bg-gray-200 rounded w-1/6" />
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="h-3 bg-gray-200 rounded w-1/4" />
                        <div className="h-3 bg-gray-200 rounded w-1/4" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : error ? (
            // 错误状态
            <div className="py-12 px-4 text-center">
              <div className="text-5xl mb-3">⚠️</div>
              <h3 className="text-lg font-medium text-gray-800 mb-1">获取失败</h3>
              <p className="text-gray-500 text-sm mb-4">{error}</p>
              <Button
                onClick={() => window.location.reload()}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                重试
              </Button>
            </div>
          ) : transactions.length === 0 ? (
            // 空状态
            <div className="py-12 px-4 text-center">
              <div className="text-5xl mb-3">📝</div>
              <h3 className="text-lg font-medium text-gray-800 mb-1">暂无交易记录</h3>
              <p className="text-gray-500 text-sm mb-4">您还没有任何交易记录</p>
            </div>
          ) : (
            // 根据当前tab过滤交易记录 - 显示最多20条最新记录
            <div>
              {/* 显示交易记录总数信息 */}
              <div className="px-4 py-2 border-b border-gray-100 bg-gray-50">
                <div className="text-xs text-gray-500">
                  共显示最近一年的 {transactions.filter(t => {
                    const isIncome = t.amount > 0;
                    if (activeTab === 'recharge') return isIncome;
                    if (activeTab === 'withdraw') return !isIncome && t.amount < 0;
                    return true;
                  }).length} 条记录
                </div>
              </div>
              
              {transactions
                .filter(transaction => {
                  // 判断是否为收入记录（金额大于0）
                  const isIncome = transaction.amount > 0;
                  
                  // 根据当前activeTab进行过滤
                  if (activeTab === 'recharge') {
                    // 收入明细：只显示金额大于0的记录
                    return isIncome;
                  } else if (activeTab === 'withdraw') {
                    // 支出明细：只显示金额小于0的记录
                    return !isIncome && transaction.amount < 0;
                  }
                  // 全部明细：显示所有记录
                  return true;
                })
                // 移除slice(0, 10)限制，因为我们在API请求后已经限制了最多20条最新记录
                .map((transaction) => {
                  const iconInfo = getTransactionIcon();
                  const isIncome = transaction.amount > 0;
                  const { date, time } = extractDateTime(transaction.createTime);
                  
                  return (
                    <div 
                      key={transaction.orderNo}
                      onClick={() => handleViewTransaction(transaction.orderNo)}
                      className="px-4 py-3 border-b border-gray-50 hover:bg-blue-50 flex items-center transition-colors duration-200"
                    >
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center ${iconInfo.bgColor} mr-3 text-lg font-bold`}>
                        <span className={iconInfo.color}>{iconInfo.icon}</span>
                      </div>
                          
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="font-medium text-gray-900 truncate max-w-[60%]">{transaction.description || transaction.typeDescription}</h3>
                          <span className={`font-medium ${isIncome ? 'text-green-600' : 'text-red-600'}`}>
                            {isIncome ? '+' : ''}{transaction.amount.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="text-xs text-gray-500">
                            {formatDate(date)} {time}
                          </div>
                          <div className="text-xs text-gray-500">
                            余额: {transaction.afterBalance.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </div>

      {/* 底部提示 */}
      <div className="px-4 py-4 text-center text-xs text-gray-500">
        <p>交易记录保存期限为12个月</p>
      </div>
    </div>
  );
};

export default TransactionListPage;
