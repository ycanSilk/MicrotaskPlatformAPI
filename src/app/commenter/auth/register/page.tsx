'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SuccessModal from '../../../../components/button/authButton/SuccessModal';

export default function CommenterRegisterPage() {
  // 生成随机验证码
  function generateCaptcha(length = 4) {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // 刷新验证码
  const refreshCaptcha = () => {
    setCaptchaCode(generateCaptcha());
    setFormData({ ...formData, captcha: '' });
  };

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    phone: '',
    email: '',
    captcha: '',
    inviteCode: '',
    agreeToTerms: false
  });
  const [captchaCode, setCaptchaCode] = useState('');
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  
  // 只在客户端生成验证码，避免SSR和客户端渲染不匹配
  useEffect(() => {
    setCaptchaCode(generateCaptcha());
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    
    // 用户名验证
    if (!formData.username.trim()) {
      setErrorMessage('用户名不能为空');
      return;
    }
    
    // 用户名长度验证（至少4个字符）
    if (formData.username.trim().length < 4) {
      setErrorMessage('用户名长度必须大于或等于4个字符');
      return;
    }

    // 用户名长度验证（不超过16个字符）
    if (formData.username.trim().length > 16) {
      setErrorMessage('用户名长度不能超过16个字符');
      return;
    }
    
    // 用户名格式验证（字母数字组合）
    const usernameRegex = /^[a-zA-Z0-9]{1,20}$/;
    if (!usernameRegex.test(formData.username.trim())) {
      setErrorMessage('用户名只能包含字母和数字');
      return;
    }

    // 密码验证
    if (!formData.password) {
      setErrorMessage('请输入密码');
      return;
    }
    
    if (formData.password.length < 6) {
      setErrorMessage('密码长度不能少于6位');
      return;
    }
    
    if (formData.password.length > 20) {
      setErrorMessage('密码长度不能超过20位');
      return;
    }

    // 确认密码验证
    if (!formData.confirmPassword) {
      setErrorMessage('请确认密码');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('两次输入的密码不一致');
      return;
    }

    // 手机号验证（必填）
    if (!formData.phone.trim()) {
      setErrorMessage('请输入手机号');
      return;
    }
    
    // 手机号格式验证
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(formData.phone.trim())) {
      setErrorMessage('请输入正确的11位手机号码');
      return;
    }
    
    // 邮箱验证（选填）
    if (formData.email.trim()) {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(formData.email.trim())) {
        setErrorMessage('请输入正确的邮箱地址');
        return;
      }
      
      if (formData.email.trim().length > 50) {
        setErrorMessage('邮箱地址长度不能超过50个字符');
        return;
      }
    }

    // 验证码验证
    if (!formData.captcha.trim()) {
      setErrorMessage('请输入验证码');
      return;
    }
    
    if (formData.captcha.trim().length !== 4) {
      setErrorMessage('验证码长度不正确');
      return;
    }

    if (formData.captcha.toUpperCase() !== captchaCode.toUpperCase()) {
      setErrorMessage('验证码错误');
      refreshCaptcha();
      return;
    }

    // 用户协议验证
    if (!formData.agreeToTerms) {
      setErrorMessage('请阅读并同意用户协议和隐私政策');
      return;
    }
    
    // 邀请码验证（如果有填写）
    if (formData.inviteCode.trim() && formData.inviteCode.trim().length > 20) {
      setErrorMessage('邀请码长度不能超过20位');
      return;
    }

    setIsLoading(true);
    
    try {
      // 调用注册API
      const response = await fetch('/api/commenter/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username.trim(),
          password: formData.password,
          phone: formData.phone.trim(),
          email: formData.email.trim() || undefined,
          inviteCode: formData.inviteCode.trim() || undefined
        }),
        // 设置请求超时
        signal: AbortSignal.timeout(5000)
      });

      // 检查响应状态
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        // 注册成功
        setSuccessMessage(result.message || '注册成功！您的账号已创建，现在可以登录了。');
        // 显示确认提示框
        setShowConfirmModal(true);
      } else {
        setErrorMessage(result.message || '注册失败，请稍后重试');
        // 刷新验证码
        refreshCaptcha();
      }
    } catch (error) {
      console.error('注册错误:', error);
      // 根据不同类型的错误提供更友好的提示
      if (  error instanceof DOMException && error.name === 'AbortError') {
        setErrorMessage('请求超时，请检查网络连接后重试');
      } else {
        setErrorMessage('注册过程中发生错误，请稍后重试');
      }
      // 刷新验证码
      refreshCaptcha();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 顶部装饰 */}
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 pt-8 md:pt-12 pb-12 md:pb-16">
        <div className="max-w-md mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-2xl font-bold text-white mb-2">微任务系统平台</h2>
        </div>
      </div>

      {/* 主要内容区域 */}
      <div className="flex-1 -mt-6 md:-mt-8">
        <div className="max-w-md mx-auto px-4">
          {/* 注册卡片 */}
          <div className="bg-white rounded-lg shadow-lg p-4 md:p-6 mb-6">
            <h3 className="text-2xl font-bold mb-3 text-center">注册</h3>

            {/* 注册表单 */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* 账号信息 */}
              <div className="bg-blue-50 rounded-lg p-3 md:p-4">

                {/* 用户名 */}
                <div className="mb-3">
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                    用户名 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="4-16位字母数字组合"
                    value={formData.username}
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                  />
                </div>

                {/* 密码 */}
                <div className="mb-3">
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                    密码 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    placeholder="至少6位字符"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                  />
                </div>

                {/* 确认密码 */}
                <div className="mb-3">
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                    确认密码 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    placeholder="再次输入密码"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                  />
                </div>

                {/* 手机号和验证码 */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                      手机号 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      placeholder="请输入11位手机号"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                      maxLength={11}
                    />
                  </div>
                  
                  {/* 邮箱（选填） */}
                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                      邮箱（选填）
                    </label>
                    <input
                      type="email"
                      placeholder="请输入邮箱地址"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                      maxLength={50}
                    />
                  </div>

                  {/* 验证码 */}
                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                      验证码 <span className="text-red-500">*</span>
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        placeholder="请输入验证码"
                        value={formData.captcha}
                        onChange={(e) => setFormData({...formData, captcha: e.target.value})}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                      />
                      <div 
                        className="w-24 h-10 flex items-center justify-center bg-gray-100 border border-gray-300 rounded-lg font-bold text-lg cursor-pointer"
                        onClick={refreshCaptcha}
                      >
                        {captchaCode}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">点击验证码可刷新</p>
                  </div>
                </div>
              </div>

              {/* 邀请码 */}
              <div className="bg-blue-50 rounded-lg p-3 md:p-4">
                <h3 className="text-sm font-bold text-blue-800 mb-3"> 邀请码（可选）</h3>
                <div>
                  <input
                    type="text"
                    placeholder="填写邀请码可获得新人奖励"
                    value={formData.inviteCode}
                    onChange={(e) => setFormData({...formData, inviteCode: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  <p className="text-xs text-blue-600 mt-2">邀请新用户,指导新用户完成首个100元提现，可获得10元系统奖励</p>
                </div>
              </div>

              {/* 协议同意 */}
              <div className="flex items-start space-x-2">
                <input
                  type="checkbox"
                  id="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={(e) => setFormData({...formData, agreeToTerms: e.target.checked})}
                  className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="agreeToTerms" className="text-xs text-gray-600 leading-relaxed">
                  我已阅读并同意 <span className="text-blue-600 underline">《用户协议》</span> 和 <span className="text-blue-600 underline">《隐私政策》</span>
                </label>
              </div>

              {/* 错误信息 */}
              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <span className="text-red-600">❌</span>
                    <span className="text-sm text-red-700">{errorMessage}</span>
                  </div>
                </div>
              )}

              {/* 成功信息 */}
              {successMessage && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <span className="text-green-600">✅</span>
                    <span className="text-sm text-green-700">{successMessage}</span>
                  </div>
                </div>
              )}

              {/* 注册按钮 */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {isLoading ? '注册中...' : '立即注册'}
              </button>
            </form>

            {/* 底部链接 */}
            <div className="mt-4 text-center">
              <p className="text-xs text-gray-600">
                已有账号？{' '}
                <button 
                  onClick={() => router.push('/commenter/auth/login')}
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  立即登录
                </button>
              </p>
            </div>
          </div>

          

          {/* 底部信息 */}
          <div className="text-center mb-8">
            <p>©2025 微任务系统平台 V1.0</p>
          </div>
        </div>
      </div>
      
      {/* 注册成功确认提示框 */}
      <SuccessModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="注册成功"
        message={successMessage || '您的账号已成功注册，现在可以登录了！'}
        buttonText="确认并登录"
        redirectUrl="/commenter/auth/login"
      />
    </div>
  );
}