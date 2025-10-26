'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeftOutlined, MessageOutlined, CopyOutlined, CheckOutlined } from '@ant-design/icons';

// 求租信息接口定义
interface RentalRequest {
  id: string;
  orderNumber: string;
  publishTime: string;
  deadline: string;
  price: number;
  description: string;
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
  platform: string;
  platformName: string;
  publisherName: string;
  publisherRating: number;
  publisherInfo?: {
    joinedDate: string;
    completedOrders: number;
    responseRate: number;
  };
  orderDetails?: {
    rentalDuration: number;
    maxConcurrentUsers: number;
    allowedRegions: string[];
  };
  
}

// 复制状态接口
interface CopyStatus {
  [key: string]: boolean;
}

// 提示信息接口
interface ToastMessage {
  show: boolean;
  message: string;
}



// 格式化日期时间
const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// 格式化日期
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

const RentalRequestDetailPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [request, setRequest] = useState<RentalRequest | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copyStatus, setCopyStatus] = useState<CopyStatus>({});
  const [toast, setToast] = useState<ToastMessage>({
    show: false,
    message: ''
  });
  
  // 显示提示消息
  const showToast = (message: string) => {
    setToast({ show: true, message });
    // 2秒后自动隐藏
    setTimeout(() => {
      setToast({ show: false, message: '' });
    }, 2000);
  };

  // 获取求租信息详情
  useEffect(() => {
    const fetchRentalRequestDetail = async () => {
      try {
        setLoading(true);
        // 模拟网络请求延迟
        await new Promise(resolve => setTimeout(resolve, 600));
        
        // 模拟数据 - 直接使用第一条数据
        const mockData: RentalRequest[] = [
          {
            id: 'req001',
            orderNumber: 'REQ-20230705-001',
            publishTime: '2023-07-05T10:00:00',
            deadline: '2023-07-07T10:00:00',
            price: 92.40,
            description: '专注于美食探店内容，有稳定的粉丝群体和良好的互动率。我们团队正在为一家新开业的高端餐厅进行推广活动，需要优质的美食账号来展示餐厅特色菜品和用餐环境。希望账号有一定的美食内容基础，能够制作精美的食物展示视频。',
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
            },
            platform: 'douyin',
            platformName: '抖音',
            publisherName: '美食达人',
            publisherRating: 4.8,
            publisherInfo: {
              joinedDate: '2022-03-15',
              completedOrders: 128,
              responseRate: 95
            },
            orderDetails: {
              rentalDuration: 3,
              maxConcurrentUsers: 1,
              allowedRegions: ['中国大陆']
            }
          }
        ];
        
        // 直接使用第一条数据
        setRequest(mockData[0]);
      } catch (error) {
        console.error('获取求租信息详情失败:', error);
        setError('获取求租信息详情失败');
      } finally {
        setLoading(false);
      }
    };

    fetchRentalRequestDetail();
  }, []);

  // 处理复制订单号
  const handleCopyOrderNumber = () => {
    if (!request) return;
    
    navigator.clipboard.writeText(request.orderNumber);
    // 设置复制成功状态
    setCopyStatus({ ...copyStatus, orderNumber: true });
    // 显示成功提示
    showToast('复制单号成功');
    // 2秒后恢复原状态
    setTimeout(() => {
      setCopyStatus({ ...copyStatus, orderNumber: false });
    }, 2000);
  };

  // 处理立即租赁
  const handleRentNow = () => {
    if (!request) return;
    // 在实际项目中，应该跳转到租赁确认页
    console.log('立即租赁请求:', request.id);
    // router.push(`/accountrental/account-rental-requests/rent/${request.id}`);
  };

  // 处理联系对方
  const handleContact = () => {
    if (!request) return;
    console.log('联系对方请求:', request.id);
    // 在实际项目中，应该打开聊天窗口或显示联系方式
  };

  // 返回上一页
  const handleBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
        <div className="bg-white rounded-lg shadow-sm p-8 max-w-md w-full text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">{error || '求租信息不存在'}</h3>
          <button
            onClick={handleBack}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-medium shadow-sm active:scale-95 transition-all"
          >
            返回列表
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 主内容区域 */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-blue-100">
          {/* 卡片头部 - 平台和价格信息 */}
          <div className="bg-blue-50 p-4 border-b border-blue-200">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <h2 className="text-xl font-medium">{request.platformName}</h2>
              </div>
              <div className="text-red-600 font-bold text-xl">
                ¥{request.price.toFixed(2)}/天
              </div>
            </div>
          </div>

          {/* 订单基本信息 */}
          <div className="p-4 border-b border-gray-100">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div className="flex items-center space-x-2">
                <span className="text-gray-700">订单号：</span>
                <span className="font-medium overflow-hidden text-ellipsis whitespace-nowrap max-w-xs">{request.orderNumber}</span>
                <button 
                  onClick={handleCopyOrderNumber}
                  className="flex items-center space-x-1 p-1 rounded hover:bg-blue-50 text-blue-600"
                  title="复制订单号"
                >
                  {copyStatus.orderNumber ? (
                    <CheckOutlined />
                  ) : (
                    <CopyOutlined />
                  )}
                  <span className="text-sm">复制</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">发布用户：</span>
                <span className="font-medium">{request.publisherName}</span>
              </div>
              <div>
                <span className="text-gray-600">发布时间：</span>
                <span>{formatDateTime(request.publishTime)}</span>
              </div>
              <div>
                <span className="text-gray-600">截止时间：</span>
                <span>{formatDateTime(request.deadline)}</span>
              </div>
              <div>
                <span className="text-gray-600">租赁时长：</span>
                <span>{request.orderDetails?.rentalDuration || 'N/A'}天</span>
              </div>
            </div>
          </div>

          {/* 求租详情 */}
          <div className="p-4 border-b border-gray-100">
            <h3 className="text-lg font-medium mb-3">求租信息描述</h3>
            <div className="bg-blue-50 p-4 rounded-md">
              <p className="text-gray-700 leading-relaxed">{request.description}</p>
            </div>
          </div>

          {/* 求租要求显示模块 */}
          <div className="p-4 border-b border-gray-100">
            <h3 className="text-lg font-medium mb-3">账号要求</h3>
            <div className="space-y-2">
              <div className="flex items-center text-sm">
                <span className={`mr-2 ${request.accountRequirements.modifyNameAvatar ? 'text-green-500 font-medium' : 'text-red-500'}`}>
                  {request.accountRequirements.modifyNameAvatar ? '√' : 'X'}
                </span>
                <span className={request.accountRequirements.modifyNameAvatar ? 'text-gray-700' : 'text-gray-500'}>
                  修改抖音账号名称和头像
                </span>
              </div>
              <div className="flex items-center text-sm">
                <span className={`mr-2 ${request.accountRequirements.modifyBio ? 'text-green-500 font-medium' : 'text-red-500'}`}>
                  {request.accountRequirements.modifyBio ? '√' : 'X'}
                </span>
                <span className={request.accountRequirements.modifyBio ? 'text-gray-700' : 'text-gray-500'}>
                  修改账号简介
                </span>
              </div>
              <div className="flex items-center text-sm">
                <span className={`mr-2 ${request.accountRequirements.canComment ? 'text-green-500 font-medium' : 'text-red-500'}`}>
                  {request.accountRequirements.canComment ? '√' : 'X'}
                </span>
                <span className={request.accountRequirements.canComment ? 'text-gray-700' : 'text-gray-500'}>
                  支持发布评论
                </span>
              </div>
              <div className="flex items-center text-sm">
                <span className={`mr-2 ${request.accountRequirements.canPostVideo ? 'text-green-500 font-medium' : 'text-red-500'}`}>
                  {request.accountRequirements.canPostVideo ? '√' : 'X'}
                </span>
                <span className={request.accountRequirements.canPostVideo ? 'text-gray-700' : 'text-gray-500'}>
                  支持发布视频
                </span>
              </div>
            </div>
          </div>
          
          {/* 登录方式 */}
          <div className="p-4 border-b border-gray-100">
            <h3 className="text-lg font-medium mb-3">登录方式</h3>
            <div className="space-y-2">
              <div className="flex items-center text-sm">
                <span className={`mr-2 ${request.loginMethod.scanCode ? 'text-green-500 font-medium' : 'text-red-500'}`}>
                  {request.loginMethod.scanCode ? '√' : 'X'}
                </span>
                <span className={request.loginMethod.scanCode ? 'text-gray-700' : 'text-gray-500'}>
                  扫码登录
                </span>
              </div>
              <div className="flex items-center text-sm">
                <span className={`mr-2 ${request.loginMethod.phoneVerification ? 'text-green-500 font-medium' : 'text-red-500'}`}>
                  {request.loginMethod.phoneVerification ? '√' : 'X'}
                </span>
                <span className={request.loginMethod.phoneVerification ? 'text-gray-700' : 'text-gray-500'}>
                  手机号+短信验证登录
                </span>
              </div>
              <div className="flex items-center text-sm">
                <span className={`mr-2 ${request.loginMethod.noLogin ? 'text-green-500 font-medium' : 'text-red-500'}`}>
                  {request.loginMethod.noLogin ? '√' : 'X'}
                </span>
                <span className={request.loginMethod.noLogin ? 'text-gray-700' : 'text-gray-500'}>
                  不登录账号，按照承租方要求完成租赁
                </span>
              </div>
            </div>
          </div>

          {/* 移除了账号要求、订单细节和发布者信息部分 */}

          {/* 风险提示 */}
          <div className="p-4 bg-red-50">
            <h4 className="text-red-700 font-medium mb-2">风险提示</h4>
            <p className="text-sm text-red-600">
              出租账户期间账户可能被平台封禁风险，租赁期间如被封禁，租户需按照抖音平台要求进行验证解封
              请确保您了解并同意平台的服务条款和风险提示后再进行租赁操作。
            </p>
          </div>

          {/* 按钮区域 */}
          <div className="p-4 bg-gray-50 border-t border-gray-100">
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleContact}
                className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-sm font-medium shadow-sm active:scale-95 transition-all flex items-center"
              >
                <MessageOutlined className="mr-1" />
                联系对方
              </button>
              <button
                onClick={handleRentNow}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium shadow-sm active:scale-95 transition-all"
              >
                立即租赁
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <Toast toast={toast} />
    </div>
  );
};

// 提示框组件
const Toast = ({ toast }: { toast: ToastMessage }) => {
  if (!toast.show) return null;
  
  return (
    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
      <div className="bg-white px-6 py-4 rounded-lg shadow-lg border border-blue-100 flex items-center space-x-2">
        <CheckOutlined className="text-green-500" />
        <span className="text-gray-800">{toast.message}</span>
      </div>
    </div>
  );
};

export default RentalRequestDetailPage;