import React from 'react';
import { useRouter } from 'next/navigation';

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

interface PendingReviewTasksTabProps {
  tasks: Task[];
  handleViewDetails: (taskId: string) => void;
  handleViewImage: (imageUrl: string) => void;
  getTaskTypeName: (taskType?: string) => string;
  isLoading: boolean;
  fetchUserTasks: () => void;
  setModalMessage: (message: string) => void;
  setShowModal: (show: boolean) => void;
}

const PendingReviewTasksTab: React.FC<PendingReviewTasksTabProps> = ({
  tasks,
  handleViewDetails,
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
        <div key={task.id || 'unknown'} className="rounded-lg p-4 mb-4 shadow-sm transition-all hover:shadow-md bg-white">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-sm text-black inline-block flex items-center">
              订单号：{task.subOrderNumber || task.orderNumber || '未命名任务'}
              <button 
                className="ml-2 text-blue-500 hover:text-blue-700 transition-colors"
                onClick={() => {
                  const orderNumber = task.subOrderNumber || task.orderNumber;
                  if (orderNumber) {
                    navigator.clipboard.writeText(orderNumber).then(() => {
                      // 使用模态框显示复制成功提示，而不是alert
                      setModalMessage('订单号已复制到剪贴板');
                      setShowModal(true);
                    }).catch(err => {
                      console.error('复制失败:', err);
                      // 使用模态框显示错误提示
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
          
          {/* 价格和任务信息区域 - 显示单价、任务状态和发布时间 */}
          <div className="mb-2">
            <div className="text-sm text-black mb-1 inline-block">订单单价：¥{(task.unitPrice || task.price || 0).toFixed(2)}</div>
            <div className="space-y-2 mb-2">
              <div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-600 mr-2">
                 {task.statusText || '待审核'}
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                 {getTaskTypeName(task.taskType) || '评论'}
                </span>
              </div>
              <div className="text-sm text-black block mb-2">
                发布时间：{task.publishTime || '未知时间'}
              </div>
            </div>
                {/* 提交时间 */}
                {task.submitTime && (
                  <div className="text-sm text-black block">
                    提交时间：{task.submitTime}
                  </div>
                )}
          </div>
          
          <div className="text-sm text-black mb-2 overflow-hidden text-ellipsis whitespace-normal max-h-[72px] line-clamp-3">
            要求：{task.requirements || '无特殊要求'}
          </div>
          

          

          
          {/* 打开视频按钮 */}
          {task.submitdvideoUrl && (
            <div className="mb-4 border border-blue-200 rounded-lg p-3 bg-blue-50">
              <span className="text-sm text-blue-700 mr-2">任务视频点击进入：</span>
              <button 
                className="bg-blue-600 mt-1 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center"
                onClick={() => window.open(task.submitdvideoUrl, '_blank')}
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                打开视频
              </button>
            </div>
          )}
          
          {/* 截图显示区域 - 自适应高度，居中显示 */}
          <div className="mb-4 border border-blue-200 rounded-lg p-3 bg-blue-50">
            <div className='text-sm text-blue-500 pl-2 py-2'>完成任务截图上传：</div>
            <div 
              className={`w-[130px] h-[130px] relative cursor-pointer overflow-hidden rounded-lg border border-gray-300 bg-gray-50 transition-colors hover:border-blue-400 ${task.screenshotUrl ? 'hover:shadow-md' : ''} flex items-center justify-center`}
              onClick={() => task.submitScreenshotUrl && handleViewImage(task.submitScreenshotUrl)}
            >
              {task.submitScreenshotUrl ? (
                <>
                  <img 
                    src={task.submitScreenshotUrl} 
                    alt="任务截图" 
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 flex items-center justify-center transition-all">
                    <span className="text-blue-500 text-lg opacity-0 hover:opacity-100 transition-opacity">点击放大</span>
                  </div>
                </>
              ) : (
                <div className="w-full h-24 flex flex-col items-center justify-center text-gray-400">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-xs">未上传截图</span>
                </div>
              )}
            </div>
            <p className="text-xs text-blue-500 mt-1 pl-2">
              点击可放大查看截图
            </p>
          </div>
          
          {/* 移除查看详情按钮 */}
        </div>
      ))}
    </div>
  );
};

export default PendingReviewTasksTab;