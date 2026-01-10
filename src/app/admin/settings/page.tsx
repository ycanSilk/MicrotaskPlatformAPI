'use client';

import React, { useState } from 'react';
import { Card, Input, Button, ToggleSwitch, Badge, Alert } from '@/components/ui';
import { 
  SystemSettings, 
  UserRole, 
  TaskCategory, 
  SystemNotification, 
  FormChangeEvent 
} from '@/types/settings';

// 表单输入组件
const FormInput: React.FC<{
  label: string;
  value: string | number;
  onChange: (value: string | number) => void;
  type?: 'text' | 'number' | 'textarea';
  placeholder?: string;
  description?: string;
  step?: string;
  required?: boolean;
}> = ({ 
  label, 
  value, 
  onChange, 
  type = 'text',
  placeholder = '',
  description = '',
  step,
  required = false
}) => {
  const handleChange = (e: FormChangeEvent) => {
    if (type === 'number') {
      const numValue = type === 'number' && step ? parseFloat(e.target.value) : parseInt(e.target.value);
      onChange(isNaN(numValue) ? 0 : numValue);
    } else {
      onChange(e.target.value);
    }
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {type === 'textarea' ? (
        <textarea
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          step={step}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
        />
      )}
      {description && (
        <p className="text-xs text-gray-500 mt-1">{description}</p>
      )}
    </div>
  );
};

// 功能切换标签页组件
const SettingsTab: React.FC<{
  activeTab: string;
  setActiveTab: (tab: string) => void;
}> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'system', label: '系统设置' },
    { id: 'roles', label: '角色权限' },
    { id: 'categories', label: '任务分类' },
    { id: 'notifications', label: '系统通知' }
  ];

  return (
    <div className="mx-4 mt-4 grid grid-cols-4 gap-1">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`py-3 px-2 rounded-lg text-sm font-medium transition-all duration-300 ${
            activeTab === tab.id 
              ? 'bg-purple-500 text-white shadow-md transform scale-[1.02]' 
              : 'bg-white border border-gray-200 text-gray-600 hover:bg-purple-50 hover:border-purple-200'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

// 系统设置部分组件
const SystemSettingsSection: React.FC<{
  systemSettings: SystemSettings;
  setSystemSettings: React.Dispatch<React.SetStateAction<SystemSettings>>;
}> = ({ systemSettings, setSystemSettings }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSettingChange = (key: keyof SystemSettings, value: any) => {
    setSystemSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      // 模拟API请求
      await new Promise(resolve => setTimeout(resolve, 800));
      setSaveSuccess(true);
      // 3秒后隐藏成功提示
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('保存设置失败:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {saveSuccess && (
        <Alert className="mx-4 bg-green-50 border-green-200 text-green-800">
          <span className="font-medium">保存成功！</span> 系统设置已更新。
        </Alert>
      )}

      {/* 基本设置 */}
      <div className="mx-4">
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-r from-purple-500 to-indigo-600 px-6 py-4">
            <h3 className="font-bold text-white text-lg">基本设置</h3>
          </div>
          <div className="p-6">
            <FormInput
              label="网站名称"
              value={systemSettings.siteName}
              onChange={(value) => handleSettingChange('siteName', value)}
              placeholder="输入网站名称"
              required={true}
            />
            <FormInput
              label="网站描述"
              value={systemSettings.siteDescription}
              onChange={(value) => handleSettingChange('siteDescription', value)}
              type="textarea"
              placeholder="输入网站描述"
              required={true}
            />
          </div>
        </Card>
      </div>

      {/* 业务设置 */}
      <div className="mx-4">
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-r from-purple-500 to-indigo-600 px-6 py-4">
            <h3 className="font-bold text-white text-lg">业务设置</h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormInput
                label="任务审核时间"
                value={systemSettings.taskReviewTime}
                onChange={(value) => handleSettingChange('taskReviewTime', value)}
                type="number"
                description="单位：小时"
                required={true}
              />
              <FormInput
                label="最低提现金额"
                value={systemSettings.withdrawMinAmount}
                onChange={(value) => handleSettingChange('withdrawMinAmount', value)}
                type="number"
                description="单位：元"
                required={true}
              />
              <FormInput
                label="提现手续费"
                value={systemSettings.withdrawFee}
                onChange={(value) => handleSettingChange('withdrawFee', value)}
                type="number"
                step="0.1"
                description="单位：元"
              />
              <FormInput
                label="平台佣金"
                value={systemSettings.platformCommission}
                onChange={(value) => handleSettingChange('platformCommission', value)}
                type="number"
                step="0.1"
                description="单位：%"
                required={true}
              />
              <FormInput
                label="邀请佣金"
                value={systemSettings.inviteCommission}
                onChange={(value) => handleSettingChange('inviteCommission', value)}
                type="number"
                step="0.1"
                description="单位：%"
                required={true}
              />
            </div>
          </div>
        </Card>
      </div>

      {/* 开关设置 */}
      <div className="mx-4">
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-r from-purple-500 to-indigo-600 px-6 py-4">
            <h3 className="font-bold text-white text-lg">功能开关</h3>
          </div>
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <div className="font-medium text-gray-800">自动审核</div>
                <div className="text-sm text-gray-500">启用后系统将自动审核符合条件的任务</div>
              </div>
              <ToggleSwitch
                checked={systemSettings.autoReview}
                onChange={(checked) => handleSettingChange('autoReview', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <div className="font-medium text-gray-800">维护模式</div>
                <div className="text-sm text-gray-500">启用后网站将显示维护页面</div>
              </div>
              <ToggleSwitch
                checked={systemSettings.maintenanceMode}
                onChange={(checked) => handleSettingChange('maintenanceMode', checked)}
                activeColor="bg-red-500"
              />
            </div>
          </div>
        </Card>
      </div>

      {/* 保存按钮 */}
      <div className="mx-4">
        <Button
          onClick={handleSaveSettings}
          disabled={isSaving}
          className="w-full py-3 bg-purple-500 hover:bg-purple-600 text-white font-medium rounded-lg transition-all transform hover:scale-[1.01]"
        >
          {isSaving ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              保存中...
            </span>
          ) : (
            '保存设置'
          )}
        </Button>
      </div>
    </div>
  );
};

// 角色权限部分组件
const RolesPermissionsSection: React.FC = () => {
  // 用户角色设置
  const userRoles: UserRole[] = [
    {
      id: 'commenter',
      name: '评论员',
      permissions: ['view_tasks', 'submit_tasks', 'withdraw_money', 'invite_users'],
      maxWithdrawDaily: 5000,
      reviewRequired: true,
      color: 'bg-blue-50 text-blue-600'
    },
    {
      id: 'publisher',
      name: '派单员',
      permissions: ['create_tasks', 'manage_tasks', 'view_stats', 'withdraw_money'],
      maxWithdrawDaily: 50000,
      reviewRequired: false,
      color: 'bg-green-50 text-green-600'
    },
    {
      id: 'admin',
      name: '管理员',
      permissions: ['all_permissions'],
      maxWithdrawDaily: 999999,
      reviewRequired: false,
      color: 'bg-purple-50 text-purple-600'
    }
  ];

  const getPermissionLabel = (permission: string) => {
    const permissionMap: Record<string, string> = {
      'view_tasks': '查看任务',
      'submit_tasks': '提交任务',
      'withdraw_money': '提现',
      'invite_users': '邀请用户',
      'create_tasks': '创建任务',
      'manage_tasks': '管理任务',
      'view_stats': '查看统计',
      'all_permissions': '所有权限'
    };
    return permissionMap[permission] || permission;
  };

  return (
    <div className="mx-4 mt-6">
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-purple-500 to-indigo-600 px-6 py-4">
          <h3 className="font-bold text-white text-lg">用户角色管理</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {userRoles.map((role) => (
              <div key={role.id} className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-3 gap-3">
                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${role.color}`}>
                      {role.name}
                    </span>
                    <Badge
                        variant={role.reviewRequired ? "error" : "secondary"}
                        className="text-xs"
                      >
                        {role.reviewRequired ? '需要审核' : '无需审核'}
                      </Badge>
                  </div>
                  <div className="text-sm font-medium text-gray-700">
                    日提现限额：¥{role.maxWithdrawDaily.toLocaleString()}
                  </div>
                </div>
                
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-2">权限列表：</div>
                  <div className="flex flex-wrap gap-2">
                    {role.permissions.map((permission, index) => (
                      <span key={index} className="text-xs bg-gray-100 text-gray-700 px-2 py-1.5 rounded-full">
                        {getPermissionLabel(permission)}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};

// 任务分类管理组件
const TaskCategoriesSection: React.FC = () => {
  // 任务分类管理
  const [taskCategories, setTaskCategories] = useState<TaskCategory[]>([
    { id: 1, name: '美食', icon: '🍔', enabled: true, minPrice: 2.0, maxPrice: 20.0 },
    { id: 2, name: '数码', icon: '📱', enabled: true, minPrice: 5.0, maxPrice: 50.0 },
    { id: 3, name: '美妆', icon: '💄', enabled: true, minPrice: 3.0, maxPrice: 30.0 },
    { id: 4, name: '旅游', icon: '✈️', enabled: true, minPrice: 8.0, maxPrice: 100.0 },
    { id: 5, name: '影视', icon: '🎬', enabled: true, minPrice: 1.0, maxPrice: 15.0 },
    { id: 6, name: '运动', icon: '⚽', enabled: false, minPrice: 5.0, maxPrice: 40.0 }
  ]);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', icon: '' });
  const [categoryChanges, setCategoryChanges] = useState<Record<number, boolean>>({});

  const handleToggleCategory = (categoryId: number) => {
    setTaskCategories(prev => 
      prev.map(cat => 
        cat.id === categoryId 
          ? { ...cat, enabled: !cat.enabled }
          : cat
      )
    );
    // 标记有变更
    setCategoryChanges(prev => ({ ...prev, [categoryId]: true }));
  };

  const handleCategoryPriceChange = (categoryId: number, field: 'minPrice' | 'maxPrice', value: number) => {
    setTaskCategories(prev => 
      prev.map(cat => 
        cat.id === categoryId 
          ? { ...cat, [field]: value }
          : cat
      )
    );
    // 标记有变更
    setCategoryChanges(prev => ({ ...prev, [categoryId]: true }));
  };

  const handleSaveChanges = async () => {
    // 模拟保存操作
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      // 清除变更标记
      setCategoryChanges({});
      // 这里可以添加保存成功的提示
    } catch (error) {
      console.error('保存分类设置失败:', error);
    }
  };

  const handleAddCategory = () => {
    if (newCategory.name.trim() && newCategory.icon.trim()) {
      const newId = Math.max(...taskCategories.map(c => c.id)) + 1;
      setTaskCategories(prev => [...prev, {
        id: newId,
        name: newCategory.name.trim(),
        icon: newCategory.icon.trim(),
        enabled: true,
        minPrice: 1.0,
        maxPrice: 10.0
      }]);
      // 重置表单
      setNewCategory({ name: '', icon: '' });
      setShowAddModal(false);
    }
  };

  return (
    <div className="mx-4 mt-6 space-y-4">
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-purple-500 to-indigo-600 px-6 py-4 flex items-center justify-between">
          <h3 className="font-bold text-white text-lg">任务分类管理</h3>
          <Button 
            onClick={() => setShowAddModal(true)}
            className="bg-white text-purple-600 hover:bg-gray-100"
          >
            + 添加分类
          </Button>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {taskCategories.map((category) => (
              <div key={category.id} className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-3">
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">{category.icon}</span>
                      <span className="font-medium text-gray-800 text-lg">{category.name}</span>
                      <Badge
                        variant={category.enabled ? "primary" : "secondary"}
                      >
                        {category.enabled ? '已启用' : '已禁用'}
                      </Badge>
                      {categoryChanges[category.id] && (
                        <Badge variant="error" className="ml-2">
                          已修改
                        </Badge>
                      )}
                  </div>
                  <ToggleSwitch
                    checked={category.enabled}
                    onChange={() => handleToggleCategory(category.id)}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">最低价格（元）</label>
                    <Input
                      type="number"
                      step="0.1"
                      value={category.minPrice}
                      onChange={(e) => handleCategoryPriceChange(category.id, 'minPrice', parseFloat(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">最高价格（元）</label>
                    <Input
                      type="number"
                      step="0.1"
                      value={category.maxPrice}
                      onChange={(e) => handleCategoryPriceChange(category.id, 'maxPrice', parseFloat(e.target.value))}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
      
      {/* 保存按钮（只有在有变更时显示） */}
      {Object.keys(categoryChanges).length > 0 && (
        <Button
          onClick={handleSaveChanges}
          className="w-full mt-4 py-3 bg-purple-500 hover:bg-purple-600 text-white font-medium rounded-lg transition-all"
        >
          保存所有变更
        </Button>
      )}
      
      {/* 添加分类模态框 */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">添加新分类</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">分类名称</label>
                <Input
                  type="text"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="请输入分类名称"
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">分类图标（Emoji）</label>
                <Input
                  type="text"
                  value={newCategory.icon}
                  onChange={(e) => setNewCategory(prev => ({ ...prev, icon: e.target.value }))}
                  placeholder="输入一个Emoji图标"
                  className="w-full text-xl"
                />
              </div>
              <div className="flex space-x-3 pt-2">
                <Button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-gray-200 text-gray-800 hover:bg-gray-300"
                >
                  取消
                </Button>
                <Button
                  onClick={handleAddCategory}
                  disabled={!newCategory.name.trim() || !newCategory.icon.trim()}
                  className="flex-1 bg-purple-500 text-white hover:bg-purple-600"
                >
                  添加
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// 系统通知管理组件
const SystemNotificationsSection: React.FC = () => {
  // 系统通知
  const [notifications, setNotifications] = useState<SystemNotification[]>([
    {
      id: 1,
      title: '系统维护通知',
      content: '平台将于今晚22:00-23:00进行系统升级维护，期间暂停服务。',
      type: 'maintenance',
      enabled: true,
      startTime: '2024-01-15 22:00',
      endTime: '2024-01-15 23:00'
    },
    {
      id: 2,
      title: '新功能上线',
      content: '邀请好友功能已上线，邀请好友完成任务可获得5%佣金奖励！',
      type: 'feature',
      enabled: true,
      startTime: '2024-01-15 00:00',
      endTime: '2024-01-20 23:59'
    }
  ]);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [newNotification, setNewNotification] = useState({
    title: '', 
    content: '',
    type: 'info' as 'maintenance' | 'feature' | 'info'
  });

  const handleToggleNotification = (notificationId: number) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, enabled: !notif.enabled }
          : notif
      )
    );
  };

  const handleAddNotification = () => {
    if (newNotification.title.trim() && newNotification.content.trim()) {
      const newId = Math.max(...notifications.map(n => n.id)) + 1;
      setNotifications(prev => [...prev, {
        id: newId,
        title: newNotification.title.trim(),
        content: newNotification.content.trim(),
        type: newNotification.type,
        enabled: true,
        startTime: new Date().toISOString().slice(0, 16).replace('T', ' '),
        endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16).replace('T', ' ')
      }]);
      // 重置表单
      setNewNotification({ title: '', content: '', type: 'info' });
      setShowAddModal(false);
    }
  };

  const getNotificationTypeBadge = (type: string) => {
    const typeMap: Record<string, { variant: 'error' | 'success' | 'primary' | 'secondary' | 'warning', label: string }> = {
      'maintenance': { variant: 'error', label: '系统维护' },
      'feature': { variant: 'primary', label: '新功能' },
      'info': { variant: 'secondary', label: '通知' }
    };
    return typeMap[type] || { variant: 'secondary', label: '通知' };
  };

  return (
    <div className="mx-4 mt-6 space-y-4">
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-purple-500 to-indigo-600 px-6 py-4 flex items-center justify-between">
          <h3 className="font-bold text-white text-lg">系统通知管理</h3>
          <Button 
            onClick={() => setShowAddModal(true)}
            className="bg-white text-purple-600 hover:bg-gray-100"
          >
            + 添加通知
          </Button>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {notifications.map((notification) => {
              const typeInfo = getNotificationTypeBadge(notification.type);
              return (
                <div key={notification.id} className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center flex-wrap gap-2 mb-2">
                        <h4 className="font-medium text-gray-800 text-lg">{notification.title}</h4>
                        <Badge variant={typeInfo.variant}>
                          {typeInfo.label}
                        </Badge>
                        <Badge variant={notification.enabled ? "primary" : "secondary"}>
                          {notification.enabled ? '已启用' : '已禁用'}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600 mb-3 whitespace-pre-line">{notification.content}</div>
                      <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                        <div>开始时间：{notification.startTime}</div>
                        <div>结束时间：{notification.endTime}</div>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <ToggleSwitch
                        checked={notification.enabled}
                        onChange={() => handleToggleNotification(notification.id)}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Card>
      
      {/* 添加通知模态框 */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">添加新通知</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">通知标题</label>
                <Input
                  type="text"
                  value={newNotification.title}
                  onChange={(e) => setNewNotification(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="请输入通知标题"
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">通知内容</label>
                <textarea
                  value={newNotification.content}
                  onChange={(e) => setNewNotification(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="请输入通知内容"
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">通知类型</label>
                <div className="flex space-x-2">
                  {(['maintenance', 'feature', 'info'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setNewNotification(prev => ({ ...prev, type }))}
                      className={`px-3 py-1 rounded-full text-sm transition-all ${newNotification.type === type 
                        ? 'bg-purple-500 text-white' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                    >
                      {type === 'maintenance' ? '系统维护' : 
                       type === 'feature' ? '新功能' : '普通通知'}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex space-x-3 pt-2">
                <Button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-gray-200 text-gray-800 hover:bg-gray-300"
                >
                  取消
                </Button>
                <Button
                  onClick={handleAddNotification}
                  disabled={!newNotification.title.trim() || !newNotification.content.trim()}
                  className="flex-1 bg-purple-500 text-white hover:bg-purple-600"
                >
                  添加
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// 主页面组件
export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState('system');
  
  // 系统设置
  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    siteName: '抖音任务平台',
    siteDescription: '专业的社交媒体营销任务平台',
    taskReviewTime: 24, // 小时
    withdrawMinAmount: 50,
    withdrawFee: 2,
    platformCommission: 5, // 百分比
    inviteCommission: 5, // 百分比
    autoReview: false,
    maintenanceMode: false
  });

  // 渲染对应标签页内容
  const renderTabContent = () => {
    switch (activeTab) {
      case 'system':
        return <SystemSettingsSection 
          systemSettings={systemSettings}
          setSystemSettings={setSystemSettings}
        />;
      case 'roles':
        return <RolesPermissionsSection />;
      case 'categories':
        return <TaskCategoriesSection />;
      case 'notifications':
        return <SystemNotificationsSection />;
      default:
        return <SystemSettingsSection 
          systemSettings={systemSettings}
          setSystemSettings={setSystemSettings}
        />;
    }
  };

  return (
    <div className="pb-20 min-h-screen bg-gray-50">
      {/* 页面标题 */}
      <div className="px-6 py-5 bg-white border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">系统设置</h1>
        <p className="text-sm text-gray-500 mt-1">管理平台各项配置与功能设置</p>
      </div>
      
      {/* 功能切换标签页 */}
      <SettingsTab activeTab={activeTab} setActiveTab={setActiveTab} />
      
      {/* 标签页内容 */}
      <div className="mt-6">
        {renderTabContent()}
      </div>
    </div>
  );
}