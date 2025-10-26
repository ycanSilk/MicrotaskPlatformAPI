'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SearchOutlined, CopyOutlined } from '@ant-design/icons';
import { Button } from '@/components/ui/Button';

// 账号租赁信息接口
type AccountRequirements = {
  modifyNameAvatar: boolean;
  modifyBio: boolean;
  canComment: boolean;
  canPostVideo: boolean;
};

type LoginMethod = {
  scanCode: boolean;
  phoneVerification: boolean;
  noLogin: boolean;
};

type AccountRentalInfo = {
  id: string;
  rentalDescription: string;
  price: number;
  publishTime: string;
  orderNumber: string;
  orderStatus: string;
  rentalDays: number;
  images: string[];
  accountRequirements?: AccountRequirements;
  loginMethod?: LoginMethod;
};

// 格式化发布时间
const formatPublishTime = (timeString: string): string => {
  const date = new Date(timeString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return '今天';
  } else if (diffDays === 1) {
    return '昨天';
  } else if (diffDays < 7) {
    return `${diffDays}天前`;
  } else {
    return date.toLocaleDateString('zh-CN');
  }
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

const RentalRequestsPage = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [rentalRequests, setRentalRequests] = useState<AccountRentalInfo[]>([]);

  const [copySuccess, setCopySuccess] = useState<string | null>(null);

  // 模拟获取求租信息数据
  useEffect(() => {
    const fetchRentalRequests = async () => {
      try {
        setLoading(true);
        // 模拟网络请求延迟
        await new Promise(resolve => setTimeout(resolve, 600));
        
        // 使用模拟数据，添加账号要求和登录方式支持情况
        const mockData: AccountRentalInfo[] = [
          {
            id: 'req001',
            rentalDescription: '求租抖音美食账号，用于餐厅推广活动',
            price: 92.40,
            publishTime: '2023-07-05T10:00:00',
            orderNumber: 'REQ-20230705-001',
            orderStatus: '待确认',
            rentalDays: 2,
            images: [
              'images/0e92a4599d02a7.jpg'      
            ],
            accountRequirements: {
              modifyNameAvatar: true,
              modifyBio: true,
              canComment: true,
              canPostVideo: false
            },
            loginMethod: {
              scanCode: true,
              phoneVerification: false,
              noLogin: false
            }
          },
          {
            id: 'req002',
            rentalDescription: '求租时尚穿搭账号，用于夏季新品推广',
            price: 120.50,
            publishTime: '2023-07-04T15:30:00',
            orderNumber: 'REQ-20230704-002',
            orderStatus: '已确认',
            rentalDays: 3,
            images: [
              'images/0e92a4599d02a7.jpg'      
            ],
            accountRequirements: {
              modifyNameAvatar: false,
              modifyBio: true,
              canComment: true,
              canPostVideo: true
            },
            loginMethod: {
              scanCode: false,
              phoneVerification: true,
              noLogin: false
            }
          },
          {
            id: 'req003',
            rentalDescription: '求租科技类账号，用于数码产品评测',
            price: 85.00,
            publishTime: '2023-07-03T09:00:00',
            orderNumber: 'REQ-20230703-003',
            orderStatus: '进行中',
            rentalDays: 5,
            images: [
              'images/0e92a4599d02a7.jpg'      
            ],
            accountRequirements: {
              modifyNameAvatar: false,
              modifyBio: false,
              canComment: true,
              canPostVideo: true
            },
            loginMethod: {
              scanCode: false,
              phoneVerification: false,
              noLogin: true
            }
          },
          {
            id: 'req004',
            rentalDescription: '求租生活方式账号，用于家居产品推广',
            price: 75.00,
            publishTime: '2023-07-02T14:00:00',
            orderNumber: 'REQ-20230702-004',
            orderStatus: '已完成',
            rentalDays: 1,
            images: [
              'images/0e92a4599d02a7.jpg'      
            ],
            accountRequirements: {
              modifyNameAvatar: true,
              modifyBio: true,
              canComment: false,
              canPostVideo: false
            },
            loginMethod: {
              scanCode: true,
              phoneVerification: true,
              noLogin: false
            }
          }
        ];
        
        setRentalRequests(mockData);
      } catch (error) {
        console.error('获取求租信息失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRentalRequests();
  }, []);

  // 过滤求租信息
  const filteredRequests = rentalRequests.filter(request => 
    request.rentalDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.orderNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 处理查看详情
  const handleViewDetail = (requestId: string) => {
    router.push(`/accountrental/account-rental-requests/requests-detail/${requestId}`);
  };



  // 复制订单号
  const copyOrderNumber = (event: React.MouseEvent, orderNumber: string) => {
    event.stopPropagation();
    navigator.clipboard.writeText(orderNumber)
      .then(() => {
        setCopySuccess(orderNumber);
        setTimeout(() => {
          setCopySuccess(null);
        }, 2000);
      })
      .catch(err => {
        console.error('复制失败:', err);
      });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* 主内容区域 */}
      <div className="max-w-7xl mx-auto px-2 py-6">
        {/* 发布求租信息按钮 */}
        <div className="mb-6">
          <Button 
            onClick={() => router.push('/accountrental/account-rental-publish/publish-requests')}
            className="bg-blue-600 w-full hover:bg-blue-700 text-white py-3 rounded-lg text-lg font-medium shadow-md transition-all min-h-12 active:scale-95"
          >
            发布求租信息
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <SearchOutlined className="h-12 w-12 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500">暂无求租信息</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRequests.map(request => (
              <div 
                key={request.id} 
                className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleViewDetail(request.id)}
              >
                {/* 已移除图片显示区域 */}
                
                {/* 求租要求显示模块 */}
                <div className="mb-3 space-y-3">
                  {/* 账号要求 - 根据支持情况显示 */}
                  {request.accountRequirements && (
                    <div className="mb-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">账号要求</label>
                      <div className="space-y-1">
                        {request.accountRequirements.modifyNameAvatar && (
                          <div className="flex items-center text-sm text-gray-700">
                            ✓ 修改抖音账号名称和头像
                          </div>
                        )}
                        {request.accountRequirements.modifyBio && (
                          <div className="flex items-center text-sm text-gray-700">
                            ✓ 修改账号简介
                          </div>
                        )}
                        {request.accountRequirements.canComment && (
                          <div className="flex items-center text-sm text-gray-700">
                            ✓ 支持发布评论
                          </div>
                        )}
                        {request.accountRequirements.canPostVideo && (
                          <div className="flex items-center text-sm text-gray-700">
                            ✓ 支持发布视频
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* 登录方式 - 根据支持情况显示 */}
                  {request.loginMethod && (
                    <div className="mb-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">登录方式</label>
                      <div className="space-y-1">
                        {request.loginMethod.scanCode && (
                          <div className="flex items-center text-sm text-gray-700">
                            ✓ 扫码登录
                          </div>
                        )}
                        {request.loginMethod.phoneVerification && (
                          <div className="flex items-center text-sm text-gray-700">
                            ✓ 手机号+短信验证登录
                          </div>
                        )}
                        {request.loginMethod.noLogin && (
                          <div className="flex items-center text-sm text-gray-700">
                            ✓ 不登录账号，按照承租方要求完成租赁
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <h3 className="font-medium text-gray-800 mb-2 line-clamp-2">{request.rentalDescription}</h3>
                <div className="flex justify-between items-center text-sm text-gray-600 mb-2">
                  <div>发布时间: {formatPublishTime(request.publishTime)}</div>
                  <div>出租天数: {request.rentalDays}天</div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-xl font-bold text-red-600">¥{request.price}</div>
                  <Button className="bg-blue-500 hover:bg-blue-600 text-white">查看详情</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

// 移除了不再需要的Toast组件和相关接口定义

export default RentalRequestsPage;