'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import WalletOutlined from '@ant-design/icons/WalletOutlined';
import CreditCardOutlined from '@ant-design/icons/CreditCardOutlined';
import ArrowUpOutlined from '@ant-design/icons/ArrowUpOutlined';
import ArrowDownOutlined from '@ant-design/icons/ArrowDownOutlined';
import InfoCircleOutlined from '@ant-design/icons/InfoCircleOutlined';
import UndoOutlined from '@ant-design/icons/UndoOutlined';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { Badge } from '@/components/ui/Badge';

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
  const [balance, setBalance] = useState(1298.00);
  const [frozenBalance, setFrozenBalance] = useState(0.00);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [rechargeRecords, setRechargeRecords] = useState<RechargeRecord[]>([]);
  const [withdrawalRecords, setWithdrawalRecords] = useState<WithdrawalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  // 模拟获取数据
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // 模拟网络请求延迟
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // 模拟交易记录数据
        const mockTransactions: Transaction[] = [
          {
            id: 'txn-001',
            type: 'task_income',
            amount: 580.00,
            balanceAfter: 1298.00,
            date: '2023-07-01',
            time: '14:30',
            description: '任务报酬结算',
            orderId: 'TASK-20230701-001',
            status: 'completed'
          },
          {
            id: 'txn-002',
            type: 'withdraw',
            amount: -100.00,
            balanceAfter: 718.00,
            date: '2023-06-30',
            time: '16:45',
            description: '提现到银行卡',
            status: 'completed'
          },
          {
            id: 'txn-003',
            type: 'task_income',
            amount: 320.00,
            balanceAfter: 818.00,
            date: '2023-06-28',
            time: '10:20',
            description: '任务报酬结算',
            orderId: 'TASK-20230628-002',
            status: 'completed'
          },
          {
            id: 'txn-004',
            type: 'withdraw',
            amount: -50.00,
            balanceAfter: 498.00,
            date: '2023-06-25',
            time: '11:05',
            description: '提现到银行卡',
            status: 'completed'
          },
          {
            id: 'txn-005',
            type: 'task_income',
            amount: 498.00,
            balanceAfter: 548.00,
            date: '2023-06-20',
            time: '15:30',
            description: '任务报酬结算',
            orderId: 'TASK-20230620-001',
            status: 'completed'
          },
          {
            id: 'txn-006',
            type: 'recharge',
            amount: 1000.00,
            balanceAfter: 50.00,
            date: '2023-06-15',
            time: '10:15',
            description: '支付宝充值',
            status: 'completed'
          }
        ];
        
        // 模拟充值记录
        const mockRechargeRecords: RechargeRecord[] = [
          {
            id: 'recharge-001',
            amount: 1000.00,
            date: '2023-06-15 10:15',
            paymentMethod: '支付宝',
            status: 'completed',
            orderId: 'RECH-20230615-001'
          },
          {
            id: 'recharge-002',
            amount: 500.00,
            date: '2023-06-01 09:20',
            paymentMethod: '微信支付',
            status: 'completed',
            orderId: 'RECH-20230601-001'
          }
        ];
        
        // 模拟提现记录
        const mockWithdrawalRecords: WithdrawalRecord[] = [
          {
            id: 'withdraw-001',
            amount: 100.00,
            date: '2023-06-30 16:45',
            bankAccount: '工商银行 **** 5678',
            status: 'completed',
            orderId: 'WITH-20230630-001'
          },
          {
            id: 'withdraw-002',
            amount: 50.00,
            date: '2023-06-25 11:05',
            bankAccount: '工商银行 **** 5678',
            status: 'completed',
            orderId: 'WITH-20230625-001'
          }
        ];
        
        setTransactions(mockTransactions);
        setRechargeRecords(mockRechargeRecords);
        setWithdrawalRecords(mockWithdrawalRecords);
      } catch (error) {
        console.error('获取余额和交易记录失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
            <div className="mb-10 grid grid-cols-2 gap-2">
              <div className="text-center bg-green-500 rounded-lg p-2">
                <div>可用余额:</div>
                <div>{balance.toFixed(2)}</div>
              </div>
              <div className="text-center bg-green-500 rounded-lg p-2">
                <div>冻结余额:</div>
                <div>{frozenBalance.toFixed(2)}</div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
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
            </div>
          </div>
        </Card>
      </div>

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
                            余额: {balance.toFixed(2)}
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
                            余额: {balance.toFixed(2)}
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