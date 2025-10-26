'use client';

import { useState } from 'react';
import { Card, Button, Input } from '@/components/ui';
import { useRouter } from 'next/navigation';

export default function CreateAccountRentalPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    accountName: '',
    platform: 'douyin',
    followers: '',
    price: '',
    rentalDuration: 'day',
    expiryDate: '',
    description: '',
    accountType: '',
    verificationRequired: false,
    contactInfo: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 平台选项
  const platforms = [
    { value: 'douyin', label: '抖音' },
    { value: 'wechat', label: '微信' },
    { value: 'weibo', label: '微博' },
    { value: 'qq', label: 'QQ' },
    { value: 'zhihu', label: '知乎' },
    { value: 'other', label: '其他' }
  ];

  // 租期选项
  const rentalDurations = [
    { value: 'hour', label: '按小时' },
    { value: 'day', label: '按天' },
    { value: 'week', label: '按周' },
    { value: 'month', label: '按月' }
  ];

  // 处理表单输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 处理下拉选择变化
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 表单验证
  const validateForm = (): boolean => {
    if (!formData.accountName.trim()) {
      setError('请输入账号名称');
      return false;
    }
    if (!formData.followers.trim()) {
      setError('请输入粉丝数量');
      return false;
    }
    if (!formData.price || isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
      setError('请输入有效的租金');
      return false;
    }
    if (!formData.expiryDate) {
      setError('请选择有效期');
      return false;
    }
    if (!formData.description.trim() || formData.description.length < 20) {
      setError('账号描述至少需要20个字符');
      return false;
    }
    return true;
  };

  // 处理表单提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // 保留空的async函数实现
  };

  // 处理取消
  const handleCancel = () => {
    router.push('/commenter/lease');
  };

  return (
    <div className="p-4">
      {/* 页面标题和返回按钮 */}
      <div className="mb-6">
        <div className="flex items-center mb-2">
          <button 
            onClick={handleCancel}
            className="mr-3 text-gray-600 hover:text-gray-900"
          >
            ←
          </button>
          <h1 className="text-2xl font-bold text-gray-800">发布账号出租任务</h1>
        </div>
        <p className="text-gray-500">填写账号信息，发布您的账号出租任务</p>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {/* 表单卡片 */}
      <Card className="mb-6">
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* 账号基本信息 */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h2 className="text-lg font-bold text-gray-800 mb-3">账号基本信息</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* 账号名称 */}
              <div>
                <div className="block text-sm font-medium text-gray-700 mb-1">
                  账号名称 <span className="text-red-500">*</span>
                </div>
                <Input
                  type="text"
                  name="accountName"
                  value={formData.accountName}
                  onChange={handleInputChange}
                  className="w-full"
                />
              </div>
              
              {/* 所属平台 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  所属平台 <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    name="platform"
                    value={formData.platform}
                    onChange={(e) => handleSelectChange('platform', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {platforms.map(platform => (
                      <option key={platform.value} value={platform.value}>
                        {platform.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* 粉丝数量 */}
              <div>
                <div className="block text-sm font-medium text-gray-700 mb-1">
                  粉丝/好友数量 <span className="text-red-500">*</span>
                </div>
                <Input
                  type="text"
                  name="followers"
                  value={formData.followers}
                  onChange={handleInputChange}
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-1">例如：10000 或 10k+</p>
              </div>
              
              {/* 账号类型 */}
              <div>
                <div className="block text-sm font-medium text-gray-700 mb-1">
                  账号类型
                </div>
                <Input
                  type="text"
                  name="accountType"
                  value={formData.accountType}
                  onChange={handleInputChange}
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-1">例如：游戏、生活、财经等</p>
              </div>
            </div>
          </div>

          {/* 租金和租期设置 */}
          <div className="bg-green-50 p-4 rounded-lg">
            <h2 className="text-lg font-bold text-gray-800 mb-3">租金和租期设置</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* 租金 */}
              <div>
                <div className="block text-sm font-medium text-gray-700 mb-1">
                  租金 (元) <span className="text-red-500">*</span>
                </div>
                <Input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className="w-full"
                />
              </div>
              
              {/* 租期计算方式 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  租期计算方式
                </label>
                <div className="relative">
                  <select
                    name="rentalDuration"
                    value={formData.rentalDuration}
                    onChange={(e) => handleSelectChange('rentalDuration', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {rentalDurations.map(duration => (
                      <option key={duration.value} value={duration.value}>
                        {duration.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            
            {/* 有效期 */}
            <div>
              <div className="block text-sm font-medium text-gray-700 mb-1">
                有效期至 <span className="text-red-500">*</span>
              </div>
              <Input
                type="date"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleInputChange}
                className="w-full"
              />
            </div>
          </div>

          {/* 账号详细描述 */}
            <div>
              <div className="block text-sm font-medium text-gray-700 mb-1">
                账号详细描述 <span className="text-red-500">*</span>
              </div>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={5}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                请详细描述您的账号特点、使用范围、注意事项等信息（至少20个字符）
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {formData.description.length}/20 个字符
              </p>
            </div>

          {/* 其他信息 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 需要验证 */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="verificationRequired"
                name="verificationRequired"
                checked={formData.verificationRequired}
                onChange={handleInputChange}
                className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="verificationRequired" className="ml-2 block text-sm text-gray-700">
                需要身份验证
              </label>
            </div>
            
            {/* 联系方式 */}
            <div>
              <div className="block text-sm font-medium text-gray-700 mb-1">
                联系方式
              </div>
              <Input
                type="text"
                name="contactInfo"
                value={formData.contactInfo}
                onChange={handleInputChange}
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">选填：微信、QQ等联系方式</p>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex space-x-4 pt-4 border-t border-gray-200">
            <Button 
              type="button" 
              variant="secondary" 
              onClick={handleCancel}
              className="flex-1"
            >
              取消
            </Button>
            <Button 
              type="submit" 
              variant="primary" 
              disabled={isSubmitting}
              className="flex-1 bg-blue-500 hover:bg-blue-600"
            >
              {isSubmitting ? '发布中...' : '确认发布'}
            </Button>
          </div>
        </form>
      </Card>

      {/* 发布提示 */}
        <Card>
          <div className="p-4">
            <h2 className="text-lg font-bold text-gray-800 mb-3">发布须知</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700 text-sm">
              <li>请确保提供的账号信息真实有效，平台会对账号进行审核</li>
              <li>合理设置租金，过高或过低的租金可能影响账号出租率</li>
              <li>账号租出期间，请保持账号安全，避免修改密码等操作</li>
              <li>如遇到租方违规使用账号的情况，请及时联系平台客服</li>
              <li>平台会收取一定比例的服务费，具体以实际结算为准</li>
            </ul>
          </div>
        </Card>
    </div>
  );
}