'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authenticatePublisher, PublisherAuthStorage } from '@/auth';
import SuccessModal  from '../../../../components/button/authButton/SuccessModal';

export default function PublisherLoginPage() {
  const [formData, setFormData] = useState({
    username: 'test12',
    password: '123456',
    captcha: ''
  });
  const [captchaCode, setCaptchaCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
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

  // 初始化验证码
  useEffect(() => {
    console.log('Initializing captcha');
    const initialCaptcha = generateCaptcha();
    setCaptchaCode(initialCaptcha);
    // 默认填充验证码
    setFormData(prev => ({ ...prev, captcha: initialCaptcha }));
  }, []);

  // 自动填充测试账号
  useEffect(() => {
    // 设置默认测试账号
    setFormData({
      username: 'test12',
      password: '123456',
      captcha: captchaCode
    });
  }, [captchaCode]);

  // 刷新验证码
  const refreshCaptcha = () => {
    console.log('Refreshing captcha');
    const newCaptcha = generateCaptcha();
    setCaptchaCode(newCaptcha);
    // 刷新验证码时保持用户名和密码不变，只更新验证码
    setFormData(prev => ({
      ...prev,
      captcha: newCaptcha
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Login form submitted with data:', formData);
    setErrorMessage('');
    
    // 验证表单
    if (!formData.username.trim()) {
      console.log('Username is empty');
      setErrorMessage('请输入用户名');
      return;
    }
    
    if (!formData.password.trim()) {
      console.log('Password is empty');
      setErrorMessage('请输入密码');
      return;
    }
    
    if (!formData.captcha.trim()) {
      console.log('Captcha is empty');
      setErrorMessage('请输入验证码');
      return;
    }
    
    if (formData.captcha.toUpperCase() !== captchaCode.toUpperCase()) {
      console.log('Captcha incorrect');
      setErrorMessage('验证码错误');
      refreshCaptcha();
      return;
    }

    setIsLoading(true);
    
    try {
      console.log('Using new publisher authentication system');
      // 使用新的认证系统
      const result = await authenticatePublisher({
        username: formData.username,
        password: formData.password
      });

      // 处理认证结果
      if (result.success && result.user && result.token) {
        // 构造认证会话
        const authSession = {
          user: result.user,
          token: result.token,
          expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24小时过期
        };
        
        // 保存认证信息
        PublisherAuthStorage.saveAuth(authSession);
        
        console.log('Auth info saved');
        
        // 在客户端验证信息是否正确保存
        if (typeof window !== 'undefined') {
          const savedToken = localStorage.getItem('publisher_auth_token');
          const savedUser = localStorage.getItem('publisher_user_info');
          console.log('Saved token:', savedToken);
          console.log('Saved user:', savedUser);
        }
        
        // 设置成功消息并显示模态框
        setLoginSuccessMessage(`登录成功！欢迎 ${result.user.username}`);
        setShowSuccessModal(true);
      } else {
        console.log('Login failed with message:', result?.message);
        setErrorMessage(result?.message || '登录失败');
        refreshCaptcha();
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrorMessage('登录过程中发生错误，请重试');
      refreshCaptcha();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 顶部装饰 */}
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 pt-12 pb-16">
        <div className="max-w-md mx-auto px-4 text-center">
          <div className="text-white font-bold text-4xl mb-3">
            微任务系统平台
          </div>
        </div>
      </div>

      {/* 主要内容区域 */}
      <div className="flex-1 -mt-8">
        <div className="max-w-md mx-auto px-4">
          {/* 登录卡片 */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">登录</h2>
            </div>

            {/* 登录表单 */}
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
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
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
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
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
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div 
                    className="w-24 h-10 flex items-center justify-center bg-gray-100 border border-gray-300 rounded-lg font-bold text-lg cursor-pointer"
                    onClick={refreshCaptcha}
                  >
                    {captchaCode}
                  </div>
                </div>
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
                  onClick={() => router.push('/auth/register/publisher')}
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
          <div className="text-center  mb-8">
            <p>©2025 微任务系统平台 V1.0</p>
          </div>
        </div>
        
        {/* 登录成功提示框 */}
        <SuccessModal
          isOpen={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
          title="登录成功"
          message={loginSuccessMessage}
          buttonText="确认"
          redirectUrl="/publisher/dashboard"
        />
      </div>
    </div>
  );
}