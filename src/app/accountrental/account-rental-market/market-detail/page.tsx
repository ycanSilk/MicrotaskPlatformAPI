import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { AccountRentalInfo } from '../../types';
import { RentButton, ClientOnly } from './ClientComponents';

// 根据平台获取对应图标
const getPlatformIcon = (platform: string) => {
  const iconMap: Record<string, string> = {
    douyin: '🎵',
    xiaohongshu: '📕',
    kuaishou: '🎬',
  };
  return iconMap[platform] || '📱';
};

// 工具函数集合
const utils = {
  // 获取平台颜色
  getPlatformColor: (platform: string): string => {
    const platformColors: Record<string, string> = {
      douyin: 'bg-gradient-to-r from-red-500 to-pink-600',
      xiaohongshu: 'bg-gradient-to-r from-red-400 to-orange-500',
      kuaishou: 'bg-gradient-to-r from-blue-500 to-teal-400'
    };
    return platformColors[platform] || 'bg-gradient-to-r from-gray-500 to-gray-600';
  },
  
  // 获取账号年龄名称
  getAccountAgeName: (age: string): string => {
    const ageMap: Record<string, string> = {
      '1-3': '1-3个月',
      '3-6': '3-6个月',
      '6-12': '6-12个月',
      '12+': '1年以上'
    };
    return ageMap[age] || age;
  },
  
  // 获取平台中文名
  getPlatformName: (platform: string): string => {
    const platformNames: Record<string, string> = {
      douyin: '抖音',
      xiaohongshu: '小红书',
      kuaishou: '快手'
    };
    return platformNames[platform] || platform;
  }
};

// 模拟获取账号详情数据
const fetchAccountDetail = async (accountId: string): Promise<AccountRentalInfo> => {
  // 模拟API请求延迟
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // 返回模拟数据
  return {
    id: accountId,
    platform: 'douyin',
    platformIcon: <span>{getPlatformIcon('douyin')}</span>,
    accountTitle: '美食探店达人',
    followersRange: '50k-100k',
    engagementRate: '5.2%',
    contentCategory: 'food',
    region: 'national',
    accountAge: '12+',
    accountScore: 4.8,
    orderPrice: 120,
    price: 120*0.77,
    rentalDuration: 1,
    minimumRentalHours: 2,
    deliveryTime: 60,
    maxConcurrentUsers: 1,
    responseTime: 30,
    includedFeatures: ['基础发布', '数据分析'],
    description: '专注于美食探店内容，有稳定的粉丝群体和良好的互动率。账号主要发布各类美食探店视频，覆盖本地热门餐厅和特色小吃，粉丝粘性高，互动活跃。',
    advantages: ['粉丝活跃度高', '内容质量优', '响应速度快', '美食领域专业度高'],
    restrictions: ['禁止发布违法内容', '禁止更改账号设置', '禁止删除原有内容'],
    isVerified: true,
    rating: 4.8,
    rentalCount: 120,
    availableCount: 1,
    publishTime: '2023-06-15T09:30:00Z',
    status: 'active',
    images: ['/images/1758380776810_96.jpg', '/images/1758380782226_96.jpg'],
    publisherName: '美食达人'
  };
};

// 服务器组件获取数据
const AccountDetailPage = async ({
  searchParams,
}: {
  searchParams: {
    id?: string;
  };
}) => {
  const accountId = searchParams?.id || '';
  
  if (!accountId) {
    return notFound();
  }
  
  try {
    // 在服务器端获取数据
    const account = await fetchAccountDetail(accountId);
    
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        {/* 账号详情内容 */}
        <div className="max-w-4xl bg-white mx-auto p-3">
            {/* 账号标题区域 - 修改为AccountCard样式 */}
            <div className="">
              {/* 图片展示区域 */}
              <div className="w-full mb-4">
                <div className="relative">
                  {account.images && account.images[0] && (
                    <div className="h-48 bg-gray-100">
                      <img 
                        src={account.images[0]}
                        alt={account.description || account.accountTitle}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* 标题和信息区域 - 按照AccountCard样式调整 */}
              <div className="mb-3">
                <div className="mb-1 text-sm line-clamp-2">{account.description || account.accountTitle}</div>

                {account.rentalDuration && (
                  <div className="text-sm mb-1">
                    出租时长：{account.rentalDuration}天
                  </div>
                )}

                {/* 租金展示 */}
                <div className="flex items-center justify-between mb-1">
                  <div className="text-sm">
                    ¥{account.price.toFixed(2)}元/天
                  </div>
                </div>
                
                {/* 发布用户和平台信息 - 按照AccountCard样式 */}
                {account.publisherName && (
                  <div className="text-sm flex items-center justify-between">
                    <span>发布用户：{account.publisherName}</span>
                    <span className="bg-green-500 text-white px-2 py-0.5 rounded text-xs">
                      {utils.getPlatformName(account.platform)}
                    </span>
                  </div>
                )}
              </div>
              
              {/* 租用按钮 - 使用客户端组件 */}
              <div className="mt-4">
                <ClientOnly>
                  <RentButton accountId={accountId} />
                </ClientOnly>
              </div>
            </div>
            
            {/* 风险提示 */}
            <div className="bg-red-50 rounded-xl p-6 mt-6">
              <div className="flex items-start gap-3">
                <span className="text-xl">⚠️</span>
                <div>
                  <h3 className="font-medium text-red-900 mb-2">风险提示</h3>
                  <p className="text-red-700 text-sm leading-relaxed">
                    请在租用前仔细阅读账号详情和租赁条款。租用期间请注意遵守平台规则，避免发布违规内容。
                    如因违规使用导致账号被封禁或其他损失，由租用方自行承担责任。
                  </p>
                </div>
              </div>
            </div>
          </div>
      </div>
    );
  } catch (error) {
    console.error('获取账号详情失败:', error);
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="text-4xl mb-4">⚠️</div>
          <h3 className="text-xl font-medium text-gray-800 mb-2">获取账号详情失败</h3>
          <a href="/accountrental/account-rental-market">
            <Button className="bg-blue-500 hover:bg-blue-600 text-white mt-4">
              返回市场
            </Button>
          </a>
        </div>
      </div>
    );
  }
};

export default AccountDetailPage;