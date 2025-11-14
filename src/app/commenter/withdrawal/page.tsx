'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CreditCardOutlined, AlipayOutlined, InfoCircleOutlined } from '@ant-design/icons';


interface ApiBankCard {
  id: string;
  userId: string;
  cardholderName: string;
  cardNumber: string;
  bank: string;
  issuingBank: string;
  isDefault: boolean;
  createTime: string;
}

interface ApiResponse {
  code: number;
  message: string;
  data: ApiBankCard[];
  success: boolean;
  timestamp: number;
}

interface ApiBalanceResponse {
  code: number;
  message: string;
  data: WalletInfo[];
  success: boolean;
  timestamp: number;
}

interface WalletInfo {
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

interface BankCard {
  id: string;
  bankName: string;
  cardNumber: string;
  fullCardNumber: string;
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
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [paymentPassword, setPaymentPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // 调用后端API获取银行卡列表数据
  useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        setLoading(true);

        const responseBalance = await fetch('/api/public/walletmanagement/getwalletinfo', {
          method: 'GET',
          headers: {
            'accept': 'application/json',
            'Content-Type': 'application/json'
          },
          // 设置超时处理
          signal: AbortSignal.timeout(10000),
          // 凭证设置，确保cookie可以被发送到API
          credentials: 'include' as RequestCredentials
        });
        
        // 检查余额响应状态
        if (!responseBalance.ok) {
          throw new Error(`获取余额失败，状态码: ${responseBalance.status}`);
        }
        
        // 调用后端API获取银行卡列表
        const response = await fetch('/api/public/bank/getbankcardslist', {
          method: 'GET',
          headers: {
            'accept': 'application/json',
            'Content-Type': 'application/json'
          },
          // 设置超时处理
          signal: AbortSignal.timeout(10000),
          // 凭证设置，确保cookie可以被发送到API
          credentials: 'include' as RequestCredentials
        });
        
        // 检查银行卡列表响应状态
        if (!response.ok) {
          throw new Error(`请求失败，状态码: ${response.status}`);
        }
        
        // 解析响应数据
        const apiResponse: ApiResponse = await response.json();
        const apiBalanceResponse: ApiBalanceResponse = await responseBalance.json();
        
        // 处理API返回的错误
        if (!apiResponse.success) {
          const errorMsg = apiResponse.message || '获取银行卡列表失败';
          throw new Error(errorMsg);
        }
        
        // 检查余额API返回状态
        if (apiBalanceResponse.success && apiBalanceResponse.data.length > 0) {
          setAvailableBalance(apiBalanceResponse.data[0].availableBalance);
        }
        
        // 将API返回的数据转换为前端显示需要的格式
        const formattedBankCards: BankCard[] = (apiResponse.data || []).map((card: ApiBankCard) => ({
          id: card.id,
          bankName: card.bank || card.issuingBank || '未知银行',
          cardNumber: formatBankCardNumber(card.cardNumber),
          fullCardNumber: card.cardNumber,
          holderName: card.cardholderName,
          isDefault: card.isDefault
        }));
        
        // 模拟支付宝账户数据（暂不调用API）
        const mockAlipayAccounts: AlipayAccount[] = [
          {
            id: 'alipay-001',
            accountName: '测试',
            accountNumber: '13794719208',
            isDefault: true,
            
          }
        ];

        setBankCards(formattedBankCards);
        setAlipayAccounts(mockAlipayAccounts);

        // 设置默认选择的卡片 - 将isDefault字段为true的银行卡设置为默认选中状态
        if (formattedBankCards.length > 0) {
          const defaultBank = formattedBankCards.find(card => card.isDefault) || formattedBankCards[0];
          setSelectedBankId(defaultBank.id);
        }

        if (mockAlipayAccounts.length > 0) {
          const defaultAlipay = mockAlipayAccounts.find(acc => acc.isDefault) || mockAlipayAccounts[0];
          setSelectedAlipayId(defaultAlipay.id);
        }
      } catch (err) {
        console.error('获取支付方式失败:', err);
        if (err instanceof Error) {
          setError(`获取支付方式失败: ${err.message}`);
        } else {
          setError('获取支付方式失败，请稍后重试');
        }
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
    // 只允许输入整数
    const filteredValue = value.replace(/[^0-9]/g, '');
    setAmount(filteredValue);
    setError('');
  };

  // 处理提现方式切换
  const handleMethodChange = (value: 'bank' | 'alipay') => {
    setWithdrawalMethod(value);
    setError('');
  };

  // 处理提现提交 - 先弹出密码输入框
  const handleSubmit = () => {
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

    // 清除之前的密码和错误信息
    setPaymentPassword('');
    setPasswordError('');
    // 显示支付密码输入框
    setShowPasswordModal(true);
  };

  // 处理支付密码验证和实际提现提交
  const handlePasswordConfirm = async () => {
    // 验证支付密码不为空 - 添加日志调试
    console.log('handlePasswordConfirm called, paymentPassword:', paymentPassword);
    
    if (!paymentPassword || paymentPassword.trim() === '') {
      console.log('Password is empty or whitespace');
      setPasswordError('请输入支付密码');
      return;
    }

    try {
      setLoading(true);
      setPasswordError('');

      let selectedAccount;
      let methodRemark;

      // 根据选择的提现方式获取对应的账号信息
      if (withdrawalMethod === 'bank') {
        selectedAccount = getSelectedBankCard();
        if (selectedAccount) {
          methodRemark = `银行卡:${selectedAccount.fullCardNumber}`;
        }
      } else {
        selectedAccount = alipayAccounts.find(acc => acc.id === selectedAlipayId);
        if (selectedAccount) {
          methodRemark = `支付宝:${selectedAccount.accountNumber}`;
        }
      }

      // 验证选择的账号
      if (!selectedAccount) {
        setPasswordError('未选择有效的提现账户');
        setLoading(false);
        return;
      }

      // 验证金额
      const numAmount = parseFloat(amount);
      if (isNaN(numAmount) || numAmount <= 0) {
        setPasswordError('请输入有效的提现金额');
        setLoading(false);
        return;
      }

      console.log('Withdrawal request data:', {
        withdrawalMethod,
        selectedAccount: selectedAccount.id,
        amount: numAmount,
        remark: methodRemark,
        paymentPassword: '******' // 掩码显示密码
      });

      // 调用后端API提交提现申请，处理两种提现方式
      console.log('Calling withdrawal API...');
      const response = await fetch('/api/public/walletmanagement/balancewithdrawal', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: numAmount,
          securityPassword: paymentPassword,
          remark: methodRemark
        }),
        credentials: 'include' as RequestCredentials
      });
      
      console.log('API response status:', response.status);
      
      // 检查响应状态
      if (!response.ok) {
        throw new Error(`请求失败，状态码: ${response.status}`);
      }
      
      // 解析响应数据
      const result = await response.json();
      console.log('API response data:', result);
      
      // 处理API返回的错误
      if (!result.success) {
        const errorMsg = result.message || '提交提现申请失败';
        throw new Error(errorMsg);
      }

      // 关闭密码输入框
      setShowPasswordModal(false);
      // 提现成功后跳转到提现记录页面
      router.push('/commenter/withdrawal/list');
    } catch (err) {
      console.error('提交提现申请失败:', err);
      if (err instanceof Error) {
        const errorMsg = `提交失败: ${err.message}`;
        console.log(errorMsg);
        setPasswordError(errorMsg);
      } else {
        const errorMsg = '提交失败，请稍后重试';
        console.log(errorMsg);
        setPasswordError(errorMsg);
      }
    } finally {
      setLoading(false);
      console.log('Withdrawal process completed');
    }
  };

  // 关闭密码输入框
  const closePasswordModal = () => {
    setShowPasswordModal(false);
    setPaymentPassword('');
    setPasswordError('');
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

      <div className="mb-6 border border-gray-200 rounded-lg shadow-sm p-4">
        <div className="">
            <div className='p-4 bg-green-500 flex flex-col items-center justify-center h-[120px] rounded-md mb-4'> 
                <div className=" text-white">可用余额: </div>
                <div className=" text-white">{availableBalance.toFixed(2)}</div>
            </div>
            <div className="text-lg font-medium mb-2">提现金额:</div>         
            <div className="relative mb-4">
                <input
                  type="text"
                  value={amount}
                  onChange={handleAmountChange}
                  placeholder="请输入提现金额"
                  className="pl-8  text-xl  border rounded w-full"
                  disabled={loading || !!success}
                  />
                  {amount && (!/^\d+$/.test(amount) || parseInt(amount) % 100 !== 0) && (
                    <p className="text-red-500 text-sm mt-1">提现金额必须是100的整数倍</p>
                  )}
                  <p className="text-sm text-red-500 mt-1">*提现金额必须是整数且是100的倍数</p>
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
                <div className="grid grid-cols-3 gap-2">
                {[100, 200, 300, 500, 1000].map(value => (
                    <button
                    key={value}
                    type="button"
                    onClick={() => setAmount(value.toString())}
                    disabled={loading || !!success || value > availableBalance}
                    className={`${value > availableBalance ? 'opacity-50 cursor-not-allowed' : ''} bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded w-full`}
                    >
                    {value}元
                    </button>
                ))}
                </div>
            </div>
        </div>
      </div>

      <div className="mb-6 border border-gray-200 rounded-lg shadow-sm p-4">
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
                <span className="ml-auto bg-gray-100 text-gray-800 text-xs rounded px-2 py-1">
                    {bankCards.length}张卡
                </span>
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
                <span className="ml-auto bg-gray-100 text-gray-800 text-xs rounded px-2 py-1">
                  {alipayAccounts.length}个账户
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {withdrawalMethod === 'bank' && bankCards.length > 0 && (
        <div className="mb-6 border border-gray-200 rounded-lg shadow-sm p-4">
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
                      <span className="ml-2 inline-block px-2 py-1 bg-green-100 text-green-800 text-xs rounded">默认</span>
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
        </div>
      )}

      {withdrawalMethod === 'alipay' && alipayAccounts.length > 0 && (
        <div className="mb-6 border border-gray-200 rounded-lg shadow-sm p-4">
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
                      <span className="ml-2 inline-block px-2 py-1 bg-green-100 text-green-800 text-xs rounded">默认</span>
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
        </div>
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
      <button
        type="button"
        onClick={handleSubmit}
        className="w-full py-6 text-lg font-medium bg-blue-600 hover:bg-blue-700 text-white rounded"
        disabled={loading || !amount}
      >
        {loading ? '提交中...' : '确认提现'}
      </button>

      {/* 底部提示 */}
      <div className="mt-6 text-center text-xs ">
        <p>提现金额将在1-3个工作日内到账，请耐心等待</p>
        <p className="mt-1">如有疑问，请联系客服</p>
      </div>

      {/* 支付密码输入弹窗 */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md mx-4 p-6">
            <h3 className="text-xl font-medium mb-4 text-center">输入支付密码</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">支付密码</label>
              <input
                type="password"
                value={paymentPassword}
                onChange={(e) => {
                  const value = e.target.value;
                  console.log('Password input changed:', value);
                  setPaymentPassword(value);
                }}
                placeholder="请输入支付密码"
                className="w-full px-4 py-2 border border-gray-300 rounded"
                disabled={loading}
                // 添加autoComplete属性防止浏览器自动填充干扰
                autoComplete="off"
              />
              {passwordError && (
                <p className="text-red-500 text-sm mt-1">{passwordError}</p>
              )}
            </div>
            
            <div className="flex gap-3">
              <button
                type="button"
                onClick={closePasswordModal}
                className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                disabled={loading}
              >
                取消
              </button>
              <button
                type="button"
                onClick={handlePasswordConfirm}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                disabled={loading}
              >
                {loading ? '验证中...' : '确认'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WithdrawalPage;