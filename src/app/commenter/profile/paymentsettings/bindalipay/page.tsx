'use client';
import React, { useState } from 'react';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';

const BindAlipayPage: React.FC = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    alipayAccount: '',
    realName: ''
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; content: string } | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // 清除该字段的错误信息
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!formData.alipayAccount.trim()) {
      newErrors.alipayAccount = '请输入支付宝账号';
    }
    
    if (!formData.realName.trim()) {
      newErrors.realName = '请输入真实姓名';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      setLoading(true);
      setMessage(null);
      
      try {
        // 调用后端绑定支付宝接口
        const response = await fetch('/api/public/walletmanagement/bindalipay', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });
        
        const result = await response.json();
        
        if (result.success) {
          // 绑定成功
          setMessage({ type: 'success', content: '支付宝绑定成功！' });
          console.log('绑定成功:', result);
          
          // 延迟返回上一页，让用户看到成功提示
          setTimeout(() => {
            router.back();
          }, 1500);
        } else {
          // 绑定失败
          setMessage({ type: 'error', content: result.message || '绑定失败，请重试' });
          console.error('绑定失败:', result);
        }
      } catch (error) {
        // 捕获网络或其他错误
        setMessage({ type: 'error', content: '网络错误，请检查您的网络连接后重试' });
        console.error('绑定过程中发生错误:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航栏 */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 py-3 flex items-center">
          <button 
            className="mr-4 p-1 rounded-full hover:bg-gray-100" 
            onClick={() => router.back()}
          >
            <ArrowLeftOutlined className="w-5 h-5 text-gray-700" />
          </button>
          <h1 className="text-lg font-medium text-gray-900">绑定支付宝</h1>
        </div>
      </header>

      {/* 主要内容区域 */}
      <main className="p-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <form onSubmit={handleSubmit}>
            {/* 支付宝账号输入框 */}
            <div className="mb-6">
              <label htmlFor="alipayAccount" className="block text-sm font-medium text-gray-700 mb-1">
                支付宝账号 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="alipayAccount"
                name="alipayAccount"
                value={formData.alipayAccount}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.alipayAccount ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="请输入支付宝账号"
              />
              {errors.alipayAccount && (
                <p className="mt-1 text-sm text-red-500">{errors.alipayAccount}</p>
              )}
            </div>

            {/* 真实姓名输入框 */}
            <div className="mb-8">
              <label htmlFor="realName" className="block text-sm font-medium text-gray-700 mb-1">
                真实姓名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="realName"
                name="realName"
                value={formData.realName}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.realName ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="请输入真实姓名"
              />
              {errors.realName && (
                <p className="mt-1 text-sm text-red-500">{errors.realName}</p>
              )}
            </div>

            {/* 安全提示 */}
            <div className="bg-blue-50 p-3 rounded-md mb-6">
              <p className="text-xs text-blue-700">
                请确保支付宝账号与真实姓名一致，否则可能导致提现失败
              </p>
            </div>

            {/* 操作提示信息 */}
            {message && (
              <div className={`mb-4 p-3 rounded-md ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                <p className="text-sm font-medium">{message.content}</p>
              </div>
            )}
            
            {/* 提交按钮 */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'} text-white`}
            >
              {loading ? '绑定中...' : '确认绑定'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default BindAlipayPage;