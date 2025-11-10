import React from 'react';
import { useRouter } from 'next/navigation';
import { MessageOutlined } from '@ant-design/icons';

// 定义任务接口
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
  submitScreenshotUrl?: string;
  subOrderNumber?: string;
  orderNumber?: string;
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
            <div className="text-sm text-black mb-1 inline-block">订单单价：¥{(task.unitPrice || 0).toFixed(2)}</div>
            <div className="space-y-2">
              <div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 mr-2">
                  {task.statusText || '已驳回'}
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                  {getTaskTypeName(task.commentType)}
                </span>
              </div>
              <div className="text-xs text-gray-500 flex items-center justify-between">
                <span>平台: -</span>
                <span>接受时间: -</span>
              </div>
              <div className="text-xs text-gray-500 flex items-center justify-between mt-1">
                <span>评论类型: {getTaskTypeName(task.commentType)}</span>
                <span>提交时间: {task.submitTime || '-'}</span>
              </div>
            </div>
          </div>

          <div className="text-sm mb-2 overflow-hidden text-ellipsis whitespace-normal max-h-[72px] line-clamp-3">
            要求：{task.taskRequirements || '无特殊要求'}
          </div>
          
          {/* 驳回原因 */}
          {/* <div className="mb-4 border border-red-200 rounded-lg p-3 bg-red-50">
            <div className="text-sm text-red-700 block mb-2">驳回原因：</div>
            <div className="text-sm bg-white p-2 rounded border border-red-200 text-gray-800">
              任务已被驳回，请重新提交
            </div>
            <div className="text-xs text-red-500 mt-1 pl-2">
              请修改任务内容后重新提交
            </div>
          </div> */}
          
          {/* 截图显示区域 */}
          <div className="mb-4 border border-gray-200 rounded-lg p-3 bg-white">
            <div className="text-sm text-gray-700 mb-2">已上传截图：</div>
            <div className="grid grid-cols-2 gap-2">
              {(task.submitScreenshotUrl || task.screenshotUrl) && (
                <a
                  href={task.submitScreenshotUrl || task.screenshotUrl || ''}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block relative overflow-hidden rounded-lg border border-gray-200 hover:border-blue-400 transition-all group"
                  onClick={(e) => {
                    e.preventDefault();
                    const url = task.submitScreenshotUrl || task.screenshotUrl;
                    url && handleViewImage(url);
                  }}
                >
                  <img
                    src={task.submitScreenshotUrl || task.screenshotUrl}
                    alt="任务截图"
                    className="w-full h-24 object-cover transition-transform group-hover:scale-105"
                  />
                  <span className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all">
                    <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity">查看大图</span>
                  </span>
                </a>
              )}
              {!(task.submitScreenshotUrl || task.screenshotUrl) && (
                <div className="w-full h-24 flex items-center justify-center text-gray-400 bg-gray-50 border border-dashed border-gray-300 rounded-lg">
                  <span className="text-sm ml-1">未上传截图</span>
                </div>
              )}
            </div>
          </div>
          
          {/* 任务操作区 */}
          <div className="flex justify-end mt-4 gap-2">
            {/* {task.canCancel && (
              <button 
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-1.5 px-4 rounded text-sm font-medium transition-colors"
                onClick={() => {
                  const confirmCancel = confirm('确定要放弃该任务吗？放弃后不可恢复。');
                  if (confirmCancel) {
                    // 这里应该调用放弃任务的API
                    setModalMessage('任务已放弃');
                    setShowModal(true);
                    // 重新加载任务列表
                    router.refresh();
                  }
                }}
              >
                放弃任务
              </button>
            )} */}
            <button 
              className="bg-blue-600 hover:bg-blue-700 text-white py-1.5 px-4 rounded text-sm font-medium transition-colors"
              onClick={() => {
                // 跳转到任务详情页进行修改
                router.push(`/commenter/task-detail/${task.id}`);
              }}
            >
              修改并重新提交
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RejectedTasksTab;