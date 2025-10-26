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

// 出租信息状态类型
type RentalOfferStatus = '已上架' | '已租出' | '已下架';

// 出租信息接口
interface RentalOffer {
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
}

// 获取状态对应的标签颜色
const getStatusTagColor = (status: RentalOfferStatus): string => {
  const statusColors = {
    '已上架': 'green',
    '已租出': 'purple',
    '已下架': 'gray'
  };
  return statusColors[status];
};

const RentalOfferPage = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>('全部');
  const [filterModalVisible, setFilterModalVisible] = useState<boolean>(false);
  const [offers, setOffers] = useState<RentalOffer[]>([
    {
      id: '1',
      offerNo: 'OFFER20240620001',
      userName: '张三',
      userId: 'USER123456',
      accountType: '抖音',
      accountName: '美食达人小C',
      followersCount: '12.5万',
      accountDescription: '专注美食领域，以制作精致的餐厅探店和美食测评视频为主，互动率高，粉丝粘性强',
      rentalPrice: 50,
      rentalDuration: 30,
      createTime: '2024-06-20 10:30:00',
      status: '已上架',
      imageUrl: '/images/douyin-logo.png'
    },
    {
      id: '2',
      offerNo: 'OFFER20240619002',
      userName: '李四',
      userId: 'USER234567',
      accountType: '小红书',
      accountName: '美妆博主小D',
      followersCount: '8.3万',
      accountDescription: '专业美妆博主，擅长口红试色和妆容教程，粉丝多为年轻女性，互动积极',
      rentalPrice: 50,
      rentalDuration: 30,
      createTime: '2024-06-19 15:20:00',
      status: '已租出',
      imageUrl: '/images/xiaohongshu-logo.png'
    },
    {
      id: '3',
      offerNo: 'OFFER20240618003',
      userName: '王五',
      userId: 'USER345678',
      accountType: '微博',
      accountName: '旅行家李明',
      followersCount: '62.3万',
      accountDescription: '知名旅游博主，以高质量旅行攻略和目的地推荐著称，内容专业详实',
      rentalPrice: 50,
      rentalDuration: 30,
      createTime: '2024-06-18 09:15:00',
      status: '已上架',
      imageUrl: '/images/0e92a4599d02a7.jpg'
    }
  ]);

  // 选项卡配置
  const tabItems: TabsProps['items'] = [
    { key: '全部', label: '全部', children: null },
    { key: '已上架', label: '已上架', children: null },
    { key: '已租出', label: '已租出', children: null },
    { key: '已下架', label: '已下架', children: null }
  ];

  // 复制出租编号功能
  const copyOfferNo = (offerNo: string) => {
    navigator.clipboard.writeText(offerNo).then(() => {
      message.success('出租编号已复制');
    }).catch(() => {
      message.error('复制失败，请手动复制');
    });
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
  const filteredOffers = activeTab === '全部' 
    ? offers 
    : offers.filter(offer => offer.status === activeTab);

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
        {filteredOffers.map((offer) => (
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
                    {offer.status}
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
                    {offer.status === '已上架' && (
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

                    {offer.status === '已下架' && (
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
          ))}

        {/* 如果没有出租信息 */}
        {filteredOffers.length === 0 && (
          <div className="bg-white p-8 text-center">
            <p className="text-sm text-black">暂无出租信息</p>
          </div>
        )}
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