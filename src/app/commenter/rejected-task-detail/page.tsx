'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
// 图标导入已移除，因为按钮不再使用图标
import { Button, message } from 'antd';

// 定义任务详情接口
interface TaskDetail {
  id: string;
  title: string;
  price: number;
  category: string;
  status: string;
  description: string;
  deadline: string;
  requirements: string;
  publishTime: string;
  taskType: string;
  recommendedComment?: string;
  commentContent?: string;
  screenshotUrl?: string;
  orderNumber: string;
  statusText: string;
  statusColor: string;
  submitTime?: string;
  completedTime?: string;
  reviewNote?: string;
  requiringVideoUrl?: string;
  submitdvideoUrl?: string;
  submitScreenshotUrl?: string;
}

export default function RejectedTaskDetailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const taskId = searchParams?.get('id') || 'rejected-task-demo';
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGivingUp, setIsGivingUp] = useState(false);
  
  // 使用静态数据
  const [taskDetail] = useState<TaskDetail>({
    id: taskId,
    title: '抖音短视频点赞评论任务',
    price: 5.88,
    category: '短视频评论',
    status: 'sub_rejected',
    description: '这是一个抖音短视频点赞评论任务，请按照要求完成。',
    deadline: '2024-07-30 23:59:59',
    requirements: '1. 点赞视频\n2. 发表积极正面的评论\n3. 评论需包含关键词：优质内容、太精彩了\n4. 评论字数不少于10个字\n5. 完成后上传截图',
    publishTime: '2024-07-25 10:30:00',
    taskType: 'sub_task',
    recommendedComment: '这个内容真的太棒了，优质内容！制作非常用心，太精彩了，支持一下！',
    commentContent: '内容制作得很精美，支持创作者！',
    screenshotUrl: '/images/1758596791656_544.jpg',
    orderNumber: 'ORDER20240725001',
    statusText: '已驳回',
    statusColor: 'bg-red-100 text-red-600',
    submitTime: '2024-07-26 15:20:00',
    reviewNote: '评论内容不符合要求，未包含指定关键词「优质内容」和「太精彩了」。请重新提交符合要求的评论内容。'
  });

  // 联系客服功能
  const handleContactCustomerService = () => {
    message.success('正在连接客服，请稍候...');
    // 这里可以实现跳转客服聊天页面或显示客服联系方式
    setTimeout(() => {
      alert('客服热线：400-123-4567\n工作时间：9:00-21:00');
    }, 1000);
  };

  // 重新提交功能
  const handleResubmit = async () => {
    setIsSubmitting(true);
    try {
      // 模拟提交过程
      await new Promise(resolve => setTimeout(resolve, 1500));
      message.success('任务重新提交成功，等待审核！');
      // 跳转到待审核页面
      router.push('/commenter/tasks?tab=sub_pending_review');
    } catch (error) {
      message.error('重新提交失败，请稍后重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 放弃订单功能
  const handleGiveUp = async () => {
    if (!window.confirm('确定要放弃此订单吗？放弃后不可恢复。')) {
      return;
    }
    
    setIsGivingUp(true);
    try {
      // 模拟放弃过程
      await new Promise(resolve => setTimeout(resolve, 1500));
      message.success('订单已放弃');
      // 跳转到任务列表页面
      router.push('/commenter/tasks');
    } catch (error) {
      message.error('放弃订单失败，请稍后重试');
    } finally {
      setIsGivingUp(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-3">
      <div className="container mx-auto px-2 max-w-3xl">
        {/* 页面标题和返回按钮 */}
        <div className="flex items-center justify-between mb-6">
          <button 
            onClick={() => router.back()} 
            className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            返回任务列表
          </button>
         
        </div>
         <h1 className="text-xl font-semibold text-gray-800 whitespace-pre-line">异常订单详情</h1>
        

        {/* 任务状态卡片 */}
        <div className="bg-white rounded-lg shadow-sm p-3 mb-6 border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-800 truncate max-w-[70%]">{taskDetail.title}</h2>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${taskDetail.statusColor}`}>
              {taskDetail.statusText}
            </span>
          </div>
          
          <div className="space-y-2 mb-4">
            <div className="flex items-center">
              <div className="text-sm mr-1">订单号：</div>
              <div className="text-base font-medium">{taskDetail.orderNumber}</div>
            </div>
            <div className="flex items-center">
              <div className="text-sm mr-1">单价：</div>
              <div className="text-base font-medium text-red-500">¥{taskDetail.price.toFixed(2)}</div>
            </div>
            <div className="flex items-center">
              <div className="text-sm mr-1">发布时间：</div>
              <div className="text-base">{taskDetail.publishTime}</div>
            </div>
            <div className="flex items-center">
              <div className="text-sm mr-1">提交时间：</div>
              <div className="text-base">{taskDetail.submitTime}</div>
            </div>
          </div>
          
          <div className="mb-4">
            <div className="text-sm  mb-1">任务要求</div>
            <div className="bg-blue-50 p-3 rounded-md text-sm whitespace-pre-line border border-blue-500">
              {taskDetail.requirements}
            </div>
          </div>
          
          {/* 驳回原因 */}
          <div className="bg-red-50 p-4 rounded-md border border-red-100">
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-1">
                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">审核未通过</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{taskDetail.reviewNote}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 提交内容区域 */}
        <div className="bg-white rounded-lg shadow-sm p-5 mb-6">
          <h3 className="text-md font-medium text-gray-800 mb-4">提交的内容</h3>
          
          {/* 评论内容 */}
          {taskDetail.commentContent && (
            <div className="mb-4">
              <div className="text-sm  mb-1">评论内容</div>
              <div className="bg-gray-50 p-3 rounded-md text-sm">
                {taskDetail.commentContent}
              </div>
            </div>
          )}
          
          {/* 提交的截图 */}
          {taskDetail.screenshotUrl && (
            <div>
              <div className="text-sm  mb-2">提交的截图</div>
              <div className="border border-gray-200 rounded-md p-2">
                <img 
                  src={taskDetail.screenshotUrl} 
                  alt="任务截图" 
                  className="max-w-full h-auto rounded"
                />
              </div>
            </div>
          )}
        </div>

        {/* 操作按钮 */}
        <div className="rounded-lg p-2">
          <div className="flex gap-1">
            <Button 
              type="primary" 
              className="bg-blue-600 hover:bg-blue-700 text-sm"
              onClick={handleContactCustomerService}
            >
              联系客服
            </Button>
            
            <Button 
              type="primary" 
              className="bg-blue-600 hover:bg-blue-700 text-sm"
              onClick={handleResubmit}
              loading={isSubmitting}
            >
              重新提交
            </Button>
            
            <Button 
              danger 
              className=" text-sm"
              onClick={handleGiveUp}
              loading={isGivingUp}
            >
              放弃订单
            </Button>
          </div>
          
          <div className="mt-4 text-sm ">
            <p>* 重新提交将返回审核流程，审核通过后可获得任务报酬</p>
            <p>* 放弃订单将不会获得任何报酬，但不会影响您的信誉</p>
            <p>* 如有疑问，请联系客服获取帮助</p>
          </div>
        </div>
      </div>
    </div>
  );
}