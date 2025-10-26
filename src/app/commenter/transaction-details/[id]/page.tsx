'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

// 交易详情类型定义
interface TransactionDetail {
  id: string;
  type: 'recharge' | 'withdraw' | 'task_payment' | 'task_income' | 'platform_fee' | 'refund' | 'transfer' | 'rental_payment' | 'rental_income';
  amount: number;
  balanceAfter: number;
  datetime: string;
  description: string;
  orderId?: string;
  status: 'completed' | 'pending' | 'failed' | 'processing';
  otherParty?: string;
  remark?: string;
  transactionNumber?: string;
}

const TransactionDetailPage = () => {
  const router = useRouter();
  const params = useParams();
  const transactionId = params?.id as string || '';
  const [transactionDetail, setTransactionDetail] = useState<TransactionDetail | null>(null);
  const [loading, setLoading] = useState(true);

  // 模拟获取交易详情数据
  useEffect(() => {
    const fetchTransactionDetail = async () => {
      try {
        setLoading(true);
        // 模拟网络请求延迟
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // 交易详情静态数据映射，为特定ID提供对应数据
        const transactionDetailsMap: Record<string, TransactionDetail> = {
          'txn-001': {
            id: 'txn-001',
            type: 'rental_payment',
            amount: -480.00,
            balanceAfter: 8965.50,
            datetime: '2023-07-01 10:25:00',
            description: '评论账号租赁订单支付',
            orderId: 'ORD-20230701-001',
            status: 'completed',
            otherParty: '平台系统',
            remark: '评论账号租赁服务费用',
            transactionNumber: 'TXN20230701102500001'
          },
          'txn-002': {
            id: 'txn-002',
            type: 'rental_income',
            amount: 280.00,
            balanceAfter: 9445.50,
            datetime: '2023-06-28 16:30:00',
            description: '发布任务佣金收入',
            orderId: 'ORD-20230628-002',
            status: 'completed',
            otherParty: '平台系统',
            remark: '任务完成佣金结算',
            transactionNumber: 'TXN20230628163000002'
          },
          'recharge-001': {
            id: 'recharge-001',
            type: 'recharge',
            amount: 2000.00,
            balanceAfter: 10965.50,
            datetime: '2023-06-30 16:45:00',
            description: '账户充值',
            orderId: 'RECH-20230630-001',
            status: 'completed',
            otherParty: '支付宝',
            remark: '支付宝充值',
            transactionNumber: 'RECH20230630164500001'
          },
          'withdraw-001': {
            id: 'withdraw-001',
            type: 'withdraw',
            amount: -5000.00,
            balanceAfter: 14165.50,
            datetime: '2023-06-25 11:05:00',
            description: '账户提现',
            orderId: 'WITH-20230625-001',
            status: 'completed',
            otherParty: '工商银行 **** 5678',
            remark: '提现到银行卡',
            transactionNumber: 'WITH20230625110500001'
          }
        };
        
        // 查找对应的交易详情，不存在则使用默认数据
        const transactionDetail = transactionDetailsMap[transactionId] || {
          id: transactionId || 'txn-default',
          type: 'transfer',
          amount: -2.61,
          balanceAfter: 0.00,
          datetime: '2025-03-09 11:25:14',
          description: '转账',
          status: 'completed',
          otherParty: '转账',
          remark: '花呗2025年03月自动还款',
          transactionNumber: '20250309102551010428040032974100'
        };
        
        setTransactionDetail(transactionDetail);
      } catch (error) {
        console.error('获取交易详情失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactionDetail();
  }, [transactionId]);

  // 获取交易类型对应的中文名称
  const getTransactionTypeText = (type: string): string => {
    const typeMap: Record<string, string> = {
      recharge: '充值',
      withdraw: '提现',
      task_payment: '任务支付',
      task_income: '任务收入',
      platform_fee: '平台服务费',
      refund: '退款',
      transfer: '转账',
      rental_payment: '租赁支付',
      rental_income: '租赁收入'
    };
    return typeMap[type] || type;
  };

  // 获取收支类型对应的中文名称
  const getIncomeExpenseType = (amount: number): string => {
    return amount > 0 ? '收入' : '支出';
  };

  // 返回上一页
  const handleBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="py-12 px-4 text-center">
          <div className="text-5xl mb-3">⏳</div>
          <h3 className="text-lg font-medium text-gray-800">加载中...</h3>
        </div>
      </div>
    );
  }

  if (!transactionDetail) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="py-12 px-4 text-center">
          <div className="text-5xl mb-3">❌</div>
          <h3 className="text-lg font-medium text-gray-800 mb-1">交易不存在</h3>
          <p className="text-gray-500 text-sm mb-4">未找到对应的交易记录</p>
          <Button onClick={handleBack} className="mt-2">返回</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部导航 */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="flex items-center px-4 py-3">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleBack}
            className="h-8 w-8 mr-2"
          >
            <ArrowLeftOutlined className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-medium">余额明细详情</h1>
        </div>
      </div>

      {/* 主要内容 */}
      <div className="px-4 py-4">
        <Card className="shadow-sm border-0 rounded-xl">
          <div className="py-6 px-2">
            {/* 交易类型图标和名称 */}
            <div className="flex flex-col items-center justify-center mb-6">
              <div className="h-16 w-16 rounded-full bg-amber-100 flex items-center justify-center mb-3">
                <span className="text-2xl text-amber-500">¥</span>
              </div>
              <h2 className="text-lg font-medium text-gray-900">
                {getTransactionTypeText(transactionDetail.type)}
              </h2>
            </div>

            {/* 交易金额 */}
            <div className="flex justify-center mb-10">
              <span className={`text-3xl font-bold ${transactionDetail.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {transactionDetail.amount > 0 ? '+' : ''}{transactionDetail.amount.toFixed(2)}
              </span>
            </div>

            {/* 交易信息列表 */}
            <div className="space-y-4">
              {/* 支付时间 */}
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">支付时间</span>
                <span className="text-gray-900 font-medium">{transactionDetail.datetime}</span>
              </div>

              {/* 交易类型 */}
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">交易类型</span>
                <span className="text-gray-900 font-medium">
                  {getIncomeExpenseType(transactionDetail.amount)}
                </span>
              </div>

              {/* 对方账户 */}
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">对方账户</span>
                <span className="text-gray-900 font-medium">
                  {transactionDetail.otherParty || '-'}</span>
              </div>

              {/* 交易号 */}
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">交易号</span>
                <span className="text-gray-900 font-medium">
                  {transactionDetail.transactionNumber || '-'}</span>
              </div>

              {/* 备注 */}
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">备注</span>
                <span className="text-gray-900 font-medium">
                  {transactionDetail.remark || '-'}</span>
              </div>

              {/* 余额 */}
              <div className="flex justify-between py-2">
                <span className="text-gray-500">余额</span>
                <span className="text-gray-900 font-medium">¥{transactionDetail.balanceAfter.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default TransactionDetailPage;