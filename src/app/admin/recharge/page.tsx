'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import AlertModal from '../../../components/ui/AlertModal';
import { WalletOutlined, CreditCardOutlined, DollarOutlined, ShoppingOutlined, CoffeeOutlined, InfoCircleOutlined } from '@ant-design/icons';

// 定义类型接口
export interface BalanceData {
  balance: number;
}

export default function PublisherFinancePage() {
  const router = useRouter();
  const params = useParams();
  const [rechargeAmount, setRechargeAmount] = useState('');
  const [rechargeRemark, setRechargeRemark] = useState('');
  // 初始化余额数据，确保符合BalanceData类型
  const [balance, setBalance] = useState<BalanceData>({
    balance: 0
  });
  const [loading, setLoading] = useState(true);
  const [rechargeSuccess, setRechargeSuccess] = useState(false);

  
  
  // 用户信息状态
  const [userId, setUserId] = useState('');


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
  const rechargeOptions = [100, 200, 300, 500, 1000, 2000];

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

  // 获取用户信息和财务数据
  useEffect(() => {
    // 如果URL参数中有ID，则设置为初始值
    if (params?.id) {
      const userIdFromParams = params.id as string;
      setUserId(userIdFromParams);
    }
    
    // 初始化空余额数据
    const newBalance: BalanceData = {
      balance: 0
    };
    setBalance(newBalance);
    setLoading(false);
  }, [params]);

  // 处理充值 - 调用后端API
  const handleRecharge = async () => {
    console.log('开始处理充值请求', { rechargeAmount, userId, rechargeRemark });
    
    // 输入验证
    if (!userId) {
      console.log('用户ID不能为空');
      showAlert('输入错误', '请输入用户ID', '⚠️');
      return;
    }
    
    if (!rechargeAmount || parseFloat(rechargeAmount) <= 0) {
      console.log('充值金额无效');
      showAlert('输入错误', '请输入有效的充值金额', '⚠️');
      return;
    }
    
    if (!rechargeRemark) {
      console.log('充值备注不能为空');
      showAlert('输入错误', '请输入充值备注', '⚠️');
      return;
    }

    try {
      const amount = parseFloat(rechargeAmount);
      const targetUserId = userId;
      const remark = rechargeRemark;

      // 调用后端充值API
      const response = await fetch('/api/wallet/recharge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ targetUserId, amount, remark }),
      });
      console.log('前端请求的后端APIurl:/api/wallet/recharge');
      console.log('targetUserId:', targetUserId);
      console.log('amount:', amount);
      console.log('remark:', remark);
      const result = await response.json();

      if (result.success) {
        // 充值成功
        showAlert('充值成功', `成功充值 ${amount} 元`, '✅', () => {
          // 用户点击确认后的回调函数
          setRechargeSuccess(true);
          // 更新余额
          const newBalance = {
            balance: balance.balance + amount
          };
          setBalance(newBalance);
          setUserId('');
          setRechargeAmount('');
          setRechargeRemark('');
        });
      } else {
        // 充值失败
        showAlert('错误', result.message || '充值失败，请稍后重试', '❌');
      }
    } catch (error) {
      console.error('充值失败:', error);
      showAlert('错误', '充值失败，请稍后重试', '❌');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50  px-4">
      {/* 用户ID输入 */}
      <div className="mx-4  mb-6">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h2 className="text-sm font-medium text-gray-700 mb-1">用户ID</h2>
          <input
            type="text"
            placeholder="请输入用户ID"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>

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

              {/* 充值备注 */}
              <div className="mb-4">
                <textarea
                  placeholder="请输入充值备注"
                  value={rechargeRemark}
                  onChange={(e) => setRechargeRemark(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-y min-h-[80px]"
                />
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