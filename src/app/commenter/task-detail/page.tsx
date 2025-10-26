'use client'

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { BulbOutlined } from '@ant-design/icons';

// 定义任务详情接口
interface TaskDetail {
  id: string;
  title: string;
  price: number;
  category: string;
  status: string;
  description: string;
  deadline?: string;
  requirements: string;
  publishTime: string;
  taskType?: string;
  recommendedComment?: string;
  commentContent?: string;
  screenshotUrl?: string;
  reviewNote?: string;
  orderNumber?: string;
  statusText?: string;
  statusColor?: string;
  submitTime?: string;
  completedTime?: string;
}

export default function TaskDetailPage() {
  const router = useRouter();
  // 直接使用静态数据，不再依赖任务ID参数
  const [taskDetail] = useState<TaskDetail>({
    id: 'static-task-demo',
    title: '抖音短视频点赞评论任务',
    price: 5.88,
    category: '短视频评论',
    status: 'sub_completed',
    description: '这是一个抖音短视频点赞评论任务，请按照要求完成。',
    deadline: '2024-07-30 23:59:59',
    requirements: '1. 点赞视频\n2. 发表积极正面的评论\n3. 评论需包含关键词：优质内容、太精彩了\n4. 评论字数不少于10个字\n5. 完成后上传截图',
    publishTime: '2024-07-25 10:30:00',
    taskType: 'sub_task',
    recommendedComment: '这个内容真的太棒了，优质内容！制作非常用心，太精彩了，支持一下！',
    commentContent: '内容制作得很精美，支持创作者的优质内容，太精彩了！',
    screenshotUrl: '/images/1758596791656_544.jpg',
    orderNumber: 'ORDER20240725001',
    statusText: '已完成',
    statusColor: 'bg-green-100 text-green-600',
    submitTime: '2024-07-26 15:20:00',
    completedTime: '2024-07-27 10:00:00',
    reviewNote: '任务完成得很好，评论符合要求，截图清晰可见。'
  });
  
  // 返回任务列表
  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/commenter/tasks');
    }
  };
  
  return (
    <div className="py-10 px-4 pb-20">
      {/* 顶部返回按钮 */}
      <div className="mb-6">
        <button 
          className="flex items-center text-blue-500 hover:text-blue-700 transition-colors"
          onClick={handleBack}
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          返回任务列表
        </button>
      </div>
      
      {/* 任务详情卡片 */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        {/* 订单号和状态 */}
        <div className="flex justify-between items-start mb-6">
          <div className="text-sm text-gray-500">
            订单号：{taskDetail.orderNumber || '无'}
          </div>
          <span className={`px-3 py-1 rounded-full text-sm ${taskDetail.statusColor || 'bg-gray-100 text-gray-600'}`}>
            {taskDetail.statusText || '未知状态'}
          </span>
        </div>
        
        {/* 任务标题和价格 */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">{taskDetail.title || '未命名任务'}</h1>
          <div className="text-2xl font-bold text-orange-500">¥{(taskDetail.price || 0).toFixed(2)}</div>
        </div>
        
        {/* 任务要求 */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-700 mb-2">任务要求</h3>
          <div className="bg-gray-50 p-4 rounded-lg text-gray-700 whitespace-pre-line">
            {taskDetail.requirements || '无特殊要求'}
          </div>
        </div>
        
        {/* 推荐评论 */}
        {taskDetail.recommendedComment && (
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-700 mb-2">推荐评论</h3>
            <div className="bg-green-50 p-4 rounded-lg text-gray-700 whitespace-pre-line">
              {taskDetail.recommendedComment}
            </div>
          </div>
        )}
        
        {/* 任务描述 */}
        {taskDetail.description && (
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-700 mb-2">任务描述</h3>
            <div className="text-gray-700 whitespace-pre-line">
              {taskDetail.description}
            </div>
          </div>
        )}
        
        {/* 评论内容 */}
        {taskDetail.commentContent && (
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-700 mb-2">评论内容</h3>
            <div className="bg-blue-50 p-4 rounded-lg text-gray-700 whitespace-pre-line">
              {taskDetail.commentContent}
            </div>
          </div>
        )}
        
        {/* 截图 */}
        {taskDetail.screenshotUrl && (
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-700 mb-2">提交截图</h3>
            <div className="bg-gray-100 rounded-lg p-2">
              <img 
                src={taskDetail.screenshotUrl} 
                alt="任务完成截图" 
                className="max-w-full h-auto rounded"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/images/default-image.png';
                }}
              />
            </div>
          </div>
        )}
        
        {/* 审核备注 */}
        {taskDetail.reviewNote && (
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-700 mb-2">审核备注</h3>
            <div className="bg-yellow-50 p-4 rounded-lg text-gray-700 whitespace-pre-line">
              {taskDetail.reviewNote}
            </div>
          </div>
        )}
        
        {/* 时间信息 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {taskDetail.publishTime && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-sm text-gray-500">发布时间</div>
              <div className="text-gray-800">{taskDetail.publishTime}</div>
            </div>
          )}
          {taskDetail.deadline && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-sm text-gray-500">截止时间</div>
              <div className="text-gray-800">{taskDetail.deadline}</div>
            </div>
          )}
          {taskDetail.submitTime && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-sm text-gray-500">提交时间</div>
              <div className="text-gray-800">{taskDetail.submitTime}</div>
            </div>
          )}
          {taskDetail.completedTime && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-sm text-gray-500">完成时间</div>
              <div className="text-gray-800">{taskDetail.completedTime}</div>
            </div>
          )}
        </div>
        
        {/* 底部操作按钮 */}
        <div className="flex justify-center">
          <button 
            className="bg-blue-500 text-white py-3 px-8 rounded-lg font-medium hover:bg-blue-600 transition-colors"
            onClick={handleBack}
          >
            返回任务列表
          </button>
        </div>
      </div>
      
      {/* 任务提示 */}
      <div className="mx-auto mt-6 max-w-md bg-blue-50 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <BulbOutlined className="text-blue-500 text-xl" />
          <div>
            <h4 className="font-medium text-blue-800 mb-1">任务小贴士</h4>
            <p className="text-sm text-blue-600">
              如有疑问，请联系客服。感谢您的努力工作！
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}