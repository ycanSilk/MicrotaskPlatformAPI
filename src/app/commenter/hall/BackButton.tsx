'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { LeftOutlined } from '@ant-design/icons';

interface BackButtonProps {
  // 可选的自定义className
  className?: string;
}

export const BackButton: React.FC<BackButtonProps> = ({ className = '' }) => {
  const router = useRouter();
  const pathname = usePathname();

  const handleBack = () => {
    router.back();
  };

  // 检查是否为二级及更深层级的页面
  // 通过检查路径中"/"的数量来判断层级
  const isDeepPage = (pathname?.split('/') || []).length > 2;

  // 在首页不显示，在其他二级及更深层级页面显示
  const shouldShow = isDeepPage && pathname != null && pathname !== '/'

  if (!shouldShow) {
    return null;
  }

  return (
    <button 
      onClick={handleBack}
      className={`p-1 hover:bg-green-600 rounded-full transition-colors ${className}`}
      aria-label="返回上一页"
    >
      <LeftOutlined size={20} />
    </button>
  );
};