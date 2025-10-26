'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { EditOutlined, CopyOutlined, LinkOutlined, CheckOutlined } from '@ant-design/icons';

// 定义订单接口
interface Order {
  id: string;
  orderNo: string;
  parentOrderNo: string;
  title: string;
  price: number;
  status: string;
  statusText: string;
  statusColor: string;
  publishTime: string;
  deadline?: string;
  submitTime?: string;
  completedTime?: string;
  taskType: string;
  taskRequirements: string;
  recommendedComment?: string;
  requiringVideoUrl?: string;
  requiringCommentUrl?: string;
  submitdvideoUrl?: string;
  submitScreenshotUrl?: string;
  reviewNote?: string;
}

// 任务类型映射函数
const getTaskTypeName = (taskType?: string): string => {
  const taskTypeMap: Record<string, string> = {
    'comment_middle': '中下评评论',
    'account_rental': '账号出租',
    'video_send': '视频分享'
  };
  return taskTypeMap[taskType || ''] || taskType || '评论';
};

const OrderDetailPage = () => {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // 模拟获取订单详情
  useEffect(() => {
    // 模拟数据
    const mockOrders: Order[] = [
      {
        id: '1',
        orderNo: 'COM20240620001',
        parentOrderNo: 'PUB20240620001',
        title: '组合任务：中下评评论',
        price: 6.00,
        status: 'sub_progress',
        statusText: '进行中',
        statusColor: 'bg-blue-100 text-blue-600',
        publishTime: '2024-06-20 10:30:00',
        deadline: '2024-06-23 23:59:59',
        taskType: 'comment_middle',
        taskRequirements: '1. 查看指定视频\n2. 发表中下评评论\n3. 评论需包含关键词："优质内容"和"太精彩了"\n4. 评论字数不少于10个字\n5. 完成后上传截图',
        recommendedComment: '这个内容真的很精彩，优质内容就应该这样分享给更多人！',
        requiringVideoUrl: 'https://www.douyin.com/root/search/%E8%B6%85%E5%93%A5%E8%B6%85%E8%BD%A6',
        requiringCommentUrl: 'https://www.douyin.com/root/search/%E8%B6%85%E5%93%A5%E8%B6%85%E8%BD%A6'
      },
      {
        id: '2',
        orderNo: 'COM20240619002',
        parentOrderNo: 'PUB20240619002',
        title: '抖音短视频点赞评论任务',
        price: 5.88,
        status: 'sub_pending_review',
        statusText: '待审核',
        statusColor: 'bg-orange-100 text-orange-600',
        publishTime: '2024-06-19 15:20:00',
        submitTime: '2024-06-20 09:45:00',
        taskType: 'comment_middle',
        taskRequirements: '1. 点赞视频\n2. 发表积极正面的评论\n3. 评论需包含关键词\n4. 完成后上传截图',
        submitScreenshotUrl: '/images/1758380776810_96.jpg',
        submitdvideoUrl: 'https://www.douyin.com/root/search/%E8%B6%85%E5%93%A5%E8%B6%85%E8%BD%A6'
      },
      {
        id: '3',
        orderNo: 'COM20240618003',
        parentOrderNo: 'PUB20240618003',
        title: '小红书笔记评论任务',
        price: 8.50,
        status: 'sub_completed',
        statusText: '已完成',
        statusColor: 'bg-green-100 text-green-600',
        publishTime: '2024-06-18 09:15:00',
        submitTime: '2024-06-19 11:30:00',
        completedTime: '2024-06-20 16:45:00',
        taskType: 'comment_middle',
        taskRequirements: '1. 浏览指定笔记\n2. 发表相关评论\n3. 截图上传',
        submitScreenshotUrl: '/images/1758380776810_96.jpg'
      },
      {
        id: '4',
        orderNo: 'COM20240617004',
        parentOrderNo: 'PUB20240617004',
        title: '微博评论互动任务',
        price: 7.20,
        status: 'sub_rejected',
        statusText: '异常订单',
        statusColor: 'bg-red-100 text-red-600',
        publishTime: '2024-06-17 14:30:00',
        submitTime: '2024-06-18 10:20:00',
        taskType: 'comment_middle',
        taskRequirements: '1. 转发指定微博\n2. 发表评论\n3. @指定用户',
        reviewNote: '评论内容不符合要求，未包含指定关键词和@指定用户。请重新提交符合要求的评论内容。',
        submitScreenshotUrl: '/images/1758596791656_544.jpg'
      },
      {
        id: '5',
        orderNo: 'COM20240616005',
        parentOrderNo: 'PUB20240616005',
        title: '视频分享任务',
        price: 12.00,
        status: 'sub_progress',
        statusText: '进行中',
        statusColor: 'bg-blue-100 text-blue-600',
        publishTime: '2024-06-16 11:20:00',
        deadline: '2024-06-22 23:59:59',
        taskType: 'video_send',
        taskRequirements: '1. 分享视频到朋友圈\n2. 保持24小时\n3. 截图上传',
        requiringVideoUrl: 'https://www.douyin.com/root/search/%E8%B6%85%E5%93%A5%E8%B6%85%E8%BD%A6'
      }
    ];

    // 查找对应ID的订单
    const foundOrder = mockOrders.find(o => o.id === id);
    if (foundOrder) {
      setOrder(foundOrder);
    }
  }, [id]);

  // 复制订单号功能
  const copyOrderNo = (orderNo: string) => {
    navigator.clipboard.writeText(orderNo).then(() => {
      setModalMessage('订单号已复制到剪贴板');
      setShowModal(true);
    }).catch(err => {
      console.error('复制失败:', err);
      setModalMessage('复制失败，请手动复制');
      setShowModal(true);
    });
  };

  // 复制推荐评论功能
  const handleCopyComment = (comment?: string) => {
    if (!comment) {
      setModalMessage('暂无推荐评论');
      setShowModal(true);
      return;
    }
    
    navigator.clipboard.writeText(comment).then(() => {
      setModalMessage('复制评论成功');
      setShowModal(true);
    }).catch(err => {
      console.error('复制失败:', err);
      setModalMessage('复制失败，请手动复制');
      setShowModal(true);
    });
  };

  // 打开链接
  const handleOpenLink = (url?: string) => {
    if (url) {
      window.open(url, '_blank');
    }
  };

  // 查看图片
  const handleViewImage = (imageUrl: string) => {
    setSelectedImage(imageUrl);
  };

  // 关闭图片查看器
  const handleCloseImageViewer = () => {
    setSelectedImage(null);
  };

  // 返回上一页
  const handleBack = () => {
    router.back();
  };

  // 渲染操作按钮
  const renderActionButtons = () => {
    if (!order) return null;

    switch (order.status) {
      case 'sub_progress':
        return (
          <div className="flex flex-col space-y-3 pt-3 border-t border-gray-100">
            <button 
              className="bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              onClick={(e) => {
                e.preventDefault();
                setModalMessage('功能开发中，敬请期待');
                setShowModal(true);
              }}
            >
              上传截图
            </button>
            <button 
              className="bg-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-400 transition-colors"
              onClick={(e) => {
                e.preventDefault();
                setModalMessage('功能开发中，敬请期待');
                setShowModal(true);
              }}
            >
              提交订单
            </button>
          </div>
        );
      case 'sub_pending_review':
        return (
          <button className="w-full bg-gray-300 text-gray-600 py-3 rounded-lg font-medium cursor-not-allowed mt-3" disabled>
            等待审核
          </button>
        );
      case 'sub_completed':
      case 'sub_rejected':
      default:
        return null;
    }
  };

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-100 px-3 pt-8">
        <div className="text-center py-20">
          <p className="text-gray-500">订单不存在</p>
          <button 
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg" 
            onClick={handleBack}
          >
            返回
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 px-3 pt-8">
      {/* 顶部返回按钮 */}
      <button 
        className="flex items-center text-blue-500 mb-4"
        onClick={handleBack}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
        返回
      </button>

      {/* 订单卡片 */}
      <div className="bg-white rounded-lg p-4 shadow-sm">
        {/* 订单头部信息 */}
        <div className="flex justify-between items-start mb-4 pb-3 border-b border-gray-100">
          <div className="flex items-center">
            <h3 className="text-sm text-black inline-block flex items-center">
              订单号：{order.orderNo}
              <button 
                className="ml-2 text-blue-500 hover:text-blue-700 transition-colors"
                onClick={() => copyOrderNo(order.orderNo)}
              >
                <svg className="w-4 h-4 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span className="text-xs inline-block">复制</span>
              </button>
            </h3>
          </div>
          <div className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${order.statusColor}`}>
            {order.statusText}
          </div>
        </div>

        {/* 订单标题和价格 */}
        <div className="mb-4">
          <div className="text-lg font-bold text-black mb-1">{order.title}</div>
          <div className="text-xl font-bold text-red-500">¥{order.price.toFixed(2)}</div>
        </div>

        {/* 任务信息区域 */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
              {getTaskTypeName(order.taskType)}
            </span>
          </div>

          {/* 时间信息 */}
          <div className="space-y-2 mb-4">
            <div className="text-sm text-black">发布时间：{order.publishTime}</div>
            {order.deadline && (
              <div className="text-sm text-black">截止时间：{order.deadline}</div>
            )}
            {order.submitTime && (
              <div className="text-sm text-black">提交时间：{order.submitTime}</div>
            )}
            {order.completedTime && (
              <div className="text-sm text-black">完成时间：{order.completedTime}</div>
            )}
          </div>

          {/* 任务要求 */}
          <div className="mb-4">
            <div className="text-sm font-medium text-black mb-2">任务要求：</div>
            <div className="text-sm text-black bg-gray-50 p-3 rounded-lg whitespace-pre-line">
              {order.taskRequirements}
            </div>
          </div>

          {/* 推荐评论区域 */}
          {order.status === 'sub_progress' && order.recommendedComment && (
            <div className="mb-4 bg-blue-50 p-3 rounded-lg border border-blue-100">
              <div className="flex justify-between items-center mb-1">
                <h4 className="text-sm font-medium text-blue-700"><EditOutlined className="inline-block mr-1" /> 推荐评论</h4>
                <button 
                  className="text-xs bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors"
                  onClick={() => handleCopyComment(order.recommendedComment)}
                >
                  <CopyOutlined className="inline-block mr-1" /> 复制评论
                </button>
              </div>
              <p className="text-sm text-black bg-white p-3 rounded border border-blue-100 whitespace-pre-line">
                {order.recommendedComment}
              </p>
            </div>
          )}

          {/* 链接区域 */}
          {order.status === 'sub_progress' && (order.requiringVideoUrl || order.requiringCommentUrl) && (
            <div className="mb-4">
              <div className="text-sm font-medium text-black mb-2">任务链接：</div>
              <div className="space-y-2">
                {order.requiringVideoUrl && (
                  <button 
                    className="w-full text-left text-sm text-blue-500 hover:text-blue-700 bg-blue-50 p-2 rounded-lg flex items-center"
                    onClick={() => handleOpenLink(order.requiringVideoUrl)}
                  >
                    <LinkOutlined className="mr-2" />
                    查看视频链接
                  </button>
                )}
                {order.requiringCommentUrl && (
                  <button 
                    className="w-full text-left text-sm text-blue-500 hover:text-blue-700 bg-blue-50 p-2 rounded-lg flex items-center"
                    onClick={() => handleOpenLink(order.requiringCommentUrl)}
                  >
                    <LinkOutlined className="mr-2" />
                    查看评论链接
                  </button>
                )}
              </div>
            </div>
          )}

          {/* 提交内容展示 */}
          {(order.submitScreenshotUrl || order.submitdvideoUrl) && (
            <div className="mb-4">
              <div className="text-sm font-medium text-black mb-2">提交内容：</div>
              <div className="space-y-2">
                {order.submitScreenshotUrl && (
                  <div className="bg-gray-50 p-2 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">提交截图：</div>
                    <img 
                      src={order.submitScreenshotUrl} 
                      alt="提交截图" 
                      className="w-full max-h-60 object-contain rounded cursor-pointer border border-gray-200" 
                      onClick={() => handleViewImage(order.submitScreenshotUrl || '')}
                    />
                  </div>
                )}
                {order.submitdvideoUrl && (
                  <button 
                    className="w-full text-left text-sm text-blue-500 hover:text-blue-700 bg-blue-50 p-2 rounded-lg flex items-center"
                    onClick={() => handleOpenLink(order.submitdvideoUrl)}
                  >
                    <LinkOutlined className="mr-2" />
                    查看提交的视频链接
                  </button>
                )}
              </div>
            </div>
          )}

          {/* 审核备注（异常订单） */}
          {order.status === 'sub_rejected' && order.reviewNote && (
            <div className="mb-4 bg-red-50 p-3 rounded-lg border border-red-100">
              <div className="text-sm font-medium text-red-700 mb-1">审核备注：</div>
              <p className="text-sm text-red-700">
                {order.reviewNote}
              </p>
            </div>
          )}

          {/* 父订单信息 */}
          <div className="pt-3 border-t border-gray-100">
            <div className="text-sm text-gray-500">
              父订单号：{order.parentOrderNo}
            </div>
          </div>
        </div>

        {/* 操作按钮 */}
        {renderActionButtons()}
      </div>

      {/* 图片查看器模态框 */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90" 
          onClick={handleCloseImageViewer}
        >
          <div className="absolute top-4 right-4 text-white">
            <button 
              className="p-2 rounded-full bg-black bg-opacity-50 hover:bg-opacity-70 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                handleCloseImageViewer();
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div 
            className="relative max-w-5xl max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <img 
              src={selectedImage} 
              alt="预览图片" 
              className="max-w-full max-h-[90vh] object-contain"
            />
          </div>
        </div>
      )}

      {/* 模态框组件 */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-lg">
            <div className="text-center">
              <div className="mb-4">
                <CheckOutlined className="text-3xl text-green-500" />
              </div>
              <p className="text-gray-700 mb-6">{modalMessage}</p>
              <button 
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                onClick={() => setShowModal(false)}
              >
                确定
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetailPage;