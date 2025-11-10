'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { Button, Card } from 'antd';

// 导入交易记录类型定义，用于数据转换
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

  // 从localStorage获取交易详情数据
  useEffect(() => {
    const fetchTransactionDetail = () => {
      try {
        setLoading(true);
        
        // 从localStorage获取交易记录数据
        const transactionDataStr = localStorage.getItem('transactionData');
        
        if (transactionDataStr) {
          const transactionData: TransactionRecord = JSON.parse(transactionDataStr);
          
          // 转换TransactionRecord到TransactionDetail格式
          const convertedDetail: TransactionDetail = {
            id: transactionData.orderNo,
            type: mapTransactionType(transactionData.transactionType),
            amount: transactionData.amount,
            balanceAfter: transactionData.afterBalance,
            datetime: formatDateTime(transactionData.createTime),
            description: transactionData.description || transactionData.typeDescription,
            orderId: transactionData.orderNo,
            status: mapTransactionStatus(transactionData.status),
            // 保存原始typeDescription用于后续判断
            otherParty: getTransactionAccount(transactionData),
            remark: transactionData.description || transactionData.typeDescription,
            transactionNumber: transactionData.orderNo
          };
          
          setTransactionDetail(convertedDetail);
        } else {
          // 如果localStorage中没有数据，使用默认数据
          setTransactionDetail({
            id: transactionId || 'txn-default',
            type: 'transfer',
            amount: 0,
            balanceAfter: 0,
            datetime: new Date().toLocaleString('zh-CN'),
            description: '交易详情',
            status: 'completed',
            otherParty: '未知',
            remark: '',
            transactionNumber: transactionId
          });
        }
      } catch (error) {
        console.error('获取交易详情失败:', error);
        setTransactionDetail(null);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTransactionDetail();
  }, [transactionId]);
  
  // 将交易类型映射到详情页需要的类型格式
  const mapTransactionType = (transactionType: string): TransactionDetail['type'] => {
    switch (transactionType) {
      case 'recharge':
        return 'recharge';
      case 'withdraw':
        return 'withdraw';
      case 'task_payment':
        return 'task_payment';
      case 'task_income':
        return 'task_income';
      case 'platform_fee':
        return 'platform_fee';
      case 'refund':
        return 'refund';
      case 'rental_payment':
        return 'rental_payment';
      case 'rental_income':
        return 'rental_income';
      default:
        return 'transfer';
    }
  };
  
  // 将交易状态映射到详情页需要的状态格式
  const mapTransactionStatus = (status: string): TransactionDetail['status'] => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'success':
        return 'completed';
      case 'pending':
        return 'pending';
      case 'failed':
        return 'failed';
      case 'processing':
        return 'processing';
      default:
        return 'completed';
    }
  };
  
  // 根据typeDescription确定交易账户
  const getTransactionAccount = (transaction: TransactionRecord): string => {
    const typeDesc = transaction.typeDescription?.toLowerCase() || '';
    
    if (typeDesc.includes('提现')) {
      return '银行卡账户';
    } else if (transaction.amount > 0) {
      return '平台';
    } else {
      return '余额';
    }
  };
  
  // 根据typeDescription和amount确定交易类型
  const getTransactionTypeByDescription = (transaction: TransactionRecord): string => {
    const typeDesc = transaction.typeDescription?.toLowerCase() || '';
    
    if (typeDesc.includes('提现')) {
      return '提现';
    } else if (transaction.amount > 0) {
      return '收入';
    } else {
      return '支出';
    }
  };
  
  // 获取订单类型显示文本
  const getOrderTypeText = (typeDescription: string): string => {
    const typeDesc = typeDescription?.toLowerCase() || '';
    
    if (typeDesc.includes('任务奖励')) {
      return '任务奖励';
    } else if (typeDesc.includes('账号出租')) {
      return '账号出租';
    } else if (typeDesc.includes('提现')) {
      return '提现';
    } else if (typeDesc.includes('账号租赁')) {
      return '账号租赁';
    } else {
      return typeDescription || '其他';
    }
  };
  
  // 格式化日期时间
  const formatDateTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).replace(/\//g, '-');
  };

  // 获取交易类型对应的中文名称
  const getTransactionTypeText = (type: string): string => {
    const typeMap: Record<string, string> = {
      recharge: '充值',
      withdraw: '提现',
      task_payment: '任务支付',
      task_income: '任务收入',
      platform_fee: '平台服务费',
      refund: '退款',
      rental_payment: '租赁支付',
      rental_income: '租赁收入'
    };
    return typeMap[type] || type;
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
            variant="outlined" 
            size="small" 
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
                {getOrderTypeText(JSON.parse(localStorage.getItem('transactionData') || '{}').typeDescription || '')}
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
                  {getTransactionTypeByDescription(JSON.parse(localStorage.getItem('transactionData') || '{}'))}
                </span>
              </div>

              {/* 交易账户 */}
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">交易账户</span>
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