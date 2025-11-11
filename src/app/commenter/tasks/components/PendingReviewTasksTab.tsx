import React from 'react';
import { useRouter } from 'next/navigation';

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
          <div className="flex justify-between items-start">
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
          <div className="">
            <div className="text-sm text-black inline-block">订单单价：¥{(task.unitPrice || 0).toFixed(2)}</div>
            <div className="text-sm">
              <span>平台: {task.mainTaskPlatform || '-'}</span>
            </div>
            <div className="text-sm">
              <span>任务类型: {getTaskTypeName(task.commentType) || '-'}</span>
            </div>
            <div className="text-sm">
              <span>接受时间: {task.acceptTime || '-'}</span>
            </div>
            <div className="text-sm">
              <span>提交时间: {task.submitTime || '-'}</span>
            </div>
          </div>
          <div className="text-sm">
              要求：{task.taskRequirements || task.taskDescription || '无特殊要求'}
          </div>
  
          {/* 提交的链接显示 */}
          {task.submittedLinkUrl && (
            <div className="mb-4 mt-2 border border-blue-200 rounded-lg p-3 bg-blue-50">
              <span className="text-sm text-blue-700 mr-2">已提交的链接：</span>
              <button
                className="mt-1 bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center"
                onClick={() => task.submittedLinkUrl && window.open(task.submittedLinkUrl, '_blank')}
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                打开视频
              </button>
            </div>
          )}
          
          {/* 已上传截图显示 */}
          {task.submittedImages && (
            <div className="mb-4 border border-green-200 rounded-lg p-3 bg-green-50">
              <span className="text-sm text-green-700 block mb-2">已上传截图：</span>
              <div className="grid grid-cols-2 gap-2">
                {task.submittedImages.split(',').map((url, index) => (
                  <a
                    key={index}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block relative overflow-hidden rounded-lg border border-gray-200 hover:border-blue-400 transition-all group"
                    onClick={(e) => {
                      e.preventDefault();
                      handleViewImage(url);
                    }}
                  >
                    <img
                      src={url}
                      alt={`任务截图 ${index + 1}`}
                      className="w-full h-24 object-cover transition-transform group-hover:scale-105"
                    />
                    <span className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all">
                      <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity">查看大图</span>
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}
          
          {/* 评论内容展示 */}
          {task.firstGroupComment && (
            <div className="mb-4 border border-purple-200 rounded-lg p-3 bg-purple-50">
              <div className="flex justify-between items-start">
                <span className="text-sm text-purple-700 block">评论内容：</span>
                <button 
                  className="text-xs text-purple-500 hover:text-purple-700"
                  onClick={() => {
                    navigator.clipboard.writeText(task.firstGroupComment || '').then(() => {
                      setModalMessage('评论已复制到剪贴板');
                      setShowModal(true);
                    }).catch(err => {
                      console.error('复制失败:', err);
                      setModalMessage('复制失败，请手动复制');
                      setShowModal(true);
                    });
                  }}
                >
                  复制评论
                </button>
              </div>
              <div className="mt-1 text-sm bg-white p-2 rounded border border-purple-200 text-gray-800">
                {task.firstGroupComment}
              </div>
            </div>
          )}
          
          {/* 任务操作区 */}
          <div className="flex justify-end mt-4 gap-2">
            {task.canCancel && (
              <button 
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-1.5 px-4 rounded text-sm font-medium transition-colors"
                onClick={() => {
                  const confirmCancel = confirm('确定要取消该任务吗？取消后不可恢复。');
                  if (confirmCancel) {
                    // 这里应该调用取消任务的API
                    setModalMessage('任务已取消');
                    setShowModal(true);
                    // 重新加载任务列表
                    router.refresh();
                  }
                }}
              >
                取消任务
              </button>
            )}
            {task.canSubmit && (
              <button 
                className="bg-blue-600 hover:bg-blue-700 text-white py-1.5 px-4 rounded text-sm font-medium transition-colors"
                onClick={() => {
                  setModalMessage('任务已提交审核');
                  setShowModal(true);
                  // 模拟提交成功后跳转到审核中标签页
                  setTimeout(() => {
                    router.refresh();
                  }, 1500);
                }}
              >
                提交审核
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default PendingReviewTasksTab;