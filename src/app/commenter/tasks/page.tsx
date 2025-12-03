'use client';

import React, { useState, useEffect } from 'react';
import { BulbOutlined } from '@ant-design/icons';
import { useRouter, useSearchParams } from 'next/navigation';
import ProgressTasksTab from './components/ProgressTasksTab';
import PendingReviewTasksTab from './components/PendingReviewTasksTab';
import CompletedTasksTab from './components/CompletedTasksTab';
import RejectedTasksTab from './components/RejectedTasksTab';

// 定义前端任务状态类型
type TaskStatus = 'ACCEPTED' | 'COMPLETED' | 'SUBMITTED' | 'sub_rejected';

// 任务状态映射
const TASK_STATUS_MAP = {
  ACCEPTED: '进行中',
  SUBMITTED: '待审核',
  COMPLETED: '已完成'
};

// 定义任务接口 - 根据响应数据示例重新定义
interface Task {
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

export default function CommenterTasksPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // 从URL参数中获取初始tab值，如果没有则默认为ACCEPTED
  const tabFromUrl = (searchParams?.get('tab') || '')?.trim() as TaskStatus | null;
  const [activeTab, setActiveTab] = useState<TaskStatus>(tabFromUrl || 'ACCEPTED');
  
  // 状态管理
  // 定义响应数据接口，与后端返回格式完全一致
  interface ApiResponse {
    code: number;
    message: string;
    data: {
      list: Task[];
      total: number;
      page: number;
      size: number;
      pages: number;
    };
    success: boolean;
    timestamp: number;
  }





  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [uploadStatus, setUploadStatus] = useState<Record<string, 'compressing' | 'uploading' | 'success' | 'error'>>({});
  const [selectedImage, setSelectedImage] = useState<string | null>(null); // 用于放大查看的图片URL
  const [commentContent, setCommentContent] = useState<Record<string, string>>({}); // 存储每个任务的评论内容
  const [tempScreenshotFiles, setTempScreenshotFiles] = useState<Record<string, File>>({}); // 临时存储截图文件
  const [linkUploadStatus, setLinkUploadStatus] = useState<Record<string, string>>({}); // 链接上传状态
  const [showModal, setShowModal] = useState(false); // 控制模态框显示
  const [modalMessage, setModalMessage] = useState(''); // 模态框消息内容
  


  // 获取用户订单数据
  const fetchUserTasks = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    
    try {
      
      // 从localStorage获取认证token
      const token = localStorage.getItem('commenter_auth_token') || '';
      
      // 调用后端API获取任务数据，发送空对象作为请求体避免解析错误
      const response = await fetch('/api/commenter/task/myacceptedtaskslist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // 向后端传递token，后端会从这里提取并用于认证
          'X-Auth-Token': token
        },
        body: JSON.stringify({})
      });
      
      // 检查响应状态
      console.log('API响应状态码:', response.status);
      console.log('API响应头部信息:', Array.from(response.headers.entries()));

      // 解析响应数据
      const responseData: ApiResponse = await response.json();
      // 记录API响应日志，帮助调试
      console.log('API返回完整数据:', responseData);
      console.log('API返回状态码:', responseData.code);
      console.log('API返回消息:', responseData.message);
      console.log('API返回数据结构F12输出:', JSON.stringify(responseData.data, null, 2));
      

      // 检查响应状态码
      if (responseData.code === 401) {
        // 未授权错误处理
        setErrorMessage(responseData.message || '未登录，请先登录');
        setTasks([]);
        return;
      }
      
      // 检查API响应是否成功
      if (!responseData.success || !responseData.data) {
        // API调用成功但数据为空或错误
        console.log('API返回数据异常，状态:', responseData.code, '消息:', responseData.message);
        setTasks([]);
        setErrorMessage(responseData.message || 'API数据异常');
        return;
      }
      
      // 更新任务列表 - 即使list为空也是正常情况，不应显示错误
      const taskList = responseData.data.list || [];

      console.log('设置任务列表:', taskList.length, '个任务');
      setTasks(taskList);
      
      // 如果任务列表为空，设置相应的提示信息
      if (taskList.length === 0) {
        setErrorMessage('暂无任务数据');
      }
      
    } catch (error) {
      console.error('处理任务数据时发生错误:', error);
      setTasks([]);
      setErrorMessage('网络异常，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  }
  

  
  // 初始化数据
  useEffect(() => {
    fetchUserTasks();
  }, [])

  // 页面加载时，如果URL没有tab参数，自动添加?tab=ACCEPTED
  useEffect(() => {
    const currentTab = searchParams?.get('tab');
    if (!currentTab) {
      // 使用replaceState避免创建新的历史记录
      router.replace('/commenter/tasks?tab=ACCEPTED');
    }
  }, [searchParams, router])

  // 认证逻辑已整合到fetchUserTasks函数中
  


  // 处理标签切换，同时更新URL参数
  const handleTabChange = (tab: TaskStatus) => {
    setActiveTab(tab);
    
    // 更新URL参数而不刷新页面
    const newParams = new URLSearchParams(searchParams || {});
    newParams.set('tab', tab);
    
    // 使用replaceState避免创建新的历史记录
    window.history.replaceState(null, '', `?${newParams.toString()}`);
    
    // 清除错误消息
    setErrorMessage(null);
  };

  // 统计各状态任务数量
  const getTaskCounts = () => {
    const counts = {
      COMPLETED: 0,
      SUBMITTED: 0,
      ACCEPTED: 0,
      TOTAL: 0
    };
    
    tasks.forEach(task => {
      counts.TOTAL += 1;
      switch (task.status) {
        case 'COMPLETED':
          counts.COMPLETED += 1;
          break;
        case 'SUBMITTED':
          counts.SUBMITTED += 1;
          break;
        case 'ACCEPTED':
          counts.ACCEPTED += 1;
          break;
        default:
          break;
      }
    });
    
    return counts;
  };
  
  const taskCounts = getTaskCounts();



  // 获取按钮样式
  const getTabButtonStyle = (status: TaskStatus) => {
    const isActive = activeTab === status;
    return `flex-1 p-2 rounded-lg text-sm transition-colors ${isActive ? 'bg-blue-500 text-white shadow-md' : 'bg-white border text-gray-600 hover:bg-blue-50'}`;
  };

  // 复制推荐评论功能
  const handleCopyComment = (taskId: string, comment?: string) => {
    // 确保comment有默认值
    const commentToCopy = comment || '';
    
    if (!commentToCopy.trim()) {
      setModalMessage('暂无推荐评论');
      setShowModal(true);
      return;
    }
    
    // 检查navigator.clipboard是否可用
    if (!navigator.clipboard) {
      // 如果clipboard API不可用，使用传统的复制方法
      const textArea = document.createElement('textarea');
      textArea.value = commentToCopy;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      
      try {
        document.execCommand('copy');
        setCommentContent(prev => ({ ...prev, [taskId]: commentToCopy }));
        setModalMessage('复制评论成功');
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
    navigator.clipboard.writeText(commentToCopy).then(() => {
      // 保存到commentContent状态
      setCommentContent(prev => ({ ...prev, [taskId]: commentToCopy }));
      setModalMessage('复制评论成功');
      setShowModal(true);
    }).catch(err => {
      console.error('复制失败:', err);
      setModalMessage('复制失败，请手动复制');
      setShowModal(true);
    });
  };

  // 上传截图按钮功能 - 优化版：只在本地保存压缩后的图片，不立即上传到服务器
  const handleUploadScreenshot = (taskId: string) => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    
    fileInput.onchange = async (e: any) => {
      const file = e.target.files[0];
      if (!file) return;
      
      try {
        // 显示正在压缩的提示
        setUploadStatus(prev => ({ ...prev, [taskId]: 'compressing' }));
        // 前端压缩图片至200KB以下
        const compressedFile = await compressImage(file);
        
        // 保存压缩后的图片到临时状态中，不立即上传到服务器
        setTempScreenshotFiles(prev => ({ ...prev, [taskId]: compressedFile }));
        
        // 立即更新对应任务的截图URL为本地URL，实现回填显示
        const objectUrl = URL.createObjectURL(compressedFile);
        setTasks(prevTasks => 
          prevTasks.map(task => 
            task.id === taskId 
              ? { ...task, screenshotUrl: objectUrl }
              : task
          )
        );
        
        setUploadStatus(prev => ({ ...prev, [taskId]: 'success' }));
        setModalMessage('截图已选择成功，提交订单时将自动上传');
        setShowModal(true);
      } catch (error) {
        console.error('处理截图错误:', error);
        setUploadStatus(prev => ({ ...prev, [taskId]: 'error' }));
        setModalMessage('处理截图失败，请稍后重试');
        setShowModal(true);
      } finally {
        // 3秒后清除上传状态
        setTimeout(() => {
          setUploadStatus(prev => {
            const newStatus = { ...prev };
            delete newStatus[taskId];
            return newStatus;
          });
        }, 3000);
      }
    };
    
    fileInput.click();
  };
  
  // 提交订单按钮功能 - 优化版：在提交订单时一并上传截图
  const handleSubmitOrder = async (taskId: string) => {
    
    try {
      // 添加验证逻辑：检查是否已上传截图
      const task = tasks.find(t => t.id === taskId);
      
      if (task && !task.screenshotUrl) {
        alert('请先上传截图');
        return;
      }
      
      setIsSubmitting(true);
      
      const token = localStorage.getItem('commenter_auth_token');
      
      // 检查是否有临时截图文件需要上传
      const tempScreenshotFile = tempScreenshotFiles[taskId];
      
      if (tempScreenshotFile) {
        // 如果有临时截图文件，先上传截图
        const formData = new FormData();
        formData.append('taskId', taskId);
        formData.append('image', tempScreenshotFile);
        
        // 显示上传截图的提示
        setUploadStatus(prev => ({ ...prev, [taskId]: 'uploading' }));
        
        const uploadResponse = await fetch('/api/commenter/upload-screenshot', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });
        
        const uploadResult = await uploadResponse.json();
        
        if (!uploadResult.success) {
          setUploadStatus(prev => ({ ...prev, [taskId]: 'error' }));
          alert(uploadResult.message || '截图上传失败，请重试');
          setIsSubmitting(false);
          return;
        }
        
        // 清除临时截图文件
        setTempScreenshotFiles(prev => {
          const newFiles = { ...prev };
          delete newFiles[taskId];
          return newFiles;
        });
      }
      
      // 提交订单
      const response = await fetch('/api/commenter/task-detail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          taskId: taskId
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        alert(result.message || '订单提交成功');
        // 重新加载任务列表
        fetchUserTasks();
        // 清除评论内容
        setCommentContent(prev => {
          const newContent = { ...prev };
          delete newContent[taskId];
          return newContent;
        });
      } else {
        alert(result.message || '订单提交失败');
      }
    } catch (error) {
      console.error('提交订单错误:', error instanceof Error ? error.message : String(error));
      alert('提交失败，请稍后重试');
    } finally {
      setIsSubmitting(false);
      // 清除上传状态
      setTimeout(() => {
        setUploadStatus(prev => {
          const newStatus = { ...prev };
          delete newStatus[taskId];
          return newStatus;
        });
      }, 1000);
    }
  };
  
  // 查看详情按钮功能
  const handleViewDetails = (taskId: string) => {
    router.push(`/commenter/task-detail?id=${taskId}`);
  };
  
  // 查看大图功能
  const handleViewImage = (imageUrl: string) => {
    setSelectedImage(imageUrl);
  };
  
  // 关闭大图查看
  const handleCloseImageViewer = () => {
    setSelectedImage(null);
  };
  
  // 删除图片功能
  const handleRemoveImage = (taskId: string) => {
    // 更新任务列表，移除对应任务的截图URL
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === taskId 
          ? { ...task, screenshotUrl: undefined, submitScreenshotUrl: undefined }
          : task
      )
    );
    
    // 清除临时截图文件
    setTempScreenshotFiles(prev => {
      const newFiles = { ...prev };
      delete newFiles[taskId];
      return newFiles;
    });
    
    // 清除上传状态
    setUploadStatus(prev => {
      const newStatus = { ...prev };
      delete newStatus[taskId];
      return newStatus;
    });
    
    setModalMessage('图片已删除，可以重新上传');
    setShowModal(true);
  };
  
  // 辅助函数：将图片压缩至200KB以下
  const compressImage = async (file: File): Promise<File> => {
    return new Promise((resolve) => {
      // 如果文件已经小于200KB，直接返回
      const MAX_SIZE = 200 * 1024; // 200KB
      if (file.size <= MAX_SIZE) {
        resolve(file);
        return;
      }

      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const reader = new FileReader();

      reader.onload = (e: any) => {
        img.src = e.target.result;
      };

      img.onload = () => {
        // 设置最大尺寸
        const maxWidth = 1200; 
        const maxHeight = 1200;

        // 计算缩放比例
        let width = img.width;
        let height = img.height;
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        
        if (width > maxWidth || height > maxHeight) {
          width = Math.floor(width * ratio);
          height = Math.floor(height * ratio);
        }

        canvas.width = width;
        canvas.height = height;

        // 在canvas上绘制图片
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
        }

        // 使用二分法查找合适的quality值进行压缩
        let quality = 0.9;

        const compressAndCheck = () => {
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                resolve(file);
                return;
              }

              if (blob.size > MAX_SIZE && quality > 0.1) {
                quality -= 0.1;
                compressAndCheck();
              } else {
                const compressedFile = new File([blob], file.name, {
                  type: file.type
                });
                resolve(compressedFile);
              }
            },
            file.type || 'image/jpeg',
            quality
          );
        };

        compressAndCheck();
      };

      reader.readAsDataURL(file);
    });
  };
  
  // 上传链接功能
  const handleUploadLink = async (taskId: string, reviewLink?: string) => {
    
    try {
      setLinkUploadStatus(prev => ({ ...prev, [taskId]: 'uploading' }));
      
      // 获取认证token
      const token = localStorage.getItem('commenter_auth_token');
      if (!token) {
        alert('请先登录');
        router.push('/commenter/auth/login');
        return;
      }
      
      // 如果没有提供链接，则弹出输入框让用户输入
      let link = reviewLink;
      if (!link) {
        // 使用空值合并运算符将prompt返回的null转换为undefined
        link = prompt('请输入上评链接：') ?? undefined;
        if (!link) {
          setLinkUploadStatus(prev => ({ ...prev, [taskId]: '' }));
          return;
        }
      }
      
      // 提交链接到服务器
      const response = await fetch('/api/commenter/upload-review-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          taskId,
          reviewLink: link
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setLinkUploadStatus(prev => ({ ...prev, [taskId]: 'success' }));
        alert('链接上传成功');
        // 重新加载任务列表
        fetchUserTasks();
        
        // 3秒后清除成功状态
        setTimeout(() => {
          setLinkUploadStatus(prev => {
            const newStatus = { ...prev };
            delete newStatus[taskId];
            return newStatus;
          });
        }, 3000);
      } else {
        setLinkUploadStatus(prev => ({ ...prev, [taskId]: 'error' }));
        alert(result.message || '链接上传失败');
      }
    } catch (error) {
      setLinkUploadStatus(prev => ({ ...prev, [taskId]: 'error' }));
      console.error('上传链接错误:', error);
      alert('上传失败，请稍后重试');
    }
  };
  
  // 获取任务操作按钮组
  const getTaskButtons = (task: Task) => {
    switch (task.status) {
      case 'ACCEPTED':
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
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${ 
                linkUploadStatus[task.id] === 'uploading' 
                  ? 'bg-gray-400 text-white cursor-not-allowed' 
                  : linkUploadStatus[task.id] === 'success' 
                    ? 'bg-green-500 text-white' 
                    : linkUploadStatus[task.id] === 'error' 
                      ? 'bg-red-500 text-white' 
                      : 'bg-purple-600 text-white hover:bg-purple-700'
              }`}
              onClick={() => handleUploadLink(task.id)}
              disabled={linkUploadStatus[task.id] === 'uploading'}
            >
              {linkUploadStatus[task.id] === 'uploading' ? '上传中...' : '上传链接'}
            </button>
            {/* 提交订单按钮已移至ProgressTasksTab组件中实现 */}
            <button 
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              onClick={() => handleViewDetails(task.id)}
            >
              查看详情
            </button>
          </div>
        );
      case 'SUBMITTED':
        // 为pending和SUBMITTED状态显示相同的按钮
        return (
          <button className="w-full bg-gray-300 text-gray-600 py-3 rounded-lg font-medium cursor-not-allowed" disabled>
            等待审核
          </button>
        );
      case 'COMPLETED':
        return (
          <button 
            className="w-full bg-green-100 text-green-600 py-3 rounded-lg font-medium hover:bg-green-200 transition-colors"
            onClick={() => handleViewDetails(task.id)}
          >
            查看详情
          </button>
        );
      default:
        return null;
    }
  };

  return (
    <>  
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90" 
          onClick={handleCloseImageViewer}
        >
          <div className="absolute top-4 right-4 text-white">
            <button 
              className="p-2 rounded-full bg-black bg-opacity-50 hover:bg-opacity-70 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                handleCloseImageViewer();
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div 
            className="relative max-w-5xl max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <img 
              src={selectedImage} 
              alt="预览图片" 
              className="max-w-full max-h-[90vh] object-contain"
            />
          </div>
        </div>
      )}
      
      <div className="pb-20">
        <div className='px-4 py-2 bg-white text-red-500 text-xs'>单个抖音账号每天评论任务次数5次以内。超过5次可能会影响抖音账号权重导致无法正常显示评论影响个人账号的完成率。如个人有多个家庭抖音账号，可以注册多个平台账号。</div>
      {/* 任务状态筛选（合并统计和筛选功能） */}
      <div className="mx-4 mt-4 flex space-x-2">
        <button 
          onClick={() => handleTabChange('ACCEPTED')}
          className={getTabButtonStyle('ACCEPTED')}
        >
          <div className="flex flex-col items-center">
            <div className={activeTab === 'ACCEPTED' ? 'text-lg font-bold text-white' : 'text-lg font-bold text-blue-500'}>
              {taskCounts.ACCEPTED}
            </div>
            <span className="text-xs">进行中</span>
          </div>
        </button>
        <button 
          onClick={() => handleTabChange('SUBMITTED')}
          className={getTabButtonStyle('SUBMITTED')}
        >
          <div className="flex flex-col items-center">
            <div className={activeTab === 'SUBMITTED' ? 'text-lg font-bold text-white' : 'text-lg font-bold text-orange-500'}>
              {taskCounts.SUBMITTED}
            </div>
            <span className="text-xs">待审核</span>
          </div>
        </button>
        <button 
          onClick={() => handleTabChange('COMPLETED')}
          className={getTabButtonStyle('COMPLETED')}
        >
          <div className="flex flex-col items-center">
            <div className={activeTab === 'COMPLETED' ? 'text-lg font-bold text-white' : 'text-lg font-bold text-green-500'}>
              {taskCounts.COMPLETED}
            </div>
            <span className="text-xs">已完成</span>
          </div>
        </button>
        <button 
          onClick={() => handleTabChange('sub_rejected')}
          className={getTabButtonStyle('sub_rejected')}
        >
          <div className="flex flex-col items-center">
            <div className={activeTab === 'sub_rejected' ? 'text-lg font-bold text-white' : 'text-lg font-bold text-red-500'}>
              {tasks.filter(task => task.status === 'sub_rejected').length}
            </div>
            <span className="text-xs">异常订单</span>
          </div>
        </button>
      </div>

      {/* 错误提示 */}
      {errorMessage && (
        <div className="mx-4 mt-3 bg-red-50 text-red-600 p-3 rounded-lg text-sm">
          <p>{errorMessage}</p>
        </div>
      )}

      {/* 根据当前选中的标签渲染对应的组件 */}

      {/* 根据当前选中的标签渲染对应的组件 */}
      <div className="mx-4 mt-6">
        {activeTab === 'ACCEPTED' && (
          <>
            {console.log('所有任务:', tasks)}
            {console.log('进行中任务数量:', tasks.filter(task => task.status === 'ACCEPTED').length)}
            {console.log('任务状态值:', tasks.map(task => task.status))}
            {console.log('待审核任务数量:', tasks.filter(task => task.status === 'SUBMITTED').length)}
            {console.log('任务状态值:', tasks.map(task => task.status))}
            {console.log('已完成任务数量:', tasks.filter(task => task.status === 'COMPLETED').length)}
            {console.log('任务状态值:', tasks.map(task => task.status))}
            <ProgressTasksTab 
              tasks={tasks.filter(task => task.status === 'ACCEPTED')}
              handleViewImage={handleViewImage}
              fetchUserTasks={fetchUserTasks}
              setModalMessage={setModalMessage}
              setShowModal={setShowModal}
              handleCopyComment={handleCopyComment}
              handleUploadScreenshot={handleUploadScreenshot}
              handleRemoveImage={handleRemoveImage}
              handleSubmitOrder={handleSubmitOrder}
              isSubmitting={isSubmitting}
              uploadStatus={uploadStatus}
            />
          </>
        )}
        
        {activeTab === 'SUBMITTED' && (
          <>            
            {tasks.filter(task => task.status === 'SUBMITTED').length > 0 ? (
              <PendingReviewTasksTab
                tasks={tasks.filter(task => task.status === 'SUBMITTED')}
                handleViewDetails={(taskId) => console.log('View details for:', taskId)}
                handleViewImage={handleViewImage}
                getTaskTypeName={(taskType) => taskType || '评论'}
                isLoading={isLoading}
                fetchUserTasks={fetchUserTasks}
                setModalMessage={setModalMessage}
                setShowModal={setShowModal}
              />
            ) : (
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <div className="text-gray-400 mb-2">📋</div>
                <p className="text-gray-500">暂无任务订单</p>
              </div>
            )}
          </>
        )}
        
        {activeTab === 'COMPLETED' && (
          <>            
            {tasks.filter(task => task.status === 'COMPLETED').length > 0 ? (
              <CompletedTasksTab
                tasks={tasks.filter(task => task.status === 'COMPLETED')}
                handleViewImage={handleViewImage}
                getTaskTypeName={(taskType) => taskType || '评论'}
                isLoading={isLoading}
                fetchUserTasks={fetchUserTasks}
                setModalMessage={setModalMessage}
                setShowModal={setShowModal}
              />
            ) : (
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <div className="text-gray-400 mb-2">📋</div>
                <p className="text-gray-500">暂无任务订单</p>
              </div>
            )}
          </>
        )}
        
        {activeTab === 'sub_rejected' && (
          <>            
            {tasks.filter(task => task.status === 'sub_rejected').length > 0 ? (
              <RejectedTasksTab
                tasks={tasks.filter(task => task.status === 'sub_rejected')}
                handleViewImage={handleViewImage}
                getTaskTypeName={(taskType) => taskType || '评论'}
                isLoading={isLoading}
                fetchUserTasks={fetchUserTasks}
                setModalMessage={setModalMessage}
                setShowModal={setShowModal}
              />
            ) : (
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <div className="text-gray-400 mb-2">📋</div>
                <p className="text-gray-500">暂无任务订单</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* 任务提示 */}
      <div className="mx-4 mt-6 bg-blue-50 rounded-lg p-4">
        <div className="flex items-start space-x-2">
          <BulbOutlined className="text-blue-500 text-xl" />
          <div>
            <h4 className="font-medium text-blue-800 mb-1">任务小贴士</h4>
            <p className="text-sm text-blue-600">
              按时完成任务可以提高信誉度，获得更多高价值任务推荐。记得在截止时间前提交哦！
            </p>
          </div>
        </div>
      </div>

      {/* 模态框组件 */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-lg">
            <div className="text-center">
              <p className="text-gray-700 mb-4">{modalMessage}</p>
              <button 
                className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
                onClick={() => setShowModal(false)}
              >
                确定
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
}