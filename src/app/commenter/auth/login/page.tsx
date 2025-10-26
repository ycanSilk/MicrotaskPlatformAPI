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
    username: 'ceshiapi',
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
    // 不自动填充验证码，让用户自己输入
    setFormData(prev => ({ ...prev, captcha: '' }));
  }, []);

  // 自动填充测试账号（仅填充用户名和密码，不填充验证码）
  useEffect(() => {
    // 设置默认测试账号信息
    setFormData(prev => ({
      ...prev,
      username: 'ceshiapi',
      password: '123456',
      // captcha 不自动填充
    }));
  }, []); // 只在组件挂载时设置一次

  // 刷新验证码
  const refreshCaptcha = () => {
    const newCaptcha = generateCaptcha();
    setCaptchaCode(newCaptcha);
    // 刷新验证码时清空用户输入的验证码
    setFormData(prev => ({
      ...prev,
      captcha: ''
    }));
    // 清除验证码相关的错误提示
    setFieldErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.captcha;
      return newErrors;
    });
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
    } else {
      // 清除验证码错误提示（如果有）
      setFieldErrors(prev => {
        if (!prev.captcha) return prev;
        const newErrors = { ...prev };
        delete newErrors.captcha;
        return newErrors;
      });
    }
  };

  // 重置表单
  const handleReset = () => {
    setFormData({
      username: 'ceshiapi',
      password: '123456',
      captcha: '' // 不自动填充验证码
    });
    setErrorMessage('');
    setResponseTime(null);
    setRequestInfo(null);
    setFieldErrors({}); // 清除所有字段错误提示
    // 重置时也刷新验证码
    refreshCaptcha();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 重置错误信息
    setErrorMessage('');
    
    // 执行表单验证
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    const startTime = Date.now();
    
    try {
      // 调用登录API
      const response = await fetch('/api/commenter/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username.trim(),
          password: formData.password
        }),
        // 设置请求超时
        signal: AbortSignal.timeout(10000)
      });
      
      const responseTime = Date.now() - startTime;
      setResponseTime(responseTime);
      
      // 解析响应数据
      const data = await response.json();
      
      // 保存请求和响应信息用于调试
      setRequestInfo({
        request: { username: formData.username, password: '******' },
        response: data,
        status: response.status,
        responseTime
      });
      
      // 处理API响应
      if (!response.ok || !data.success) {
        setErrorMessage(data.message || '登录失败，请检查用户名和密码');
        return;
      }
      
      // 先清除所有其他角色的认证信息
      clearAllAuth();
      
      // 验证返回的数据结构
      if (!data.data || !data.data.token) {
        throw new Error('无效的认证信息');
      }
      
      // 构建用户信息
      const userInfo = {
        username: formData.username,
        id: data.data.userId || '',
        role: 'commenter' as const,
        balance: data.data.userInfo?.balance || 0,
        status: data.data.userInfo?.status || 'active',
        createdAt: data.data.userInfo?.createdAt || new Date().toISOString(),
        ...data.data.userInfo
      };
      
      // 保存认证信息到本地存储
      CommenterAuthStorage.saveAuth({
        token: data.data.token,
        user: userInfo,
        expiresAt: Date.now() + (data.data.expiresIn || 86400) * 1000
      });
      
      // 保存token到本地缓存
      if (typeof window !== 'undefined') {
        const tokenData = {
          token: data.data.token,
          tokenType: 'Bearer',
          expiresIn: data.data.expiresIn || 86400,
          timestamp: Date.now(),
          expiresAt: Date.now() + (data.data.expiresIn || 86400) * 1000
        };
        localStorage.setItem('commenterAuthToken', JSON.stringify(tokenData));
      }
      
      // 设置成功消息并显示模态框
      setLoginSuccessMessage(`登录成功！欢迎 ${userInfo.username}`);
      setShowSuccessModal(true);
    } catch (error) {
      // 处理不同类型的错误
      let errorMsg = '登录过程中出现错误，请稍后再试';
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMsg = '请求超时，请检查网络连接';
        } else if (error.message.includes('Failed to fetch')) {
          errorMsg = '无法连接到服务器，请稍后再试';
        } else {
          errorMsg = error.message;
        }
      }
      
      setErrorMessage(errorMsg);
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
                    onChange={handleInputChange}
                    name="captcha"
                    className={`flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${fieldErrors.captcha ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
                    autoComplete="off"
                  />
                  <div 
                    className="w-24 h-10 flex items-center justify-center bg-gray-100 border border-gray-300 rounded-lg font-bold text-lg cursor-pointer hover:bg-gray-200 transition-colors"
                    onClick={refreshCaptcha}
                    title="刷新验证码"
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
                  onClick={() => router.push('/commenter/auth/register')}
                  className="text-blue-500 hover:underline"
                >
                  立即注册
                </button>
                <button 
                  onClick={() => router.push('/commenter/auth/resetpwd')}
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