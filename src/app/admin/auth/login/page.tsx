'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';

// 登录请求接口
export interface LoginRequest {
  username: string;
  password: string;
  captcha: string;
}

// 登录响应接口
export interface LoginResponse {
  success: boolean;
  message: string;
  data?: {
    username: string;
    userInfo: any;
    menus: any[];
    expiresIn: number;
    expiresAt: string;
  };
}

// 提示框类型
type ToastType = 'success' | 'error' | 'loading' | 'info';

// 提示框组件
const Toast: React.FC<{ type: ToastType; message: string; onClose: () => void; show: boolean }> = ({ type, message, onClose, show }) => {
  if (!show) return null;

  // 使用单一样式
  const styles = {
    bg: 'bg-blue-50 border-blue-200',
    text: 'text-blue-800',
    icon: type === 'loading' ? <svg className="w-4 h-4 text-current" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> : type === 'success' ? '✓' : type === 'error' ? '✗' : 'ℹ',
    iconBg: 'bg-blue-100 text-blue-600'
  };

  // 自动关闭提示框（除了加载中状态）
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (type !== 'loading' && show) {
      timer = setTimeout(() => onClose(), 3000);
    }
    return () => timer && clearTimeout(timer);
  }, [type, show, onClose]);

  return (
    <div className="fixed top-4 right-4 z-50 transform transition-all duration-300 ease-in-out animate-slideInRight">
      <div className={`flex items-center ${styles.bg} border rounded-lg shadow-lg p-4 max-w-md`} onClick={onClose}>
        <div className="fixed inset-0 z-40" onClick={onClose} aria-hidden="true" />
        <div className={`flex-shrink-0 w-8 h-8 rounded-full ${styles.iconBg} flex items-center justify-center mr-3 z-50`}>
          {typeof styles.icon === 'string' ? <span className="font-bold text-sm">{styles.icon}</span> : styles.icon}
        </div>
        <div className={`flex-grow ${styles.text} z-50`}><p className="font-medium">{message}</p></div>
        <button type="button" onClick={onClose} className="flex-shrink-0 ml-3 text-gray-400 hover:text-gray-600 focus:outline-none z-50" aria-label="关闭提示框">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

// 生成随机验证码
const generateCaptcha = (length: number = 4): string => {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
};

// 绘制验证码到Canvas
const drawCaptcha = (canvas: HTMLCanvasElement, text: string): void => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  canvas.width = 120;
  canvas.height = 40;
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // 绘制白色背景
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // 绘制验证码文字
  const textWidth = canvas.width / text.length;
  ctx.font = 'bold 24px Arial, sans-serif';
  
  for (let i = 0; i < text.length; i++) {
    ctx.fillStyle = `rgb(${Math.floor(Math.random() * 80)}, ${Math.floor(Math.random() * 80)}, ${Math.floor(Math.random() * 80)})`;
    const rotate = (Math.random() - 0.5) * 0.4;
    const x = i * textWidth + textWidth / 3;
    const y = canvas.height / 2 + 8;
    
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotate);
    ctx.fillText(text[i], -10, 5);
    ctx.restore();
  }
};

// 管理员登录页面组件
export default function AdminLoginPage() {
  // 表单数据状态
  const [formData, setFormData] = useState({  
    username: '',
    password: '',
    captcha: ''
  });
  
  // UI状态
  const [loading, setLoading] = useState(false);
  const [captchaText, setCaptchaText] = useState('');
  const [countdown, setCountdown] = useState(60);
  
  // 提示框状态
  const [toast, setToast] = useState({
    show: false,
    type: 'info' as ToastType,
    message: ''
  });
  
  // 引用
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // 初始化验证码
  useEffect(() => {
    if (typeof window !== 'undefined') {
      refreshCaptcha();
    }
    return () => abortControllerRef.current?.abort();
  }, []);

  // 验证码自动刷新倒计时
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else {
      refreshCaptcha();
    }
    return () => timer && clearTimeout(timer);
  }, [countdown]);

  // 显示提示框
  const showToast = useCallback((type: ToastType, message: string) => {
    setToast({ show: true, type, message });
  }, []);

  // 关闭提示框
  const closeToast = useCallback(() => {
    setToast(prev => ({ ...prev, show: false }));
  }, []);

  // 刷新验证码
  const refreshCaptcha = useCallback(() => {
    const newCaptcha = generateCaptcha();
    setCaptchaText(newCaptcha);
    setCountdown(60);
    if (canvasRef.current) {
      drawCaptcha(canvasRef.current, newCaptcha);
    }
  }, []);

  // 处理登录按钮点击
  const handleLoginClick = useCallback(() => {
    formRef.current?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
  }, []);

  // 处理表单提交
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 验证验证码
    if (!formData.captcha || formData.captcha.toUpperCase() !== captchaText.toUpperCase()) {
      showToast('error', '验证码错误，请重新输入');
      refreshCaptcha();
      return;
    }
    
    // 验证用户名和密码
    if (!formData.username.trim() || !formData.password) {
      showToast('error', '用户名和密码不能为空');
      return;
    }
    
    setLoading(true);
    showToast('loading', '正在登录，请稍候...');

    // 确保之前的请求被中止
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const loginData: LoginRequest = {
        username: formData.username.trim(),
        password: formData.password,
        captcha: formData.captcha
      };

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData),
        signal: controller.signal
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result: LoginResponse = await response.json();

      if (result.success) {
        console.log('登录成功:', result);
        showToast('success', '登录成功，正在跳转...');
        setTimeout(() => window.location.href = '/admin/dashboard', 1000);
      } else {
        console.error('登录失败:', result);
        showToast('error', result.message || '登录失败，请检查用户名和密码');
        refreshCaptcha();
      }
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        console.error('登录请求错误:', err);
        showToast('error', '登录请求失败，请稍后重试');
        refreshCaptcha();
      }
    } finally {
      setLoading(false);
    }
  }, [formData, captchaText, showToast, refreshCaptcha]);

  // 处理输入变化
  const handleInputChange = useCallback((field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 顶部装饰 */}
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 pt-12 pb-16">
        <div className="max-w-md mx-auto px-4 text-center">
          <div className="text-white text-4xl font-bold mb-3">
            管理员登录
          </div>
          <div className="text-blue-100 text-sm">
            抖音派单系统管理后台
          </div>
        </div>
      </div>

      {/* 主要内容区域 */}
      <div className="flex-1 -mt-8">
        <div className="max-w-md mx-auto px-4">
          {/* 登录卡片 */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6 transform transition-all duration-300 hover:shadow-xl">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">管理员登录</h2>
              <p className="text-sm text-gray-600">请输入管理员账号信息</p>
            </div>

            {/* 登录表单 */}
            <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
              {/* 用户名输入 - 添加禁用状态和过渡效果 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  用户名
                </label>
                <input
                  type="text"
                  placeholder="请输入管理员用户名"
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleLoginClick())}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  disabled={loading}
                  aria-disabled={loading}
                />
              </div>

              {/* 密码输入 - 增强安全性和用户体验 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  密码
                </label>
                <input
                  type="password"
                  placeholder="请输入密码"
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleLoginClick())}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  disabled={loading}
                  aria-disabled={loading}
                />
              </div>

              {/* 验证码区域 - 增强用户交互和视觉效果 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  验证码
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="请输入验证码"
                    value={formData.captcha}
                    onChange={(e) => handleInputChange('captcha', e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleLoginClick())}
                    className="flex-1  border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    maxLength={4}
                    disabled={loading}
                    aria-disabled={loading}
                  />
                  <div className="flex flex-col items-end">
                    <div className="relative">
                      <canvas
                        ref={canvasRef}
                        className="border border-gray-300 rounded-lg cursor-pointer transition-transform hover:scale-105 active:scale-95"
                        onClick={refreshCaptcha}
                        title="点击刷新验证码"
                        style={{ pointerEvents: loading ? 'none' : 'auto', opacity: loading ? 0.6 : 1 }}
                        aria-disabled={loading}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={refreshCaptcha}
                      disabled={loading || countdown > 0}
                      className={`text-xs mt-1 transition-colors ${loading ? 'text-gray-300 cursor-not-allowed' : (countdown > 0 ? 'text-gray-400 cursor-not-allowed' : 'text-blue-500 hover:text-blue-600 cursor-pointer')}`}
                      aria-disabled={loading || countdown > 0}
                    >
                      {loading ? '加载中...' : (countdown > 0 ? `${countdown}秒后刷新` : '刷新验证码')}
                    </button>
                  </div>
                </div>
              </div>
              
              {/* 登录按钮 - 优化版：添加动效和加载状态 */}
              <button
                type="button"
                onClick={handleLoginClick}
                disabled={loading}
                className={`w-full py-3 text-white rounded-lg transition-all duration-300 font-medium flex items-center justify-center ${loading ? 'bg-blue-400 cursor-not-allowed scale-100' : 'bg-blue-500 hover:bg-blue-600 hover:scale-102 active:scale-98'}`}
                aria-disabled={loading}
              >
                {loading ? (
                  <>
                    {/* 加载动画 - SVG实现确保跨浏览器兼容性 */}
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    登录中...
                  </>
                ) : (
                  '登录'
                )}
              </button>
            </form>

            {/* 注册提示 */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                还没有管理员账户？{' '}
                <a 
                  href="/auth/register/publisher" 
                  className="text-blue-500 hover:text-blue-600 hover:underline transition-colors"
                  onClick={(e) => {
                    if (loading) {
                      e.preventDefault(); // 加载状态下阻止跳转
                    }
                  }}
                >
                  联系超级管理员注册
                </a>
              </p>
            </div>
          </div>

          {/* 底部信息 */}
          <div className="text-center text-xs text-gray-500 mb-8">
            <p>© 2024 抖音派单系统 版本 v2.0.0</p>
            <p className="mt-1">安全登录 · 数据加密</p>
          </div>
        </div>
      </div>

      {/* 状态提示框组件 */}
      <Toast
        type={toast.type}
        message={toast.message}
        onClose={closeToast}
        show={toast.show}
      />


    </div>
  );
}