'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Button, Space, Avatar, Tabs, Modal, Radio, DatePicker, message } from 'antd';
import Link from 'next/link';
import { SearchOutlined, CopyOutlined } from '@ant-design/icons';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';

dayjs.locale('zh-cn');
import type { TabsProps } from 'antd';

// 求租信息状态类型
type RentalRequestStatus = '待匹配' | '已匹配' | '已完成' | '已取消';

// 求租信息接口
interface RentalRequest {
  id: string;
  requestNo: string;
  userName: string;
  userId: string;
  accountType: string;
  accountDescription: string;
  requiredFollowers: string;
  rentalDays: number;
  budget: number;
  createTime: string;
  status: RentalRequestStatus;
  imageUrl?: string;
}

// 获取状态对应的标签颜色
const getStatusTagColor = (status: RentalRequestStatus): string => {
  const statusColors = {
    '待匹配': 'blue',
    '已匹配': 'orange',
    '已完成': 'green',
    '已取消': 'red'
  };
  return statusColors[status];
};

const RentalRequestPage = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>('全部');
  const [filterModalVisible, setFilterModalVisible] = useState<boolean>(false);
  const [requests, setRequests] = useState<RentalRequest[]>([
    {
      id: '1',
      requestNo: 'REQ20240620001',
      userName: '张三',
      userId: 'USER123456',
      accountType: '抖音',
      accountDescription: '需要一个拥有10万+粉丝的美食类抖音账号，用于推广新餐厅开业活动，要求互动率高，评论区活跃',
      requiredFollowers: '10万以上',
      rentalDays: 5,
      budget: 3000,
      createTime: '2024-06-20 10:30:00',
      status: '待匹配',
      imageUrl: '/images/douyin-logo.png'
    },
    {
      id: '2',
      requestNo: 'REQ20240619002',
      userName: '李四',
      userId: 'USER234567',
      accountType: '小红书',
      accountDescription: '寻找美妆类小红书达人账号，推广新品口红，需要有详细的产品展示和真实使用效果分享',
      requiredFollowers: '5万-10万',
      rentalDays: 3,
      budget: 1500,
      createTime: '2024-06-19 15:20:00',
      status: '已匹配',
      imageUrl: '/images/xiaohongshu-logo.png'
    },
    {
      id: '3',
      requestNo: 'REQ20240618003',
      userName: '王五',
      userId: 'USER345678',
      accountType: '微博',
      accountDescription: '需要知名旅游博主账号发布目的地推荐，要求图文并茂，内容质量高',
      requiredFollowers: '50万以上',
      rentalDays: 2,
      budget: 5000,
      createTime: '2024-06-18 09:15:00',
      status: '已完成',
      imageUrl: '/images/0e92a4599d02a7.jpg'
    },
    {
      id: '4',
      requestNo: 'REQ20240617004',
      userName: '赵六',
      userId: 'USER456789',
      accountType: '快手',
      accountDescription: '寻找搞笑视频创作者账号，推广新游戏上线活动，要求内容幽默有趣',
      requiredFollowers: '10万-50万',
      rentalDays: 7,
      budget: 2500,
      createTime: '2024-06-17 14:30:00',
      status: '已取消',
      imageUrl: '/images/kuaishou-logo.png'
    },
    {
      id: '5',
      requestNo: 'REQ20240616005',
      userName: '钱七',
      userId: 'USER567890',
      accountType: '抖音',
      accountDescription: '需要游戏主播账号直播试玩新游戏，要求技术好，解说专业，能够展示游戏核心玩法',
      requiredFollowers: '20万-50万',
      rentalDays: 1,
      budget: 4000,
      createTime: '2024-06-16 11:20:00',
      status: '待匹配',
      imageUrl: '/images/douyin-logo.png'
    }
  ]);

  // 选项卡配置
  const tabItems: TabsProps['items'] = [
    { key: '全部', label: '全部', children: null },
    { key: '待匹配', label: '待匹配', children: null },
    { key: '已匹配', label: '已匹配', children: null },
    { key: '已完成', label: '已完成', children: null },
    { key: '已取消', label: '已取消', children: null }
  ];

  // 复制求租编号功能
  const copyRequestNo = (requestNo: string) => {
    navigator.clipboard.writeText(requestNo).then(() => {
      message.success('求租编号已复制');
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
    // 实际项目中这里应该根据筛选条件过滤求租信息
    console.log('应用筛选条件');
  };

  // 处理联系客服
  const handleContactService = (requestId: string) => {
    console.log('联系客服，求租ID:', requestId);
    alert('即将为您连接客服，请稍候...');
  };

  // 处理求租操作
  const handleRequestAction = (requestId: string, action: string) => {
    console.log(`求租 ${requestId} 执行操作: ${action}`);
    alert(`求租 ${requestId} 执行 ${action} 操作`);
  };

  // 过滤求租信息
  const filteredRequests = activeTab === '全部' 
    ? requests 
    : requests.filter(request => request.status === activeTab);

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

      {/* 求租列表 */}
      <div className="">
        {filteredRequests.map((request) => (
            <Link href={`/accountrental/my-account-rental/rentalrequest/rentalrequest-detail/${request.id}`} key={request.id}>
              <Card className="border-0 rounded-none mb-3 cursor-pointer hover:shadow-md transition-shadow">
                {/* 求租头部信息 */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <span className="text-sm text-black">求租编号：{request.requestNo}</span>
                    <Button 
                      type="text" 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        copyRequestNo(request.requestNo);
                      }}
                      size="small"
                      className="ml-2"
                    >
                      复制
                    </Button>
                  </div>
                </div>
                <div className="mb-1">
                  <span className="text-sm text-red-500 border border-red-500 px-2 rounded-md bg-red-50">
                    {request.status}
                  </span>
                </div>

                {/* 求租详细信息 - 左右结构，同一行显示，垂直居中 */}
                <div className="flex flex-row gap-2 py-2 px-1 items-center">
                  {/* 左侧图片区域 */}
                  <div className="flex-shrink-0">
                    <div className="w-20 h-20 bg-gray-100 overflow-hidden">
                      {request.imageUrl ? (
                        <img 
                          src={request.imageUrl} 
                          alt={request.accountType}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200">
                          <Avatar size={40}>{request.accountType.charAt(0)}</Avatar>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 右侧信息区域 */}
                  <div className="flex-1">
                      <div className="text-sm text-gray-600 line-clamp-2">{request.accountDescription}</div>
                      <div>求租时长：{request.rentalDays} 天</div>
                      <div>预算：¥{request.budget}</div>
                  </div>
                </div>
                
                {/* 按钮区域 */}
                <div className="flex justify-end items-center mt-2 py-3 px-2">
                  <Space>
                    <Button
                      type="default"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleContactService(request.id);
                      }}
                      size="small"
                      style={{ borderColor: '#000' }}
                    >
                      客服
                    </Button>
                    
                    {/* 根据状态显示不同按钮 */}
                    {request.status === '待匹配' && (
                      <>
                        <Button 
                          type="primary" 
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleRequestAction(request.id, '编辑求租');
                          }} 
                          size="small"
                        >
                          编辑求租
                        </Button>
                        <Button
                          danger
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (confirm('确定要取消该求租信息吗？')) {
                              handleRequestAction(request.id, '取消求租');
                            }
                          }}
                          size="small"
                          style={{ borderColor: '#000' }}
                        >
                          取消求租
                        </Button>
                      </>
                    )}

                    {request.status === '已匹配' && (
                      <>
                        <Button 
                          type="default" 
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleRequestAction(request.id, '查看匹配账号');
                          }} 
                          size="small"
                          style={{ borderColor: '#000' }}
                        >
                          查看匹配账号
                        </Button>
                      </>
                    )}
                  </Space>
                </div>
              </Card>
            </Link>
          ))}

        {/* 如果没有求租信息 */}
        {filteredRequests.length === 0 && (
          <div className="bg-white p-8 text-center">
            <p className="text-sm text-black">暂无求租信息</p>
          </div>
        )}
      </div>

      {/* 筛选弹窗 */}
      <Modal
        title="求租筛选"
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

export default RentalRequestPage;