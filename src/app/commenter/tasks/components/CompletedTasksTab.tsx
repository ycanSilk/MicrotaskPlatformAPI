import React from 'react';
import { useRouter } from 'next/navigation';
import { MessageOutlined } from '@ant-design/icons';

// 定义后端返回的任务接口
export interface Task {
  id: string;
  mainTaskId: string;
  mainTaskTitle: string;
  mainTaskPlatform: string;
  workerId: string;
  workerName: string | null;
  agentId: string | null;
  agentName: string | null;
  commentGroup: string;
  commentType: string;
  unitPrice: number;
  userReward: number;
  agentReward: number;
  status: string;
  acceptTime: string;
  expireTime: string;
  submitTime: string | null;
  completeTime: string | null;
  settleTime: string | null;
  submittedImages: string | null;
  submittedLinkUrl: string | null;
  submittedComment: string | null;
  verificationNotes: string | null;
  rejectReason: string | null;
  cancelReason: string | null;
  cancelTime: string | null;
  releaseCount: number;
  settled: boolean;
  verifierId: string | null;
  verifierName: string | null;
  createTime: string;
  updateTime: string;
  taskDescription: string | null;
  taskRequirements: string | null;
  taskDeadline: string | null;
  remainingMinutes: number | null;
  isExpired: boolean | null;
  isAutoVerified: boolean | null;
  canSubmit: boolean | null;
  canCancel: boolean | null;
  canVerify: boolean | null;
  verifyResult: string | null;
  verifyTime: string | null;
  verifyComment: string | null;
  settlementStatus: string | null;
  settlementTime: string | null;
  settlementRemark: string | null;
  workerRating: number | null;
  workerComment: string | null;
  publisherRating: number | null;
  publisherComment: string | null;
  firstGroupComment: string | null;
  secondGroupComment: string | null;
  firstGroupImages: string | null;
  secondGroupImages: string | null;
  
  // 前端需要的额外字段
  statusText?: string;
  statusColor?: string;
  screenshotUrl?: string;
}

interface CompletedTasksTabProps {
  tasks: Task[];
  handleViewImage: (imageUrl: string) => void;
  getTaskTypeName: (taskType?: string) => string;
  isLoading: boolean;
  fetchUserTasks: () => void;
  setModalMessage: (message: string) => void;
  setShowModal: (show: boolean) => void;
}

const CompletedTasksTab: React.FC<CompletedTasksTabProps> = ({
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
        <div key={task.id || 'unknown'} className="rounded-lg p-4 mb-4 shadow-sm transition-all hover:shadow-md bg-white">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-sm text-black inline-block flex items-center">
              任务标题：{task.mainTaskTitle || '未命名任务'}
              <button 
                className="ml-2 text-blue-500 hover:text-blue-700 transition-colors"
                onClick={() => {
                  navigator.clipboard.writeText(task.id).then(() => {
                    // 使用模态框显示复制成功提示
                    setModalMessage('任务ID已复制到剪贴板');
                    setShowModal(true);
                  }).catch(err => {
                    console.error('复制失败:', err);
                    setModalMessage('复制失败，请手动复制');
                    setShowModal(true);
                  });
                }}
              >
                <svg className="w-4 h-4 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span className="text-xs inline-block">复制任务ID</span>
              </button>
            </h3>
          </div>
          
          {/* 价格和任务信息区域 - 显示单价、任务状态和发布时间 */}
          <div className="mb-2">
            <div className="text-sm text-black mb-1 inline-block">订单单价：¥{(task.unitPrice || 0).toFixed(2)}</div>
            <div className="space-y-2">
              <div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 mr-2">
                  {task.statusText || '已完成'}
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                  {getTaskTypeName(task.commentType) || '评论'}
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 ml-2">
                  {task.mainTaskPlatform || '抖音'}
                </span>
              </div>
              <div className="text-sm text-black block">
                接受时间：{task.acceptTime}
              </div>
              {/* 完成时间 */}
              {task.completeTime && (
              <div className="text-sm text-black block  mt-2">
                  完成时间：{task.completeTime}
              </div>
              )}
            </div>
               
          </div>

          <div className="text-sm text-black mb-2 overflow-hidden text-ellipsis whitespace-normal max-h-[72px] line-clamp-3 block">
              要求：{task.taskRequirements || task.taskDescription || '无特殊要求'}
            </div>
          

          
          {/* 打开视频/链接按钮 */}
          {task.submittedLinkUrl && (
            <div className="mb-4 border border-blue-200 rounded-lg p-3 bg-blue-50">
              <span className="text-sm text-blue-700 mr-2">任务链接点击进入：</span>
              <button
                className="bg-blue-600 mt-1 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center"
                onClick={() => task.submittedLinkUrl && window.open(task.submittedLinkUrl, '_blank')}
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                打开链接
              </button>
            </div>
          )}
          
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
          
          {/* 审核意见区域 - 如果有审核意见，显示橙色背景的审核意见卡片 */}
          {task.verificationNotes && (
            <div className="mb-4 bg-orange-50 p-3 rounded-lg border border-orange-100">
              <h4 className="text-sm font-medium text-orange-700 mb-1"><MessageOutlined className="inline-block mr-1" /> 审核意见</h4>
              <p className="text-sm text-gray-700 bg-white p-3 rounded border border-orange-100 overflow-hidden text-ellipsis whitespace-normal max-h-[72px] line-clamp-3">
                {task.verificationNotes || task.verifyComment || '暂无审核意见'}
              </p>
            </div>
          )}
          
          {/* 查看详情按钮 */}
          <div className="flex space-x-2">
            <button 
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              onClick={() => router.push(`/commenter/task-detail`)}
            >
              查看详情
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CompletedTasksTab;