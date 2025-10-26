'use client';

import { useState, useEffect } from 'react';
import { Card, Button } from '@/components/ui';
import { useRouter, useParams } from 'next/navigation';

export default function AccountRentalDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params || {};
  const [taskDetails, setTaskDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 模拟账号出租任务数据
  const mockTaskData = {
    id: id,
    accountName: '科技评测达人',
    platform: 'douyin',
    platformLabel: '抖音',
    followers: '25.5k+',
    price: '50',
    rentalDuration: 'day',
    rentalDurationLabel: '按天',
    expiryDate: '2023-12-31',
    description: '这是一个科技类评测账号，主要分享各类数码产品评测、使用技巧和购买建议。账号已有2年运营历史，粉丝活跃度高，互动率良好。适合进行科技产品推广、品牌合作等。注意事项：请保持账号内容质量，不要发布违规信息；请勿修改账号密码；使用期间如遇问题请及时联系我。',
    accountType: '科技数码',
    verificationRequired: true,
    contactInfo: '微信：techreviewer2023',
    status: 'active',
    createdAt: '2023-11-15T10:30:00Z',
    updatedAt: '2023-11-16T14:45:00Z',
    rentalCount: 5,
    rating: 4.8
  };

  // 平台图标映射
  const platformIcons = {
    douyin: '🎵',
    wechat: '💬',
    weibo: '🔍',
    qq: '💻',
    zhihu: '📚',
    other: '📱'
  };

  // 状态标签映射
  const statusLabels = {
    active: { label: '出租中', className: 'bg-green-100 text-green-800' },
    pending: { label: '审核中', className: 'bg-yellow-100 text-yellow-800' },
    expired: { label: '已过期', className: 'bg-gray-100 text-gray-800' },
    rented: { label: '已租出', className: 'bg-blue-100 text-blue-800' },
    closed: { label: '已关闭', className: 'bg-red-100 text-red-800' }
  };

  // 加载任务详情
  useEffect(() => {
    const fetchTaskDetails = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // 在实际应用中，这里会调用API获取任务详情
        // 模拟API请求延迟
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // 使用模拟数据
        setTaskDetails(mockTaskData);
      } catch (err) {
        console.error('获取账号出租任务详情时出错:', err);
        setError('获取任务详情失败，请稍后重试');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTaskDetails();
  }, [id]);

  // 处理返回
  const handleBack = () => {
    router.push('/commenter/lease');
  };

  // 处理编辑
  const handleEdit = () => {
    router.push(`/commenter/lease/edit/${id}`);
  };

  // 处理下架
  const handleCloseTask = () => {
    if (confirm('确定要下架此账号出租任务吗？')) {
      // 在实际应用中，这里会调用API下架任务
      console.log(`下架账号出租任务 ${id}`);
      // 模拟API请求延迟
      setTimeout(() => {
        router.push('/commenter/lease');
      }, 500);
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 flex items-center justify-center h-screen">
        <div className="text-lg text-gray-500">加载中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4">
          {error}
        </div>
        <Button onClick={handleBack} variant="secondary">
          返回
        </Button>
      </div>
    );
  }

  if (!taskDetails) {
    return (
      <div className="p-4">
        <div className="bg-yellow-50 text-yellow-600 p-3 rounded-lg mb-4">
          未找到该账号出租任务
        </div>
        <Button onClick={handleBack} variant="secondary">
            返回
          </Button>
      </div>
    );
  }

  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="p-4">
      {/* 页面标题和返回按钮 */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <button 
              onClick={handleBack}
              className="mr-3 text-gray-600 hover:text-gray-900"
            >
              ←
            </button>
            <h1 className="text-2xl font-bold text-gray-800">账号出租详情</h1>
          </div>
          <div className="flex space-x-2">
            <Button variant="secondary" onClick={handleEdit}>
              编辑
            </Button>
            <Button 
              variant="danger" 
              className="bg-red-500 hover:bg-red-600 text-white"
              onClick={handleCloseTask}
            >
              下架
            </Button>
          </div>
        </div>
        <p className="text-gray-500">任务ID: {taskDetails.id}</p>
      </div>

      {/* 任务状态标签 */}
      {taskDetails.status && statusLabels[taskDetails.status as keyof typeof statusLabels] && (
        <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium mb-4 ${statusLabels[taskDetails.status as keyof typeof statusLabels].className}`}>
          {statusLabels[taskDetails.status as keyof typeof statusLabels].label}
        </div>
      )}

      {/* 账号基本信息卡片 */}
      <Card className="mb-6">
        <div className="p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <span className="text-2xl mr-2">
              {platformIcons[taskDetails.platform as keyof typeof platformIcons] || platformIcons.other}
            </span>
            账号基本信息
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            <div className="flex flex-col">
              <div className="block text-sm font-medium text-gray-500 mb-1">账号名称</div>
              <span className="font-medium text-gray-800">{taskDetails.accountName}</span>
            </div>
            
            <div className="flex flex-col">
              <div className="block text-sm font-medium text-gray-500 mb-1">所属平台</div>
              <span className="font-medium text-gray-800">{taskDetails.platformLabel || taskDetails.platform}</span>
            </div>
            
            <div className="flex flex-col">
              <div className="block text-sm font-medium text-gray-500 mb-1">粉丝/好友数量</div>
              <span className="font-medium text-gray-800">{taskDetails.followers}</span>
            </div>
            
            <div className="flex flex-col">
              <div className="block text-sm font-medium text-gray-500 mb-1">账号类型</div>
              <span className="font-medium text-gray-800">{taskDetails.accountType || '未设置'}</span>
            </div>
            
            <div className="flex flex-col">
              <div className="block text-sm font-medium text-gray-500 mb-1">创建时间</div>
              <span className="font-medium text-gray-800">{formatDate(taskDetails.createdAt)}</span>
            </div>
            
            <div className="flex flex-col">
              <div className="block text-sm font-medium text-gray-500 mb-1">更新时间</div>
              <span className="font-medium text-gray-800">{formatDate(taskDetails.updatedAt)}</span>
            </div>
            
            <div className="flex flex-col">
              <div className="block text-sm font-medium text-gray-500 mb-1">出租次数</div>
              <span className="font-medium text-gray-800">{taskDetails.rentalCount || 0}次</span>
            </div>
            
            <div className="flex flex-col">
              <div className="block text-sm font-medium text-gray-500 mb-1">账号评分</div>
              <span className="font-medium text-gray-800">★★★★★ {taskDetails.rating || 5.0}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* 租金和租期设置卡片 */}
      <Card className="mb-6">
        <div className="p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">租金和租期设置</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            <div className="flex flex-col">
              <div className="block text-sm font-medium text-gray-500 mb-1">租金</div>
              <span className="font-medium text-gray-800 text-xl">¥{taskDetails.price}</span>
            </div>
            
            <div className="flex flex-col">
              <div className="block text-sm font-medium text-gray-500 mb-1">租期计算方式</div>
              <span className="font-medium text-gray-800">{taskDetails.rentalDurationLabel || taskDetails.rentalDuration}</span>
            </div>
            
            <div className="flex flex-col">
              <div className="block text-sm font-medium text-gray-500 mb-1">有效期至</div>
              <span className="font-medium text-gray-800">{taskDetails.expiryDate}</span>
            </div>
            
            <div className="flex flex-col">
              <div className="block text-sm font-medium text-gray-500 mb-1">需要身份验证</div>
              <span className="font-medium text-gray-800">
                {taskDetails.verificationRequired ? '是' : '否'}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* 账号详细描述卡片 */}
      <Card className="mb-6">
        <div className="p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">账号详细描述</h2>
          <div className="bg-gray-50 p-4 rounded-lg text-gray-700 whitespace-pre-line">
            {taskDetails.description || '暂无描述'}
          </div>
        </div>
      </Card>

      {/* 联系方式卡片 */}
      {taskDetails.contactInfo && (
        <Card className="mb-6">
          <div className="p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">联系方式</h2>
            <div className="text-gray-700">
              {taskDetails.contactInfo}
            </div>
          </div>
        </Card>
      )}

      {/* 操作提示卡片 */}
      <Card>
        <div className="p-6 bg-blue-50">
          <h2 className="text-lg font-bold text-gray-800 mb-4">操作提示</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>如遇租方违规使用账号，请及时联系平台客服</li>
            <li>租方确认租用后，请及时提供账号信息</li>
            <li>任务到期前可手动下架或修改任务信息</li>
            <li>如有其他问题，请联系平台客服：support@example.com</li>
          </ul>
        </div>
      </Card>
    </div>
  );
}