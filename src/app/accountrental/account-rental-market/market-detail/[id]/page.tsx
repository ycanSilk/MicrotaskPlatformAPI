'use client';

import { useState, useEffect } from 'react';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { AccountRentalInfo } from '../../../types';





// 模拟获取账号详情数据
const fetchAccountDetail = async (accountId: string): Promise<AccountRentalInfo> => {
  // 模拟API请求延迟
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // 返回完整的模拟数据，包含所有必需字段
  return {
    id: accountId,
    platform: '抖音',
    accountTitle: '美食探店达人',
    followersRange: '50-100万',
    engagementRate: '3.5%',
    contentCategory: '美食',
    region: '全国',
    accountAge: '1年半',
    accountScore: 4.8,
    orderPrice: 800,
    price: 800,
    rentalDuration: 30,
    minimumRentalHours: 4,
    deliveryTime: 24,
    maxConcurrentUsers: 1,
    responseTime: 12,
    includedFeatures: ['评论', '私信', '数据分析'],
    description: '专业美食账号，主要发布餐厅探店和美食测评内容，互动率高',
    rentalDescription: '抖音美食账号出租，专注餐厅探店和美食测评，互动率高',
    advantages: ['粉丝粘性高', '互动率好', '内容质量稳定'],
    restrictions: ['禁止发布违规内容', '禁止修改账号信息'],
    isVerified: true,
    rating: 4.8,
    rentalCount: 12,
    availableCount: 1,
    publishTime: '2024-06-20T10:30:00Z',
    status: '可用',
    images: [
              'images/0e92a4599d02a7.jpg'      
            ],
    publisherName: '美食工作室',
    orderNumber: 'ORD202406201030001',
    orderStatus: '待确认',
    rentalDays: 30
  };
};

// 客户端组件
const AccountDetailPage = ({
  params
}: {
  params: {
    id: string;
  };
}) => {
  const accountId = params?.id || '';
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [account, setAccount] = useState<AccountRentalInfo | null>(null);
  const [loading, setLoading] = useState(true);
  
  // 组件挂载时获取数据
  useEffect(() => {
    const loadAccountData = async () => {
      try {
        const data = await fetchAccountDetail(accountId);
        setAccount(data);
      } catch (error) {
        console.error('获取账号详情失败:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (accountId) {
      loadAccountData();
    }
  }, [accountId]);
  
  if (!accountId) {
    return notFound();
  }
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl mb-2">🔄</div>
          <div>加载中...</div>
        </div>
      </div>
    );
  }
  
  if (!account) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-lg font-medium text-gray-900 mb-2">获取账号详情失败</h2>
          <p className="text-gray-500 mb-4">请稍后再试或返回首页</p>
          <Button onClick={() => window.history.back()}>
            返回
          </Button>
        </div>
      </div>
    );
  }

    // 格式化发布时间
    const formatPublishTime = (timeString: string): string => {
      const date = new Date(timeString);
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    // 根据订单状态返回对应的样式类名
    const getOrderStatusClass = (status: string): string => {
      switch (status) {
        case '待确认':
          return 'bg-yellow-100 text-yellow-800';
        case '已确认':
          return 'bg-green-100 text-green-800';
        case '进行中':
          return 'bg-blue-100 text-blue-800';
        case '已完成':
          return 'bg-purple-100 text-purple-800';
        case '已取消':
          return 'bg-gray-100 text-gray-800';
        default:
          return 'bg-gray-100 text-gray-800';
      }
    };

    return (
      <div className="min-h-screen bg-gray-50">
        {/* 主内容区域 */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 左侧主要信息 */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="p-6">
                  {/* 订单基本信息 */}
                  <div className="mb-6">
                    <div>
                      <h1 className="text-xl font-bold text-gray-800">出租账号详情</h1>
                    </div>
                  </div>
                  
                  {/* 图片预览区域 */}
                  {account.images && account.images.length > 0 && (
                    <div className="mb-6">
                      <h2 className="text-lg font-medium text-gray-800 mb-2">账号图片</h2>
                      <div className="flex flex-wrap gap-2">
                        {account.images.slice(0, 6).map((image, index) => (
                          <div key={index} className="w-[85px] h-[85px] bg-gray-100 rounded-lg overflow-hidden">
                            <img 
                              src={`/${image}`} 
                              alt={`账号图片${index + 1}`} 
                              className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                              onClick={() => setSelectedImage(image)}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* 租赁描述 */}
                  <div className="mb-6">
                    <h2 className="text-lg font-medium text-gray-800 mb-2">账号描述</h2>
                    <p className="text-gray-600 leading-relaxed">{account.rentalDescription}</p>
                  </div>
                  
                  {/* 订单详情 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 border-t border-gray-100 pt-4">
                    <div>
                      <div className="text-sm text-gray-500">订单号</div>
                      <div className="text-gray-800 font-medium">{account.orderNumber}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">发布时间</div>
                      <div className="text-gray-800">{formatPublishTime(account.publishTime)}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* 右侧价格和操作信息 */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
                {/* 价格信息 */}
                <div className="mb-6">
                  <div className="flex items-end">
                    <span className="text-3xl font-bold text-red-600">¥{account.price}</span>
                    <span className="text-sm text-gray-500 ml-2 mb-1">（单价：¥{(account.rentalDays ? (account.price / account.rentalDays) : 0).toFixed(2)}/天）</span>
                  </div>
                </div>
                
                {/* 租赁信息 */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">出租天数</span>
                    <span className="text-gray-800 font-medium">{account.rentalDays}天</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">总价</span>
                    <span className="text-gray-800 font-medium">¥{account.price}</span>
                  </div>
                </div>
                
                {/* 操作按钮 */}
                <div className="space-y-3">
                  <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white">
                    立即租赁
                  </Button>
                  
                  <Button variant="ghost" className="w-full">
                    联系发布者
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* 图片预览模态框 */}
        {selectedImage && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80" 
            onClick={() => setSelectedImage(null)}
          >
            <div className="relative max-w-4xl max-h-[90vh] p-4" onClick={(e) => e.stopPropagation()}>
              <button 
                className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2 z-10 hover:bg-opacity-70 transition-colors"
                onClick={() => setSelectedImage(null)}
              >
                ✕
              </button>
              <img 
                src={`/${selectedImage}`} 
                alt="预览图片" 
                className="max-w-full max-h-[85vh] object-contain" 
              />
            </div>
          </div>
        )}
      </div>
    );
};

export default AccountDetailPage;