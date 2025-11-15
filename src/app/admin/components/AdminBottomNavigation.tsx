import React from 'react';
import { BottomNavigation } from '../../../components/layout/BottomNavigation';
import { NavigationItem } from '@/types';

/**
 * 管理员底部导航栏组件
 * 封装了管理员页面的底部导航栏，包含总览、用户、财务和设置四个导航项
 */
export const AdminBottomNavigation: React.FC = () => {
  // 管理员导航项配置
  const adminNavigationItems: NavigationItem[] = [
    {
      icon: '📊',
      label: '总览',
      path: '/admin/dashboard'
    },
    {
      icon: '👥',
      label: '管理中心',
      path: '/admin/managementCenter'
    },
    {
      icon: '💰',
      label: '财务',
      path: '/admin/finance'
    },
    {
      icon: '⚙️',
      label: '设置',
      path: '/admin/settings'
    }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white">
      <BottomNavigation items={adminNavigationItems} />
    </div>
  );
};