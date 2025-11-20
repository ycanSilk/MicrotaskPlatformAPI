'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Button, Space, Avatar, Tabs, Modal, Radio, DatePicker, message } from 'antd';
import Link from 'next/link';
import {  SearchOutlined, CopyOutlined } from '@ant-design/icons';
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
  // 定义API响应接口
  interface LeaseInfo {
    id: string;
    userId: string;
    accountType: string;
    accountLevel: string;
    platform: string;
    description: string;
    pricePerDay: number;
    depositAmount: number;
    minLeaseDays: number;
    maxLeaseDays: number;
    status: string;
    totalOrders: number;
    completedOrders: number;
    successRate: number;
    createTime: string;
  }

  interface RentalOrder {
    id: string;
    leaseInfoId: string;
    lessorId: string;
    renterId: string;
    orderNo: string;
    leaseDays: number;
    totalAmount: number;
    depositAmount: number;
    platformFee: number;
    lessorIncome: number;
    renterPay: number;
    status: OrderStatus;
    startTime: string;
    endTime: string;
    actualEndTime: string;
    settled: boolean;
    settleTime: string;
    cancelReason: string;
    disputeReason: string;
    completionNotes: string;
    createTime: string;
    leaseInfo: LeaseInfo;
    lessorName: string;
    renterName: string;
  }

  interface ApiResponse {
    code: number;
    message: string;
    data: {
      list: RentalOrder[];
      total: number;
      page: number;
      size: number;
      pages: number;
    };
    success: boolean;
    timestamp: number;
  }

  // 初始化订单状态为数组
  const [orders, setOrders] = useState<RentalOrder[]>([]);

  // 页面加载时获取订单数据
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch('/api/public/rental/myrenterorder', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            page: 1,
            size: 20,
            sortField: 'createTime',
            sortOrder: 'DESC',
            status: ''
          })
        });

        if (!response.ok) {
          throw new Error('Failed to fetch orders');
        }

        const result: ApiResponse = await response.json();

        if (result.success) {
          setOrders(result.data.list);
        } else {
          message.error(result.message || '获取订单失败');
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
        message.error('获取订单失败，请稍后重试');
      }
    };

    fetchOrders();
  }, []);

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
    <div className="min-h-screen bg-gray-100 px-3 pt-8">
      {/* 选项卡区域 - 包含状态选项和筛选按钮 */}
      <div className="flex flex-row mb-2 items-center">
        {/* 左侧选项按钮区域 - 90%宽度，支持左右滑动 */}
        <div className="w-[90%] p-2">
          <div 
            className="flex overflow-x-auto whitespace-nowrap pb-2 custom-tabs-container"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            onWheel={(e) => {
              if (e.deltaY !== 0) {
                e.preventDefault();
                (e.currentTarget as HTMLDivElement).scrollLeft += e.deltaY;
              }
            }}
          >
            <style jsx global>{
              `.custom-tabs-container::-webkit-scrollbar {
                display: none;
              }
            `}</style>
            {tabItems.map((item) => (
              <button
                key={item.key}
                onClick={() => handleTabChange(item.key)}
                className={`px-2 py-1 mr-2 text-sm transition-all whitespace-nowrap ${item.key === activeTab
                  ? 'bg-[#ffebeb] border border-[#ff8080]'
                  : 'bg-white border border-transparent hover:border-gray-200'}`}
                style={{
                  fontSize: '14px',
                  outline: 'none',
                  minWidth: '60px', // 确保按钮在小屏幕上有足够的宽度
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
        
        {/* 右侧筛选按钮区域 - 10%宽度，垂直居中 */}
        <div className="w-[10%] flex items-center justify-center">
          <button 
            onClick={handleFilterClick} 
            className="text-sm text-blue-500 text-center p-1 pb-2 whitespace-nowrap"
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
            <Link href={`/accountrental/my-account-rental/rentalorder/rentalorder-detail/${order.id}`} key={order.id} className="block">
                <Card className="border-0 rounded-none mb-3 cursor-pointer hover:shadow-md transition-shadow">
                {/* 订单头部信息 */}
                <div className="flex justify-between items-center p-0">
                  <div className="flex items-center">
                    <span className="text-sm text-black whitespace-nowrap overflow-hidden text-ellipsis">订单编号：{order.orderNo}</span>
                    <Button 
                      type="text" 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        copyOrderNo(order.orderNo);
                      }}
                      size="small"
                      className="ml-2"   
                    >
                      复制
                    </Button>
                  </div>
                </div>
                <div className='mb-1'> 
                  <span className="text-sm text-red-500 border border-red-500 px-2 rounded-md bg-red-50">
                    {order.status}
                  </span>
                </div>       
                {/* 订单详细信息 - 左右结构，响应式布局 */}
                <div className="flex flex-row gap-2 p-0 items-center">
                  {/* 左侧图片区域 - 在移动设备上调整尺寸 */}
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 overflow-hidden">
                      {/* 根据平台显示不同的logo */}
                    <img 
                      src={`/images/${order.leaseInfo.platform.toLowerCase()}-logo.png`} 
                      alt={order.leaseInfo.description} 
                      className="w-full h-full object-cover"
                    />
                    </div>
                  </div>

                  {/* 右侧信息区域 */}
                  <div className="flex-1">
                    <div className="text-sm text-black line-clamp-2">{order.leaseInfo.description}</div>
                    <div className="text-sm text-black">租赁时长：{order.leaseDays} 天</div>
                    <div className="text-sm font-medium text-black">￥{order.totalAmount.toFixed(2)}</div>
                  </div>
                </div>
                {/* 按钮区域 */}
                <div className="flex justify-end items-center mt-1">
                  <Space>
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
                    
                    {/* 根据订单状态显示不同按钮 */}
                    {order.status === '待付款' && (
                      <>
                        <Button 
                          type="primary" 
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleOrderAction(order.id, '立即付款');
                          }} 
                          size="small"
                          className="whitespace-nowrap"
                        >
                          立即付款
                        </Button>
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
                          style={{ borderColor: '#000' }}
                          className="whitespace-nowrap"
                        >
                          取消订单
                        </Button>
                      </>
                    )}

                    {order.status === '租赁中' && (
                      <>
                        <Button 
                          type="default" 
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleOrderAction(order.id, '延长租期');
                          }} 
                          size="small"
                          style={{ borderColor: '#000' }}
                          className="whitespace-nowrap"
                        >
                          延长租期
                        </Button>
                      </>
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
      </div>

      {/* 筛选弹窗 - 设置宽度适应移动端 */}
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
        width={320} // 移动端弹窗宽度
        centered
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
            
            <div className="flex items-center gap-2 mt-4">
              <DatePicker className="flex-1" placeholder="起始时间" size="small" />
              <span>-</span>
              <DatePicker className="flex-1" placeholder="终止时间" size="small" />
            </div>
          </div>
        </ConfigProvider>
      </Modal>
    </div>
  );
};

export default RentalOrderPage;