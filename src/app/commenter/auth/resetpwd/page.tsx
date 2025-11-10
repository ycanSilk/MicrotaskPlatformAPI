'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// 定义重置密码表单数据类型
interface ResetPasswordFormData {
  username: string;
  newPassword: string;
  confirmPassword: string;
}

// 表单验证规则
const validationRules = {
  username: {
    minLength: 3,
    maxLength: 10,
    pattern: /^[a-zA-Z0-9_]{3,10}$/,
    message: '用户名必须包含3-10个字符，且只能包含字母、数字和下划线'
  },
  newPassword: {
    minLength: 6,
    maxLength: 20,
    // 允许使用字母、数字和常用特殊字符，但禁止使用控制字符和其他非法字符
    pattern: /^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{6,20}$/,
    message: '密码长度必须大于6位字符，且只能包含字母、数字和常用特殊字符'
  },
  confirmPassword: {
    minLength: 6,
    maxLength: 20,
    pattern: /^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{6,20}$/,
    message: '确认密码长度必须大于6位字符，且只能包含字母、数字和常用特殊字符'
  }
};

export default function ResetPasswordPage() {
  const [formData, setFormData] = useState<ResetPasswordFormData>({
    username: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof ResetPasswordFormData, string>>>({});
  const router = useRouter();

  // 验证单个字段
  const validateField = (fieldName: keyof ResetPasswordFormData, value: string): string => {
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
    const errors: Partial<Record<keyof ResetPasswordFormData, string>> = {};
    let isValid = true;
    
    // 验证用户名（必填）
    const usernameError = validateField('username', formData.username);
    if (usernameError) {
      errors.username = usernameError;
      isValid = false;
    }
    
    // 验证新密码（必填）
    const newPasswordError = validateField('newPassword', formData.newPassword);
    if (newPasswordError) {
      errors.newPassword = newPasswordError;
      isValid = false;
    }
    
    // 验证确认密码（必填）
    const confirmPasswordError = validateField('confirmPassword', formData.confirmPassword);
    if (confirmPasswordError) {
      errors.confirmPassword = confirmPasswordError;
      isValid = false;
    }
    
    // 密码一致性验证
    if (formData.newPassword && formData.confirmPassword && 
        formData.newPassword !== formData.confirmPassword) {
      errors.confirmPassword = '两次输入的密码不一致';
      isValid = false;
    }
    
    setFieldErrors(errors);
    return isValid;
  };

  // 处理表单输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const fieldName = name as keyof ResetPasswordFormData;
    
    // 更新表单数据
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
    
    // 实时验证当前字段
    const error = validateField(fieldName, value);
    setFieldErrors(prev => ({
      ...prev,
      [fieldName]: error
    }));
    
    // 如果修改了密码相关字段，重置密码一致性验证错误
    if ((fieldName === 'newPassword' || fieldName === 'confirmPassword') && 
        fieldErrors.confirmPassword === '两次输入的密码不一致') {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.confirmPassword;
        return newErrors;
      });
    }
  };

  // 重置表单
  const handleReset = () => {
    setFormData({
      username: '',
      newPassword: '',
      confirmPassword: ''
    });
    setErrorMessage('');
    setSuccessMessage('');
    setFieldErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 重置错误信息
    setErrorMessage('');
    setSuccessMessage('');
    
    // 全面验证表单
    if (!validateForm()) {
      setErrorMessage('请检查输入的信息');
      return;
    }
    
    setIsLoading(true);
    setErrorMessage('');

    try {
      // 实际项目中，这里应该调用重置密码的API
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // 模拟成功响应
      setSuccessMessage('密码重置成功，请使用新密码登录');
      
      // 5秒后跳转到登录页面
      setTimeout(() => {
        router.push('/commenter/auth/login');
      }, 5000);
    } catch (error) {
      // 提供错误信息
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('重置密码失败，请稍后再试');
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
            重置密码
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
                  用户名 <span className="text-red-500">*</span>
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

              {/* 新密码 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  新密码
                </label>
                <input
                    type="password"
                    placeholder="请设置新密码"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    name="newPassword"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${fieldErrors.newPassword ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
                  />
                  {fieldErrors.newPassword && (
                    <p className="text-red-500 text-xs mt-1">{fieldErrors.newPassword}</p>
                  )}
              </div>

              {/* 确认新密码 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  确认新密码
                </label>
                <input
                    type="password"
                    placeholder="请再次输入新密码"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    name="confirmPassword"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${fieldErrors.confirmPassword ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
                  />
                  {fieldErrors.confirmPassword && (
                    <p className="text-red-500 text-xs mt-1">{fieldErrors.confirmPassword}</p>
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

              {/* 成功信息 */}
              {successMessage && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <span className="text-green-600">✓</span>
                    <span className="text-sm text-green-700">{successMessage}</span>
                  </div>
                </div>
              )}

              {/* 操作按钮 */}
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={handleReset}
                  className="w-1/3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  重置表单
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-2/3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? '处理中...' : '重置密码'}
                </button>
              </div>
            </form>

            {/* 返回登录提示 */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                记得密码了？{' '}
                <button 
                  onClick={() => router.push('/commenter/auth/login')}
                  className="text-blue-500 hover:underline"
                >
                  返回登录
                </button>
              </p>
            </div>
          </div>

          {/* 底部信息 */}
          <div className="text-center text-xs text-gray-500 mb-8">
            <p>© 2024 微任务系统 v2.0.0</p>
          </div>
        </div>
      </div>
    </div>
  );
}