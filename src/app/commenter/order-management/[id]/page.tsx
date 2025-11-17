'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';

// Define the TaskDetail interface matching the API response
export interface TaskDetail {
  id: string;
  mainTaskId: string;
  mainTaskTitle: string;
  mainTaskPlatform: string;
  workerId: string;
  workerName: string;
  agentId: string;
  agentName: string;
  commentGroup: string;
  commentType: string;
  unitPrice: number;
  userReward: number;
  agentReward: number;
  status: string;
  acceptTime: string;
  expireTime: string;
  submitTime: string;
  completeTime: string;
  settleTime: string;
  submittedImages: string;
  submittedLinkUrl: string;
  submittedComment: string;
  verificationNotes: string;
  rejectReason: string;
  cancelReason: string;
  cancelTime: string;
  releaseCount: number;
  settled: boolean;
  verifierId: string;
  verifierName: string;
  createTime: string;
  updateTime: string;
  taskDescription: string;
  taskRequirements: string;
  taskDeadline: string;
  remainingMinutes: number;
  isExpired: boolean;
  isAutoVerified: boolean;
  canSubmit: boolean;
  canCancel: boolean;
  canVerify: boolean;
  verifyResult: string;
  verifyTime: string;
  verifyComment: string;
  settlementStatus: string;
  settlementTime: string;
  settlementRemark: string;
  workerRating: number;
  workerComment: string;
  publisherRating: number;
  publisherComment: string;
  firstGroupComment: string;
  secondGroupComment: string;
  firstGroupImages: string;
  secondGroupImages: string;
}

// Define the API response interface
interface ApiResponse {
  code: number;
  message: string;
  data: {
    list: TaskDetail[];
    total: number;
    page: number;
    size: number;
    pages: number;
  };
  success: boolean;
  timestamp: number;
}

const OrderDetailPage = () => {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  // Replace mock data with API call
  const [order, setOrder] = useState<TaskDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchOrderDetails = async () => {
      try {
        // Call the API
        const response = await fetch('/api/commenter/task/myacceptedtaskslist', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ size: 100 }), // Increase size to get more tasks
        });

        if (!response.ok) {
          throw new Error('Failed to fetch order details');
        }

        const apiResponse: ApiResponse = await response.json();

        // Find the order with the matching ID
        const foundOrder = apiResponse.data.list.find((order) => order.id === id);

        if (foundOrder) {
          setOrder(foundOrder);
        } else {
          setError('Order not found');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [id]);

  // Loading state
  if (loading) {
    return <div className="container mx-auto p-4 flex justify-center items-center">Loading...</div>;
  }

  // Error state
  if (error || !order) {
    return <div className="container mx-auto p-4 text-red-500">{error || 'Order not found'}</div>;
  }

  // Render the order details using the existing UI layout
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-xl font-bold mb-4">订单详情</h1>
        {/* Continue rendering the rest of the UI using the order object's fields */}
        <div className="flex flex-wrap justify-between mb-4">
          <div className="w-full">
            <h2 className="text-lg font-semibold">{order.mainTaskTitle}</h2>
            <p className="text-sm text-gray-500">订单号: {order.id}</p>
            <p className="text-sm" style={{ color: getStatusColor(order.status) }}><strong>订单状态：</strong> {order.status || '无'}</p>
            <p className="text-sm"><strong>任务类型:</strong> {order.commentType || '未知'}</p>
            <p className="text-sm"><strong>平台:</strong> {order.mainTaskPlatform || '未知'}</p>
            <p className="text-sm"><strong>单价:</strong> ¥{order.unitPrice.toFixed(2)}</p>
            <p className="text-sm"><strong>代理人:</strong> {order.agentName || '无'}</p>            
            <p className="text-sm"><strong>发布时间:</strong> {order.createTime || ''}</p>
            <p className="text-sm"><strong>接受时间:</strong> {order.acceptTime || ''}</p>
            <p className="text-sm"><strong>截止时间:</strong> {order.expireTime || ''}</p>
            {order.completeTime && <p className="text-sm"><strong>完成时间:</strong> {order.completeTime}</p>}
          </div>
        </div>

        <div className="task-requirements mb-4">
          <h3 className="text-md font-semibold mb-2">任务描速</h3>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-sm whitespace-pre-wrap">{order.taskDescription || '默认描速'}</p>
          </div>
        </div>

        <div className="comment-content mb-4">
          <h3 className="text-md font-semibold mb-2">提交内容</h3>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-sm whitespace-pre-wrap">{order.firstGroupComment || order.secondGroupComment || '默认提交内容'}</p>
            {/* Render images if any */}
            <div className="mt-2">
              <p className="text-xs text-gray-500 mb-1">提交图片:</p>
              <div className="flex space-x-2 overflow-x-auto">
                {order.submittedImages ? (
                  order.submittedImages.split(',').map((url, index) => (
                    <img key={index} src={url} alt={`submitted-img-${index}`} className="w-20 h-20 object-cover rounded" />
                  ))
                ) : (
                  <img src="/images/1758596791656_544.jpg" alt="default-submitted-img" className="w-20 h-20 object-cover rounded" />
                )}
              </div>
            </div>
            <div className="mt-2">
              <p className="text-xs text-gray-500 mb-1">一组图片:</p>
              <div className="flex space-x-2 overflow-x-auto">
                {order.firstGroupImages ? (
                  order.firstGroupImages.split(',').map((url, index) => (
                    <img key={index} src={url} alt={`comment-img-${index}`} className="w-20 h-20 object-cover rounded" />
                  ))
                ) : (
                  <img src="/images/1758596791656_544.jpg" alt="default-first-group-img" className="w-20 h-20 object-cover rounded" />
                )}
              </div>
            </div>
            <div className="mt-2">
              <p className="text-xs text-gray-500 mb-1">二组图片:</p>
              <div className="flex space-x-2 overflow-x-auto">
                {order.secondGroupImages ? (
                  order.secondGroupImages.split(',').map((url, index) => (
                    <img key={index} src={url} alt={`second-comment-img-${index}`} className="w-20 h-20 object-cover rounded" />
                  ))
                ) : (
                  <img src="/images/1758596791656_544.jpg" alt="default-second-group-img" className="w-20 h-20 object-cover rounded" />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Verification result */}
        {order.verifyResult && (
          <div className="verification-result mb-4">
            <h3 className="text-md font-semibold mb-2">审核结果</h3>
            <div className={`rounded-lg p-3 ${order.verifyResult === '通过' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              <p className="text-sm"><strong>结果:</strong> {order.verifyResult}</p>
              {order.verifyComment && <p className="text-sm mt-1"><strong>备注:</strong> {order.verifyComment}</p>}
              {order.rejectReason && <p className="text-sm mt-1"><strong>拒绝原因:</strong> {order.rejectReason}</p>}
            </div>
          </div>
        )}

    </div>
  );
};

// Helper function to get status color
const getStatusColor = (status: string): string => {
  switch (status) {
    case 'COMPLETED':
    case '已完成':
      return '#52c41a';
    case 'PENDING':
    case '待处理':
      return '#1890ff';
    case 'REJECTED':
    case '已拒绝':
      return '#ff4d4f';
    case 'SUBMITTED':
    case '已提交':
      return '#faad14';
    default:
      return '#8c8c8c';
  }
};

export default OrderDetailPage;