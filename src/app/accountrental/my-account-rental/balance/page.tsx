'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import WalletOutlined from '@ant-design/icons/WalletOutlined';
import CreditCardOutlined from '@ant-design/icons/CreditCardOutlined';
import ArrowUpOutlined from '@ant-design/icons/ArrowUpOutlined';
import ArrowDownOutlined from '@ant-design/icons/ArrowDownOutlined';
import SafetyOutlined from '@ant-design/icons/SafetyOutlined';
import BellOutlined from '@ant-design/icons/BellOutlined';
import InfoCircleOutlined from '@ant-design/icons/InfoCircleOutlined';
import DownOutlined from '@ant-design/icons/DownOutlined';
import CalendarOutlined from '@ant-design/icons/CalendarOutlined';
import ClockCircleOutlined from '@ant-design/icons/ClockCircleOutlined';
import MoreOutlined from '@ant-design/icons/MoreOutlined';
import UndoOutlined from '@ant-design/icons/UndoOutlined';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { Badge } from '@/components/ui/Badge';


// 交易记录类型定义
interface Transaction {
  id: string;
  type: 'recharge' | 'withdraw' | 'rental_payment' | 'rental_income' | 'platform_fee' | 'refund';
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
  const [balance, setBalance] = useState(8965.50);
  const [frozenBalance, setFrozenBalance] = useState(1200.00);
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
            type: 'rental_payment',
            amount: -480.00,
            balanceAfter: 8965.50,
            date: '2023-07-01',
            time: '10:30',
            description: '租赁账号：美食探店达人',
            orderId: 'ORD-20230701-001',
            status: 'completed'
          },
          {
            id: 'txn-002',
            type: 'recharge',
            amount: 2000.00,
            balanceAfter: 9445.50,
            date: '2023-06-30',
            time: '16:45',
            description: '支付宝充值',
            status: 'completed'
          },
          {
            id: 'txn-003',
            type: 'rental_income',
            amount: 1200.00,
            balanceAfter: 7445.50,
            date: '2023-06-28',
            time: '14:20',
            description: '账号租赁收入',
            orderId: 'ORD-20230628-002',
            status: 'completed'
          },
          {
            id: 'txn-004',
            type: 'withdraw',
            amount: -5000.00,
            balanceAfter: 6245.50,
            date: '2023-06-25',
            time: '11:05',
            description: '提现至工商银行储蓄卡',
            status: 'completed'
          },
          {
            id: 'txn-005',
            type: 'platform_fee',
            amount: -150.00,
            balanceAfter: 11245.50,
            date: '2023-06-20',
            time: '00:00',
            description: '平台服务费',
            status: 'completed'
          },
          {
            id: 'txn-006',
            type: 'rental_payment',
            amount: -540.00,
            balanceAfter: 11395.50,
            date: '2023-06-18',
            time: '15:30',
            description: '租赁账号：时尚搭配指南',
            orderId: 'ORD-20230618-001',
            status: 'completed'
          },
          {
            id: 'txn-007',
            type: 'refund',
            amount: 800.00,
            balanceAfter: 11935.50,
            date: '2023-06-15',
            time: '10:15',
            description: '订单退款',
            orderId: 'ORD-20230610-001',
            status: 'completed'
          },
          {
            id: 'txn-008',
            type: 'recharge',
            amount: 5000.00,
            balanceAfter: 11135.50,
            date: '2023-06-10',
            time: '14:40',
            description: '微信支付充值',
            status: 'completed'
          }
        ];
        
        // 模拟充值记录
        const mockRechargeRecords: RechargeRecord[] = [
          {
            id: 'recharge-001',
            amount: 2000.00,
            date: '2023-06-30 16:45',
            paymentMethod: '支付宝',
            status: 'completed',
            orderId: 'RECH-20230630-001'
          },
          {
            id: 'recharge-002',
            amount: 5000.00,
            date: '2023-06-10 14:40',
            paymentMethod: '微信支付',
            status: 'completed',
            orderId: 'RECH-20230610-001'
          },
          {
            id: 'recharge-003',
            amount: 1000.00,
            date: '2023-06-01 09:20',
            paymentMethod: '支付宝',
            status: 'completed',
            orderId: 'RECH-20230601-001'
          }
        ];
        
        // 模拟提现记录
        const mockWithdrawalRecords: WithdrawalRecord[] = [
          {
            id: 'withdraw-001',
            amount: 5000.00,
            date: '2023-06-25 11:05',
            bankAccount: '工商银行 **** 5678',
            status: 'completed',
            orderId: 'WITH-20230625-001'
          },
          {
            id: 'withdraw-002',
            amount: 3000.00,
            date: '2023-06-05 15:30',
            bankAccount: '建设银行 **** 8901',
            status: 'completed',
            orderId: 'WITH-20230605-001'
          },
          {
            id: 'withdraw-003',
            amount: 2000.00,
            date: '2023-07-02 10:15',
            bankAccount: '工商银行 **** 5678',
            status: 'processing',
            orderId: 'WITH-20230702-001'
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

  // 交易记录直接显示，不进行筛选

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
      rental_payment: {
        icon: <CreditCardOutlined className="h-4 w-4" />,
        color: 'text-purple-600',
        bgColor: 'bg-purple-100'
      },
      rental_income: {
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
      rental_payment: '租赁支付',
      rental_income: '租赁收入',
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
    console.log('充值');
    // 在实际项目中，应该跳转到充值页面
    // router.push('/accountrental/recharge');
  };

  // 处理提现
  const handleWithdraw = () => {
    console.log('提现');
    // 在实际项目中，应该跳转到提现页面
    // router.push('/accountrental/withdraw');
  };

  // 处理查看交易详情
  const handleViewTransaction = (transactionId: string) => {
    console.log('查看交易详情:', transactionId);
    // 在实际项目中，应该跳转到交易详情页面
    // router.push(`/accountrental/transactions/${transactionId}`);
  };

  // 处理查看充值详情
  const handleViewRecharge = (rechargeId: string) => {
    console.log('查看充值详情:', rechargeId);
    // 在实际项目中，应该跳转到充值详情页面
  };

  // 处理查看提现详情
  const handleViewWithdrawal = (withdrawalId: string) => {
    console.log('查看提现详情:', withdrawalId);
    // 在实际项目中，应该跳转到提现详情页面
  };

  // 处理查看资金流水
  const handleViewAllTransactions = () => {
    console.log('查看全部资金流水');
    // 跳转到交易详情页面
    router.push('/accountrental/my-account-rental/balance/transaction-list');
  };

  return (
    <div className="min-h-screen bg-gray-50">
 

      {/* 余额卡片 */}
      <div className="px-4 mt-3">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white overflow-hidden relative">
          <div className="absolute right-0 top-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16" />
          <div className="absolute left-0 bottom-0 w-24 h-24 bg-white opacity-10 rounded-full -ml-12 -mb-12" />
          
          <div className="p-5 relative z-10">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-white text-opacity-80 font-medium">账户余额（元）</h2>
              <Button 
                onClick={handleViewAllTransactions}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white text-xs px-3 py-1 rounded-full"
              >
                查看全部明细
              </Button>
            </div>
            
            <div className="flex items-baseline mb-5">
              <span className="text-3xl font-bold">{balance.toFixed(2)}</span>
              <span className="ml-2 text-sm text-white text-opacity-70">可用余额</span>
            </div>
            
            {frozenBalance > 0 && (
              <div className="text-sm text-white text-opacity-70 mb-6">
                冻结余额: <span className="text-white">{frozenBalance.toFixed(2)}</span> 元
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-3">
              <Button 
                onClick={handleRecharge}
                className="bg-white text-blue-600 hover:bg-blue-50 font-medium"
              >
                                充值
              </Button>
              <Button onClick={handleWithdraw} className="bg-green-500 text-white border border-white border-opacity-30 hover:bg-green-600 font-medium">
                              提现
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
              <TabsTrigger value="withdraw" className="text-sm">提现记录</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* 交易记录区域 */}

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
            // 空状态 - 提现记录
            <div className="py-12 px-4 text-center">
              <div className="text-5xl mb-3">💳</div>
              <h3 className="text-lg font-medium text-gray-800 mb-1">暂无提现记录</h3>
              <p className="text-gray-500 text-sm mb-4">您还没有提现过</p>
              <Button
                onClick={handleWithdraw}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                立即提现
              </Button>
            </div>
          ) : (
            // 交易记录列表
            <div>
              {activeTab === 'all' && (
                transactions.map((transaction) => {
                  const iconInfo = getTransactionIcon(transaction.type);
                  const isIncome = transaction.amount > 0;
                  
                  return (
                    <div 
                      key={transaction.id}
                      className="px-4 py-3 border-b border-gray-50 hover:bg-gray-50 flex items-center"
                      onClick={() => handleViewTransaction(transaction.id)}
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
                            {getTransactionType(transaction.type)} · {formatDate(transaction.date)} {transaction.time}
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
                rechargeRecords.map((record) => {
                  const statusInfo = getStatusInfo(record.status);
                  
                  return (
                    <div 
                      key={record.id}
                      className="px-4 py-3 border-b border-gray-50 hover:bg-gray-50 flex items-center"
                      onClick={() => handleViewRecharge(record.id)}
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
                            {record.paymentMethod} · {record.date}
                          </div>
                          <Badge className={`${statusInfo.color.replace('text-', 'bg-').replace('600', '100')} ${statusInfo.color}`}>
                            {statusInfo.text}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              
              {activeTab === 'withdraw' && (
                withdrawalRecords.map((record) => {
                  const statusInfo = getStatusInfo(record.status);
                  
                  return (
                    <div 
                      key={record.id}
                      className="px-4 py-3 border-b border-gray-50 hover:bg-gray-50 flex items-center"
                      onClick={() => handleViewWithdrawal(record.id)}
                    >
                      <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center mr-3">
                        <ArrowDownOutlined className="h-4 w-4 text-red-600" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="font-medium text-gray-900">账户提现</h3>
                          <span className="font-medium text-red-600">-{record.amount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="text-xs text-gray-500">
                            {record.bankAccount} · {record.date}
                          </div>
                          <Badge className={`${statusInfo.color.replace('text-', 'bg-').replace('600', '100')} ${statusInfo.color}`}>
                            {statusInfo.text}
                          </Badge>
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