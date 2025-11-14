'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Button, Space, Avatar, Tabs, Modal, Radio, DatePicker, message } from 'antd';
import Link from 'next/link';
import { PhoneOutlined, SearchOutlined, CopyOutlined } from '@ant-design/icons';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';

dayjs.locale('zh-cn');
import type { TabsProps } from 'antd';

// API响应格式
export interface RentalOfferApiResponse {
  code: number;
  message: string;
  success: boolean;
  data: RentalOfferData;
}

// 分页数据结构
export interface RentalOfferData {
  list: RentalOffer[];
  page: number;
  size: number;
  total: number;
  pages: number;
}

// 出租信息接口
export interface RentalOffer {
  id: string;
  offerNo: string;
  userName: string;
  userId: string;
  accountType: string;
  accountName: string;
  followersCount: string;
  accountDescription: string;
  rentalPrice: number;
  createTime: string;
  status: RentalOfferStatus;
  imageUrl?: string;
  rentalDuration: number;
  // 可能的额外字段
  platform?: string;
  updateTime?: string;
  startTime?: string;
  endTime?: string;
}

// 出租信息状态类型（API返回值）
export type RentalOfferStatus = 'ACTIVE' | 'INACTIVE' | 'CANCELED' | 'RENTED';

// 状态文本映射
export const statusTextMap: Record<RentalOfferStatus, string> = {
  ACTIVE: '已发布',
  INACTIVE: '不活跃',
  CANCELED: '已取消',
  RENTED: '已出租'
};

// 获取状态对应的标签颜色
const getStatusTagColor = (status: RentalOfferStatus): string => {
  const statusColors: Record<RentalOfferStatus, string> = {
    ACTIVE: 'green',
    INACTIVE: 'gray',
    CANCELED: 'red',
    RENTED: 'purple'
  };
  return statusColors[status] || 'gray';
};

const RentalOfferPage = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>('全部');
  const [filterModalVisible, setFilterModalVisible] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<RentalOfferData | null>(null);
  const [pagination, setPagination] = useState({ page: 1, size: 20 });

  // 选项卡配置
  const tabItems: TabsProps['items'] = [
    { key: '全部', label: '全部', children: null },
    { key: 'ACTIVE', label: '已发布', children: null },
    { key: 'INACTIVE', label: '不活跃', children: null },
    { key: 'CANCELED', label: '已取消', children: null },
    { key: 'RENTED', label: '已出租', children: null }
  ];

  // 调用API获取出租信息
  const fetchRentalOffers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/public/rental/mypublishrentalinfolist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...pagination,
          sortField: 'createTime',
          sortOrder: 'desc',
        }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const responseData = await response.json() as RentalOfferApiResponse;

      if (responseData.success) {
        setData(responseData.data);
      } else {
        setError(responseData.message || 'Failed to fetch data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // 页面加载时调用API
  React.useEffect(() => {
    fetchRentalOffers();
  }, [pagination]);

  // 复制出租编号功能
  const copyOfferNo = (offerNo: string) => {
    navigator.clipboard.writeText(offerNo).then(() => {
      message.success('出租编号已复制');
    }).catch(() => {
      message.error('复制失败，请手动复制');
    });
  };

  // 状态文本映射
  const getStatusText = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return '已发布';
      case 'INACTIVE':
        return '已下架';
      case 'CANCELED':
        return '已取消';
      case 'RENTED':
        return '已出租';
      default:
        return status;
    }
  };

  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  // 处理选项卡切换
  const handleTabChange = (key: string) => {
    setActiveTab(key);
  };

  // 处理筛选按钮点击
  const handleFilterClick = () => {
    setFilterModalVisible(true);
  };

  // 处理筛选确认
  const handleFilterConfirm = () => {
    setFilterModalVisible(false);
    // 实际项目中这里应该根据筛选条件过滤出租信息
    console.log('应用筛选条件');
  };

  // 处理联系客服
  const handleContactService = (offerId: string) => {
    console.log('联系客服，出租ID:', offerId);
    alert('即将为您连接客服，请稍候...');
  };

  // 处理出租操作
  const handleOfferAction = (offerId: string, action: string) => {
    console.log(`出租 ${offerId} 执行操作: ${action}`);
    alert(`出租 ${offerId} 执行 ${action} 操作`);
  };

  // 过滤出租信息
  const filteredOffers = data?.list || [];
  const filteredByStatus = activeTab === '全部' 
    ? filteredOffers 
    : filteredOffers.filter(offer => offer.status === activeTab);

  // 辅助函数：渲染出租列表
  const renderRentalList = () => {
    if (loading) {
      return (
        <div className="bg-white p-8 text-center">
          <p className="text-sm text-black">加载中...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-white p-8 text-center">
          <p className="text-sm text-red-500">{error}</p>
          <Button 
            type="primary" 
            onClick={fetchRentalOffers} 
            size="small" 
            className="mt-2"
          >
            重试
          </Button>
        </div>
      );
    }

    if (filteredByStatus.length === 0) {
      return (
        <div className="bg-white p-8 text-center">
          <p className="text-sm text-black">暂无出租信息</p>
        </div>
      );
    }

    return filteredByStatus.map((offer) => (
      <Link href={`/accountrental/my-account-rental/rentaloffer/rentaloffer-detail/${offer.id}`} key={offer.id}>
        <Card className="border-0 rounded-none mb-3 cursor-pointer hover:shadow-md transition-shadow">
          {/* 出租头部信息 */}
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <span className="text-sm text-black">出租单号：{offer.offerNo}</span>
              <Button 
                type="text" 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  copyOfferNo(offer.offerNo);
                }}
                size="small"
                className="ml-2"
              >
                复制
              </Button>
            </div>
          </div>
          <div className='mb-1'>
            <span className="text-sm text-red-500">
              {statusTextMap[offer.status]}
            </span>
          </div>
          {/* 出租详细信息 - 左右结构，同一行显示，垂直居中 */}
          <div className="flex flex-row gap-2 items-center">
            {/* 左侧图片区域 */}
            <div className="flex-shrink-0">
              <div className="w-20 h-20 bg-gray-100 overflow-hidden">
                {offer.imageUrl ? (
                  <img 
                    src={offer.imageUrl} 
                    alt={offer.accountType}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200">
                    <Avatar size={40}>{offer.accountType.charAt(0)}</Avatar>
                  </div>
                )}
              </div>
            </div>

            {/* 右侧信息区域 */}
            <div className="flex-1">
                <div className="text-sm text-gray-600 line-clamp-2">{offer.accountDescription}</div>
                <div className="text-xs text-gray-500">租赁时长：{offer.rentalDuration} 天</div>
                <div className="text-sm text-black">{offer.rentalPrice} 元/天</div>
            </div>
          </div>
          
          {/* 按钮区域 */}
          <div className="flex justify-end items- mt-1">
            <Space>
              <Button
                type="default"
                icon={<PhoneOutlined />}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleContactService(offer.id);
                }}
                size="small"
                style={{ borderColor: '#000' }}
              >
                客服
              </Button>

              {/* 根据状态显示不同按钮 */}
              {offer.status === 'ACTIVE' && (
                <>
                  <Button 
                    type="default" 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleOfferAction(offer.id, '编辑出租');
                    }} 
                    size="small"
                    style={{ borderColor: '#000' }}
                  >
                    编辑出租
                  </Button>                       
                  <Button
                    danger
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (confirm('确定要下架该出租信息吗？')) {
                        handleOfferAction(offer.id, '下架');
                      }
                    }}
                    size="small"
                    style={{ borderColor: '#000' }}
                  >
                    下架
                  </Button>
                </>
              )}

              {offer.status === 'INACTIVE' && (
                <>
                  <Button 
                    type="primary" 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleOfferAction(offer.id, '重新上架');
                    }} 
                    size="small"
                  >
                    重新上架
                  </Button>
                </>
              )}
            </Space>
          </div>
        </Card>
      </Link>
    ));
  };

  return (
    <div className="min-h-screen bg-gray-100 px-3 pt-8">
      {/* 选项卡区域 - 包含状态选项和筛选按钮 */}
      <div className="flex flex-row mb-2 items-center">
        {/* 左侧选项按钮区域 - 90%宽度，支持左右滑动 */}
        <div className="w-[90%] p-2">
          <div 
            className="flex overflow-x-auto whitespace-nowrap pb-2"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            onWheel={(e) => {
              if (e.deltaY !== 0) {
                e.preventDefault();
                (e.currentTarget as HTMLDivElement).scrollLeft += e.deltaY;
              }
            }}
          >
            <style jsx global>{`
              .custom-tabs-container::-webkit-scrollbar {
                display: none;
              }
            `}</style>
            {tabItems.map((item) => (
              <button
                key={item.key}
                onClick={() => handleTabChange(item.key)}
                className={`px-2 py-1 mr-2 text-sm transition-all ${item.key === activeTab
                  ? 'bg-[#ffebeb] border border-[#ff8080]'
                  : 'bg-white border border-transparent hover:border-gray-200'}`}
                style={{
                  fontSize: '14px',
                  outline: 'none'
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
        
        {/* 右侧筛选按钮区域 - 10%宽度，垂直居中 */}
        <div className="w-[10%] flex">
          <button 
            onClick={handleFilterClick} 
            className="text-sm text-blue-500 text-center p-1 pb-2"
            style={{
              fontSize: '14px',
              outline: 'none'
            }}
          >
            筛选
          </button>
        </div>
      </div>

      {/* 出租列表 */}
      <div className="">
        {renderRentalList()}
      </div>

      {/* 筛选弹窗 */}
      <Modal
        title="出租筛选"
        open={filterModalVisible}
        onOk={handleFilterConfirm}
        onCancel={() => setFilterModalVisible(false)}
        footer={[
          <Button key="reset" onClick={() => console.log('重置筛选条件')} size="small">
            重置
          </Button>,
          <Button key="confirm" type="primary" onClick={handleFilterConfirm} size="small">
            确定
          </Button>
        ]}
      >
        <ConfigProvider locale={zhCN}>
          <div>
            <div>
              <h4 className="text-sm text-black mb-2">时间区间</h4>
              <Radio.Group className="w-full">
                <Space direction="vertical" className="w-full">
                  <Radio value="1">1个月内</Radio>
                  <Radio value="3">3个月内</Radio>
                  <Radio value="6">6个月内</Radio>
                </Space>
              </Radio.Group>
            </div>
            
            <div className="mt-4">
              <h4 className="text-sm text-black mb-2">账号类型</h4>
              <Radio.Group className="w-full">
                <Space direction="vertical" className="w-full">
                  <Radio value="抖音">抖音</Radio>
                  <Radio value="小红书">小红书</Radio>
                  <Radio value="微博">微博</Radio>
                  <Radio value="快手">快手</Radio>
                </Space>
              </Radio.Group>
            </div>
            
            <div className="flex items-center gap-4 mt-4">
              <DatePicker className="flex-1" placeholder="起始时间" />
              <span>-</span>
              <DatePicker className="flex-1" placeholder="终止时间" />
            </div>
          </div>
        </ConfigProvider>
      </Modal>
    </div>
  );
};

export default RentalOfferPage;