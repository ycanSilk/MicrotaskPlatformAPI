import React from 'react';
import { useRouter } from 'next/navigation';
import { MessageOutlined } from '@ant-design/icons';

// 定义任务接口
export interface Task {
  id: string;
  parentId?: string;
  title?: string;
  price?: number;
  unitPrice?: number;
  status: string;
  statusText?: string;
  statusColor?: string;
  description?: string;
  deadline?: string;
  progress?: number;
  submitTime?: string;
  completedTime?: string;
  reviewNote?: string;
  requirements: string;
  publishTime: string;
  videoUrl?: string;
  mention?: string;
  screenshotUrl?: string;
  recommendedComment?: string;
  commentContent?: string;
  subOrderNumber?: string;
  orderNumber?: string;
  taskType?: string;
  requiringVideoUrl?: string;
  submitdvideoUrl?: string;
  submitScreenshotUrl?: string;
  requiringCommentUrl?: string;
}

interface RejectedTasksTabProps {
  tasks: Task[];
  handleViewImage: (imageUrl: string) => void;
  getTaskTypeName: (taskType?: string) => string;
  isLoading: boolean;
  fetchUserTasks: () => void;
  setModalMessage: (message: string) => void;
  setShowModal: (show: boolean) => void;
}

const RejectedTasksTab: React.FC<RejectedTasksTabProps> = ({
  tasks,
  handleViewImage,
  getTaskTypeName,
  isLoading,
  fetchUserTasks,
  setModalMessage,
  setShowModal
}) => {
  const router = useRouter();

  return (
    <div className="mt-6">
      {tasks.map((task) => (
        <div key={task.id || 'unknown'} className="rounded-lg p-4 mb-4 shadow-sm transition-all hover:shadow-md bg-white border border-red-100">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-sm text-black inline-block flex items-center">
              订单号：{task.subOrderNumber || task.orderNumber || '未命名任务'}
              <button 
                className="ml-2 text-blue-500 hover:text-blue-700 transition-colors"
                onClick={() => {
                  const orderNumber = task.subOrderNumber || task.orderNumber;
                  if (orderNumber) {
                    navigator.clipboard.writeText(orderNumber).then(() => {
                      setModalMessage('订单号已复制到剪贴板');
                      setShowModal(true);
                    }).catch(err => {
                      console.error('复制失败:', err);
                      setModalMessage('复制失败，请手动复制');
                      setShowModal(true);
                    });
                  }
                }}
              >
                <svg className="w-4 h-4 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span className="text-xs inline-block">复制</span>
              </button>
            </h3>
          </div>
          
          {/* 价格和任务信息区域 */}
          <div className="mb-2">
            <div className="text-sm text-black mb-1 inline-block">订单单价：¥{(task.unitPrice || task.price || 0).toFixed(2)}</div>
            <div className="space-y-2">
              <div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 mr-2">
                  {task.statusText || '已驳回'}
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                  {getTaskTypeName(task.taskType) || '评论'}
                </span>
              </div>
              <div className="text-sm text-black block">
                发布时间：{task.publishTime || '未知时间'}
              </div>
              {task.submitTime && (
              <div className="text-sm text-black block  mt-2">
                  提交时间：{task.submitTime}
              </div>
              )}
            </div>
          </div>

          <div className="text-sm mb-2 overflow-hidden text-ellipsis whitespace-normal max-h-[72px] line-clamp-3">
            要求：{task.requirements || '无特殊要求'}
          </div>
          
          {/* 审核意见区域 - 异常订单必须显示审核意见 */}
          <div className="mb-4 bg-red-50 p-3 rounded-lg border border-red-100">
            <h4 className="text-sm font-medium text-red-700 mb-1"><MessageOutlined className="inline-block mr-1" /> 驳回原因</h4>
            <p className="text-sm text-gray-700 bg-white p-3 rounded border border-red-100 overflow-hidden text-ellipsis whitespace-normal max-h-[72px] line-clamp-3">
              {task.reviewNote || '暂无驳回原因'}
            </p>
          </div>
          
          {/* 截图显示区域 */}
          {task.submitScreenshotUrl && (
            <div className="mb-4 border border-blue-200 rounded-lg p-3 bg-blue-50">
              <div className='text-sm text-blue-500 pl-2 py-2'>提交的任务截图：</div>
              <div 
                className={`w-[130px] h-[130px] relative cursor-pointer overflow-hidden rounded-lg border border-gray-300 bg-gray-50 transition-colors hover:border-blue-400 ${task.submitScreenshotUrl ? 'hover:shadow-md' : ''} flex items-center justify-center`}
                onClick={() => task.submitScreenshotUrl && handleViewImage(task.submitScreenshotUrl)}
              >
                <img 
                  src={task.submitScreenshotUrl} 
                  alt="任务截图" 
                  className="w-full h-full object-contain"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 flex items-center justify-center transition-all">
                  <span className="text-blue-500 text-lg opacity-0 hover:opacity-100 transition-opacity">点击放大</span>
                </div>
              </div>
              <p className="text-xs text-blue-500 mt-1 pl-2">
                点击可放大查看截图
              </p>
            </div>
          )}
          
          {/* 查看详情按钮 */}
          <div className="flex space-x-2">
            <button 
              className="flex-1 bg-red-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
              onClick={() => router.push(`/commenter/rejected-task-detail?id=${task.id}`)}
            >
              异常处理
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RejectedTasksTab;