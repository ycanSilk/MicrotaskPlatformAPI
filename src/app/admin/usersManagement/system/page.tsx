'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

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

// 密码重置表单错误类型
interface PasswordResetErrors {
  newPassword?: string;
  confirmPassword?: string;
}

// 系统用户卡片组件
interface SystemUserCardProps {
  user: SystemUser;
}

const SystemUserCard: React.FC<SystemUserCardProps> = ({ user }) => {
  const router = useRouter();
  
  // 处理状态切换
  const handleToggleStatus = (e: React.MouseEvent, userId: string) => {
    e.stopPropagation();
    // 这里可以添加确认和状态切换逻辑
    console.log('切换用户状态:', userId);
  };
  
  return (
    <Card 
      className={`p-5 border hover:border-blue-400 transition-colors ${user.status === 'active' ? 'bg-white' : 'bg-gray-50'}`}
    >
      <div className="mb-4">
        <div className="grid grid-cols-2 gap-2 mb-2">
          <div className="text-sm">
            <span className="mr-2">用户名称：</span>
            <span>{user.username}</span>
          </div>
          <div className="text-sm">
            <span className="mr-2">手机号码:</span>
            <span>
              {user.phone}
            </span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 mb-2">
          <div className="text-sm">
            <span className="mr-2">所属角色：</span>
            <span>{user.role}</span>
          </div>
          <div className="text-sm">
            <span className="mr-2">当前状态：</span>
            <span className={` ${user.status === 'active' ? 'text-green-600' : 'text-gray-600'}`}>
              {user.status === 'active' ? '活跃' : '禁用'}
            </span>
          </div>
        </div>
      </div>
      
      {/* 操作按钮 */}
      <div className="mt-4 pt-4 border-t flex justify-end space-x-2">
        <button 
          className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/admin/usersManagement/system/changesystemuser?id=${user.id}`);
          }}
        >
          编辑
        </button>
        <button 
          className="px-3 py-1 bg-yellow-500 text-white rounded-md text-sm hover:bg-yellow-600 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/admin/usersManagement/system/resetpwd?id=${user.id}`);
          }}
        >
          重置密码
        </button>
        <button 
          className={`px-3 py-1 rounded-md text-sm transition-colors ${user.status === 'active' ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-green-500 text-white hover:bg-green-600'}`}
          onClick={(e) => handleToggleStatus(e, user.id)}
        >
          {user.status === 'active' ? '禁用' : '启用'}
        </button>
      </div>
    </Card>
  );
};

// 编辑用户模态框组件
interface EditUserModalProps {
  user: SystemUser | null;
  onClose: () => void;
  onSave: (user: SystemUser) => void;
}

const EditUserModal: React.FC<EditUserModalProps> = ({ user, onClose, onSave }) => {
  // 可选择的角色列表
  const availableRoles = ['超级管理员', '运营专员', '财务专员', '审计员'];
  
  // 可选择的权限列表
  const availablePermissions = ['用户管理', '财务管理', '系统设置', '数据分析', '日志查看', '内容审核'];
  
  // 表单状态
  const [formData, setFormData] = useState<SystemUser>(user || {
    id: '',
    username: '',
    realName: '',
    email: '',
    phone: '',
    role: '',
    permissions: [],
    status: 'active',
    createdAt: '',
    lastLogin: ''
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // 当用户变化时更新表单数据
  React.useEffect(() => {
    if (user) {
      setFormData(user);
      setErrors({});
      setSuccessMessage('');
    }
  }, [user]);
  
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
  
  // 处理状态变化
  const handleStatusChange = (status: 'active' | 'inactive') => {
    setFormData(prev => ({
      ...prev,
      status
    }));
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
  
  // 表单验证
  const validateForm = (): boolean => {
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
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // 模拟API请求延迟
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 提交数据
      onSave(formData);
      
      // 显示成功消息
      setSuccessMessage('用户信息更新成功！');
      
      // 3秒后关闭模态框
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      console.error('更新用户信息失败:', error);
      // 这里可以添加错误处理逻辑
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!user) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">编辑系统用户</h2>
            <button 
              onClick={onClose} 
              className=" hover: focus:outline-none"
            >
              ✕
            </button>
          </div>
          
          {successMessage && (
            <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg">
              {successMessage}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* 基本信息区域 */}
              <div>
                <h3 className="font-medium  mb-4">基本信息</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <h3 className="font-medium  mb-4">角色和权限</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="role" className="block text-sm font-medium ">
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
                    <label className="block text-sm font-medium ">
                      权限
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {availablePermissions.map(permission => (
                        <label key={permission} className="flex items-center space-x-2 bg-gray-50 px-3 py-2 rounded-lg cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.permissions?.includes(permission) || false}
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
              
              {/* 状态管理 */}
              <div>
                <h3 className="font-medium  mb-4">账号状态</h3>
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
                <h3 className="font-medium  mb-4">系统信息</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              
              {/* 密码重置按钮 */}
              <div className="pt-4">
                <button
                  type="button"
                  className="px-4 py-2 text-blue-600 border border-blue-500 rounded-lg hover:bg-blue-50 transition-colors"
                  onClick={() => {
                    // 后续实现密码重置功能
                    console.log('重置密码:', formData.username);
                    alert('密码重置功能将在后续实现');
                  }}
                >
                  重置密码
                </button>
              </div>
              
              {/* 操作按钮 */}
              <div className="flex justify-end space-x-4 pt-4 border-t">
                <button
                  type="button"
                  onClick={onClose}
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
        </div>
      </Card>
    </div>
  );
};

export default function SystemUsersPage() {
  const router = useRouter();
  
  // 模拟系统用户数据
  const [systemUsers, setSystemUsers] = useState<SystemUser[]>([
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
  ]);

  // 处理用户状态切换
  const handleToggleStatus = (userId: string) => {
    const user = systemUsers.find(u => u.id === userId);
    if (user) {
      // 显示确认对话框
      if (confirm(`确定要${user.status === 'active' ? '禁用' : '启用'}用户"${user.username}"吗？`)) {
        setSystemUsers(prev => 
          prev.map(u => 
            u.id === userId 
              ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' }
              : u
          )
        );
      }
    }
  };

  return (
    <div className="space-y-6 pb-32 px-4 pt-4">
      {/* 页面标题 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">系统用户管理</h1>
        <p className="text-sm text-gray-600">管理平台系统管理员和运营人员账户</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card className="p-4 border border-gray-200">
        <div className="space-y-1 text-center">
          <p className="text-sm">总用户数</p>
          <p className="text-xl font-bold text-blue-600">{systemUsers.length}</p>
        </div>
      </Card>
        <Card className="p-4 border border-gray-200">
        <div className="space-y-1 text-center">
          <p className="text-sm">活跃用户</p>
          <p className="text-xl font-bold text-green-600">{systemUsers.filter(u => u.status === 'active').length}</p>
        </div>
      </Card>
        <Card className="p-4 border border-gray-200">
        <div className="space-y-1 text-center">
          <p className="text-sm">禁用用户</p>
          <p className="text-xl font-bold">{systemUsers.filter(u => u.status === 'inactive').length}</p>
        </div>
      </Card>
      </div>

      {/* 搜索区域 */}
      <Card className="p-4 border border-gray-200 mb-6">
        <div className="flex-1">
          <input
            type="text"
            placeholder="搜索用户名、姓名或邮箱..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </Card>

      
      {/* 添加系统用户按钮 */}
        <div className="bottom-20 flex justify-center items-center px-4 mt-6">
          <Link href="/admin/usersManagement/system/addsystemuser">
            <button className="bg-blue-600 text-white px-6 py-3 items-center rounded-lg font-bold shadow-lg hover:bg-blue-700 transition-colors flex items-center">
              <span className="mr-2 text-2xl">+</span>
              添加系统用户
            </button>
          </Link>
        </div>

      {/* 系统用户列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {systemUsers.map((user) => (
          <SystemUserCard key={user.id} user={user} />
        ))}
      </div>



    </div>
  );
}