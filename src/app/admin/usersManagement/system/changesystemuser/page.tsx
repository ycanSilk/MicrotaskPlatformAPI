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
  role: string;
  permissions: string[];
  status: 'active' | 'inactive';
  createdAt: string;
  lastLogin: string;
  avatar?: string;
}

// 表单验证错误类型
interface FormErrors {
  realName?: string;
  email?: string;
  phone?: string;
  role?: string;
}

// 模拟用户数据
const mockUsers: SystemUser[] = [
  {
    id: '1',
    username: 'admin',
    realName: '系统管理员',
    email: 'admin@example.com',
    phone: '13800138000',
    role: '超级管理员',
    permissions: ['用户管理', '财务管理', '系统设置', '数据分析'],
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    lastLogin: '2024-01-15T08:30:00Z'
  },
  {
    id: '2',
    username: 'operator1',
    realName: '张三',
    email: 'operator1@example.com',
    phone: '13800138001',
    role: '运营专员',
    permissions: ['用户管理', '数据分析'],
    status: 'active',
    createdAt: '2024-01-05T00:00:00Z',
    lastLogin: '2024-01-14T15:20:00Z'
  },
  {
    id: '3',
    username: 'financial1',
    realName: '李四',
    email: 'financial1@example.com',
    phone: '13800138002',
    role: '财务专员',
    permissions: ['财务管理', '数据分析'],
    status: 'active',
    createdAt: '2024-01-10T00:00:00Z',
    lastLogin: '2024-01-15T10:15:00Z'
  },
  {
    id: '4',
    username: 'auditor1',
    realName: '王五',
    email: 'auditor1@example.com',
    phone: '13800138003',
    role: '审计员',
    permissions: ['数据分析', '日志查看'],
    status: 'inactive',
    createdAt: '2024-01-12T00:00:00Z',
    lastLogin: '2024-01-13T09:45:00Z'
  }
];

export default function ChangeSystemUserPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get('id');
  
  // 可选择的角色列表
  const availableRoles = ['超级管理员', '运营专员', '财务专员', '审计员'];
  
  // 可选择的权限列表
  const availablePermissions = ['用户管理', '财务管理', '系统设置', '数据分析', '日志查看', '内容审核'];
  
  // 表单状态
  const [formData, setFormData] = useState<SystemUser | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // 加载用户数据
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
        
        const user = mockUsers.find(u => u.id === userId);
        if (user) {
          setFormData(user);
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
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!formData) return;
    
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
  
  // 处理状态变化
  const handleStatusChange = (status: 'active' | 'inactive') => {
    if (!formData) return;
    
    setFormData(prev => ({
      ...prev,
      status
    }));
  };
  
  // 处理权限变化
  const handlePermissionChange = (permission: string) => {
    if (!formData) return;
    
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
  
  // 表单验证
  const validateForm = (): boolean => {
    if (!formData) return false;
    
    const newErrors: FormErrors = {};
    
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
    
    if (!formData) return;
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // 模拟API请求延迟
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 提交数据成功
      setSuccessMessage('用户信息更新成功！');
      
      // 2秒后返回列表页
      setTimeout(() => {
        router.push('/admin/usersManagement/system');
      }, 1500);
    } catch (error) {
      console.error('更新用户信息失败:', error);
      // 这里可以添加错误处理逻辑
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // 处理取消
  const handleCancel = () => {
    router.push('/admin/usersManagement/system');
  };
  
  // 处理密码重置跳转
  const handleResetPassword = () => {
    if (formData) {
      router.push(`/admin/usersManagement/system/resetpwd?id=${formData.id}`);
    }
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
  if (error || !formData) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-lg text-red-600">{error || '用户数据加载失败'}</div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6 pb-20 px-4 pt-4">
      <Card className="p-6">
        {successMessage && (
          <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-lg">
            {successMessage}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-8">
            {/* 基本信息区域 */}
            <div>
              <h3 className="font-medium  mb-4 pb-2 border-b">基本信息</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="username" className="block text-sm font-medium ">
                    用户名
                  </label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="realName" className="block text-sm font-medium ">
                    真实姓名 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="realName"
                    name="realName"
                    value={formData.realName}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg ${errors.realName ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors.realName && (
                    <p className="text-sm text-red-500">{errors.realName}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-medium ">
                    邮箱 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500">{errors.email}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="phone" className="block text-sm font-medium ">
                    手机号码 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors.phone && (
                    <p className="text-sm text-red-500">{errors.phone}</p>
                  )}
                </div>
              </div>
            </div>
            
            {/* 角色和权限区域 */}
            <div>
              <h3 className="font-medium  mb-4 pb-2 border-b">角色权限</h3>
              <div className="space-y-4">
                <div className="space-y-2">
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
              </div>
            </div>
            
            {/* 状态管理 */}
            <div>
              <h3 className="font-medium  mb-4 pb-2 border-b">账号状态</h3>
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
            </div>
            
            {/* 系统信息 */}
            <div>
              <h3 className="font-medium  mb-4 pb-2 border-b">系统信息</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium ">
                    创建时间
                  </label>
                  <input
                    type="text"
                    value={new Date(formData.createdAt).toLocaleString()}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium ">
                    最后登录时间
                  </label>
                  <input
                    type="text"
                    value={formData.lastLogin ? new Date(formData.lastLogin).toLocaleString() : '从未登录'}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>
              </div>
            </div>
            {/* 操作按钮 */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-2 border border-gray-300 rounded-lg  hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-6 py-2 rounded-lg transition-colors ${isSubmitting ? 'bg-blue-300 text-white cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
              >
                {isSubmitting ? '保存中...' : '保存修改'}
              </button>
            </div>
          </div>
        </form>
      </Card>
    </div>
  );
}