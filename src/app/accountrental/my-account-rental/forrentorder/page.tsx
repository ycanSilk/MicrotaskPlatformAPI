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

// 订单状态类型
type OrderStatus = '待付款' | '租赁中' | '已完成' | '已取消';

// 订单接口
interface RentalOrder {
  id: string;
  orderNo: string;
  userName: string;
  userId: string;
  accountInfo: string;
  rentalDays: number;
  totalAmount: number;
  createTime: string;
  startTime: string;
  endTime: string;
  status: OrderStatus;
  imageUrl?: string;
}

// 获取状态对应的标签颜色
const getStatusTagColor = (status: OrderStatus): string => {
  const statusColors = {
    '待付款': 'orange',
    '租赁中': 'green',
    '已完成': 'purple',
    '已取消': 'red'
  };
  return statusColors[status];
};

const RentalOrderPage = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>('全部');
  const [filterModalVisible, setFilterModalVisible] = useState<boolean>(false);
  const [orders, setOrders] = useState<RentalOrder[]>([
    {
      id: '1',
      orderNo: 'RENT20240620001',
      userName: '张三',
      userId: 'USER123456',
      accountInfo: '抖音账号 - 美食达人',
      rentalDays: 3,
      totalAmount: 199.00,
      createTime: '2024-06-20 10:30:00',
      startTime: '2024-06-20 12:00:00',
      endTime: '2024-06-23 12:00:00',
      status: '待付款',
      imageUrl: '/images/douyin-logo.png'
    },
    {
      id: '2',
      orderNo: 'RENT20240619002',
      userName: '李四',
      userId: 'USER234567',
      accountInfo: '小红书账号 - 美妆博主',
      rentalDays: 7,
      totalAmount: 499.00,
      createTime: '2024-06-19 15:20:00',
      startTime: '2024-06-19 16:00:00',
      endTime: '2024-06-26 16:00:00',
      status: '待付款',
      imageUrl: '/images/xiaohongshu-logo.png'
    },
    {
      id: '3',
      orderNo: 'RENT20240618003',
      userName: '王五',
      userId: 'USER345678',
      accountInfo: '微博账号 - 旅游达人',
      rentalDays: 1,
      totalAmount: 89.00,
      createTime: '2024-06-18 09:15:00',
      startTime: '2024-06-18 10:00:00',
      endTime: '2024-06-19 10:00:00',
      status: '租赁中',
      imageUrl: '/images/0e92a4599d02a7.jpg'
    },
    {
      id: '4',
      orderNo: 'RENT20240617004',
      userName: '赵六',
      userId: 'USER456789',
      accountInfo: '测试测试测试测试测试测试测试测试测试测试',
      rentalDays: 5,
      totalAmount: 299.00,
      createTime: '2024-06-17 14:30:00',
      startTime: '2024-06-17 15:00:00',
      endTime: '2024-06-22 15:00:00',
      status: '已完成',
      imageUrl: '/images/kuaishou-logo.png'
    },
    {
      id: '5',
      orderNo: 'RENT20240616005',
      userName: '钱七',
      userId: 'USER567890',
      accountInfo: '抖音账号抖音账号抖音账号抖音账号抖音账号抖音账号抖音账号抖音账号',
      rentalDays: 2,
      totalAmount: 159.00,
      createTime: '2024-06-16 11:20:00',
      startTime: '2024-06-16 12:00:00',
      endTime: '2024-06-18 12:00:00',
      status: '已取消',
      imageUrl: '/images/douyin-logo.png'
    }
  ]);

  // 选项卡配置
  const tabItems: TabsProps['items'] = [
    { key: '全部', label: '全部', children: null },
    { key: '待付款', label: '待付款', children: null },
    { key: '租赁中', label: '租赁中', children: null },
    { key: '已完成', label: '已完成', children: null },
    { key: '已取消', label: '已取消', children: null }
  ];

  // 复制订单号功能
  const copyOrderNo = (orderNo: string) => {
    navigator.clipboard.writeText(orderNo).then(() => {
      message.success('订单号已复制');
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
    // 实际项目中这里应该根据筛选条件过滤订单
    console.log('应用筛选条件');
  };

  // 处理联系客服
  const handleContactService = (orderId: string) => {
    console.log('联系客服，订单ID:', orderId);
    alert('即将为您连接客服，请稍候...');
  };

  // 处理订单操作
  const handleOrderAction = (orderId: string, action: string) => {
    console.log(`订单 ${orderId} 执行操作: ${action}`);
    alert(`订单 ${orderId} 执行 ${action} 操作`);
  };

  // 过滤订单
  const filteredOrders = activeTab === '全部' 
    ? orders 
    : orders.filter(order => order.status === activeTab);

  return (
    <div className="min-h-screen pt-3">
      {/* 选项卡区域 - 包含状态选项和筛选按钮 */}
      <div className="flex flex-row mb-2 items-center">
        {/* 左侧选项按钮区域 - 90%宽度，支持左右滑动 */}
        <div className="w-[88%]">
          <div 
            className="flex overflow-x-auto whitespace-nowrap" 
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
                className={`px-2 py-1 mr-1 text-sm transition-all ${item.key === activeTab
                  ? 'bg-[#ffebeb] border border-[#ff8080]'
                  : 'bg-white border border-transparent hover:border-gray-200'}`}
                style={{
                  fontSize: '12px',
                  outline: 'none'
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
        
        {/* 右侧筛选按钮区域 - 10%宽度，垂直居中 */}
        <div className="w-[12%] flex">
          <button 
            onClick={handleFilterClick} 
            className="text-sm text-blue-500 text-center"
            style={{
              fontSize: '14px',
              outline: 'none'
            }}
          >
            筛选
          </button>
        </div>
      </div>

      {/* 订单列表 */}
      <div className="">
        {filteredOrders.map((order) => (
            <Link href={`/accountrental/my-account-rental/forrentorder/forrentorder-detail/${order.id}`} key={order.id}>
              <Card className="rounded-md mb-3 hover:shadow-md">
                {/* 订单头部信息 */}
                <div className="">
                  <div className="flex items-center space-y-1">
                    <span className="text-sm text-black whitespace-nowrap overflow-hidden text-ellipsis">订单号：{order.orderNo}</span>
                    <Button 
                      type="text" 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        copyOrderNo(order.orderNo);
                      }}
                      size="small"
                      className="ml-1"   
                    >
                      复制
                    </Button>
                  </div>
                  <span className="text-sm text-red-500 border border-red-500 rounded-md px-2 bg-red-50">
                    {order.status}
                  </span>
                </div>

                {/* 订单详细信息 - 左右结构，同一行显示，垂直居中 */}
                <div className="flex flex-row gap-2 p-1 items-center">
                  {/* 左侧图片区域 */}
                  <div className="flex-shrink-0">
                    <div className="w-20 h-20 bg-gray-100 overflow-hidden">
                      {order.imageUrl ? (
                        <img 
                          src={order.imageUrl} 
                          alt={order.accountInfo} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200">
                          <Avatar size={40}>{order.accountInfo.charAt(0)}</Avatar>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 右侧信息区域 */}
                  <div className="flex-1  space-y-1">
                      <div className="text-sm text-black line-clamp-2 overflow-hidden">{order.accountInfo}</div>
                      <div className="text-sm">租赁时长：{order.rentalDays} 天</div>
                      <div className="text-sm">￥{order.totalAmount.toFixed(2)}</div>
                  </div>
                </div>
                {/* 按钮区域 */}
                <div className="flex justify-end items-center py-3 px-2">
                  {/* 客服按钮移至右侧 */}
                    <Button
                      type="default"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleContactService(order.id);
                      }}
                      size="small"
                      style={{ borderColor: '#000' }}
                    >
                      客服
                    </Button>


                  <Space>
                    {/* 根据订单状态显示不同按钮 */}
                    {order.status === '待付款' && (
                      <Button
                        danger
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (confirm('确定要取消该订单吗？')) {
                            handleOrderAction(order.id, '取消订单');
                          }
                        }}
                        size="small"
                        style={{ borderColor: '#000' ,marginLeft:4 }}
                      >
                        取消订单
                      </Button>
                    )}
                    
                    
                  </Space>
                </div>
              </Card>
            </Link>
          ))}

        {/* 如果没有订单 */}
        {filteredOrders.length === 0 && (
          <div className="bg-white p-8 text-center">
            <p className="text-sm text-black">暂无出租订单</p>
          </div>
        )}
   

      {/* 筛选弹窗 */}
      <Modal
        title="订单筛选"
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
            
            <div className="flex items-center gap-4">
              <DatePicker className="flex-1" placeholder="起始时间" />
              <span>-</span>
              <DatePicker className="flex-1" placeholder="终止时间" />
            </div>
          </div>
        </ConfigProvider>
      </Modal>
    </div>
    </div>
  );
};

export default RentalOrderPage;