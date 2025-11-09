'use client';
import { useState } from 'react';
import { BankOutlined, EnvironmentOutlined, FlagOutlined, ToolOutlined, MessageOutlined, WalletOutlined, MedicineBoxOutlined, ShopOutlined, WarningOutlined, SunOutlined, GlobalOutlined, CreditCardOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';

// 定义银行列表数据
const BANKS = [
  { code: 'ICBC', name: '工商银行', icon: <BankOutlined className="text-xl" /> },
  { code: 'ABC', name: '农业银行', icon: <EnvironmentOutlined className="text-xl" /> },
  { code: 'BOC', name: '中国银行', icon: <FlagOutlined className="text-xl" /> },
  { code: 'CCB', name: '建设银行', icon: <ToolOutlined className="text-xl" /> },
  { code: 'PSBC', name: '邮储银行', icon: <MessageOutlined className="text-xl" /> },
  { code: 'CMB', name: '招商银行', icon: <WalletOutlined className="text-xl" /> },
  { code: 'CMBC', name: '民生银行', icon: <MedicineBoxOutlined className="text-xl" /> },
  { code: 'SPDB', name: '浦发银行', icon: <ShopOutlined className="text-xl" /> },
  { code: 'CIB', name: '兴业银行', icon: <WarningOutlined className="text-xl" /> },
  { code: 'CEB', name: '光大银行', icon: <SunOutlined className="text-xl" /> },
  { code: 'HXB', name: '华夏银行', icon: <GlobalOutlined className="text-xl" /> }
];



// 定义错误状态接口
interface FormErrors {
  cardHolderName?: string;
  cardNumber?: string;
  bankCode?: string;
  phoneNumber?: string;
  bankBranch?: string;
}

export default function BindBankCardPage() {
  const router = useRouter();
  // 状态管理
  const [cardHolderName, setCardHolderName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [selectedBank, setSelectedBank] = useState<{ code: string; name: string; icon: React.ReactNode } | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [bankBranch, setBankBranch] = useState('');
  const [showBankList, setShowBankList] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // 验证持卡人姓名（支持中文、英文及部分特殊字符）
  const validateCardHolderName = (name: string): string | null => {
    if (!name.trim()) {
      return '持卡人姓名不能为空';
    }
    // 支持中文、英文、点、空格和连字符
    if (!/^[\u4e00-\u9fa5a-zA-Z\s.\-]{1,50}$/.test(name)) {
      return '持卡人姓名格式不正确，仅支持中文、英文及部分特殊字符';
    }
    return null;
  };



  // 验证银行卡号（Luhn算法验证，储蓄卡固定16位）
  const validateCardNumber = (number: string): string | null => {
    const cleanedNumber = number.replace(/\s/g, '');
    
    if (!cleanedNumber) {
      return '银行卡号不能为空';
    }
    
    if (!/^\d{16,19}$/.test(cleanedNumber)) {
      return '银行卡号格式不正确，储蓄卡应为16-19位数字';
    }
    
    // Luhn算法验证
    let sum = 0;
    let isEven = false;
    for (let i = cleanedNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(cleanedNumber.charAt(i), 10);
      
      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }
      
      sum += digit;
      isEven = !isEven;
    }
    
    if (sum % 10 !== 0) {
      return '银行卡号无效，请检查输入';
    }
    
    return null;
  };

  // 验证银行选择
  const validateBank = (bank: typeof selectedBank): string | null => {
    if (!bank) {
      return '请选择所属银行';
    }
    return null;
  };

  // 验证手机号（选填但填写时需符合格式）
  const validatePhoneNumber = (phone: string): string | null => {
    if (!phone) {
      return null; // 手机号为选填
    }
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      return '手机号格式不正确，请输入11位手机号码';
    }
    return null;
  };

  // 处理银行选择
  const handleBankSelect = (bank: { code: string; name: string; icon: React.ReactNode }) => {
    setSelectedBank(bank);
    setShowBankList(false);
    // 清除相关错误
    if (errors.bankCode) {
      setErrors(prev => ({ ...prev, bankCode: undefined }));
    }
  };

  // 格式化银行卡号，每4位加空格
  const formatCardNumber = (value: string) => {
    return value.replace(/\s+/g, '').replace(/(\d{4})/g, '$1 ').trim();
  };

  // 验证开户行
  const validateBankBranch = (branch: string): string | null => {
    if (!branch.trim()) {
      return '开户行不能为空';
    }
    // 支持中文、英文、数字、常见标点符号，长度限制在2-100个字符
    if (!/^[\u4e00-\u9fa5a-zA-Z0-9\s\u002D-\u002F\u0028-\u0029\u002E\u002C\u003A\u003B\u005F]{2,100}$/.test(branch)) {
      return '开户行格式不正确，请输入2-100个字符的有效开户行名称';
    }
    return null;
  };

  // 处理输入变化并清除对应字段错误
  const handleInputChange = (field: string, value: string) => {
    switch (field) {
      case 'cardHolderName':
        setCardHolderName(value);
        if (errors.cardHolderName) {
          setErrors(prev => ({ ...prev, cardHolderName: undefined }));
        }
        break;
      case 'cardNumber':
        // 只保留数字字符
        const numericValue = value.replace(/[^0-9]/g, '');
        // 限制最大数字长度为16位
        const limitedValue = numericValue.slice(0, 19);
        setCardNumber(limitedValue);
        
        // 清除卡号错误状态
        if (errors.cardNumber) {
          setErrors(prev => ({ ...prev, cardNumber: undefined }));
        }
        break;
      case 'phoneNumber':
        const phoneValue = value.replace(/[^\d]/g, '');
        setPhoneNumber(phoneValue);
        if (errors.phoneNumber) {
          setErrors(prev => ({ ...prev, phoneNumber: undefined }));
        }
        break;
      case 'bankBranch':
        setBankBranch(value);
        if (errors.bankBranch) {
          setErrors(prev => ({ ...prev, bankBranch: undefined }));
        }
        break;
    }
  };

  // 表单验证
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    const nameError = validateCardHolderName(cardHolderName);
    if (nameError) newErrors.cardHolderName = nameError;
    
    const numberError = validateCardNumber(cardNumber);
    if (numberError) newErrors.cardNumber = numberError;
    
    const bankError = validateBank(selectedBank);
    if (bankError) newErrors.bankCode = bankError;
    
    const phoneError = validatePhoneNumber(phoneNumber);
    if (phoneError) newErrors.phoneNumber = phoneError;
    
    const branchError = validateBankBranch(bankBranch);
    if (branchError) newErrors.bankBranch = branchError;
    
    setErrors(newErrors);
    
    // 如果有错误，将焦点设置到第一个错误字段
    if (Object.keys(newErrors).length > 0) {
      const firstErrorField = Object.keys(newErrors)[0];
      const element = document.getElementById(firstErrorField);
      if (element) {
        element.focus();
        // 滚动到错误字段
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
    
    return Object.keys(newErrors).length === 0;
  };

  // 提交表单
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setApiError(null);
    
    try {
      // 构建提交数据，按照后端API要求的格式
      const formData: any = {
        userId: '', // 添加用户ID，实际应用中应从用户认证状态获取
        cardholderName: cardHolderName, // 使用后端API要求的字段名
        cardNumber: cardNumber.replace(/\s/g, ''),
        bank: selectedBank?.code,
        issuingBank: bankBranch.trim() // 开户行作为必填项 
      };
      
      // 如果提供了手机号，也添加到表单数据中
      if (phoneNumber) {
        formData.phoneNumber = phoneNumber;
      }
      
      console.log('提交的银行卡信息:', formData);
      
      // 调用指定的后端API文件
      const response = await fetch('/api/public/bank/addbankcard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (!response.ok || !data.success) {
        // 处理API返回的错误
        setApiError(data.message || '绑定银行卡失败');
        return;
      }
      
      // 显示成功信息
      setShowSuccess(true);
      
      // 3秒后返回银行卡列表页
      setTimeout(() => {
        router.push('/commenter/bank-cards');
      }, 3000);
      
    } catch (error) {
        console.error('绑定银行卡失败:', error);
        // 提供更详细的错误信息
        if (error instanceof Error) {
          setApiError(`网络错误: ${error.message}，请稍后重试`);
        } else {
          setApiError('网络连接失败，请检查您的网络设置后重试');
        }
      } finally {
        setIsSubmitting(false);
      }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航栏 */}
      <div className="sticky top-0 z-10 bg-white shadow-sm">
        <div className="flex items-center justify-center h-16 relative">
          <button
            onClick={() => router.back()}
            className="absolute left-4 text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-lg font-medium text-gray-800">绑定银行卡</h1>
          <div className="w-6 h-6 absolute right-4"></div> {/* 占位元素保持标题居中 */}
        </div>
      </div>

      {/* 主要内容区 */}
      <div className="px-5 py-6">
        {showSuccess ? (
          // 绑定成功页面
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-50 flex items-center justify-center">
              <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-medium text-gray-800 mb-2">绑定成功</h2>
            <p className="text-gray-600 mb-8">
              您的银行卡已成功绑定，可用于账户提现
            </p>
            <p className="text-gray-500 text-sm mb-4">将在3秒后自动返回...</p>
          </div>
        ) : (
          // 一次性表单页面
          <div className="bg-white rounded-xl shadow-sm p-5 mb-5">
            <h2 className="text-base font-medium text-gray-800 mb-6">填写银行卡信息</h2>
            
            {apiError && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg flex items-center">
                <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{apiError}</span>
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              {/* 持卡人姓名 */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  持卡人姓名 <span className="text-red-500">*</span>
                </label>
                <input
                  id="cardHolderName"
                  type="text"
                  value={cardHolderName}
                  onChange={(e) => handleInputChange('cardHolderName', e.target.value)}
                  placeholder="请输入持卡人姓名"
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none transition-all ${errors.cardHolderName ? 'border-red-500 focus:ring-2 focus:ring-red-200' : 'border-gray-200 focus:ring-2 focus:ring-blue-500'} text-gray-700`}
                />
                {errors.cardHolderName && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    {errors.cardHolderName}
                  </p>
                )}
              </div>

              {/* 银行卡卡号 */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  银行卡卡号 <span className="text-red-500">*</span>
                </label>
                <input
                  id="cardNumber"
                  type="text"
                  value={formatCardNumber(cardNumber)}
                  onChange={(e) => handleInputChange('cardNumber', e.target.value)}
                  placeholder="请输入银行卡号"
                  maxLength={23} // 16位数字 + 3个空格
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none transition-all ${errors.cardNumber ? 'border-red-500 focus:ring-2 focus:ring-red-200' : 'border-gray-200 focus:ring-2 focus:ring-blue-500'} text-gray-700`}
                />
                {errors.cardNumber && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    {errors.cardNumber}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  请输入本人名下储蓄卡卡号，目前仅支持储蓄卡绑定
                </p>
              </div>

              {/* 所属银行 */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  所属银行 <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowBankList(!showBankList)}
                  className={`w-full flex items-center justify-between p-3 border rounded-lg transition-all ${errors.bankCode ? 'border-red-500 focus:ring-2 focus:ring-red-200' : 'border-gray-200 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500'}`}
                >
                  <div className="flex items-center">
                    <span className="text-xl mr-3">{selectedBank?.icon || <CreditCardOutlined className="text-xl" />}</span>
                    <div>
                      <span className="text-gray-600">{selectedBank?.name || '请选择银行'}</span>
                    </div>
                  </div>
                  <svg className={`w-5 h-5 text-gray-500 transition-transform ${showBankList ? 'transform rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {errors.bankCode && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    {errors.bankCode}
                  </p>
                )}

                {/* 银行列表 */}
                {showBankList && (
                  <div className="mt-3 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden max-h-96 overflow-y-auto z-10">
                    <div className="grid grid-cols-3 gap-2 p-2">
                      {BANKS.map((bank) => (
                        <button
                          key={bank.code}
                          type="button"
                          onClick={() => handleBankSelect(bank)}
                          className={`flex flex-col items-center justify-center p-3 border rounded-lg transition-colors ${selectedBank?.code === bank.code ? 'bg-blue-50 border-blue-200' : 'border-gray-200 hover:bg-gray-50'}`}
                        >
                          <span className="text-2xl mb-1">{bank.icon}</span>
                          <span className="text-xs text-gray-700">{bank.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 手机号（选填） */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  手机号 <span className="text-gray-400 text-xs">(选填)</span>
                </label>
                <input
                  id="phoneNumber"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                  placeholder="请输入手机号码"
                  maxLength={11}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none transition-all ${errors.phoneNumber ? 'border-red-500 focus:ring-2 focus:ring-red-200' : 'border-gray-200 focus:ring-2 focus:ring-blue-500'} text-gray-700`}
                />
                {errors.phoneNumber && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    {errors.phoneNumber}
                  </p>
                )}
              </div>

              {/* 开户行（选填） */}
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  开户行 <span className="text-red-500">*</span>
            </label>
            <input
              id="bankBranch"
              type="text"
              value={bankBranch}
              onChange={(e) => handleInputChange('bankBranch', e.target.value)}
              placeholder="请输入开户银行名称，如：某某银行某某分行"
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none transition-all ${errors.bankBranch ? 'border-red-500 focus:ring-2 focus:ring-red-200' : 'border-gray-200 focus:ring-2 focus:ring-blue-500'} text-gray-700`}
            />
            {errors.bankBranch && (
              <p className="text-red-500 text-xs mt-1 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                {errors.bankBranch}
              </p>
            )}
              </div>

              {/* 提交按钮 */}
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3 rounded-lg text-white font-medium transition-colors ${isSubmitting ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'}`}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    绑定中...
                  </div>
                ) : (
                  '确认绑定'
                )}
              </button>
            </form>
          </div>
        )}

        {/* 安全提示 */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            为保障您的资金安全，我们采用银行级加密技术<br />
            您的银行卡信息仅用于身份验证和提现
          </p>
        </div>
      </div>
    </div>
  );
}