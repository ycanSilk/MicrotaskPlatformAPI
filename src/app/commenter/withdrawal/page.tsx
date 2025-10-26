'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { CreditCardOutlined, AlipayOutlined, InfoCircleOutlined } from '@ant-design/icons';

interface BankCard {
  id: string;
  bankName: string;
  cardNumber: string;
  holderName: string;
  isDefault: boolean;
}

interface AlipayAccount {
  id: string;
  accountName: string;
  accountNumber: string;
  isDefault: boolean;
}

const WithdrawalPage = () => {
  const router = useRouter();
  const [withdrawalMethod, setWithdrawalMethod] = useState<'bank' | 'alipay'>('bank');
  const [amount, setAmount] = useState('');
  const [selectedBankId, setSelectedBankId] = useState<string>('');
  const [selectedAlipayId, setSelectedAlipayId] = useState<string>('');
  const [bankCards, setBankCards] = useState<BankCard[]>([]);
  const [alipayAccounts, setAlipayAccounts] = useState<AlipayAccount[]>([]);
  const [availableBalance, setAvailableBalance] = useState(1298.00);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // 模拟获取银行卡和支付宝账户数据
  useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        setLoading(true);
        // 模拟网络请求延迟
        await new Promise(resolve => setTimeout(resolve, 500));

        // 模拟银行卡数据
        const mockBankCards: BankCard[] = [
          {
            id: 'bank-001',
            bankName: '工商银行',
            cardNumber: '6222 **** **** 5678',
            holderName: '张三',
            isDefault: true
          },
          {
            id: 'bank-002',
            bankName: '建设银行',
            cardNumber: '6217 **** **** 1234',
            holderName: '张三',
            isDefault: false
          }
        ];

        // 模拟支付宝账户数据
        const mockAlipayAccounts: AlipayAccount[] = [
          {
            id: 'alipay-001',
            accountName: '张三',
            accountNumber: '138****5678',
            isDefault: true
          }
        ];

        setBankCards(mockBankCards);
        setAlipayAccounts(mockAlipayAccounts);

        // 设置默认选择的卡片
        if (mockBankCards.length > 0) {
          const defaultBank = mockBankCards.find(card => card.isDefault) || mockBankCards[0];
          setSelectedBankId(defaultBank.id);
        }

        if (mockAlipayAccounts.length > 0) {
          const defaultAlipay = mockAlipayAccounts.find(acc => acc.isDefault) || mockAlipayAccounts[0];
          setSelectedAlipayId(defaultAlipay.id);
        }
      } catch (err) {
        console.error('获取支付方式失败:', err);
        setError('获取支付方式失败，请稍后重试');
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentMethods();
  }, []);

  // 验证提现金额
  const validateAmount = (value: string): { isValid: boolean; message: string } => {
    const numAmount = parseFloat(value);

    // 检查是否为有效数字
    if (isNaN(numAmount) || numAmount <= 0) {
      return { isValid: false, message: '请输入有效的提现金额' };
    }

    // 检查最低金额
    if (numAmount < 100) {
      return { isValid: false, message: '最低提现金额为100元' };
    }

    // 检查最高金额
    if (numAmount > 1000) {
      return { isValid: false, message: '最高提现金额为1000元' };
    }

    // 检查是否为100的整数倍
    if (numAmount % 100 !== 0) {
      return { isValid: false, message: '提现金额必须为100的整数倍' };
    }

    // 检查余额是否充足
    if (numAmount > availableBalance) {
      return { isValid: false, message: '提现金额不能超过可用余额' };
    }

    return { isValid: true, message: '' };
  };

  // 处理金额输入变化
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // 只允许输入数字和小数点
    const filteredValue = value.replace(/[^0-9.]/g, '');
    setAmount(filteredValue);
    setError('');
  };

  // 处理提现方式切换
  const handleMethodChange = (value: 'bank' | 'alipay') => {
    setWithdrawalMethod(value);
    setError('');
  };

  // 处理提现提交
  const handleSubmit = async () => {
    // 验证金额
    const validation = validateAmount(amount);
    if (!validation.isValid) {
      setError(validation.message);
      return;
    }

    // 验证是否选择了提现账户
    if ((withdrawalMethod === 'bank' && !selectedBankId) || 
        (withdrawalMethod === 'alipay' && !selectedAlipayId)) {
      setError('请选择提现账户');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // 模拟提交提现申请
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 直接跳转到提现记录页面
      router.push('/commenter/withdrawal/list');
    } catch (err) {
      console.error('提交提现申请失败:', err);
      setError('提交提现申请失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  // 获取选中的银行卡信息
  const getSelectedBankCard = (): BankCard | undefined => {
    return bankCards.find(card => card.id === selectedBankId);
  };

  // 获取选中的支付宝账户信息
  const getSelectedAlipayAccount = (): AlipayAccount | undefined => {
    return alipayAccounts.find(acc => acc.id === selectedAlipayId);
  };

  // 格式化银行卡号显示
  const formatBankCardNumber = (cardNumber: string): string => {
    // 保留前4位和后4位，中间用*代替
    const cleaned = cardNumber.replace(/\s/g, '');
    if (cleaned.length <= 8) return cardNumber;
    return `${cleaned.substring(0, 4)} **** **** ${cleaned.substring(cleaned.length - 4)}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-4 px-3">
      {/* 页面标题 */}
      <div className="mb-6">
        <div className="flex items-center mb-2">
          <button 
            onClick={() => router.back()} 
            className="mr-2 p-1 rounded-full hover:bg-gray-200"
          >
            ←
          </button>
          <h1 className="text-xl font-medium">申请提现</h1>
        </div>
       
      </div>

      <Card className="mb-6">
        <div className="">
            <div className='p-4 bg-green-500 flex flex-col items-center justify-center h-[120px] rounded-md mb-4'> 
                <div className=" text-white">可用余额: </div>
                <div className=" text-white">{availableBalance.toFixed(2)}</div>
            </div>
            <div className="text-lg font-medium mb-2">提现金额:</div>         
            <div className="relative mb-4">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-lg font-medium">¥</span>
                <Input
                type="text"
                value={amount}
                onChange={handleAmountChange}
                placeholder="请输入提现金额"
                className="pl-8 py-3 text-2xl font-medium"
                disabled={loading || !!success}
                />
            </div>

            <div className="text-sm  mb-4">
                <p>提现说明：</p>
                <ul className="list-disc list-inside pl-2 mt-1 space-y-1">
                <li>最低提现金额：100元</li>
                <li>最高提现金额：1000元</li>
                <li>提现金额必须为100的整数倍</li>
                <li>提现申请提交后将在1-3个工作日内到账</li>
                </ul>
            </div>

            {/* 快捷金额选项 */}
            <div className="mb-4">
                <p className="text-sm  mb-2">快捷提现金额：</p>
                <div className="flex gap-2 flex-wrap">
                {[100, 200, 300, 500, 1000].map(value => (
                    <Button
                    key={value}
                    variant="secondary"
                    onClick={() => setAmount(value.toString())}
                    disabled={loading || !!success || value > availableBalance}
                    className={`${value > availableBalance ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                    {value}元
                    </Button>
                ))}
                </div>
            </div>
        </div>
      </Card>

      <Card className="mb-6">
        <div className="p-4">
          <h2 className="text-lg font-medium mb-4">提现方式</h2>
          
          <div className="space-y-4">
            <div 
              className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-colors ${withdrawalMethod === 'bank' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}
              onClick={() => !loading && !success && handleMethodChange('bank')}
              style={{ opacity: (loading || success) ? 0.6 : 1 }}
            >
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${withdrawalMethod === 'bank' ? 'border-blue-500' : 'border-gray-300'}`}>
                {withdrawalMethod === 'bank' && <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />}
              </div>
              <CreditCardOutlined className="text-blue-600" />
              <span>银行卡</span>
              {bankCards.length > 0 && (
                <Badge className="ml-auto">
                  {bankCards.length}张卡
                </Badge>
              )}
            </div>
            
            <div 
              className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-colors ${withdrawalMethod === 'alipay' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}
              onClick={() => !loading && !success && handleMethodChange('alipay')}
              style={{ opacity: (loading || success) ? 0.6 : 1 }}
            >
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${withdrawalMethod === 'alipay' ? 'border-blue-500' : 'border-gray-300'}`}>
                {withdrawalMethod === 'alipay' && <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />}
              </div>
              <AlipayOutlined className="text-blue-500" />
              <span>支付宝</span>
              {alipayAccounts.length > 0 && (
                <Badge className="ml-auto">
                  {alipayAccounts.length}个账户
                </Badge>
              )}
            </div>
          </div>
        </div>
      </Card>

      {withdrawalMethod === 'bank' && bankCards.length > 0 && (
        <Card className="mb-6">
          <div className="p-4">
            <h2 className="text-lg font-medium mb-4">选择银行卡</h2>
            <div className="space-y-3">
              {bankCards.map(card => (
                <div
                  key={card.id}
                  className={`p-3 border rounded-lg flex items-center justify-between cursor-pointer transition-colors ${selectedBankId === card.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}
                  onClick={() => setSelectedBankId(card.id)}
                >
                  <div>
                    <div className="font-medium">{card.bankName}</div>
                    <div className="text-sm  mt-1">{card.cardNumber}</div>
                  </div>
                  <div className="flex items-center">
                    {card.isDefault && (
                      <Badge className="mr-2 bg-green-100 text-green-800 hover:bg-green-200">默认</Badge>
                    )}
                    {selectedBankId === card.id && (
                      <div className="w-4 h-4 rounded-full border-2 border-blue-500 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {withdrawalMethod === 'alipay' && alipayAccounts.length > 0 && (
        <Card className="mb-6">
          <div className="p-4">
            <h2 className="text-lg font-medium mb-4">选择支付宝账户</h2>
            <div className="space-y-3">
              {alipayAccounts.map(acc => (
                <div
                  key={acc.id}
                  className={`p-3 border rounded-lg flex items-center justify-between cursor-pointer transition-colors ${selectedAlipayId === acc.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}
                  onClick={() => setSelectedAlipayId(acc.id)}
                >
                  <div>
                    <div className="font-medium">{acc.accountName}</div>
                    <div className="text-sm  mt-1">{acc.accountNumber}</div>
                  </div>
                  <div className="flex items-center">
                    {acc.isDefault && (
                      <Badge className="mr-2 bg-green-100 text-green-800 hover:bg-green-200">默认</Badge>
                    )}
                    {selectedAlipayId === acc.id && (
                      <div className="w-4 h-4 rounded-full border-2 border-blue-500 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* 错误提示 */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6 flex items-start">
          <InfoCircleOutlined className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 成功提示 - 已移除，直接跳转 */}

      {/* 提现按钮 */}
      <Button
        onClick={handleSubmit}
        className="w-full py-6 text-lg font-medium bg-blue-600 hover:bg-blue-700 text-white"
        disabled={loading || !amount}
      >
        {loading ? '提交中...' : '确认提现'}
      </Button>

      {/* 底部提示 */}
      <div className="mt-6 text-center text-xs ">
        <p>提现金额将在1-3个工作日内到账，请耐心等待</p>
        <p className="mt-1">如有疑问，请联系客服</p>
      </div>
    </div>
  );
};

export default WithdrawalPage;