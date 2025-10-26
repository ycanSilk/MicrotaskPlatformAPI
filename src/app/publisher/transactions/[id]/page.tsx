'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import TransactionDetailTemplate, { TransactionDetail } from '../../../../components/page/transaction-details/TransactionDetailTemplate';
import { WalletOutlined } from '@ant-design/icons';

// 原始页面保留数据获取和状态管理逻辑
// 但使用模板组件进行渲染
export default function TransactionDetailPage() {
  const params = useParams();
  const id = params?.id as string || '';
  const router = useRouter();
  const [transaction, setTransaction] = useState<TransactionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: '',
    message: '',
    icon: ''
  });

  // 显示通用提示框
  const showAlert = (title: string, message: string, icon: string) => {
    setAlertConfig({ title, message, icon });
    setShowAlertModal(true);
  };

  // 处理提示框关闭
  const handleAlertClose = () => {
    setShowAlertModal(false);
  };

  // 生成模拟交易详情数据
  const generateMockTransactionDetail = (transactionId: string): TransactionDetail => {
    // 模拟不同类型的交易
    const transactionTypes = ['expense', 'recharge'];
    const randomType = transactionTypes[Math.floor(Math.random() * transactionTypes.length)];
    const amount = randomType === 'expense' ? -Math.floor(Math.random() * 100) : Math.floor(Math.random() * 1000);
    const balance = 1298 + Math.floor(Math.random() * 1000);
    
    return {
      id: transactionId,
      type: randomType,
      amount: amount,
      status: 'completed',
      method: randomType === 'expense' ? '任务支付' : '微信支付',
      time: new Date().toLocaleString('zh-CN'),
      orderId: transactionId,
      description: randomType === 'expense' ? '发布任务费用' : '账户充值',
      balanceAfterTransaction: balance + amount,
      customFields: [
        { label: '数据来源', value: '模拟数据', className: 'text-gray-700' },
        { label: '交易类型', value: randomType === 'recharge' ? '充值' : '支出' },
        { label: '交易金额', value: `${amount > 0 ? '+' : ''}¥${Math.abs(amount).toFixed(2)}` },
        { label: '交易状态', value: '成功' },
        { label: '交易时间', value: new Date().toLocaleString('zh-CN') },
        { label: '余额', value: `¥${balance.toFixed(2)}` }
      ],
      transactionId: `trans${Date.now()}`,
      paymentMethod: randomType === 'recharge' ? 'wechat_pay' : '',
      currency: 'CNY',
      orderTime: new Date().toISOString(),
      completedTime: new Date().toISOString(),
      relatedId: transactionId,
      expenseType: randomType === 'expense' ? 'task_publish' : ''
    };
  };

  // 获取交易详情
  const fetchTransactionDetail = async () => {
    console.log('===== 开始获取交易详情 =====');
    console.log('请求的交易ID:', id);
    
    try {
      setLoading(true);
      console.log('设置加载状态为true');

      // 创建一个延迟，模拟网络请求
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 直接使用模拟数据，跳过登录验证
      const mockTransaction = generateMockTransactionDetail(id);
      setTransaction(mockTransaction);
      console.log('设置模拟交易详情数据成功');

    } catch (error) {
      console.error('获取交易详情发生异常:', error);
      showAlert('获取失败', '网络错误，请稍后重试', '❌');
    } finally {
      console.log('设置加载状态为false');
      setLoading(false);
      console.log('===== 获取交易详情流程结束 =====');
    }
  };

  // 组件挂载时获取交易详情
  useEffect(() => {
    fetchTransactionDetail();
  }, [id]);

  // 返回上一页
  const handleBack = () => {
    router.back();
  };

  // 使用模板组件渲染页面
  return (
    <TransactionDetailTemplate
      transaction={transaction}
      loading={loading}
      showAlertModal={showAlertModal}
      alertConfig={alertConfig}
      onBack={handleBack}
      onAlertClose={handleAlertClose}
      title="交易详情"
      showAmountSection={true}
      showDetailsSection={true}
    />
  );
}