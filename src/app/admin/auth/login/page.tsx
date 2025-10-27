'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';

/**
 * 登录请求接口定义
 * 用于规范登录表单提交的数据结构
 */
interface LoginRequest {
  username: string;
  password: string;
  captcha: string;
}

/**
 * 登录响应接口定义
 * 用于解析后端返回的登录结果
 */
interface LoginResponse {
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

/**
 * 提示框状态类型
 * 定义不同状态的提示框样式和行为
 */
type ToastType = 'success' | 'error' | 'loading' | 'info';

/**
 * 提示框组件属性接口
 */
interface ToastProps {
  type: ToastType;
  message: string;
  onClose: () => void;
  show: boolean;
}

/**
 * 状态提示框组件
 * 根据不同类型显示相应的状态提示
 * @param {ToastProps} props - 提示框组件属性
 */
const Toast: React.FC<ToastProps> = ({ type, message, onClose, show }) => {
  if (!show) return null;

  // 根据类型获取样式类和图标 - 性能优化：内联函数避免不必要的重渲染
  const getTypeStyles = useCallback(() => {
    switch (type) {
      case 'success':
        return {
          bgClass: 'bg-green-50 border-green-200',
          textClass: 'text-green-800',
          icon: '✓',
          iconClass: 'bg-green-100 text-green-600'
        };
      case 'error':
        return {
          bgClass: 'bg-red-50 border-red-200',
          textClass: 'text-red-800',
          icon: '✗',
          iconClass: 'bg-red-100 text-red-600'
        };
      case 'loading':
        return {
          bgClass: 'bg-blue-50 border-blue-200',
          textClass: 'text-blue-800',
          icon: '⟳',
          iconClass: 'bg-blue-100 text-blue-600 animate-spin'
        };
      case 'info':
      default:
        return {
          bgClass: 'bg-gray-50 border-gray-200',
          textClass: 'text-gray-800',
          icon: 'ℹ',
          iconClass: 'bg-gray-100 text-gray-600'
        };
    }
  }, [type]);

  const styles = getTypeStyles();

  // 自动关闭提示框（除了加载中状态）
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (type !== 'loading' && show) {
      timer = setTimeout(() => {
        onClose();
      }, 3000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [type, show, onClose]);

  return (
    <div className="fixed top-4 right-4 z-50 transform transition-all duration-300 ease-in-out animate-slideInRight">
      <div 
        className={`flex items-center ${styles.bgClass} border rounded-lg shadow-lg p-4 max-w-md`}
        onClick={onClose}
      >
        {/* 点击外部区域关闭提示框 - 确保良好的用户体验 */}
        <div 
          className="fixed inset-0 z-40"
          onClick={onClose}
          aria-hidden="true"
        />
        
        {/* 图标区域 - 提高可访问性和视觉识别 */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full ${styles.iconClass} flex items-center justify-center mr-3 z-50`}>
          {type === 'loading' ? (
            // 加载中状态使用SVG旋转动画 - 兼容所有现代浏览器
            <svg className="w-4 h-4 text-current animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <span className="font-bold text-sm">{styles.icon}</span>
          )}
        </div>
        
        {/* 消息内容 */}
        <div className={`flex-grow ${styles.textClass} z-50`}>
          <p className="font-medium">{message}</p>
        </div>
        
        {/* 关闭按钮 - 增强可访问性 */}
        <button
          type="button"
          onClick={onClose}
          className="flex-shrink-0 ml-3 text-gray-400 hover:text-gray-600 focus:outline-none z-50"
          aria-label="关闭提示框"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

/**
 * 生成随机验证码的函数
 * @param {number} length - 验证码长度，默认为4
 * @returns {string} 随机生成的验证码字符串
 */
const generateCaptcha = (length: number = 4): string => {
  // 数字和大小写字母的组合 - 确保验证码的复杂性和可读性平衡
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * 绘制验证码到Canvas
 * @param {HTMLCanvasElement} canvas - Canvas元素
 * @param {string} text - 要绘制的验证码文本
 */
const drawCaptcha = (canvas: HTMLCanvasElement, text: string): void => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // 设置画布尺寸和样式 - 优化性能，避免不必要的重绘
  canvas.width = 120;
  canvas.height = 40;
  
  // 清空画布
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // 绘制渐变背景 - 增强视觉效果
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
  gradient.addColorStop(0, '#f3f4f6');
  gradient.addColorStop(1, '#e5e7eb');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // 添加噪点 - 防机器识别措施
  for (let i = 0; i < 100; i++) {
    ctx.fillStyle = `rgba(${Math.random() * 100}, ${Math.random() * 100}, ${Math.random() * 100}, ${Math.random() * 0.5})`;
    ctx.beginPath();
    ctx.arc(
      Math.random() * canvas.width,
      Math.random() * canvas.height,
      Math.random() * 1.5,
      0,
      2 * Math.PI
    );
    ctx.fill();
  }
  
  // 添加干扰线 - 增强安全性
  for (let i = 0; i < 4; i++) {
    ctx.strokeStyle = `rgba(${Math.random() * 100 + 50}, ${Math.random() * 100 + 50}, ${Math.random() * 100 + 50}, ${0.3 + Math.random() * 0.4})`;
    ctx.lineWidth = 1 + Math.random() * 2;
    ctx.beginPath();
    ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
    ctx.bezierCurveTo(
      Math.random() * canvas.width,
      Math.random() * canvas.height,
      Math.random() * canvas.width,
      Math.random() * canvas.height,
      Math.random() * canvas.width,
      Math.random() * canvas.height
    );
    ctx.stroke();
  }
  
  // 绘制验证码文字 - 随机旋转增加安全性
  const textWidth = canvas.width / text.length;
  ctx.font = 'bold 24px Arial, sans-serif'; // 使用通用字体确保跨浏览器兼容性
  
  // 逐个字符绘制
  for (let i = 0; i < text.length; i++) {
    // 随机颜色
    ctx.fillStyle = `rgb(${Math.floor(Math.random() * 80)}, ${Math.floor(Math.random() * 80)}, ${Math.floor(Math.random() * 80)})`;
    
    // 随机旋转角度 - 提高安全性但保持可读性
    const rotate = (Math.random() - 0.5) * 0.4; // -20deg 到 20deg
    
    // 设置文字位置和旋转
    const x = i * textWidth + textWidth / 3;
    const y = canvas.height / 2 + 8;
    
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotate);
    
    // 绘制文字（带阴影效果）- 增强可读性
    ctx.shadowColor = 'rgba(0,0,0,0.1)';
    ctx.shadowBlur = 2;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;
    
    ctx.fillText(text[i], -10, 5);
    ctx.restore();
  }
};

/**
 * 管理员登录页面组件
 * 包含登录表单、验证码和状态提示功能
 */
export default function AdminLoginPage() {
  // 表单数据状态管理
  const [formData, setFormData] = useState({  
    username: 'admin',  // 默认填充管理员测试用户名
    password: 'admin123', // 默认填充管理员测试密码
    captcha: ''
  });
  
  // UI状态管理
  const [loading, setLoading] = useState(false);
  const [captchaText, setCaptchaText] = useState('');
  const [countdown, setCountdown] = useState(60);
  
  // 提示框状态管理
  const [toast, setToast] = useState({
    show: false,
    type: 'info' as ToastType,
    message: ''
  });
  
  // 引用管理
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // 初始化验证码 - 组件挂载时执行
  useEffect(() => {
    refreshCaptcha();
    
    // 清理函数 - 确保组件卸载时中止所有请求
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // 验证码自动刷新倒计时 - 性能优化：使用useEffect避免不必要的计时器
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    } else {
      refreshCaptcha();
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [countdown]);

  /**
   * 显示提示框函数
   * @param {ToastType} type - 提示框类型
   * @param {string} message - 提示消息内容
   */
  const showToast = useCallback((type: ToastType, message: string) => {
    setToast({
      show: true,
      type,
      message
    });
  }, []);

  /**
   * 关闭提示框函数
   */
  const closeToast = useCallback(() => {
    setToast(prev => ({ ...prev, show: false }));
  }, []);

  /**
   * 刷新验证码函数
   */
  const refreshCaptcha = useCallback(() => {
    const newCaptcha = generateCaptcha();
    setCaptchaText(newCaptcha);
    setCountdown(60);
    
    // 绘制验证码到Canvas
    if (canvasRef.current) {
      drawCaptcha(canvasRef.current, newCaptcha);
    }
  }, []);

  /**
   * 处理登录按钮点击事件
   * 单独的点击处理函数，提供更好的可维护性
   */
  const handleLoginClick = useCallback(() => {
    // 触发表单提交
    if (formRef.current) {
      formRef.current.dispatchEvent(
        new Event('submit', { cancelable: true, bubbles: true })
      );
    }
  }, []);

  /**
   * 处理表单提交
   * @param {React.FormEvent} e - 表单提交事件
   */
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 验证验证码
    if (!formData.captcha || formData.captcha.toUpperCase() !== captchaText.toUpperCase()) {
      showToast('error', '验证码错误，请重新输入');
      refreshCaptcha(); // 验证失败后刷新验证码
      return;
    }
    
    // 验证用户名和密码
    if (!formData.username.trim() || !formData.password) {
      showToast('error', '用户名和密码不能为空');
      return;
    }
    
    setLoading(true);
    showToast('loading', '正在登录，请稍候...');

    // 确保之前的请求被中止，防止竞态条件
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // 创建新的AbortController用于当前请求
    abortControllerRef.current = new AbortController();

    try {
      // 构建登录请求数据
      const loginData: LoginRequest = {
        username: formData.username.trim(),
        password: formData.password,
        captcha: formData.captcha
      };

      // 调用后端登录API - 添加请求超时和中止支持
      const response = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(loginData),
        signal: abortControllerRef.current.signal
      });

      // 检查响应状态 - 增强错误处理
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      // 解析响应
      const result: LoginResponse = await response.json();

      if (result.success) {
        console.log('登录成功:', result);
        showToast('success', '登录成功，正在跳转...');
        
        // 登录成功后延迟跳转到管理员首页
        setTimeout(() => {
          window.location.href = '/admin/dashboard';
        }, 1000);
      } else {
        // 处理登录失败
        console.error('登录失败:', result);
        showToast('error', result.message || '登录失败，请检查用户名和密码');
        refreshCaptcha(); // 登录失败后刷新验证码
      }
    } catch (err) {
      // 避免处理已中止的请求错误
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }
      console.error('登录请求错误:', err);
      showToast('error', '登录请求失败，请稍后重试');
      refreshCaptcha(); // 请求错误后刷新验证码
    } finally {
      setLoading(false);
    }
  }, [formData, captchaText, showToast, refreshCaptcha]);

  // 性能优化：使用useCallback优化事件处理函数
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
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
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

      {/* 全局CSS动画 - 确保所有现代浏览器支持 */}
      <style jsx global>{`
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        .animate-slideInRight {
          animation: slideInRight 0.3s ease-out;
        }
        
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        
        /* 增强无障碍性 - 高对比度模式支持 */
        @media (prefers-contrast: high) {
          .bg-blue-500 {
            background-color: #0056b3 !important;
          }
          .border-gray-300 {
            border: 2px solid #000 !important;
          }
        }
        
        /* 减少动画模式支持 - 提高可访问性 */
        @media (prefers-reduced-motion: reduce) {
          .animate-slideInRight,
          .animate-spin,
          .hover\:scale-102,
          .active\:scale-98,
          .hover\:scale-105,
          .active\:scale-95 {
            animation: none !important;
            transform: none !important;
            transition: none !important;
          }
        }
      `}</style>
    </div>
  );
}