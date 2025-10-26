'use client';

import { useState } from 'react';
import { Card, Button } from '@/components/ui';
import { useRouter } from 'next/navigation';
// 直接从localStorage获取用户信息的辅助函数
const getCurrentUser = () => {
  if (typeof localStorage === 'undefined') return null;
  try {
    const authDataStr = localStorage.getItem('commenter_auth_data');
    if (authDataStr) {
      const authData = JSON.parse(authDataStr);
      return {
        id: authData.userId || '',
        username: authData.username || '',
        ...(authData.userInfo || {})
      };
    }
  } catch (error) {
    console.error('获取用户信息失败:', error);
  }
  return null;
};
import { VideoCameraOutlined, CoffeeOutlined, BarChartOutlined } from '@ant-design/icons';

export default function AccountRentalPage() {
  const router = useRouter();
  const [accountTasks, setAccountTasks] = useState([
    {
      id: 'task001',
      title: '抖音账号',
      icon: <VideoCameraOutlined className="text-purple-500" />,
      platform: '抖音',
      followers: '10k+',
      price: 50,
      status: 'available',
      expiryDate: '2024-12-31',
      description: '高质量游戏领域抖音账号，活跃粉丝多'
    },
    {
      id: 'task002',
      title: '抖音账号',
      icon: <CoffeeOutlined className="text-amber-500" />,
      platform: '抖音',
      followers: '500+',
      price: 40,
      status: 'rented',
      expiryDate: '2024-11-20',
      description: '美食与生活分享微信账号，真实用户'
    },
    {
      id: 'task003',
      title: '抖音账号',
      icon: <BarChartOutlined className="text-green-500" />,
      platform: '抖音',
      followers: '8k+',
      price: 60,
      status: 'available',
      expiryDate: '2024-12-15',
      description: '专业财经领域微博账号，高互动率'
    }
  ]);

  const handlePublishNewTask = () => {
    router.push('/commenter/lease/create');
  };

  const handleViewTaskDetail = (taskId: string) => {
    router.push(`/commenter/lease/${taskId}`);
  };

  const getStatusBadge = (status: string) => {
    if (status === 'available') {
      return <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">可出租</span>;
    } else if (status === 'rented') {
      return <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-full">已出租</span>;
    } else {
      return <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">未知状态</span>;
    }
  };

  return (
    <div className="p-4 pb-20">
      {/* 返回按钮 */}
      <button
        onClick={() => {
          if (window.history.length > 1) {
            router.back();
          } else {
            router.push('/commenter' as any);
          }
        }}
        className="mb-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
      >
        ← 返回
      </button>
      
      {/* 页面标题 */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">账号出租管理</h1>
          <p className="text-gray-500 mt-1">管理您发布的账号出租任务</p>
        </div>
        <Button 
          variant="primary" 
          onClick={handlePublishNewTask}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
        >
          + 发布新任务
        </Button>
      </div>

      {/* 账号出租任务列表 */}
      <div className="mb-6">
        <h2 className="text-lg font-bold text-gray-800 mb-3">我的账号出租任务</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {accountTasks.map((task) => (
            <Card 
              key={task.id} 
              className="h-full cursor-pointer hover:border-blue-300 transition-all"
              onClick={() => handleViewTaskDetail(task.id)}
            >
              <div className="p-4">
                {/* 任务头部 */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-base font-medium text-gray-900 mb-1">{task.title}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span className="text-primary font-bold text-lg">￥{task.price}</span>
                      <span>{task.platform}</span>
                      <span>{task.followers}</span>
                    </div>
                  </div>
                  {getStatusBadge(task.status)}
                </div>
                
                {/* 任务描述 */}
                <div className="text-sm text-gray-600 mb-3">
                  {task.description}
                </div>
                
                {/* 有效期 */}
                <div className="text-xs text-gray-500 mb-4">
                  有效期至: {task.expiryDate}
                </div>
                
                {/* 操作按钮 */}
                <div className="flex space-x-3">
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => {
                      handleViewTaskDetail(task.id);
                    }}
                  >
                    查看详情
                  </Button>
                  {task.status === 'available' && (
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      className="flex-1 bg-green-500 hover:bg-green-600"
                      onClick={() => {}}
                    >
                      编辑任务
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* 账号出租指南 */}
      <Card>
        <div className="p-4">
          <h2 className="text-lg font-bold text-gray-800 mb-3">账号出租指南</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>1. 点击"发布新任务"按钮，添加您的账号信息</li>
            <li>2. 设置合理的租金和租期，提高账号出租率</li>
            <li>3. 定期检查任务状态，及时处理租约请求</li>
            <li>4. 账号租出后，请保持账号安全，避免账号异常</li>
          </ul>
        </div>
      </Card>
    </div>
  );
}