'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PublisherAuthStorage } from '@/auth/publisher/auth';
import OrderHeaderTemplate from '../components/OrderHeaderTemplate';

// 定义数据类型
interface PendingOrder {
  id: string;
  taskTitle: string;
  commenterName: string;
  submitTime: string;
  updatedTime?: string;
  content: string;
  images: string[];
  status: string;
  orderNumber?: string;
}

export default function AuditTabPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('time');
  const [loading, setLoading] = useState(true);
  const [pendingOrders, setPendingOrders] = useState<PendingOrder[]>([]);
  // 显示复制成功提示
  const [showCopyTooltip, setShowCopyTooltip] = useState(false);
  const [tooltipMessage, setTooltipMessage] = useState('');
  // 模态框状态
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [currentOrderId, setCurrentOrderId] = useState('');
  // 图片查看器状态
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState('');

  // 模拟订单数据
  const mockOrders: PendingOrder[] = [
    {
      id: 'SUB1758353659512002',
      orderNumber: 'SUB1758353659512002',
      taskTitle: '使用提供的账号登录后，按照要求浏览指定内容并发表评论',
      commenterName: '测试评论员1',
      submitTime: new Date(Date.now() - 3600000).toISOString(), // 1小时前
      updatedTime: new Date(Date.now() - 1800000).toISOString(), // 30分钟前
      content: '这个内容很有价值，学到了很多东西。希望以后能有更多这样的优质内容分享。',
      images: ['/images/1758380776810_96.jpg'],
      status: 'reviewing'
    },
    {
      id: 'SUB1758353659512003',
      orderNumber: 'SUB1758353659512003',
      taskTitle: '视频内容评论任务，需要观看完整视频并给出真实评价',
      commenterName: '测试评论员2',
      submitTime: new Date(Date.now() - 7200000).toISOString(), // 2小时前
      updatedTime: new Date(Date.now() - 5400000).toISOString(), // 1.5小时前
      content: '视频制作非常精良，内容讲解清晰易懂，强烈推荐给大家观看。',
      images: ['/images/1758384598887_578.jpg'],
      status: 'reviewing'
    },
    {
      id: 'SUB1758353659512004',
      orderNumber: 'SUB1758353659512004',
      taskTitle: '账号租赁任务，按照要求使用指定账号进行操作',
      commenterName: '测试评论员3',
      submitTime: new Date(Date.now() - 10800000).toISOString(), // 3小时前
      updatedTime: new Date(Date.now() - 9000000).toISOString(), // 2.5小时前
      content: '已完成账号租赁任务，所有操作都已按照要求完成，请查看截图确认。',
      images: ['/images/1758596791656_544.jpg', '/images/1758380776810_96.jpg'],
      status: 'reviewing'
    }
  ];

  // 直接使用模拟数据进行渲染
  useEffect(() => {
    console.log('使用模拟数据进行渲染');
    setPendingOrders(mockOrders);
    setLoading(false);
  }, []);

  // 处理搜索
  const handleSearch = () => {
    // 搜索逻辑将在AuditTab组件中处理
  };

  // 处理订单审核
  const handleOrderReview = (orderId: string, action: string) => {
    setCurrentOrderId(orderId);
    if (action === 'approve') {
      setShowApproveModal(true);
    } else if (action === 'reject') {
      setRejectReason('');
      setShowRejectModal(true);
    }
  };

  // 确认审核通过
  const confirmApprove = () => {
    // 这里添加审核通过的逻辑
    console.log(`订单 ${currentOrderId} 已审核通过`);
    showCopySuccess('订单已审核通过');
    setShowApproveModal(false);
    // 在实际应用中，这里应该更新订单状态
  };

  // 确认驳回
  const confirmReject = () => {
    if (!rejectReason.trim()) {
      alert('请输入驳回理由');
      return;
    }
    // 这里添加驳回的逻辑
    console.log(`订单 ${currentOrderId} 已驳回，理由：${rejectReason}`);
    showCopySuccess('订单已驳回');
    setShowRejectModal(false);
    // 在实际应用中，这里应该更新订单状态
  };

  // 打开图片查看器
  const openImageViewer = (imageUrl: string) => {
    setCurrentImageUrl(imageUrl);
    setShowImageViewer(true);
  };

  // 关闭图片查看器
  const closeImageViewer = () => {
    setShowImageViewer(false);
    setCurrentImageUrl('');
  };

  // 过滤最近订单
  const filterRecentOrders = (orders: any[]) => {
    return orders.filter(order => {
      const orderTime = new Date(order.submitTime).getTime();
      const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      return orderTime >= sevenDaysAgo;
    });
  };

  // 搜索订单
  const searchOrders = (orders: any[]) => {
    if (!searchTerm.trim()) return orders;
    
    return orders.filter(order => 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.taskTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.content.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // 排序审核任务
  const sortAuditTasks = (orders: any[]) => {
    return [...orders].sort((a, b) => {
      switch (sortBy) {
        case 'time':
          return new Date(b.submitTime).getTime() - new Date(a.submitTime).getTime();
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });
  };

  // 显示加载状态
  if (loading) {
    return (
      <div className="pb-20 flex items-center justify-center h-64">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }



  const showCopySuccess = (message: string) => {
    setTooltipMessage(message);
    setShowCopyTooltip(true);
    setTimeout(() => {
      setShowCopyTooltip(false);
    }, 2000);
  };

  // 复制订单号功能
  const handleCopyOrderNumber = (orderNumber: string) => {
    navigator.clipboard.writeText(orderNumber).then(() => {
      showCopySuccess('订单号已复制');
    }).catch(() => {
      // 静默处理复制失败
    });
  };

  // 复制评论功能
  const handleCopyComment = (comment: string) => {
    navigator.clipboard.writeText(comment).then(() => {
      showCopySuccess('评论已复制');
    }).catch(() => {
      // 静默处理复制失败
    });
  };

  // 获取过滤和搜索后的订单
  const filteredOrders = sortAuditTasks(searchOrders(filterRecentOrders(pendingOrders)));

  return (
    <div className="mx-4 mt-6 space-y-4">
      {/* 统一的复制成功提示 - 全局管理 */}
      {showCopyTooltip && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50">
          {tooltipMessage}
        </div>
      )}
      
      {/* 使用标准模板组件 */}
      <OrderHeaderTemplate
        title="待审核的订单"
        totalCount={pendingOrders.length}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        handleSearch={handleSearch}
        sortBy={sortBy}
        setSortBy={setSortBy}
        viewAllUrl="/publisher/allsuborders"
        onViewAllClick={() => router.push('/publisher/orders')}
      />
      
      {/* 子订单列表 - 内联实现AuditOrderCard功能 */}
      {filteredOrders.map((order, index) => (
        <div key={`pending-${order.id}-${index}`} className="p-3 rounded-lg shadow-sm hover:shadow-md transition-shadow mb-1 bg-white">
          {/* 订单号 */}
          <div className="flex items-center mb-1 overflow-hidden">
            <div className="flex-1 mr-2 whitespace-nowrap overflow-hidden text-truncate">
              订单号：{order.orderNumber || order.id}
            </div>
            <div className="relative">
              <button 
                className="text-blue-600 hover:text-blue-700 whitespace-nowrap text-sm"
                onClick={() => handleCopyOrderNumber(order.orderNumber || order.id)}
              >
                <span>⧉ 复制</span>
              </button>
            </div>
          </div>
          
          {/* 订单状态和任务类型 - 同一行且独立占一行 */}
          <div className="flex items-center mb-1 space-x-4">
            <div className="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded text-xs">
              待审核
            </div>
            <div className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs">
              {order.taskTitle.includes('账号租赁') ? '账号租赁' : order.taskTitle.includes('视频发布') ? '视频发布' : '评论任务'}
            </div>
          </div>
          
          {/* 价格和状态信息 */}
          <div className="mb-1">
            <div className="flex items-center mb-1">
              <span className="text-sm text-black font-medium">价格：</span>
              <span className="text-sm text-black">¥6.00</span>
            </div>
          </div>
          
          {/* 时间信息 - 各自独占一行 */}
          <div className="text-sm text-black mb-1">
            发布时间：2025-10-15 12:00:00
          </div>
          <div className="text-sm text-black mb-1">
            提交时间：2025-10-15 14:00:00
          </div>
          
          {/* 领取用户信息展示 */}
          <div className="text-black text-sm mb-1 w-full rounded-lg">
              要求：组合任务，中下评评论
          </div>

          <div className="text-sm text-red-500 mb-1">温馨提示：审核过程中如目标视频丢失，将以接单员完成任务截图为准给予审核结算</div>
          
          {/* 评论展示和复制功能 */}
          {order.content && (
            <div className="mb-3 p-2 border border-gray-200 rounded-lg bg-blue-50">
              <div className="flex items-start justify-between mb-1">
                <span className="text-sm font-medium text-blue-700">提交的评论：</span>
                <button
                  className="text-blue-600 hover:text-blue-700 text-xs flex items-center"
                  onClick={() => handleCopyComment(order.content || '')}
                >
                  <span className="mr-1">⧉</span> 复制评论
                </button>
              </div>
              <p className="text-sm text-blue-700 whitespace-pre-wrap">{order.content}</p>
            </div>
          )}

          <div className="mb-1 bg-blue-50 border border-blue-500 py-2 px-3 rounded-lg">
            <p className='mb-1  text-sm text-blue-600'>已完成评论点击进入：</p>
            <a 
              href="http://localhost:3000/publisher/dashboard?tab=active" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="bg-blue-600 text-white px-3 py-1.5 rounded-md text-sm font-medium inline-flex items-center"
              onClick={(e) => {
                e.preventDefault();
                // 在实际应用中，这里应该跳转到抖音视频页面
                window.open('https://www.douyin.com', '_blank');
              }}
            >
              <span className="mr-1">⦿</span> 打开视频
            </a>
          </div>

          {/* 截图显示区域 - 自适应高度，居中显示 */}
          <div className="mb-4 border border-blue-200 rounded-lg p-3 bg-blue-50">
            <div className='text-sm text-blue-600 pl-2 py-2'>完成任务截图上传：</div>
            {order.images && order.images.length > 0 ? (
              <div className="grid grid-cols-3 gap-2">
                {order.images.map((imageUrl: string, imgIndex: number) => (
                  <div 
                    key={imgIndex}
                    className="w-[90px] h-[90px] relative cursor-pointer overflow-hidden rounded-lg border border-gray-300 bg-gray-50 transition-colors hover:border-blue-400 hover:shadow-md flex items-center justify-center"
                    onClick={() => openImageViewer(imageUrl)}
                  >
                    <img 
                      src={imageUrl} 
                      alt={`任务截图 ${imgIndex + 1}`} 
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 flex items-center justify-center transition-all">
                      <span className="text-blue-600 text-xs opacity-0 hover:opacity-100 transition-opacity">点击放大</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="w-full h-24 flex flex-col items-center justify-center text-gray-400">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-xs">未上传截图</span>
              </div>
            )}
            <p className="text-xs text-blue-600 mt-1 pl-2">
              点击可放大查看截图
            </p>
          </div>

          {/* 按钮区域 */}
            <div className="mt-4 flex gap-2 justify-end">
              <button 
                className="py-2 px-4 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 transition-colors"
                onClick={() => handleOrderReview(order.id, 'approve')}
              >
                审核通过
              </button>
              <button 
                className="py-2 px-4 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 transition-colors"
                onClick={() => handleOrderReview(order.id, 'reject')}
              >
                驳回订单
              </button>
            </div>
        </div>
      ))}
    
    {/* 审核通过确认模态框 */}
    {showApproveModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-5 w-full max-w-md">
          <h3 className="text-lg font-medium mb-3">确认审核通过</h3>
          <p className="text-gray-600 mb-4">您确定要审核通过这个订单吗？</p>
          <div className="flex justify-end gap-3">
            <button 
              className="px-4 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50 transition-colors"
              onClick={() => setShowApproveModal(false)}
            >
              取消
            </button>
            <button 
              className="px-4 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 transition-colors"
              onClick={confirmApprove}
            >
              确定
            </button>
          </div>
        </div>
      </div>
    )}
    
    {/* 驳回订单模态框 */}
    {showRejectModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-5 w-full max-w-md">
          <h3 className="text-lg font-medium mb-3">驳回订单</h3>
          <p className="text-gray-600 mb-1">请输入驳回理由：</p>
          <textarea 
            className="w-full border border-gray-300 rounded-md p-2 mb-4 min-h-[100px]"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="请输入驳回原因..."
          />
          <div className="flex justify-end gap-3">
            <button 
              className="px-4 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50 transition-colors"
              onClick={() => setShowRejectModal(false)}
            >
              取消
            </button>
            <button 
              className="px-4 py-2 bg-red-600 text-white rounded-md text-sm hover:bg-red-700 transition-colors"
              onClick={confirmReject}
            >
              确定驳回
            </button>
          </div>
        </div>
      </div>
    )}
    
    {/* 图片查看器 */}
    {showImageViewer && (
      <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
        <button 
          className="absolute top-4 right-4 text-white text-2xl"
          onClick={closeImageViewer}
        >
          ×
        </button>
        <img 
          src={currentImageUrl} 
          alt="大图查看" 
          className="max-w-[90%] max-h-[90%] object-contain"
        />
      </div>
    )}
    
    </div>
  );
}