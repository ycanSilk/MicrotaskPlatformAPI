'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Label } from '@/components/ui';
// 移除可能不存在的组件导入，使用基础HTML元素和Tailwind CSS样式

const CreateRolePage: React.FC = () => {
  const router = useRouter();
  const [roleName, setRoleName] = useState('');
  const [roleDescription, setRoleDescription] = useState('');
  const [roleCode, setRoleCode] = useState('');
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // 处理roleCode输入，实现大写转换
  const handleRoleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    setRoleCode(value);
    
    // 清除错误提示
    if (errors.roleCode) {
      setErrors({ ...errors, roleCode: '' });
    }
  };

  // 表单验证
  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!roleName.trim()) {
      newErrors.roleName = '请输入角色名称';
    }
    
    if (!roleCode.trim()) {
      newErrors.roleCode = '请输入角色代码';
    } else if (!/^[A-Z_]+$/.test(roleCode)) {
      newErrors.roleCode = '角色代码只能包含大写字母和下划线';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 提交表单
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // 准备请求数据，确保字段名称与后端一致
      const requestData = {
        roleName: roleName,
        roleCode: roleCode,
        description: roleDescription
      };
      
      // 调用实际的后端API
      const response = await fetch('/api/role/systemrole/creatrole', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });
      
      // 解析响应数据
      const responseData = await response.json();
      
      // 检查API响应状态
      if (responseData.success || responseData.code === 1) {
        // 显示成功提示
        setShowSuccess(true);
        
        // 3秒后跳转回角色列表
        setTimeout(() => {
          router.push('/admin/roleManagement');
        }, 1000);
      } else {
        // 显示错误信息
        setErrors({ submit: responseData.message || '创建角色失败，请稍后重试' });
      }
    } catch (error) {
      console.error('创建角色失败:', error);
      setErrors({ submit: '创建角色失败，请稍后重试' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">创建新角色</h1>
          <button 
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md transition-colors"
            onClick={() => router.back()}
          >
            返回列表
          </button>
        </div>
        
        {showSuccess ? (
          <div className="bg-green-50 border-green-200 text-green-800 p-4 rounded-md border flex items-start">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <p className="ml-2">
              角色创建成功！3秒后自动返回角色列表...
            </p>
          </div>
        ) : (
          <div className="overflow-hidden border-0 shadow-lg bg-white rounded-lg">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="pb-2 px-6 pt-6">
                <h2 className="text-xl font-bold">基本信息</h2>
                <p className="text-gray-600">请填写角色的基本信息和权限设置</p>
              </div>
               
              <div className="space-y-6 px-6">
                {/* 角色名称 */}
                <div className="space-y-2">
                  <label htmlFor="roleName" className="text-base block">角色名称 <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    id="roleName"
                    value={roleName}
                    onChange={(e) => {
                      setRoleName(e.target.value);
                      if (errors.roleName) {
                        setErrors({ ...errors, roleName: '' });
                      }
                    }}
                    placeholder="请输入角色名称"
                    className={`w-full px-3 py-2 border rounded-md ${errors.roleName ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'} focus:outline-none transition-all`}
                  />
                  {errors.roleName && (
                    <p className="text-red-500 text-sm mt-1">{errors.roleName}</p>
                  )}
                </div>
                
                {/* 角色代码 */}
                <div className="space-y-2">
                  <label htmlFor="roleCode" className="text-base block">角色代码 <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    id="roleCode"
                    value={roleCode}
                    onChange={handleRoleCodeChange}
                    placeholder="请输入角色代码（大写字母和下划线）"
                    className={`w-full px-3 py-2 border rounded-md ${errors.roleCode ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'} focus:outline-none transition-all`}
                  />
                  {errors.roleCode && (
                    <p className="text-red-500 text-sm mt-1">{errors.roleCode}</p>
                  )}
                </div>
                
                {/* 角色描述 */}
                <div className="space-y-2">
                  <label htmlFor="roleDescription" className="block">角色描述</label>
                  <textarea
                    id="roleDescription"
                    value={roleDescription}
                    onChange={(e) => setRoleDescription(e.target.value)}
                    placeholder="请输入角色描述（可选）"
                    className="w-full min-h-[100px] resize-y px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                </div>
                
                <div className="border-t border-gray-200 my-4"></div>
                
                {errors.submit && (
                  <div className="bg-red-50 border-red-200 text-red-800 p-4 rounded-md border">
                    <p>{errors.submit}</p>
                  </div>
                )}
              </div>
               
              <div className="px-6 pb-6 flex flex-col sm:flex-row sm:justify-end gap-3">
                <button 
                  type="button" 
                  className="bg-gray-200 text-gray-800 hover:bg-gray-300 px-4 py-2 rounded-md transition-colors"
                  onClick={() => router.back()}
                  disabled={isSubmitting}
                >
                  取消
                </button>
                <button 
                  type="submit" 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      提交中...
                    </>
                  ) : '创建角色'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateRolePage;