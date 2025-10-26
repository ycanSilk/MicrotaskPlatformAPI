'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AlertModal from '../../../components/ui/AlertModal';
import transactionData from '../../../data/financialRecords/transactionRecords.json';
import { WalletOutlined, CreditCardOutlined, DollarOutlined, ShoppingOutlined, CoffeeOutlined, InfoCircleOutlined } from '@ant-design/icons';

// 定义类型接口
export interface BalanceData {
  balance: number;
}

export default function PublisherFinancePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('recharge');
  const [rechargeAmount, setRechargeAmount] = useState('');
  // 初始化余额数据，确保符合BalanceData类型
  const [balance, setBalance] = useState<BalanceData>({
    balance: 0
  });
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('alipay');
  const [rechargeSuccess, setRechargeSuccess] = useState(false);
  const [monthlyTransactions, setMonthlyTransactions] = useState<Record<string, any[]>>({});

  // 通用提示框状态
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: '',
    message: '',
    icon: ''
  });
  // 提示框确认后的回调函数
  const [alertCallback, setAlertCallback] = useState<(() => void) | null>(null);

  // 充值档位
  const rechargeOptions = [100, 200, 300, 500, 1000, 2000, ];

  // 显示通用提示框
  const showAlert = (title: string, message: string, icon: string, onConfirmCallback?: () => void) => {
    setAlertConfig({ title, message, icon });
    setAlertCallback(onConfirmCallback || null);
    setShowAlertModal(true);
  };

  // 处理提示框关闭
  const handleAlertClose = () => {
    setShowAlertModal(false);
    // 如果有回调函数，则执行它
    if (alertCallback) {
      setTimeout(() => {
        alertCallback();
        setAlertCallback(null);
      }, 300); // 等待动画完成
    }
  };

  // 从token中获取用户信息
  const getUserInfoFromToken = () => {
    try {
      const token = localStorage.getItem('publisher_auth_token');
      console.log('尝试从localStorage获取token:', token ? '已获取到token' : '未获取到token');
      
      if (!token) {
        console.log('getUserInfoFromToken: 未找到token');
        return null;
      }
      
      const decodedToken = JSON.parse(atob(token));
      console.log('getUserInfoFromToken: 解析token成功', decodedToken);
      
      // 验证token是否过期
      if (decodedToken.exp && decodedToken.exp < Date.now()) {
        console.log('getUserInfoFromToken: token已过期');
        localStorage.removeItem('publisher_auth_token');
        return null;
      }
      
      return decodedToken;
    } catch (error) {
      console.error('解析token失败:', error);
      return null;
    }
  };

  // 检查是否已登录
  useEffect(() => {
    const userInfo = getUserInfoFromToken();
    if (!userInfo && process.env.NODE_ENV !== 'development') {
      // 在非开发环境下，如果没有登录信息，提示用户登录
      showAlert('提示', '请先登录', '💡');
    } else if (userInfo && process.env.NODE_ENV === 'development') {
      console.log(`当前登录用户: ${userInfo.username || '未知用户'} (ID: ${userInfo.userId || '未知ID'})`);
    }
  }, []);

  // 获取财务数据
  const fetchFinanceData = async () => {
    try {
      setLoading(true);
      console.log('开始获取财务数据');
      
      // 从token中获取用户信息
      const userInfo = getUserInfoFromToken();
      console.log('fetchFinanceData: 获取用户信息结果', userInfo);
      
      // 如果没有用户信息，提示登录
      if (!userInfo) {
        console.log('fetchFinanceData: 没有用户信息，提示登录');
        showAlert('提示', '请先登录', '💡');
        return;
      }
      
      // 模拟数据：从本地JSON文件获取交易记录数据
      console.log('fetchFinanceData: 从本地JSON文件获取交易记录数据');
      
      // 处理余额数据（这里使用模拟数据）
      const newBalance: BalanceData = {
        balance: 1298 // 模拟余额数据
      };
      
      console.log('fetchFinanceData: 使用模拟余额数据:', newBalance);
      setBalance(newBalance);
      
      // 处理交易记录 - 从本地JSON文件获取
      // 过滤出当前用户的交易记录
      const currentUserId = userInfo.userId || 'pub003'; // 默认使用pub003作为演示
      const transactionsList = transactionData.transactions
        .filter((trans: any) => trans.userId === currentUserId)
        .map((trans: any) => ({
          ...trans,
          // 转换数据结构以匹配前端展示需求
          id: trans.transactionId,
          type: trans.transactionType,
          time: trans.orderTime,
          method: trans.paymentMethod || (trans.transactionType === 'recharge' ? '账户充值' : '账户支出')
        }));
      
      setTransactions(transactionsList);
      
      // 按月份分组交易记录
      const monthlyData: Record<string, any[]> = {};
      transactionsList.forEach((transaction: any) => {
        if (transaction.time) {
          const date = new Date(transaction.time);
          const monthKey = `${date.getFullYear()}年${date.getMonth() + 1}月`;
          if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = [];
          }
          monthlyData[monthKey].push(transaction);
        }
      });
      
      // 按月份降序排列
      const sortedMonthlyData: Record<string, any[]> = {};
      Object.keys(monthlyData).sort((a, b) => {
        const [yearA, monthA] = a.match(/(\d+)年(\d+)月/)!.slice(1).map(Number);
        const [yearB, monthB] = b.match(/(\d+)年(\d+)月/)!.slice(1).map(Number);
        return (yearB * 12 + monthB) - (yearA * 12 + monthA);
      }).forEach(key => {
        sortedMonthlyData[key] = monthlyData[key];
      });
      
      setMonthlyTransactions(sortedMonthlyData);
      
      // 显示当前登录用户信息
      console.log(`当前登录用户: ${userInfo.username || '未知用户'} (ID: ${userInfo.userId || '未知ID'})`);
      
    } catch (error) {
      console.error('获取财务数据失败:', error);
      showAlert('网络错误', '获取数据失败，请稍后重试', '❌');
    } finally {
      console.log('fetchFinanceData: 请求完成，设置loading为false');
      setLoading(false);
    }
  };

  // 处理充值
  const handleRecharge = async () => {
    console.log('开始处理充值请求', { rechargeAmount, selectedPaymentMethod });
    
    if (!rechargeAmount || parseFloat(rechargeAmount) <= 0) {
      console.log('充值金额无效');
      showAlert('输入错误', '请输入有效的充值金额', '⚠️');
      return;
    }

    try {
      // 从token中获取用户信息
      const userInfo = getUserInfoFromToken();
      console.log('handleRecharge: 用户信息', userInfo);
      
      if (!userInfo) {
        console.log('handleRecharge: 未登录');
        showAlert('提示', '请先登录', '💡');
        return;
      }

      // 从localStorage获取token
      const token = localStorage.getItem('publisher_auth_token');
      console.log('handleRecharge: 获取到token', token ? '是' : '否');
      
      if (!token) {
        console.log('handleRecharge: 未获取到token');
        showAlert('提示', '请先登录', '💡');
        return;
      }

      console.log('handleRecharge: 准备发送充值请求', { amount: parseFloat(rechargeAmount), paymentMethod: selectedPaymentMethod });
      const response = await fetch('/api/publisher/finance', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: parseFloat(rechargeAmount),
          paymentMethod: selectedPaymentMethod
        })
      });

      console.log('handleRecharge: 充值请求完成，状态码:', response.status);
      const data = await response.json();
      console.log('handleRecharge: 充值响应数据', data);
      
      if (data.success) {
        console.log('handleRecharge: 充值成功');
        // 充值成功后只显示提示，不立即刷新数据
        // 用户点击确认后再刷新数据并重置状态
        showAlert('充值成功', data.message, '✅', () => {
          // 用户点击确认后的回调函数
          setRechargeSuccess(true);
          fetchFinanceData();
          setRechargeAmount('');
        });
      } else {
        console.log('handleRecharge: 充值失败', data.message);
        showAlert('充值失败', data.message, '❌');
      }
    } catch (error) {
      console.error('充值失败:', error);
      showAlert('网络错误', '充值失败，请稍后重试', '❌');
    }
  };



  // 初始加载数据
  useEffect(() => {
    fetchFinanceData();
  }, []);

  // 余额字段说明：
  // 1. balance: 主要的余额字段，前端页面直接使用这个字段显示余额
  // 2. currentBalance: 冗余字段，当前实现中与balance保持一致
  // 3. availableBalance: 冗余字段，当前实现中与balance保持一致
  // 这三个字段在当前版本中存储相同的值，是为了未来可能的扩展需求，比如实现余额冻结功能

  // 获取交易图标
  const getTransactionIcon = (type: string, expenseType?: string) => {
    if (type === 'recharge') return <WalletOutlined className="h-6 w-6" />;
    if (type === 'withdraw') return <DollarOutlined className="h-6 w-6" />;
    if (type === 'expense') {
      switch (expenseType) {
        case 'task_publish': return <ShoppingOutlined className="h-6 w-6" />;
        case 'platform_fee': return <CreditCardOutlined className="h-6 w-6" />;
        default: return <CoffeeOutlined className="h-6 w-6" />;
      }
    }
    return <InfoCircleOutlined className="h-6 w-6" />;
  };
  
  // 跳转到交易详情页
  const handleTransactionClick = (transactionId: string) => {
    router.push(`/publisher/transactions/${transactionId}`);
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'recharge': return 'text-green-600';
      case 'withdraw': return 'text-blue-600';
      case 'expense': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'success': return '成功';
      case 'pending': return '处理中';
      case 'failed': return '失败';
      default: return '未知';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600';
      case 'pending': return 'text-orange-600';
      case 'failed': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="pb-20">
      {/* 功能选择 */}
      <div className="mx-4 mt-4 grid grid-cols-2 gap-2">
        <button
          onClick={() => setActiveTab('recharge')}
          className={`py-3 px-4 rounded font-medium transition-colors ${
            activeTab === 'recharge' ? 'bg-green-500 text-white shadow-md' : 'bg-white border border-gray-300 text-gray-600 hover:bg-green-50'
          }`}
        >
          充值
        </button>
        <button
          onClick={() => setActiveTab('records')}
          className={`py-3 px-4 rounded font-medium transition-colors ${
            activeTab === 'records' ? 'bg-green-500 text-white shadow-md' : 'bg-white border border-gray-300 text-gray-600 hover:bg-green-50'
          }`}
        >
          记录
        </button>
      </div>

      {/* 余额显示 */}
      <div className="mx-4 mt-6">
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg p-6">
          <div className="text-center">
            <div className="text-sm mb-2">账户余额</div>
            <div className="text-4xl font-bold">
              {loading ? '加载中...' : `¥${balance.balance.toFixed(2)}`}
            </div>
          </div>
        </div>
      </div>

      {activeTab === 'recharge' && (
        <>
          {/* 充值金额输入 */}
          <div className="mx-4 mt-6">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h3 className="font-bold text-gray-800 mb-4">充值金额</h3>
              <div className="mb-4">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">¥</span>
                  <input
                    type="number"
                    placeholder="请输入充值金额"
                    value={rechargeAmount}
                    onChange={(e) => setRechargeAmount(e.target.value)}
                    className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  最低充值：¥100 | 单次最高：¥2000
                </div>
              </div>

              {/* 快捷充值 */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">快捷选择</h4>
                <div className="grid grid-cols-3 gap-2">
                  {rechargeOptions.map((amount) => (
                    <button
                      key={amount}
                      onClick={() => setRechargeAmount(amount.toString())}
                      className={`py-2 px-3 border rounded text-sm transition-all duration-300 ${rechargeAmount === amount.toString() ? 'bg-blue-500 text-white border-blue-600' : 'border-gray-300 hover:bg-blue-50 hover:border-blue-300'}`}
                    >
                      ¥{amount}
                    </button>
                  ))}
                </div>
              </div>

              {/* 支付方式 */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">支付方式</h4>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input 
                      type="radio" 
                      name="payMethod" 
                      className="mr-2" 
                      checked={selectedPaymentMethod === 'alipay'} 
                      onChange={() => setSelectedPaymentMethod('alipay')}
                    />
                    <span className="text-sm">💙 支付宝</span>
                  </label>
                  <label className="flex items-center">
                    <input 
                      type="radio" 
                      name="payMethod" 
                      className="mr-2" 
                      checked={selectedPaymentMethod === 'usdt'} 
                      onChange={() => setSelectedPaymentMethod('usdt')}
                    />
                    <span className="text-sm">🟢 USDT (TRC20)</span>
                  </label>
                </div>
              </div>

              {/* 支付信息展示 */}
              <div className="mb-4 flex flex-col items-center">
                {selectedPaymentMethod === 'alipay' ? (
                  <>
                    <div className="bg-white p-4 border border-gray-200 rounded-lg mb-3">
                      <div className="w-48 h-48 bg-gray-50 flex items-center justify-center">
                        {/* 使用假的二维码图片 - 这里使用data:image/svg+xml创建一个简单的二维码样式图像 */}
                        <img 
                          src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='192' height='192'%3E%3Crect width='192' height='192' fill='%23ffffff'/%3E%3Crect x='16' y='16' width='48' height='48' fill='%23000000'/%3E%3Crect x='16' y='128' width='48' height='48' fill='%23000000'/%3E%3Crect x='128' y='16' width='48' height='48' fill='%23000000'/%3E%3Crect x='96' y='96' width='32' height='32' fill='%23000000'/%3E%3Cpath d='M128 80v64H80V80h48m8-8H72v80h64V72z' fill='%23000000'/%3E%3C/svg%3E" 
                          alt="支付宝二维码" 
                          className="w-full h-full"
                        />
                      </div>
                    </div>
                    <p className="text-sm text-gray-500">请使用支付宝扫描二维码完成支付</p>
                    <p className="text-sm font-medium text-gray-700 mt-1">充值金额: ¥{rechargeAmount || '0.00'}</p>
                  </>
                ) : (
                  <>
                    <div className="bg-white p-4 border border-gray-200 rounded-lg mb-3">
                      <div className="w-48 h-48 bg-gray-50 flex items-center justify-center">
                        {/* USDT二维码 */}
                        <img 
                          src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='192' height='192'%3E%3Crect width='192' height='192' fill='%23ffffff'/%3E%3Crect x='16' y='16' width='48' height='48' fill='%2326A17B'/%3E%3Crect x='16' y='128' width='48' height='48' fill='%2326A17B'/%3E%3Crect x='128' y='16' width='48' height='48' fill='%2326A17B'/%3E%3Crect x='96' y='96' width='32' height='32' fill='%2326A17B'/%3E%3Cpath d='M128 80v64H80V80h48m8-8H72v80h64V72z' fill='%2326A17B'/%3E%3C/svg%3E" 
                          alt="USDT二维码" 
                          className="w-full h-full"
                        />
                      </div>
                    </div>
                    <div className="w-full max-w-sm">
                      <div className="bg-gray-50 p-3 rounded-lg mb-2">
                        <p className="text-xs text-gray-500 mb-1">USDT (TRC20) 地址</p>
                        <p className="text-sm font-medium text-gray-800 break-all">
                          TXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX<br/>
                          <span className="text-xs text-green-500">请复制地址进行转账</span>
                        </p>
                      </div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">充值金额 (¥):</span>
                        <span className="text-sm font-medium">{rechargeAmount || '0.00'}</span>
                      </div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-gray-600">需支付 USDT:</span>
                        <span className="text-sm font-medium text-green-600">{(parseFloat(rechargeAmount || '0') / 7.2).toFixed(4)}</span>
                      </div>
                      <p className="text-xs text-orange-500">请确保在15分钟内完成转账，超时订单将自动取消</p>
                    </div>
                  </>
                )}
              </div>

              <button
                onClick={handleRecharge}
                disabled={loading}
                className={`w-full py-3 rounded-lg font-medium transition-colors ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500 text-white hover:bg-green-600'}`}
              >
                {loading ? '处理中...' : '立即充值'}
              </button>
            </div>
          </div>
        </>
      )}



      {activeTab === 'records' && (
        <>
          {/* 交易记录 - 支付宝账单风格 */}
          <div className="mx-4 mt-6">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-4 border-b">
                <h3 className="font-bold text-gray-800">交易记录</h3>
              </div>
              
              {/* 记录内容 */}
              <div className="overflow-y-auto">
                {loading ? (
                  <div className="p-8 text-center text-gray-500">加载中...</div>
                ) : transactions.length > 0 ? (
                  <>
                    {/* 按月份分组显示交易记录，默认显示10条 */}
                    {Object.entries(monthlyTransactions).map(([month, records], monthIndex) => {
                      // 默认只显示前10条记录
                      let displayRecords = records;
                      if (monthIndex === 0) {
                        // 只在第一个月份限制显示数量
                        displayRecords = records.slice(0, 10);
                      }
                      return (
                        <div key={month}>            
                          {/* 交易记录列表 */}
                          {displayRecords.map((record) => (
                            <div 
                              key={record.id} 
                              className="border-b last:border-0"
                            >
                              <button
                                onClick={() => handleTransactionClick(record.id)}
                                className="w-full p-4 hover:bg-gray-50 transition-colors flex justify-between items-center"
                              >
                                {/* 左侧：图标、标题、描述 */}
                                <div className="flex items-center space-x-3">
                                  <div className="rounded-full items-center  w-12 h-12 bg-orange-400 flex items-center justify-center">
                                    <div className="flex items-center justify-center text-white text-3xl">
                                      {getTransactionIcon(record.type, record.expenseType)}
                                    </div>
                                  </div>
                                  <div className="text-left">
                         
                                    <div className="text-lg ">
                                      {record.expenseType === 'task_publish' ? '任务发布' : ''}
                                    </div>
                                    <div className="text-sm text-gray-500 mt-1">
                                      {new Date(record.time).toLocaleDateString('zh-CN', { 
                                        year: 'numeric',
                                        month: '2-digit', 
                                        day: '2-digit',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      }).replace(/\//g, '-')}
                                    </div>
                                  </div>
                                </div>
                                
                                {/* 右侧：金额和余额 */}
                                <div className="text-right">
                                  <div className={` text-lg ${getTransactionColor(record.type)}`}>
                                    {record.amount > 0 ? '+' : ''}{Math.abs(record.amount).toFixed(2)}
                                  </div>
                                  <div className="text-sm text-gray-500 mt-1">
                                    余额 {record.balanceAfter || balance.balance}元
                                  </div>
                                </div>
                              </button>
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </>
                ) : (
                  <div className="p-8 text-center text-gray-500">暂无交易记录</div>
                )}
              </div>
              
              {/* 查看更多按钮 - 支付宝风格 */}
              <div className="border-t">
                <button
                  onClick={() => router.push('/publisher/transactions')}
                  className="w-full p-4 bg-white hover:bg-gray-50 transition-colors flex items-center justify-center"
                >
                  <span className="text-sm text-blue-500">查看更多交易记录</span>
                  <svg className="w-4 h-4 ml-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </>
      )}
      
      {/* 通用提示模态框 */}
      <AlertModal
        isOpen={showAlertModal}
        title={alertConfig.title}
        message={alertConfig.message}
        icon={alertConfig.icon}
        onClose={handleAlertClose}
      />
    </div>
  );
}