"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

interface UserProfile {
  avatar: string;
  name: string;
  phone: string;
  email: string;

}

export default function PersonalInfoPage() {
  const router = useRouter();
  
  // 用户个人信息状态
  const [userProfile, setUserProfile] = useState<UserProfile>({
    avatar: '/images/0e92a4599d02a7.jpg',
    name: 'A', 
    phone: '137****8808',
    email: '123456@qq.com'
  });

  // 编辑状态
  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentField, setCurrentField] = useState<{
    key: keyof UserProfile;
    label: string;
    placeholder?: string;
  } | null>(null);

  // 处理头像上传
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 在实际应用中，这里应该上传文件到服务器
      // 这里仅做本地预览
      const reader = new FileReader();
      reader.onload = (event) => {
        setUserProfile(prev => ({
          ...prev,
          avatar: event.target?.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // 打开编辑模态框
  const openEditModal = (field: keyof UserProfile, label: string, placeholder?: string) => {
    setCurrentField({ key: field, label, placeholder });
    setTempValue(userProfile[field]);
    setShowEditModal(true);
  };

  // 保存编辑
  const saveEdit = () => {
    if (currentField) {
      setUserProfile(prev => ({
        ...prev,
        [currentField.key]: tempValue
      }));
      setShowEditModal(false);
      setCurrentField(null);
      setTempValue('');
    }
  };

  // 处理返回
  const handleBack = () => {
    router.back();
  };

  // 信息项组件
  const InfoItem = ({ 
    label, 
    value, 
    field,
    placeholder 
  }: { 
    label: string; 
    value: string; 
    field: keyof UserProfile;
    placeholder?: string;
  }) => (
    <div 
      className="p-4 border-b border-gray-100 flex justify-between items-center"
      onClick={() => openEditModal(field, label, placeholder)}
    >
      <span className="text-gray-800">{label}</span>
      <div className="flex items-center text-gray-500">
        <span className="mr-2 whitespace-nowrap">{value}</span>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 个人信息表单 */}
      <div className="mt-4 bg-white shadow-sm">
        {/* 头像 - 整行可点击 */}
        <div 
          className="p-4 border-b border-gray-100 flex justify-between items-center cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={(e) => {
            const fileInput = e.currentTarget.querySelector('input[type="file"]') as HTMLInputElement;
            if (fileInput) {
              fileInput.click();
            }
          }}
        >
          <span className="text-gray-800">头像</span>
          <div className="flex items-center">
            <div className="relative mr-2">
              <img 
                src={userProfile.avatar} 
                alt="头像" 
                className="w-12 h-12 rounded-full object-cover border border-gray-200"
              />
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleAvatarUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="absolute inset-0 bg-black bg-opacity-30 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <span className="text-white text-sm">更换</span>
              </div>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>

        {/* 名字 */}
        <InfoItem label="名字" value={userProfile.name} field="name" placeholder="请输入名字" />

        {/* 手机号 */}
        <InfoItem label="手机号" value={userProfile.phone} field="phone" placeholder="请输入手机号" />

        {/* 邮箱 */}
        <InfoItem label="邮箱" value={userProfile.email || '未填写'} field="email" placeholder="请输入邮箱" />

      </div>

      {/* 编辑模态框 */}
      {showEditModal && currentField && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md mx-4">
            <div className="p-5 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">编辑{currentField.label}</h3>
            </div>
            <div className="p-5">
              <input
                type="text"
                value={tempValue}
                onChange={(e) => setTempValue(e.target.value)}
                placeholder={currentField.placeholder || `请输入${currentField.label}`}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
            </div>
            <div className="flex border-t border-gray-200">
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 py-3 text-gray-600 font-medium hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={saveEdit}
                className="flex-1 py-3 text-blue-600 font-medium hover:bg-gray-50 border-l border-gray-200"
              >
                确定
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}