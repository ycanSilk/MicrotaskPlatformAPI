'use client'
import React, { useState } from 'react';
import { Card, Button, Input } from '@/components/ui';

// 设置项组件
interface SettingItemProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

const SettingItem = ({ title, description, children }: SettingItemProps) => {
  return (
    <div className="py-4 border-b border-gray-100">
      <div className="mb-2">
        <div className="font-medium text-gray-900 mb-1">{title}</div>
        <div className="text-xs text-gray-500">{description}</div>
      </div>
      <div className="flex justify-end">
        {children}
      </div>
    </div>
  );
};

// 开关按钮组件
interface ToggleButtonProps {
  checked: boolean;
  onToggle: () => void;
}

const ToggleButton = ({ checked, onToggle }: ToggleButtonProps) => {
  return (
    <Button 
      variant={checked ? "primary" : "ghost"} 
      size="sm" 
      onClick={onToggle}
    >
      {checked ? '开启' : '关闭'}
    </Button>
  );
};

export default function SystemSettingsPage() {
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  const [isNewUserRegistration, setIsNewUserRegistration] = useState(true);
  const [isNotificationEnabled, setIsNotificationEnabled] = useState(true);
  const [maxTaskLimit, setMaxTaskLimit] = useState('100');

  return (
    <div className="space-y-4 pb-6">
      {/* 页面标题 */}
      <div className="px-4 pt-4">
        <h1 className="text-xl font-bold text-gray-900 mb-1">系统设置</h1>
        <p className="text-sm text-gray-600">管理平台基础设置、安全设置等</p>
      </div>

      {/* 基础设置 */}
      <div className="px-4">
        <Card className="p-4">
          <h3 className="text-lg font-bold text-gray-900 mb-4">基础设置</h3>
          <div className="space-y-2">
            <SettingItem 
              title="维护模式" 
              description="开启后，平台将进入维护状态，仅管理员可访问"
            >
              <ToggleButton 
                checked={isMaintenanceMode} 
                onToggle={() => setIsMaintenanceMode(!isMaintenanceMode)} 
              />
            </SettingItem>
            <SettingItem 
              title="用户注册" 
              description="允许新用户注册平台账号"
            >
              <ToggleButton 
                checked={isNewUserRegistration} 
                onToggle={() => setIsNewUserRegistration(!isNewUserRegistration)} 
              />
            </SettingItem>
            <SettingItem 
              title="通知推送" 
              description="开启平台通知推送功能"
            >
              <ToggleButton 
                checked={isNotificationEnabled} 
                onToggle={() => setIsNotificationEnabled(!isNotificationEnabled)} 
              />
            </SettingItem>
            <SettingItem 
              title="每日最大任务发布数量" 
              description="限制用户每日可发布的最大任务数量"
            >
              <Input 
                type="number" 
                value={maxTaskLimit} 
                onChange={(e) => setMaxTaskLimit(e.target.value)} 
                className="w-32 text-right" 
              />
            </SettingItem>
          </div>
        </Card>
      </div>

      {/* 安全设置 */}
      <div className="px-4">
        <Card className="p-4">
          <h3 className="text-lg font-bold text-gray-900 mb-4">安全设置</h3>
          <div className="space-y-2">
            <SettingItem 
              title="两步验证" 
              description="为管理员账号启用两步验证"
            >
              <Button variant="secondary">
                配置
              </Button>
            </SettingItem>
            <SettingItem 
              title="IP白名单" 
              description="限制仅白名单IP可访问管理后台"
            >
              <Button variant="secondary">
                管理
              </Button>
            </SettingItem>
            <SettingItem 
              title="安全日志" 
              description="查看管理后台的登录和操作日志"
            >
              <Button variant="secondary">
                查看
              </Button>
            </SettingItem>
          </div>
        </Card>
      </div>

      {/* 保存设置按钮 */}
      <div className="px-4 flex justify-end">
        <Button>
          保存设置
        </Button>
      </div>
    </div>
  );
}