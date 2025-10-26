'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CommenterAuthStorage, getCommenterHomePath, clearAllAuth } from '@/auth';
import SuccessModal  from '../../../../components/button/authButton/SuccessModal';

// 定义登录表单数据类型
interface LoginFormData {
  username: string;
  password: string;
  captcha: string;
}

// 表单验证规则
const validationRules = {
  username: {
    minLength: 3,
    maxLength: 10,
    pattern: /^[a-zA-Z0-9_]{3,10}$/,
    message: '用户名必须包含3-10个字符，且只能包含字母、数字和下划线'
  },
  password: {
    minLength: 6,
    maxLength: 20,
    pattern: /^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{6,20}$/,
    message: '密码必须包含6-20个字符'
  },
  captcha: {
    minLength: 4,
    maxLength: 6,
    pattern: /^[a-zA-Z0-9]{4,6}$/,
    message: '验证码格式不正确'
  }
};

export default function CommenterLoginPage() {
  const [formData, setFormData] = useState<LoginFormData>({
    username: 'testkf1',
    password: '123456',
    captcha: ''
  });
  const [captchaCode, setCaptchaCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [requestInfo, setRequestInfo] = useState<any | null>(null);
  const [responseTime, setResponseTime] = useState<number | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof LoginFormData, string>>>({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [loginSuccessMessage, setLoginSuccessMessage] = useState('');
  const router = useRouter();

  // 生成随机验证码
  function generateCaptcha(length = 4) {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // 验证单个字段
  const validateField = (fieldName: keyof LoginFormData, value: string): string => {
    const rules = validationRules[fieldName];
    
    if (!value.trim()) {
      return '此字段不能为空';
    }
    
    if (value.length < rules.minLength || value.length > rules.maxLength) {
      return rules.message;
    }
    
    if (!rules.pattern.test(value)) {
      return rules.message;
    }
    
    return '';
  };
  
  // 全面验证表单
  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof LoginFormData, string>> = {};
    let isValid = true;
    
    // 验证每个字段
    Object.keys(formData).forEach(key => {
      const fieldName = key as keyof LoginFormData;
      const error = validateField(fieldName, formData[fieldName]);
      if (error) {
        errors[fieldName] = error;
        isValid = false;
      }
    });
    
    // 验证码特殊验证
    if (formData.captcha && formData.captcha.toUpperCase() !== captchaCode.toUpperCase()) {
      errors.captcha = '请输入正确的验证码';
      isValid = false;
    }
    
    setFieldErrors(errors);
    return isValid;
  };

  // 初始化验证码
  useEffect(() => {
    const initialCaptcha = generateCaptcha();
    setCaptchaCode(initialCaptcha);
    // 默认填充验证码
    setFormData(prev => ({ ...prev, captcha: initialCaptcha }));
  }, []);

  // 自动填充测试账号
  useEffect(() => {
    // 设置默认测试账号
    setFormData({
      username: 'testkf1',
      password: '123456',
      captcha: captchaCode
    });
  }, [captchaCode]);

  // 刷新验证码
  const refreshCaptcha = () => {
    const newCaptcha = generateCaptcha();
    setCaptchaCode(newCaptcha);
    // 刷新验证码时保持用户名和密码不变，只更新验证码
    setFormData(prev => ({
      ...prev,
      captcha: newCaptcha
    }));
  };

  // 处理表单输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const fieldName = name as keyof LoginFormData;
    
    // 更新表单数据
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
    
    // 实时验证当前字段
    if (fieldName !== 'captcha') { // 验证码不实时验证，只在提交时验证
      const error = validateField(fieldName, value);
      setFieldErrors(prev => ({
        ...prev,
        [fieldName]: error
      }));
    }
  };

  // 重置表单
  const handleReset = () => {
    setFormData({
      username: 'testkf1',
      password: '123456',
      captcha: captchaCode
    });
    setErrorMessage('');
    setResponseTime(null);
    setRequestInfo(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 重置错误信息
    setErrorMessage('');
    
    // 临时登录逻辑：跳过验证，直接模拟成功
    setIsLoading(true);
    
    try {
      // 模拟网络延迟
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 先清除所有其他角色的认证信息
      clearAllAuth();
      
      // 模拟生成认证信息
      const mockToken = 'mock_token_' + Date.now();
      const mockUserInfo = {
        username: formData.username || 'testkf1',
        id: '1',
        role: 'commenter' as const,
        balance: 0,
        status: 'active' as const, // 使用常量断言确保类型匹配联合类型
        createdAt: new Date().toISOString()
      };
      
      // 保存认证信息到本地存储
      CommenterAuthStorage.saveAuth({
        token: mockToken,
        user: mockUserInfo,
        expiresAt: Date.now() + 24 * 60 * 60 * 1000 // 默认24小时后过期
      });
      
      // 保存token到本地缓存
      if (typeof window !== 'undefined') {
        const tokenData = {
          token: mockToken,
          tokenType: 'Bearer',
          expiresIn: 3600,
          timestamp: Date.now(),
          expiresAt: Date.now() + 3600 * 1000
        };
        localStorage.setItem('commenterAuthToken', JSON.stringify(tokenData));
      }
      
      // 设置成功消息并显示模态框
      setLoginSuccessMessage(`登录成功！欢迎 ${mockUserInfo.username}`);
      setShowSuccessModal(true);
    } catch (error) {
      // 提供错误信息
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('登录过程中出现错误，请稍后再试');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 顶部装饰 */}
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 pt-12 pb-16">
        <div className="max-w-md mx-auto px-4 text-center">
          <div className="text-white text-4xl font-bold mb-3">
            登录
          </div>
        </div>
      </div>

      {/* 主要内容区域 */}
      <div className="flex-1 -mt-8">
        <div className="max-w-md mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* 用户名输入 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  用户名
                </label>
                <input
                    type="text"
                    placeholder="请输入用户名"
                    value={formData.username}
                    onChange={handleInputChange}
                    name="username"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${fieldErrors.username ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
                  />
                  {fieldErrors.username && (
                    <p className="text-red-500 text-xs mt-1">{fieldErrors.username}</p>
                  )}
              </div>

              {/* 密码输入 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  密码
                </label>
                <input
                    type="password"
                    placeholder="请输入密码"
                    autoComplete="current-password"
                    value={formData.password}
                    onChange={handleInputChange}
                    name="password"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${fieldErrors.password ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
                  />
                  {fieldErrors.password && (
                    <p className="text-red-500 text-xs mt-1">{fieldErrors.password}</p>
                  )}
              </div>

              {/* 验证码 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  验证码
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="请输入验证码"
                    value={formData.captcha}
                    onChange={(e) => setFormData({...formData, captcha: e.target.value})}
                    className={`flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${fieldErrors.captcha ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
                  />
                  <div 
                    className="w-24 h-10 flex items-center justify-center bg-gray-100 border border-gray-300 rounded-lg font-bold text-lg cursor-pointer"
                    onClick={refreshCaptcha}
                  >
                    {captchaCode}
                  </div>
                </div>
                {fieldErrors.captcha && (
                  <p className="text-red-500 text-xs mt-1">{fieldErrors.captcha}</p>
                )}
              </div>

              {/* 错误信息 */}
              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <span className="text-red-600">⚠️</span>
                    <span className="text-sm text-red-700">{errorMessage}</span>
                  </div>
                </div>
              )}

              {/* 登录按钮 */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? '登录中...' : '登录'}
              </button>
            </form>

            {/* 注册提示 */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                还没有账户？{' '}
                <button 
                  onClick={() => router.push('/auth/register/commenter')}
                  className="text-blue-500 hover:underline"
                >
                  立即注册
                </button>
                <button 
                  onClick={() => router.push('/auth/resetpwd')}
                  className="text-blue-500 hover:underline ml-3"
                >
                  忘记密码
                </button>
              </p>
            </div>
          </div>

          {/* 底部信息 */}
          <div className="text-center text-xs text-gray-500 mb-8">
            <p>© 2024 微任务系统 v2.0.0</p>
          </div>
        </div>
        
        {/* 登录成功提示框 */}
        <SuccessModal
          isOpen={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
          title="登录成功"
          message={loginSuccessMessage}
          buttonText="确认"
          redirectUrl={getCommenterHomePath()}
        />
      </div>
    </div>
  );
}