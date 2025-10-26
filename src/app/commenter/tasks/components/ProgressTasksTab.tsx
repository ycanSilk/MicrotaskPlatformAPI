import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { EditOutlined, CopyOutlined, LinkOutlined } from '@ant-design/icons';

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

export type TaskStatus = 'sub_progress' | 'sub_completed' | 'sub_pending_review' | 'waiting_collect';

interface ProgressTasksTabProps {
  tasks: Task[];
  uploadStatus: Record<string, string>;
  linkUploadStatus: Record<string, string>;
  isSubmitting: boolean;
  isLoading: boolean;
  handleCopyComment: (taskId: string, comment?: string) => void;
  handleUploadScreenshot: (taskId: string) => void;
  handleUploadLink: (taskId: string, reviewLink?: string) => Promise<void>;
  handleSubmitOrder: (taskId: string) => void;
  handleViewDetails: (taskId: string) => void;
  handleViewImage: (imageUrl: string) => void;
  handleRemoveImage: (taskId: string) => void;
  getTaskTypeName: (taskType?: string) => string;
  fetchUserTasks: () => void;
  setModalMessage: (message: string) => void;
  setShowModal: (show: boolean) => void;
}

const ProgressTasksTab: React.FC<ProgressTasksTabProps> = ({
  tasks,
  uploadStatus,
  linkUploadStatus,
  isSubmitting,
  isLoading,
  handleCopyComment,
  handleUploadScreenshot,
  handleUploadLink,
  handleSubmitOrder,
  handleViewDetails,
  handleViewImage,
  handleRemoveImage,
  getTaskTypeName,
  fetchUserTasks,
  setModalMessage,
  setShowModal
}) => {
  const router = useRouter();
  const [reviewLinks, setReviewLinks] = useState<Record<string, string>>({});

  // 处理评论链接输入变化
  const handleReviewLinkChange = (taskId: string, value: string) => {
    setReviewLinks(prev => ({ ...prev, [taskId]: value }));
  };

  // 提交订单时同时提交评论链接
  const handleSubmitOrderWithLink = async (taskId: string) => {
    const reviewLink = reviewLinks[taskId];
    if (reviewLink) {
      // 先上传链接
      await handleUploadLink(taskId, reviewLink);
    }
    // 然后提交订单
    handleSubmitOrder(taskId);
  };

  // 获取任务操作按钮组
  const getTaskButtons = (task: Task) => {
    return (
      <div className="flex space-x-2">
        <button 
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${ 
            uploadStatus[task.id] === 'compressing' || uploadStatus[task.id] === 'uploading' 
              ? 'bg-gray-400 text-white cursor-not-allowed' 
              : uploadStatus[task.id] === 'success' 
                ? 'bg-green-500 text-white' 
                : uploadStatus[task.id] === 'error' 
                  ? 'bg-red-500 text-white' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
          onClick={() => handleUploadScreenshot(task.id)}
          disabled={uploadStatus[task.id] === 'compressing' || uploadStatus[task.id] === 'uploading'}
        >
          {uploadStatus[task.id] === 'compressing' ? '压缩中...' : uploadStatus[task.id] === 'uploading' ? '上传中...' : '上传截图'}
        </button>
        <button 
          className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          onClick={() => handleSubmitOrderWithLink(task.id)}
          disabled={isSubmitting || !task.screenshotUrl}
        >
          提交订单
        </button>
      </div>
    );
  }

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
              <div className="space-y-2 mb-1">
                <div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 mr-2">
                    {task.statusText || '进行中'}
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                    {getTaskTypeName(task.taskType) || '评论'}
                  </span>
                </div>
                <div className="text-sm text-black block">
                  {task.publishTime || '未知时间'}
                </div>  
                {/* 时间信息 */}
                {task.deadline && (
                  <div className="text-sm text-black block">
                    截止时间：{task.deadline}
                  </div>
                )}
              </div>
          </div>
          
         

          <div className="text-sm text-black mb-2 overflow-hidden text-ellipsis whitespace-normal max-h-[72px] line-clamp-3 block">
            要求：{task.requirements || '无特殊要求'}
          </div>
          
          {/* 推荐评论区域 - 所有任务都显示 */}
        <div className="mb-4 bg-blue-50 p-3 rounded-lg border border-blue-100">
          <div className="flex justify-between items-center mb-1">
            <h4 className="text-sm font-medium text-blue-700"><EditOutlined className="inline-block mr-1" /> 推荐评论</h4>
            <button 
              className="text-xs bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors"
              onClick={() => handleCopyComment(task.id, task.recommendedComment)}
            >
              <CopyOutlined className="inline-block mr-1" /> 复制评论
            </button>
          </div>
          <p className="text-sm text-black bg-white p-3 rounded border border-blue-100 overflow-hidden text-ellipsis whitespace-normal max-h-[72px] line-clamp-3">
            {task.recommendedComment || '暂无推荐评论内容，请根据任务要求自行撰写。'}
          </p>
        </div>
     
          {/* 打开视频按钮 */}
          {task.requiringVideoUrl && (
            <div className="mb-4 border border-blue-200 rounded-lg p-3 bg-blue-50">
              <span className="text-sm text-blue-700 mr-2">任务视频点击进入：</span>
              <button 
                className="mt-1 bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center"
                onClick={() => window.open(task.requiringVideoUrl, '_blank')}
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                打开视频
              </button>
            </div>
          )}
          
          
          
      

      {/* 评论链接输入框 - 新增 */}
      <div className="mb-4 border border-blue-200 rounded-lg p-3 bg-blue-50">
        <label className="block text-sm font-medium mb-1 text-blue-700">
          <LinkOutlined className="inline-block mr-1" /> 完成任务评论的链接输入:
        </label>
        <input
          type="text"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          placeholder="完成任务评论的链接输入"
          value={reviewLinks[task.id] || task.submitdvideoUrl || ''}
          onChange={(e) => handleReviewLinkChange(task.id, e.target.value)}
        />
        {linkUploadStatus[task.id] === 'uploading' && (
          <div className="mt-1 text-xs text-black">链接上传中...</div>
        )}
        {linkUploadStatus[task.id] === 'success' && (
          <div className="mt-1 text-xs text-green-600">链接上传成功</div>
        )}
        {linkUploadStatus[task.id] === 'error' && (
          <div className="mt-1 text-xs text-red-600">链接上传失败</div>
        )}
      </div>

          {/* 截图显示区域 - 自适应高度，居中显示 */}
          <div className="mb-4 border border-blue-200 rounded-lg p-3 bg-blue-50">
            <div className='text-sm text-blue-500 pl-2 py-2'>完成任务截图上传：</div>
            <div 
              className={`w-[130px] h-[130px] relative cursor-pointer overflow-hidden rounded-lg border border-gray-300 bg-gray-50 transition-colors hover:border-blue-400 ${task.screenshotUrl ? 'hover:shadow-md' : ''} flex items-center justify-center`}
              onClick={() => task.screenshotUrl && handleViewImage(task.screenshotUrl)}
            >
              {task.screenshotUrl ? (
                <>
                  <img 
                    src={task.screenshotUrl} 
                    alt="任务截图" 
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 flex items-center justify-center transition-all">
                    <span className="text-blue-500 text-lg opacity-0 hover:opacity-100 transition-opacity">点击放大</span>
                  </div>
                  {/* 删除按钮 */}
                  <button
                    className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors z-10"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveImage(task.id);
                    }}
                  >
                    X
                  </button>
                </>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-xs">未上传截图</span>
                </div>
              )}
            </div>
            <p className="text-xs text-blue-500 mt-1 pl-2">
              {task.screenshotUrl ? '已上传截图，点击可放大查看' : '点击上传按钮上传图片'}
            </p>
          </div>
          
          {/* 添加防御性编程，确保即使task有问题也不会导致运行时错误 */}
          {task && typeof getTaskButtons === 'function' && getTaskButtons(task)}
        </div>
      ))}
    </div>
  );
}

export default ProgressTasksTab;