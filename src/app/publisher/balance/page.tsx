'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import WalletOutlined from '@ant-design/icons/WalletOutlined';
import CreditCardOutlined from '@ant-design/icons/CreditCardOutlined';
import ArrowUpOutlined from '@ant-design/icons/ArrowUpOutlined';
import ArrowDownOutlined from '@ant-design/icons/ArrowDownOutlined';
import InfoCircleOutlined from '@ant-design/icons/InfoCircleOutlined';
import UndoOutlined from '@ant-design/icons/UndoOutlined';
import ReloadOutlined from '@ant-design/icons/ReloadOutlined';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { Badge } from '@/components/ui/Badge';

// 钱包信息类型定义
interface WalletData {
  userId: string;
  totalBalance: number;
  availableBalance: number;
  frozenBalance: number;
  totalIncome: number;
  totalExpense: number;
  status: string;
  currency: string;
  createTime: string;
}

// API响应类型定义 - 更灵活的接口定义以适应不同的响应格式
interface ApiResponse {
  code?: number;
  message: string;
  data?: WalletData;
  success: boolean;
  timestamp?: number;
}

// 交易记录类型定义
interface Transaction {
  id: string;
  type: 'recharge' | 'withdraw' | 'task_payment' | 'task_income' | 'platform_fee' | 'refund';
  amount: number;
  balanceAfter: number;
  date: string;
  time: string;
  description: string;
  orderId?: string;
  status: 'completed' | 'pending' | 'failed';
}

// 充值记录类型定义
interface RechargeRecord {
  id: string;
  amount: number;
  date: string;
  paymentMethod: string;
  status: 'completed' | 'pending' | 'failed';
  orderId: string;
}

// 提现记录类型定义
interface WithdrawalRecord {
  id: string;
  amount: number;
  date: string;
  bankAccount: string;
  status: 'completed' | 'pending' | 'failed' | 'processing';
  orderId: string;
}

const BalancePage = () => {
  const router = useRouter();
  const [balance, setBalance] = useState<number | null>(null);
  const [frozenBalance, setFrozenBalance] = useState<number | null>(null);
  const [totalBalance, setTotalBalance] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [rechargeRecords, setRechargeRecords] = useState<RechargeRecord[]>([]);
  const [withdrawalRecords, setWithdrawalRecords] = useState<WithdrawalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [walletError, setWalletError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('all');

  // 获取钱包信息
  const fetchWalletInfo = async () => {
    try {
      setLoading(true);
      setWalletError(null);
      console.log('开始获取钱包信息...');
      
      const response = await fetch('/api/public/walletmanagement/getwalletinfo', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include' // 包含cookies以支持HttpOnly Cookie认证
      });
      
      // 无论状态码如何，都尝试解析响应数据
      const data = await response.json();
      
      // 检查响应数据是否包含必要的信息
      if (data && data.success && data.data) {
        console.log('钱包信息获取成功:', data.data);
        // 更新状态数据
        setBalance(data.data.availableBalance);
        setFrozenBalance(data.data.frozenBalance);
        setTotalBalance(data.data.totalBalance);
        
        // 使用真实数据生成交易记录
        fetchTransactionData();
      } else {
        // API返回失败时显示错误信息
        console.warn('API返回格式异常:', data);
        setWalletError('获取钱包信息失败，请稍后重试');
        // 清空余额数据，不显示任何值
        setBalance(null);
        setFrozenBalance(null);
        setTotalBalance(null);
        setTransactions([]);
        setRechargeRecords([]);
        setWithdrawalRecords([]);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      console.error('获取钱包信息过程中发生异常:', errorMessage);
      
      // 发生异常时显示错误信息
      setWalletError('网络连接异常，请检查您的网络');
      // 清空余额数据，不显示任何值
      setBalance(null);
      setFrozenBalance(null);
      setTotalBalance(null);
      setTransactions([]);
      setRechargeRecords([]);
      setWithdrawalRecords([]);
    } finally {
      setLoading(false);
    }
  };

  // 获取交易记录数据（仅使用真实数据）
  const fetchTransactionData = async () => {
    try {
      // 这里应该调用真实的交易记录API
      // 由于目前没有真实API，暂时返回空数组
      setTransactions([]);
      setRechargeRecords([]);
      setWithdrawalRecords([]);
    } catch (error) {
      console.error('获取交易记录失败:', error);
      setTransactions([]);
      setRechargeRecords([]);
      setWithdrawalRecords([]);
    }
  };

  // 页面加载时获取钱包信息
  useEffect(() => {
    fetchWalletInfo();
  }, []);

  // 刷新钱包信息
  const handleRefreshWallet = () => {
    fetchWalletInfo();
  };

  // 格式化日期
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

  // 获取交易类型对应的图标和颜色
  const getTransactionIcon = (type: string) => {
    const iconMap: Record<string, { icon: React.ReactNode; color: string; bgColor: string }> = {
      recharge: {
        icon: <ArrowUpOutlined className="h-4 w-4" />,
        color: 'text-green-600',
        bgColor: 'bg-green-100'
      },
      withdraw: {
        icon: <ArrowDownOutlined className="h-4 w-4" />,
        color: 'text-red-600',
        bgColor: 'bg-red-100'
      },
      task_payment: {
        icon: <CreditCardOutlined className="h-4 w-4" />,
        color: 'text-purple-600',
        bgColor: 'bg-purple-100'
      },
      task_income: {
        icon: <WalletOutlined className="h-4 w-4" />,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100'
      },
      platform_fee: {
        icon: <InfoCircleOutlined className="h-4 w-4" />,
        color: 'text-gray-600',
        bgColor: 'bg-gray-100'
      },
      refund: {
        icon: <UndoOutlined className="h-4 w-4" />,
        color: 'text-orange-600',
        bgColor: 'bg-orange-100'
      }
    };
    return iconMap[type] || {
      icon: <InfoCircleOutlined className="h-4 w-4" />,
      color: 'text-gray-600',
      bgColor: 'bg-gray-100'
    };
  };

  // 获取交易类型对应的中文名称
  const getTransactionType = (type: string) => {
    const typeMap: Record<string, string> = {
      recharge: '充值',
      withdraw: '提现',
      task_payment: '任务支付',
      task_income: '任务收入',
      platform_fee: '平台服务费',
      refund: '退款'
    };
    return typeMap[type] || type;
  };

  // 获取状态对应的中文名称和颜色
  const getStatusInfo = (status: string) => {
    const statusMap: Record<string, { text: string; color: string }> = {
      completed: { text: '已完成', color: 'text-green-600' },
      pending: { text: '待处理', color: 'text-orange-600' },
      failed: { text: '失败', color: 'text-red-600' },
      processing: { text: '处理中', color: 'text-blue-600' }
    };
    return statusMap[status] || { text: status, color: 'text-gray-600' };
  };

  // 处理充值
  const handleRecharge = () => {
    router.push('/publisher/finance');
  };

  // 处理查看交易详情
  const handleViewTransaction = (transactionId: string) => {
    router.push(`/publisher/balance/transaction-details/${transactionId}`);
  };

  // 处理查看充值详情
  const handleViewRecharge = (rechargeId: string) => {
    router.push(`/publisher/balance/transaction-details/${rechargeId}`);
  };

  // 处理查看支出详情
  const handleViewWithdrawal = (withdrawalId: string) => {
    router.push(`/publisher/balance/transaction-details/${withdrawalId}`);
  };

  // 处理查看资金流水
  const handleViewAllTransactions = () => {
    console.log('查看全部资金流水');
    // 跳转到交易详情页面
    router.push('/publisher/balance/transaction-list');
  };

  return (
    <div className="min-h-screen bg-gray-50">
    
      {/* 余额卡片 */}
      <div className="p-2 mt-3 relative">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white overflow-hidden relative">
          <div className="absolute right-0 top-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16" />
          <div className="absolute left-0 bottom-0 w-24 h-24 bg-white opacity-10 rounded-full -ml-12 -mb-12" />
          <div className="p-2 relative z-10 mt-5">
            <div className="mb-6 grid grid-cols-2 gap-2">
              <div className="text-center bg-green-500 rounded-lg p-2">
                <div className="text-sm opacity-90">可用余额</div>
                <div className="text-xl font-bold">{balance !== null ? balance.toFixed(2) : '--'}</div>
              </div>
              <div className="text-center bg-green-500 rounded-lg p-2">
                <div className="text-sm opacity-90">冻结余额</div>
                <div className="text-xl font-bold">{frozenBalance !== null ? frozenBalance.toFixed(2) : '--'}</div>
              </div>
            </div>
            
            {totalBalance !== null && (
              <div className="text-center mb-6">
                <div className="text-sm opacity-90">总资产</div>
                <div className="text-2xl font-bold">{totalBalance.toFixed(2)}</div>
              </div>
            )}
            
            <div className="grid grid-cols-3 gap-2">
              <Button 
                onClick={handleRecharge}
                className="bg-blue-700 text-white hover:bg-blue-600 font-medium"
              >
                充值
              </Button>
              <Button 
                onClick={handleViewAllTransactions}
                className="bg-blue-700 text-white hover:bg-blue-600 font-medium"
              >
                全部明细
              </Button>
              <Button 
                onClick={handleRefreshWallet}
                className="bg-blue-700 text-white hover:bg-blue-600 font-medium flex items-center justify-center"
                disabled={loading}
              >
                <ReloadOutlined className="mr-1" /> 刷新
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* 错误提示 */}
      {walletError && (
        <div className="mt-3 px-4">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm flex items-center">
            <InfoCircleOutlined className="mr-2 h-4 w-4" />
            <span>{walletError}</span>
          </div>
        </div>
      )}

      {/* 交易记录 */}
      <div className="mt-3 bg-white">
        <div className="px-4 py-3 border-b border-gray-100">
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all" className="text-sm">全部明细</TabsTrigger>
              <TabsTrigger value="recharge" className="text-sm">充值记录</TabsTrigger>
              <TabsTrigger value="withdraw" className="text-sm">消费记录</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* 交易记录列表 */}
        <div>
          {loading ? (
            // 加载状态
            <div className="space-y-4 px-4 py-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center py-3 animate-pulse">
                  <div className="h-10 w-10 rounded-full bg-gray-200 mr-3" />
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
                    <div className="h-3 bg-gray-200 rounded w-1/4" />
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-1/6" />
                </div>
              ))}
            </div>
          ) : activeTab === 'all' && transactions.length === 0 ? (
            // 空状态 - 全部明细
            <div className="py-12 px-4 text-center">
              <div className="text-5xl mb-3">📝</div>
              <h3 className="text-lg font-medium text-gray-800 mb-1">暂无交易记录</h3>
              <p className="text-gray-500 text-sm mb-4">您还没有任何交易记录</p>
            </div>
          ) : activeTab === 'recharge' && rechargeRecords.length === 0 ? (
            // 空状态 - 充值记录
            <div className="py-12 px-4 text-center">
              <div className="text-5xl mb-3">💰</div>
              <h3 className="text-lg font-medium text-gray-800 mb-1">暂无充值记录</h3>
              <p className="text-gray-500 text-sm mb-4">您还没有充值过</p>
              <Button
                onClick={handleRecharge}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                立即充值
              </Button>
            </div>
          ) : activeTab === 'withdraw' && withdrawalRecords.length === 0 ? (
            // 空状态 - 支出记录
            <div className="py-12 px-4 text-center">
              <div className="text-5xl mb-3">💳</div>
              <h3 className="text-lg font-medium text-gray-800 mb-1">暂无支出记录</h3>
              <p className="text-gray-500 text-sm mb-4">您还没有支出记录</p>
            </div>
          ) : (
            // 交易记录列表
            <div>
              {activeTab === 'all' && (
                transactions.slice(0, 10).map((transaction) => {
                  const iconInfo = getTransactionIcon(transaction.type);
                  const isIncome = transaction.amount > 0;
                  
                  return (
                    <div 
                      key={transaction.id}
                      onClick={() => handleViewTransaction(transaction.id)}
                      className="px-4 py-3 border-b border-gray-50 hover:bg-gray-50 flex items-center"
                    >
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center ${iconInfo.bgColor} mr-3`}>
                        <div className={iconInfo.color}>{iconInfo.icon}</div>
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="font-medium text-gray-900">{transaction.description}</h3>
                          <span className={`font-medium ${isIncome ? 'text-green-600' : 'text-red-600'}`}>
                            {isIncome ? '+' : ''}{transaction.amount.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="text-xs text-gray-500">
                            {formatDate(transaction.date)} {transaction.time}
                          </div>
                          <div className="text-xs text-gray-500">
                            余额: {transaction.balanceAfter.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              
              {activeTab === 'recharge' && (
                rechargeRecords.slice(0, 10).map((record) => {
                  const statusInfo = getStatusInfo(record.status);
                  
                  return (
                    <div 
                      key={record.id}
                      onClick={() => handleViewRecharge(record.id)}
                      className="px-4 py-3 border-b border-gray-50 hover:bg-gray-50 flex items-center"
                    >
                      <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                        <ArrowUpOutlined className="h-4 w-4 text-green-600" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="font-medium text-gray-900">账户充值</h3>
                          <span className="font-medium text-green-600">+{record.amount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="text-xs text-gray-500">
                            {record.date}
                          </div>
                          <div className="text-xs text-gray-500">
                            余额: {balance !== null ? balance.toFixed(2) : '--'}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              
              {activeTab === 'withdraw' && (
                withdrawalRecords.slice(0, 10).map((record) => {
                  const statusInfo = getStatusInfo(record.status);
                  
                  return (
                    <div 
                      key={record.id}
                      onClick={() => handleViewWithdrawal(record.id)}
                      className="px-4 py-3 border-b border-gray-50 hover:bg-gray-50 flex items-center"
                    >
                      <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center mr-3">
                        <ArrowDownOutlined className="h-4 w-4 text-red-600" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="font-medium text-gray-900">账户支出</h3>
                          <span className="font-medium text-red-600">-{record.amount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="text-xs text-gray-500">
                            {record.date}
                          </div>
                          <div className="text-xs text-gray-500">
                            余额: {balance !== null ? balance.toFixed(2) : '--'}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>

      {/* 底部提示 */}
      <div className="px-4 py-4 text-center text-xs text-gray-500">
        <div>
          <p>交易记录保存期限为12个月</p>
        </div>
      </div>
    </div>
  );
};

export default BalancePage;