'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui';
import { useRouter } from 'next/navigation';

// 表单验证错误类型
interface FormErrors {
  username?: string;
  realName?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
  role?: string;
}

// 系统用户类型定义
interface SystemUser {
  id: string;
  username: string;
  realName: string;
  email: string;
  phone: string;
  password: string;
  role: string;
  permissions: string[];
  status: 'active' | 'inactive';
  createdAt: string;
}

export default function AddSystemUserPage() {
  const router = useRouter();
  
  // 可选择的角色列表
  const availableRoles = ['超级管理员', '运营专员', '财务专员', '审计员'];
  
  // 可选择的权限列表
  const availablePermissions = ['用户管理', '财务管理', '系统设置', '数据分析', '日志查看', '内容审核'];
  
  // 表单状态
  const [formData, setFormData] = useState({
    username: '',
    realName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: '',
    permissions: [] as string[],
    status: 'active' as 'active' | 'inactive'
  });
  
  // 表单验证错误
  const [errors, setErrors] = useState<FormErrors>({});
  
  // 页面状态
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // 处理表单输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // 清除相关字段的错误信息
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name as keyof FormErrors];
        return newErrors;
      });
    }
  };
  
  // 处理权限变化
  const handlePermissionChange = (permission: string) => {
    setFormData(prev => {
      const permissions = prev.permissions || [];
      if (permissions.includes(permission)) {
        return {
          ...prev,
          permissions: permissions.filter(p => p !== permission)
        };
      } else {
        return {
          ...prev,
          permissions: [...permissions, permission]
        };
      }
    });
  };
  
  // 处理状态变化
  const handleStatusChange = (status: 'active' | 'inactive') => {
    setFormData(prev => ({
      ...prev,
      status
    }));
  };
  
  // 切换密码显示状态
  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };
  
  // 表单验证
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    // 验证用户名
    if (!formData.username.trim()) {
      newErrors.username = '请输入用户名';
    } else if (formData.username.length < 3) {
      newErrors.username = '用户名长度至少为3个字符';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = '用户名只能包含字母、数字和下划线';
    }
    
    // 验证真实姓名
    if (!formData.realName.trim()) {
      newErrors.realName = '请输入真实姓名';
    }
    
    // 验证邮箱
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = '请输入邮箱地址';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = '请输入有效的邮箱地址';
    }
    
    // 验证电话
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!formData.phone.trim()) {
      newErrors.phone = '请输入手机号码';
    } else if (!phoneRegex.test(formData.phone)) {
      newErrors.phone = '请输入有效的手机号码';
    }
    
    // 验证密码
    if (!formData.password) {
      newErrors.password = '请输入密码';
    } else if (formData.password.length < 8) {
      newErrors.password = '密码长度至少为8个字符';
    } else if (!/(?=.*[A-Za-z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = '密码必须包含字母和数字';
    }
    
    // 验证确认密码
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = '请确认密码';
    } else if (formData.confirmPassword !== formData.password) {
      newErrors.confirmPassword = '两次输入的密码不一致';
    }
    
    // 验证角色
    if (!formData.role) {
      newErrors.role = '请选择角色';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // 处理表单提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // 模拟API请求延迟
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 构建用户数据
      const userData: SystemUser = {
        id: Date.now().toString(), // 模拟生成ID
        username: formData.username,
        realName: formData.realName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password, // 实际应用中应该加密存储
        role: formData.role,
        permissions: formData.permissions,
        status: formData.status,
        createdAt: new Date().toISOString()
      };
      
      console.log('提交的用户数据:', userData);
      
      // 提交成功
      setSuccess(true);
      
      // 2秒后返回用户管理页面
      setTimeout(() => {
        router.push('/admin/usersManagement/system');
      }, 2000);
    } catch (error) {
      console.error('添加用户失败:', error);
      // 这里可以添加错误处理逻辑
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // 处理取消
  const handleCancel = () => {
    router.push('/admin/usersManagement/system');
  };
  
  // 成功状态
  if (success) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-6">
        <div className="text-5xl text-green-500">✓</div>
        <div className="text-xl text-gray-800">用户添加成功！</div>
        <p className="text-gray-600">正在返回用户管理页面...</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6 pb-20 px-4 pt-4">
      <Card className="p-6">
        <form onSubmit={handleSubmit}>
          <div className="space-y-8">
            {/* 基本信息区域 */}
            <div>
              <h3 className="font-medium text-gray-700 mb-4 pb-2 border-b">基本信息</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                    用户名 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg ${errors.username ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="请输入用户名"
                  />
                  {errors.username && (
                    <p className="text-sm text-red-500">{errors.username}</p>
                  )}
                  <p className="text-xs text-gray-500">
                    用户名只能包含字母、数字和下划线，长度至少3个字符
                  </p>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="realName" className="block text-sm font-medium text-gray-700">
                    真实姓名 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="realName"
                    name="realName"
                    value={formData.realName}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg ${errors.realName ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="请输入真实姓名"
                  />
                  {errors.realName && (
                    <p className="text-sm text-red-500">{errors.realName}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    邮箱 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="请输入邮箱地址"
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500">{errors.email}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    手机号码 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="请输入手机号码"
                  />
                  {errors.phone && (
                    <p className="text-sm text-red-500">{errors.phone}</p>
                  )}
                </div>
              </div>
            </div>
            
            {/* 账号安全 */}
            <div>
              <h3 className="font-medium text-gray-700 mb-4 pb-2 border-b">账号安全</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    密码 <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-lg pr-10 ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="请输入密码"
                    />
                    <button
                      type="button"
                      onClick={toggleShowPassword}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? '隐藏' : '显示'}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-red-500">{errors.password}</p>
                  )}
                  <p className="text-xs text-gray-500">
                    密码必须至少包含8个字符，并同时包含字母和数字
                  </p>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                    确认密码 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="请再次输入密码"
                  />
                  {errors.confirmPassword && (
                    <p className="text-sm text-red-500">{errors.confirmPassword}</p>
                  )}
                </div>
              </div>
            </div>
            
            {/* 角色和权限区域 */}
            <div>
              <h3 className="font-medium text-gray-700 mb-4 pb-2 border-b">角色和权限</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                    角色 <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg ${errors.role ? 'border-red-500' : 'border-gray-300'}`}
                  >
                    <option value="">请选择角色</option>
                    {availableRoles.map(role => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                  {errors.role && (
                    <p className="text-sm text-red-500">{errors.role}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    权限
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {availablePermissions.map(permission => (
                      <label key={permission} className="flex items-center space-x-2 bg-gray-50 px-3 py-2 rounded-lg cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.permissions.includes(permission)}
                          onChange={() => handlePermissionChange(permission)}
                          className="rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span>{permission}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            {/* 账号状态 */}
            <div>
              <h3 className="font-medium text-gray-700 mb-4 pb-2 border-b">账号状态</h3>
              <div className="flex items-center space-x-6">
                <label className={`flex items-center space-x-2 cursor-pointer p-3 rounded-lg ${formData.status === 'active' ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'}`}>
                  <input
                    type="radio"
                    name="status"
                    value="active"
                    checked={formData.status === 'active'}
                    onChange={() => handleStatusChange('active')}
                    className="text-green-600 focus:ring-green-500"
                  />
                  <span>活跃</span>
                </label>
                <label className={`flex items-center space-x-2 cursor-pointer p-3 rounded-lg ${formData.status === 'inactive' ? 'bg-red-50 border border-red-200' : 'bg-gray-50 border border-gray-200'}`}>
                  <input
                    type="radio"
                    name="status"
                    value="inactive"
                    checked={formData.status === 'inactive'}
                    onChange={() => handleStatusChange('inactive')}
                    className="text-red-600 focus:ring-red-500"
                  />
                  <span>禁用</span>
                </label>
              </div>
              {formData.status === 'inactive' && (
                <p className="mt-2 text-sm text-yellow-600">
                  注：禁用状态的账号将无法登录系统
                </p>
              )}
            </div>
            
            {/* 操作按钮 */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-6 py-2 rounded-lg transition-colors ${isSubmitting ? 'bg-blue-300 text-white cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
              >
                {isSubmitting ? '添加中...' : '添加用户'}
              </button>
            </div>
          </div>
        </form>
      </Card>
    </div>
  );
}