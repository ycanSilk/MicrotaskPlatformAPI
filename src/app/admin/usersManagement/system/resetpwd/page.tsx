'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui';
import { useRouter, useSearchParams } from 'next/navigation';

// 系统用户类型定义
interface SystemUser {
  id: string;
  username: string;
  realName: string;
  email: string;
  phone: string;
}

// 密码重置表单验证错误类型
interface PasswordResetErrors {
  newPassword?: string;
  confirmPassword?: string;
}

// 模拟用户数据
const mockUsers: SystemUser[] = [
  {
    id: '1',
    username: 'admin',
    realName: '系统管理员',
    email: 'admin@example.com',
    phone: '13800138000'
  },
  {
    id: '2',
    username: 'operator1',
    realName: '张三',
    email: 'operator1@example.com',
    phone: '13800138001'
  },
  {
    id: '3',
    username: 'financial1',
    realName: '李四',
    email: 'financial1@example.com',
    phone: '13800138002'
  },
  {
    id: '4',
    username: 'auditor1',
    realName: '王五',
    email: 'auditor1@example.com',
    phone: '13800138003'
  }
];

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams?.get('id');
  
  // 表单状态
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<PasswordResetErrors>({});
  const [user, setUser] = useState<SystemUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // 加载用户信息
  useEffect(() => {
    const loadUserData = async () => {
      if (!userId) {
        setError('用户ID不存在');
        setLoading(false);
        return;
      }
      
      try {
        // 模拟API请求延迟
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const foundUser = mockUsers.find(u => u.id === userId);
        if (foundUser) {
          setUser(foundUser);
        } else {
          setError('用户不存在');
        }
      } catch (err) {
        setError('加载用户数据失败');
        console.error('加载用户数据失败:', err);
      } finally {
        setLoading(false);
      }
    };
    
    loadUserData();
  }, [userId]);
  
  // 处理表单输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // 清除相关字段的错误信息
    if (errors[name as keyof PasswordResetErrors]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name as keyof PasswordResetErrors];
        return newErrors;
      });
    }
  };
  
  // 表单验证
  const validateForm = (): boolean => {
    const newErrors: PasswordResetErrors = {};
    
    // 验证新密码
    if (!formData.newPassword) {
      newErrors.newPassword = '请输入新密码';
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = '密码长度至少为8个字符';
    } else if (!/(?=.*[A-Za-z])(?=.*\d)/.test(formData.newPassword)) {
      newErrors.newPassword = '密码必须包含字母和数字';
    }
    
    // 验证确认密码
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = '请确认新密码';
    } else if (formData.confirmPassword !== formData.newPassword) {
      newErrors.confirmPassword = '两次输入的密码不一致';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // 处理密码重置提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // 确认对话框
    if (!window.confirm(`确定要重置用户 ${user?.username} 的密码吗？`)) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // 模拟API请求延迟
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // 密码重置成功
      setSuccess(true);
      
      // 2秒后返回用户管理页面
      setTimeout(() => {
        router.push('/admin/usersManagement/system');
      }, 2000);
    } catch (err) {
      console.error('密码重置失败:', err);
      // 这里可以添加错误处理逻辑
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // 处理返回
  const handleBack = () => {
    router.push('/admin/usersManagement/system');
  };
  
  // 切换密码显示状态
  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };
  
  // 加载中状态
  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-lg text-gray-600">加载中...</div>
      </div>
    );
  }
  
  // 错误状态
  if (error || !user) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <div className="text-lg text-red-600">{error || '用户数据加载失败'}</div>
        <button
          onClick={handleBack}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          返回用户管理
        </button>
      </div>
    );
  }
  
  // 成功状态
  if (success) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-6">
        <div className="text-5xl text-green-500">✓</div>
        <div className="text-xl text-gray-800">密码重置成功！</div>
        <p className="text-gray-600">正在返回用户管理页面...</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6 pb-20 px-4 pt-4">
      <Card className="p-6">
        {/* 用户信息卡片 */}
        <div className="mb-3 space-y-2">当前用户名称：{user.username}</div>
        
        {/* 密码重置表单 */}
        <form onSubmit={handleSubmit}>
          <div className="space-y-3">
            {/* 新密码输入 */}
            <div className="space-y-2">
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                新密码 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="newPassword"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg pr-10 ${errors.newPassword ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="请输入新密码"
                />
                <button
                  type="button"
                  onClick={toggleShowPassword}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? '隐藏' : '显示'}
                </button>
              </div>
              {errors.newPassword && (
                <p className="text-sm text-red-500">{errors.newPassword}</p>
              )}
            </div>
            
            {/* 确认密码输入 */}
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                确认新密码 <span className="text-red-500">*</span>
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 border rounded-lg ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="请再次输入新密码"
              />
              {errors.confirmPassword && (
                <p className="text-sm text-red-500">{errors.confirmPassword}</p>
              )}
            </div>  
            {/* 操作按钮 */}
            <div className="flex justify-end space-x-4 pt-4 border-t">
              <button
                type="button"
                onClick={handleBack}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-6 py-2 rounded-lg transition-colors ${isSubmitting ? 'bg-blue-300 text-white cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
              >
                {isSubmitting ? '重置中...' : '确认重置密码'}
              </button>
            </div>
          </div>
        </form>
      </Card>
    </div>
  );
}