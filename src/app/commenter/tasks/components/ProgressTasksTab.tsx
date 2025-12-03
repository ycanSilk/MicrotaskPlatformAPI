import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { EditOutlined, CopyOutlined, LinkOutlined } from '@ant-design/icons';

// 定义表单提交数据类型
interface SubmitFormData {
  subtaskId: string;
  submittedLinkUrl: string;
  submittedImages: string;
  submittedComment?: string;
}

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
  status: string; // 后端状态
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
  
  // 前端需要的字段
  screenshotUrl?: string;
}

export type TaskStatus = 'sub_progress' | 'sub_completed' | 'SUBMITTED' | 'waiting_collect' | 'sub_rejected';

interface ProgressTasksTabProps {
  tasks: Task[];
  handleViewImage: (imageUrl: string) => void;
  fetchUserTasks: () => Promise<void>;
  setModalMessage: (message: string) => void;
  setShowModal: (show: boolean) => void;
  handleCopyComment?: (taskId: string, comment?: string) => void;
  handleUploadScreenshot?: (taskId: string) => void;
  handleRemoveImage?: (taskId: string) => void;
  handleSubmitOrder?: (taskId: string) => void;
  isSubmitting?: boolean;
  uploadStatus?: Record<string, 'compressing' | 'uploading' | 'success' | 'error'>;
}

const ProgressTasksTab: React.FC<ProgressTasksTabProps> = ({ tasks, handleViewImage, fetchUserTasks, setModalMessage, setShowModal, handleCopyComment, handleUploadScreenshot, handleRemoveImage, handleSubmitOrder, isSubmitting }) => {
    // 组件内部状态管理
    const [reviewLinks, setReviewLinks] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
    // 视频模态框状态
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentVideoUrl, setCurrentVideoUrl] = useState('');
    const [currentComment, setCurrentComment] = useState('');
  // modal相关状态通过props传入，无需在组件内部重复声明
    
  // 处理评论链接输入变化
  const handleReviewLinkChange = (taskId: string, value: string) => {
    setReviewLinks(prev => ({ ...prev, [taskId]: value }));
    // 清除相关错误提示
    if (errors[taskId]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[taskId];
        return newErrors;
      });
    }
  };
  
  // 处理取消任务
  const handleCancelTask = async (taskId: string) => {
    if (confirm('确定要取消此任务吗？')) {
      setIsLoading(true);
      try {
        // 调用取消任务的API
        const response = await fetch('/api/commenter/task/canceltask', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ taskId }),
        });
        
        const data = await response.json();
        if (data.success || data.status === 'success') {
          setModalMessage('任务取消成功');
          setShowModal(true);
          // 通过props传入的函数刷新任务列表
          await fetchUserTasks();
        } else {
          setModalMessage(`取消失败: ${data.message || '未知错误'}`);
          setShowModal(true);
        }
      } catch (error) {
        console.error('取消任务出错:', error);
        setModalMessage('取消任务时发生错误，请稍后重试');
        setShowModal(true);
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  // 获取任务类型名称
  const getTaskTypeName = (commentType?: string): string => {
    const typeMap: Record<string, string> = {
      'video_comment': '视频评论',
      'article_comment': '文章评论',
      'product_review': '商品评价',
    };
    return typeMap[commentType || ''] || '评论';
  };

    // 图片上传功能
    const uploadImage = async (taskId: string, file: File): Promise<string> => {
      return new Promise((resolve, reject) => {
        // 检查文件类型
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
          reject(new Error('不支持的图片格式，请上传JPG、PNG、GIF或WebP格式的图片'));
          return;
        }
        
        // 检查文件大小（限制为5MB）
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
          reject(new Error('图片文件过大，请上传小于5MB的图片'));
          return;
        }
        
        // 创建FormData对象
        const formData = new FormData();
        formData.append('image', file);
        formData.append('taskId', taskId);
        
        // 创建XMLHttpRequest以支持进度监控
        const xhr = new XMLHttpRequest();
        
        // 监听上传进度
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const percentComplete = Math.round((event.loaded / event.total) * 100);
            setUploadProgress(prev => ({ ...prev, [taskId]: percentComplete }));
          }
        });
        
        // 处理完成事件
        xhr.addEventListener('load', () => {
          setUploadProgress(prev => ({ ...prev, [taskId]: 100 }));
          if (xhr.status === 200) {
            try {
              const response = JSON.parse(xhr.responseText);
              if (response.success && response.data && response.data.imageUrl) {
                resolve(response.data.imageUrl);
              } else {
                reject(new Error(response.message || '图片上传失败'));
              }
            } catch (error) {
              reject(new Error('图片上传响应解析失败'));
            }
          } else {
            reject(new Error(`图片上传失败: HTTP ${xhr.status}`));
          }
        });
        
        // 处理错误事件
        xhr.addEventListener('error', () => {
          reject(new Error('网络错误，图片上传失败'));
        });
        
        // 发送请求
        xhr.open('POST', '/api/upload/image');
        xhr.send(formData);
      });
    };
    
    // 表单验证和提交处理
    const handleSubmitOrderForm = async (task: Task) => {
      // 清除之前的错误
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[task.id];
        return newErrors;
      });
      
      // 表单验证
      const videoUrl = reviewLinks[task.id] || task.submittedLinkUrl || '';
      const imageUrl = task.screenshotUrl || task.submittedImages;
      
      // 验证task.id是否存在
      if (!task.id) {
        setModalMessage('任务ID无效，无法提交');
        setShowModal(true);
        return;
      }
      
      // 验证图片URL不能为空
      if (!imageUrl) {
        setErrors(prev => ({ ...prev, [task.id]: '请上传任务截图' }));
        setModalMessage('请上传任务截图');
        setShowModal(true);
        return;
      }
      
      try {
        setIsLoading(true);
        // 不需要设置taskId，直接使用isLoading状态控制按钮文本
        
        // 构建请求数据
        const formData: SubmitFormData = {
          subtaskId: task.id,
          submittedLinkUrl: videoUrl,
          submittedImages: imageUrl,
          submittedComment: task.firstGroupComment || task.secondGroupComment || task.submittedComment || ''
        };
        
        console.log('提交订单数据:', formData);
        
        // 调用后端API
        const response = await fetch('/api/commenter/task/submittask', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        // 处理API响应
        if (response.ok && (data.success || data.status === 'success')) {
          setModalMessage('任务提交成功');
          setShowModal(true);
          // 刷新任务列表 - 使用传入的fetchUserTasks回调
          fetchUserTasks && fetchUserTasks();
        } else {
          setModalMessage(data.message || '任务提交失败');
          setShowModal(true);
          console.log('提交订单失败:', data);
        }
      } catch (error) {
        console.error('提交订单失败:', error);
        setModalMessage(error instanceof Error ? error.message : '网络错误，请检查网络连接后重试');
        setShowModal(true);
      } finally {
        setIsLoading(false);
        // 已移除对uploadProgress.taskId的管理
      }
    };
    
  return (
    <div className="mt-6">
      {/* 加载状态显示 */}
      {isLoading && (
        <div className="flex justify-center items-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-blue-600">加载中...</span>
        </div>
      )}

      {/* 错误状态显示 */}
      {!isLoading && tasks.length === 0 && (
        <div className="text-center py-10 bg-gray-50 rounded-lg">
          <svg className="w-16 h-16 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="mt-4 text-gray-500">暂无进行中的任务</p>
          <button 
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 transition-colors"
            onClick={fetchUserTasks}
          >
            刷新任务列表
          </button>
        </div>
      )}

      {/* 任务列表 */}
      {!isLoading && tasks.length > 0 && tasks.map((task) => (
        <div key={task.id || 'unknown'} className="rounded-lg p-4 mb-4 shadow-sm transition-all hover:shadow-md bg-white">
          {/* 添加任务操作按钮组 */}
          {task.canCancel && (
            <button
              className="text-xs bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-colors mb-2"
              onClick={() => handleCancelTask(task.id)}
              disabled={isSubmitting}
            >
              取消任务
            </button>
          )}
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-sm text-black inline-block flex items-center">
              任务标题：{task.mainTaskTitle || '未命名任务'}
              <button 
                className="ml-2 text-blue-500 hover:text-blue-700 transition-colors"
                onClick={() => {
                  const taskIdToCopy = task.id;
                  
                  // 检查navigator.clipboard是否可用
                  if (!navigator.clipboard) {
                    // 如果clipboard API不可用，使用传统的复制方法
                    const textArea = document.createElement('textarea');
                    textArea.value = taskIdToCopy;
                    textArea.style.position = 'fixed';
                    textArea.style.opacity = '0';
                    document.body.appendChild(textArea);
                    textArea.select();
                    
                    try {
                      document.execCommand('copy');
                      setModalMessage('任务ID已复制到剪贴板');
                      setShowModal(true);
                    } catch (err) {
                      console.error('复制失败:', err);
                      setModalMessage('复制失败，请手动复制');
                      setShowModal(true);
                    } finally {
                      document.body.removeChild(textArea);
                    }
                    return;
                  }
                  
                  // 如果clipboard API可用，使用它
                  navigator.clipboard.writeText(taskIdToCopy).then(() => {
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
            <div className="text-sm text-black mb-1 inline-block">订单单价：¥{(task.unitPrice ).toFixed(2)}</div>
              <div className="space-y-2 mb-1">
                <div>

                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                    {task.commentType}
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 ml-2">
                    {task.mainTaskPlatform}
                  </span>
                </div>
                <div className="text-sm text-black block">
                  接受时间：{task.acceptTime}
                </div>  
                <div className="text-sm text-black block">
                  截止时间：{task.expireTime}
                </div>
              </div>
          </div>
          
         

          <div className="text-sm text-black mb-2 overflow-hidden text-ellipsis whitespace-normal max-h-[72px] line-clamp-3 block">
            要求：{task.taskRequirements}
          </div>
          
          {/* 推荐评论区域 - 所有任务都显示 */}
        <div className="mb-2 bg-blue-50 p-3 rounded-lg border border-blue-100">
          <div className="flex justify-between items-center mb-1">
            <h4 className="text-sm font-medium text-blue-700"><EditOutlined className="inline-block mr-1" /> 推荐评论</h4>
            <button
                className="text-xs bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-500 transition-colors"
                onClick={() => handleCopyComment && handleCopyComment(task.id, (task.firstGroupComment || task.secondGroupComment || task.submittedComment || ''))}
              >
                <CopyOutlined className="inline-block mr-1" /> 复制评论
              </button>
          </div>
          <p className="text-sm text-black bg-white p-3 rounded border border-blue-100 overflow-hidden text-ellipsis whitespace-normal max-h-[72px] line-clamp-3">
            {task.firstGroupComment}
          </p>
        </div>
     
          {/* 提交的图片显示 */}
          {task.submittedImages && (
            <div className="mb-2 border border-blue-200 rounded-lg p-3 bg-blue-50">
              <span className="text-sm text-blue-700 mr-2">已提交的截图：</span>
              <img 
                src={task.submittedImages} 
                alt="已提交的截图" 
                className="mt-1 max-w-full h-auto rounded"
                onClick={() => task.submittedImages && handleViewImage(task.submittedImages)}
              />
            </div>
          )}

      <div className="mb-2 bg-blue-50 border border-blue-500 py-2 px-3 rounded-lg">
          <p className='mb-1  text-sm text-blue-600'>任务视频点击进入：</p>
          <a 
            href="https://v.douyin.com/oiunFce071s/" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="bg-blue-600 text-white px-3 py-1.5 rounded-md text-sm  inline-flex items-center"
            onClick={async (e) => {
              e.preventDefault();
              // 获取评论内容
              const blueDiv = e.currentTarget.closest('div.bg-blue-50');
              const commentSpan = blueDiv?.querySelector('p:last-of-type span');
              const commentText = commentSpan?.textContent || '';
              // 复制评论
              await handleCopyComment?.(task.id, commentText);
              // 设置当前视频URL并打开模态框
              setCurrentVideoUrl('https://v.douyin.com/oiunFce071s/');
              setIsModalOpen(true);
            }}
          >
             打开视频
          </a>
          <p>视频评论链接：<span>90:/. 06/15 k@p.qr 复制打开抖音，查看【初代风华】发布作品的评论：想起李白的一句诗，今月不是古时月，今月曾照古时人[...ŠŠcjs5gch5s19➝➝</span></p>
      </div>    
          
          
      
      
      {/* 评论链接输入框 - 新增 */}
      <div className="mb-4 border border-blue-200 rounded-lg p-3 bg-blue-50">
        <label className="block text-sm font-medium mb-1 text-blue-700">
          <LinkOutlined className="inline-block mr-1" /> 完成任务评论的链接输入:
        </label>
        <input
          type="text"
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${errors[task.id] ? 'border-red-500' : 'border-gray-300'}`}
          placeholder="完成任务评论的链接输入"
          value={reviewLinks[task.id] || task.submittedLinkUrl || ''}
          onChange={(e) => handleReviewLinkChange(task.id, e.target.value)}
        />
        {reviewLinks[task.id] || task.submittedLinkUrl ? (
          <button
              className="mt-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
              onClick={() => {
                const url = reviewLinks[task.id] || task.submittedLinkUrl;
                if (url && task.id) {
                  // 保存当前视频URL和评论
                  setCurrentVideoUrl(url);
                  setCurrentComment(task.submittedComment || '');
                  // 复制评论
                  handleCopyComment?.(task.id, task.submittedComment || '');
                  // 打开模态框
                  setIsModalOpen(true);
                }
              }}
          >
            打开视频
          </button>
        ) : null}
      </div>

          {/* 截图显示区域 - 自适应高度，居中显示 */}
          <div className="mb-4 border border-blue-200 rounded-lg p-3 bg-blue-50">
            <div className='text-sm text-blue-500 pl-2 py-2'>完成任务截图上传：</div>
            {/* 显示错误信息 */}
            {errors[task.id] && (
              <div className="text-red-500 text-xs mb-2 pl-2">{errors[task.id]}</div>
            )}
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
                  {/* 删除按钮 - 移除冷却时间限制 */}
                  <button
                    className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors z-10"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveImage && handleRemoveImage(task.id);
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
          
          {/* 任务操作按钮 */}
          <div className="flex space-x-2">
            <button 
              className="flex-1 py-2 rounded-lg text-sm font-medium bg-blue-500 text-white hover:bg-blue-700 transition-colors"
              onClick={() => handleUploadScreenshot!(task.id)}
            >
              上传截图
            </button>
            <button 
              className="flex-1 bg-blue-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              onClick={() => handleSubmitOrderForm(task)}
              disabled={!task.screenshotUrl || isLoading || !task.id}
            >
              {isLoading ? '提交中...' : '提交订单'}
            </button>
          </div>
          
          
        </div>
      ))}

      {/* 打开视频确认模态框 */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-medium mb-4">提示</h3>
            <p className="text-gray-700 mb-6">是否需要打开抖音APP？</p>
            <div className="flex justify-end space-x-3">
              <button 
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md"
                onClick={() => setIsModalOpen(false)}
              >
                取消
              </button>
              <button 
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                onClick={() => {
                  // 打开视频链接
                  window.open(currentVideoUrl, '_blank');
                  // 关闭模态框
                  setIsModalOpen(false);
                }}
              >
                确定
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default ProgressTasksTab;