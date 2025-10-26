'use client';

import React, { useState, useEffect,ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Button, AlertModal } from '@/components/ui';

// 自定义Tabs组件 - 符合项目风格
interface TabsProps {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}
const Tabs = ({ children, className }: TabsProps) => {
  return <div className={className}>{children}</div>;
};

interface TabsListProps {
  children: React.ReactNode;
  className?: string;
}
const TabsList = ({ children, className }: TabsListProps) => {
  return <div className={className}>{children}</div>;
};

interface TabsTriggerProps {
  value: string;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
}
const TabsTrigger = ({ children, onClick, className }: TabsTriggerProps) => {
  return <button onClick={onClick} className={className}>{children}</button>;
};

interface TabsContentProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}
const TabsContent = ({ children, className }: TabsContentProps) => {
  return <div className={className}>{children}</div>;
};

// 自定义Dialog组件 - 符合项目风格
interface DialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}
const Dialog = ({ children, open }: DialogProps) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-6">
      {children}
    </div>
  );
};

interface DialogContentProps {
  children: React.ReactNode;
  className?: string;
}
const DialogContent = ({ children, className }: DialogContentProps) => {
  return <div className={`bg-white rounded-lg p-6 w-full max-w-md mx-auto shadow-xl ${className}`}>{children}</div>;
};

interface DialogHeaderProps {
  children: React.ReactNode;
}
const DialogHeader = ({ children }: DialogHeaderProps) => {
  return <div className="mb-4">{children}</div>;
};

interface DialogTitleProps {
  children: React.ReactNode;
}
const DialogTitle = ({ children }: DialogTitleProps) => {
  return <h2 className="text-xl font-bold text-gray-900">{children}</h2>;
};

interface DialogDescriptionProps {
  children: React.ReactNode;
}
const DialogDescription = ({ children }: DialogDescriptionProps) => {
  return <p className="text-gray-500">{children}</p>;
};

interface DialogTriggerProps {
  children: React.ReactNode;
  onClick?: () => void;
}
const DialogTrigger = ({ children, onClick }: DialogTriggerProps) => {
  return <button onClick={onClick}>{children}</button>;
};

// 定义子任务数据类型 - 租号任务特定
interface AccountRentalSubTask {
  id: string;
  parentId: string;
  status: 'sub_progress' | 'sub_completed' | 'sub_pending_review' | 'waiting_collect';
  commenterId: string;
  commenterName: string;
  commentTime: string;
  screenshotUrl: string;
  accountDetails?: {
    username: string;
    password: string;
    loginMethod: string;
    verificationCode?: string;
    additionalInfo?: string;
  };
}

// 定义任务数据类型 - 租号任务特定
interface AccountRentalTask {
  id: string;
  orderNumber: string;
  videoUrl: string;
  mention: string;
  status: 'main_progress' | 'main_completed';
  quantity: number;
  completedQuantity: number;
  unitPrice: number;
  taskRequirements: string;
  publishTime: string;
  deadline: string;
  taskType: string;
  title: string;
  accountInfo: {
    platform: string;
    accountLevel: string;
    followerCount: string;
    requiresVerification: boolean;
    rentalDuration: string;
    engagementRate?: string;
    postFrequency?: string;
    audienceDemographics?: string;
  };
  subOrders: AccountRentalSubTask[];
}

export default function AccountRentalDetailPage() {
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [task, setTask] = useState<AccountRentalTask | null>({
    id: "task001",
    orderNumber: "ORD-20240425-001",
    videoUrl: "https://example.com/video.mp4",
    mention: "@brandofficial",
    status: "main_progress",
    quantity: 5,
    completedQuantity: 2,
    unitPrice: 100.00,
    taskRequirements: "请按照视频教程完成任务，确保截图清晰显示完成状态。",
    publishTime: "2024-04-25T08:00:00Z",
    deadline: "2024-05-02T23:59:59Z",
    taskType: "account_rental",
    title: "社交媒体账号推广任务",
    accountInfo: {
      platform: "抖音",
      accountLevel: "level_3",
      followerCount: "10000+",
      requiresVerification: true,
      rentalDuration: "24小时",
      engagementRate: "5%",
      postFrequency: "每天2-3条",
      audienceDemographics: "18-35岁，女性占比65%"
    },
    subOrders: [
      {
        id: "subtask001",
        parentId: "task001",
        status: "sub_completed",
        commenterId: "user001",
        commenterName: "张三",
        commentTime: "2024-04-26T15:30:00Z",
        screenshotUrl: "https://example.com/screenshot1.jpg",
        accountDetails: {
          username: "testaccount1",
          password: "password123",
          loginMethod: "password_only",
          additionalInfo: "请不要修改账号设置"
        }
      },
      {
        id: "subtask002",
        parentId: "task001",
        status: "sub_progress",
        commenterId: "user002",
        commenterName: "李四",
        commentTime: "",
        screenshotUrl: "",
        accountDetails: {
          username: "testaccount2",
          password: "password456",
          loginMethod: "phone_verification",
          verificationCode: "123456",
          additionalInfo: "登录后请先查看消息"
        }
      },
      {
        id: "subtask003",
        parentId: "task001",
        status: "waiting_collect",
        commenterId: "",
        commenterName: "",
        commentTime: "",
        screenshotUrl: "",
        accountDetails: {
          username: "testaccount3",
          password: "password789",
          loginMethod: "third_party",
          additionalInfo: "使用微信扫码登录"
        }
      },
      {
        id: "subtask004",
        parentId: "task001",
        status: "sub_pending_review",
        commenterId: "user003",
        commenterName: "王五",
        commentTime: "2024-04-27T10:15:00Z",
        screenshotUrl: "https://example.com/screenshot2.jpg",
        accountDetails: {
          username: "testaccount4",
          password: "password101",
          loginMethod: "password_only",
          additionalInfo: "账号已设置自动回复"
        }
      },
      {
        id: "subtask005",
        parentId: "task001",
        status: "waiting_collect",
        commenterId: "",
        commenterName: "",
        commentTime: "",
        screenshotUrl: "",
        accountDetails: {
          username: "testaccount5",
          password: "password202",
          loginMethod: "phone_verification",
          verificationCode: "654321",
          additionalInfo: "请在任务完成后清除浏览记录"
        }
      }
    ]
  });
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedSubTask, setSelectedSubTask] = useState<string | null>(null);
  const [showAccountDetails, setShowAccountDetails] = useState(false);
  const [screenshotUrl, setScreenshotUrl] = useState('');
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleSubTaskAction = (subTaskId: string, action: string) => {
    if (!task) return;
    
    switch (action) {
      case 'claim':
        // 模拟领取租号任务
        setShowSuccessModal(true);
        break;
      case 'viewAccount':
        // 查看账号详情
        setSelectedSubTask(subTaskId);
        setShowAccountDetails(true);
        break;
      case 'submitResult':
        // 提交租赁结果
        setSelectedSubTask(subTaskId);
        setShowSubmitModal(true);
        break;
      default:
        alert(`对子任务 ${subTaskId} 执行 ${action} 操作`);
    }
  };
  
  const handleClaimSubTask = async (subTaskId: string) => {
    if (!task) return;
    
    try {
      setShowSuccessModal(true);
    } catch (error) {
      // 静默处理错误
    }
  };
  
  const handleSubmitResult = async () => {
    if (!task || !selectedSubTask || !screenshotUrl.trim()) return;
    
    try {
      setShowSubmitModal(false);
      setScreenshotUrl('');
      setShowSuccessModal(true);
    } catch (error) {
      // 静默处理错误
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <div className="bg-white shadow-sm">
          <div className="max-w-3xl mx-auto px-4 py-3 flex items-center">
            <button 
              onClick={() => router.back()}
              className="mr-4 p-2 rounded-full hover:bg-gray-100"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-lg font-bold">加载中...</h1>
          </div>
        </div>
        <div className="max-w-3xl mx-auto px-4 py-8 flex justify-center">
          <div className="text-gray-500">正在加载任务详情...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <div className="bg-white shadow-sm">
          <div className="max-w-3xl mx-auto px-4 py-3 flex items-center">
            <button 
              onClick={() => router.back()}
              className="mr-4 p-2 rounded-full hover:bg-gray-100"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-lg font-bold">错误</h1>
          </div>
        </div>
        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <span className="text-red-600">⚠️</span>
              <span className="text-red-700">{error}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <div className="bg-white shadow-sm">
          <div className="max-w-3xl mx-auto px-4 py-3 flex items-center">
            <button 
              onClick={() => router.back()}
              className="mr-4 p-2 rounded-full hover:bg-gray-100"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-lg font-bold">任务未找到</h1>
          </div>
        </div>
        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <span className="text-yellow-600">⚠️</span>
              <span className="text-yellow-700">未找到指定的任务</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 统计子任务状态
  const statusCounts = {
    completed: task.subOrders.filter(sub => sub.status === 'sub_completed').length,
    waitingCollect: task.subOrders.filter(sub => sub.status === 'waiting_collect').length,
    inReview: task.subOrders.filter(sub => sub.status === 'sub_pending_review').length,
    inProgress: task.subOrders.filter(sub => sub.status === 'sub_progress').length,
  };

  // 状态映射函数
  const getStatusText = (status: string) => {
    switch (status) {
      // 主任务状态
      case 'main_progress':
        return '进行中';
      case 'main_completed':
        return '已完成';
      // 子任务状态
      case 'sub_completed':
        return '已完成';
      case 'sub_progress':
        return '进行中';
      case 'waiting_collect':
        return '待领取';
      case 'sub_pending_review':
        return '待审核';
      default:
        return status;
    }
  };

  // 状态样式映射函数
  const getStatusStyle = (status: string) => {
    switch (status) {
      // 主任务状态
      case 'main_progress':
        return 'bg-blue-100 text-blue-800';
      case 'main_completed':
        return 'bg-green-100 text-green-800';
      // 子任务状态
      case 'sub_completed':
        return 'bg-green-100 text-green-800';
      case 'sub_progress':
        return 'bg-blue-100 text-blue-800';
      case 'waiting_collect':
        return 'bg-yellow-100 text-yellow-800';
      case 'sub_pending_review':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // 账号等级映射
  const getAccountLevelText = (level: string) => {
    const levelMap: Record<string, string> = {
      'level_1': '初级账号',
      'level_2': '中级账号',
      'level_3': '高级账号',
      'level_4': '专业账号',
      'level_5': '顶级账号'
    };
    return levelMap[level] || level;
  };

  // 登录方式映射
  const getLoginMethodText = (method: string) => {
    const methodMap: Record<string, string> = {
      'phone_verification': '手机验证登录',
      'password_only': '密码登录',
      'third_party': '第三方登录'
    };
    return methodMap[method] || method;
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center">
          <button 
            onClick={() => router.back()}
            className="mr-4 p-2 rounded-full hover:bg-gray-100"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-lg font-bold">租号任务详情</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* 标签页导航 */}
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full mb-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="overview">概览</TabsTrigger>
            <TabsTrigger value="account-detail">账号详情</TabsTrigger>
            <TabsTrigger value="rental-flow">租赁流程</TabsTrigger>
          </TabsList>
          
          {/* 概览标签页 */}
        <TabsContent value="overview" className="mt-4">

          {/* 任务基本信息 */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800">{task.title}</h2>
              <span className={`px-3 py-1 rounded-full text-sm ${getStatusStyle(task.status)}`}>
                {getStatusText(task.status)}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-600">任务编号</p>
                <p className="font-medium">{task.orderNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">任务类型</p>
                <p className="font-medium">账号租用任务</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">单价</p>
                <p className="font-medium">¥{task.unitPrice.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">总数量</p>
                <p className="font-medium">{task.quantity} 个账号</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">已完成</p>
                <p className="font-medium">{task.completedQuantity} 个</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">发布时间</p>
                <p className="font-medium">{new Date(task.publishTime).toLocaleString('zh-CN')}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">截止时间</p>
                <p className="font-medium">{new Date(task.deadline).toLocaleString('zh-CN')}</p>
              </div>
            </div>
            
            <div>
              <div className="mb-4">
                  <p className="text-sm text-gray-600">视频链接</p>
                  <a 
                    href={task.videoUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline break-all"
                  >
                    {task.videoUrl || '暂无链接'}
                  </a>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-2">任务要求</p>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-gray-800">{task.taskRequirements}</p>
                  </div>
                </div>
            </div>
          </div>

          {/* 子任务统计 */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">子任务统计</h2>
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-green-50 border border-green-100 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-green-600">{statusCounts.completed}</div>
                <div className="text-sm text-green-700">已完成</div>
              </div>
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-blue-600">{statusCounts.inProgress}</div>
                <div className="text-sm text-blue-700">进行中</div>
              </div>
              <div className="bg-orange-50 border border-orange-100 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-orange-600">{statusCounts.inReview}</div>
                <div className="text-sm text-orange-700">待审核</div>
              </div>
              <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-yellow-600">{statusCounts.waitingCollect}</div>
                <div className="text-sm text-yellow-700">待领取</div>
              </div>
            </div>
          </div>
      </TabsContent>
      
      {/* 账号详情标签页 */}
      <TabsContent value="account-detail" className="mt-4">
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">账号详细信息</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">平台</p>
              <p className="font-medium">{task.accountInfo.platform}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">账号等级</p>
              <p className="font-medium">{getAccountLevelText(task.accountInfo.accountLevel)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">粉丝数量</p>
              <p className="font-medium">{task.accountInfo.followerCount}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">互动率</p>
              <p className="font-medium">{task.accountInfo.engagementRate || '暂无数据'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">发布频率</p>
              <p className="font-medium">{task.accountInfo.postFrequency || '暂无数据'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">受众人群</p>
              <p className="font-medium">{task.accountInfo.audienceDemographics || '暂无数据'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">需要验证</p>
              <p className="font-medium">{task.accountInfo.requiresVerification ? '是' : '否'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">租用时长</p>
              <p className="font-medium">{task.accountInfo.rentalDuration}</p>
            </div>
          </div>
        </div>
      </TabsContent>
      
      {/* 租赁流程标签页 */}
      <TabsContent value="rental-flow" className="mt-4">

        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">租赁账号流程</h2>
          
          <div className="mb-6">
            <h3 className="text-md font-semibold mb-2">租赁步骤</h3>
            <div className="space-y-2">
              <div className="flex items-center">
                <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center mr-3">1</div>
                <p>浏览可用账号，选择适合的账号</p>
              </div>
              <div className="flex items-center">
                <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center mr-3">2</div>
                <p>领取账号，获取账号登录信息</p>
              </div>
              <div className="flex items-center">
                <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center mr-3">3</div>
                <p>完成任务操作，截图保存</p>
              </div>
              <div className="flex items-center">
                <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center mr-3">4</div>
                <p>提交截图，等待审核</p>
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="text-md font-semibold mb-2">注意事项</h3>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                <li>请在规定时间内完成任务，超时将无法提交</li>
                <li>请严格按照任务要求操作，违规操作将被驳回</li>
                <li>请妥善保管账号信息，不要泄露给他人</li>
                <li>完成任务后请及时提交截图，以便尽快审核</li>
              </ul>
            </div>
          </div>
        </div>
        
        {/* 可用账号列表 */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h2 className="text-lg font-bold text-gray-800 mb-4">可用账号列表</h2>
          <div className="space-y-4">
            {task.subOrders.map((subTask) => (
              <div key={subTask.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">订单编号： {subTask.id}</span>
                    <span className={`px-2 py-1 rounded text-xs ${getStatusStyle(subTask.status)}`}>
                      {getStatusText(subTask.status)}
                    </span>
                  </div>
                  
                  {/* 操作按钮 - 根据状态显示不同按钮 */}
                  <div className="flex space-x-2">
                    {subTask.status === 'waiting_collect' && (
                      <button
                        onClick={() => handleSubTaskAction(subTask.id, 'claim')}
                        className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                      >
                        领取任务
                      </button>
                    )}
                    
                    {subTask.status === 'sub_progress' && (
                      <>
                        <button
                          onClick={() => handleSubTaskAction(subTask.id, 'viewAccount')}
                          className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
                        >
                          查看账号
                        </button>
                        <button
                          onClick={() => handleSubTaskAction(subTask.id, 'submitResult')}
                          className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                        >
                          提交结果
                        </button>
                      </>
                    )}
                  </div>
                </div>
                
                {subTask.commenterName ? (
                  <div className="mb-3">
                    <p className="text-sm text-gray-600">领取用户</p>
                    <p className="font-medium">{subTask.commenterName}</p>
                  </div>
                ) : (
                  <div className="mb-3">
                    <p className="text-sm text-gray-600">领取用户</p>
                    <p className="font-medium text-gray-400">暂无信息</p>
                  </div>
                )}
                
                {subTask.commentTime ? (
                  <div className="mb-3">
                    <p className="text-sm text-gray-600">提交时间</p>
                    <p className="font-medium">{new Date(subTask.commentTime).toLocaleString('zh-CN')}</p>
                  </div>
                ) : (
                  <div className="mb-3">
                    <p className="text-sm text-gray-600">提交时间</p>
                    <p className="font-medium text-gray-400">暂无信息</p>
                  </div>
                )}
                
                <div>
                  <p className="text-sm text-gray-600 mb-1">截图</p>
                  {subTask.screenshotUrl ? (
                    <div className="bg-gray-100 rounded flex items-center justify-center">
                      <img 
                        src={subTask.screenshotUrl} 
                        alt="操作截图" 
                        className="max-h-40 object-contain"
                      />
                    </div>
                  ) : (
                    <div className="bg-gray-100 border border-gray-200 rounded flex items-center justify-center h-40">
                      <p className="text-gray-400">暂无截图</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </TabsContent>
        </Tabs>
        
        {/* 账号详情模态框 */}
        <Dialog open={showAccountDetails} onOpenChange={setShowAccountDetails}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>账号登录信息</DialogTitle>
              <DialogDescription>
                请妥善保管账号信息，不要泄露给他人
              </DialogDescription>
            </DialogHeader>
            
            {selectedSubTask && (
              <div className="mt-4 space-y-3">
                {task.subOrders.find(sub => sub.id === selectedSubTask)?.accountDetails && (
                  <>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="mb-2">
                        <p className="text-xs text-gray-500">用户名</p>
                        <p className="font-medium">{task.subOrders.find(sub => sub.id === selectedSubTask)?.accountDetails?.username}</p>
                      </div>
                      <div className="mb-2">
                        <p className="text-xs text-gray-500">密码</p>
                        <p className="font-medium">{task.subOrders.find(sub => sub.id === selectedSubTask)?.accountDetails?.password}</p>
                      </div>
                      <div className="mb-2">
                        <p className="text-xs text-gray-500">登录方式</p>
                        <p className="font-medium">{getLoginMethodText(task.subOrders.find(sub => sub.id === selectedSubTask)?.accountDetails?.loginMethod || '')}</p>
                      </div>
                      {task.subOrders.find(sub => sub.id === selectedSubTask)?.accountDetails?.verificationCode && (
                        <div className="mb-2">
                          <p className="text-xs text-gray-500">验证码</p>
                          <p className="font-medium">{task.subOrders.find(sub => sub.id === selectedSubTask)?.accountDetails?.verificationCode}</p>
                        </div>
                      )}
                      {task.subOrders.find(sub => sub.id === selectedSubTask)?.accountDetails?.additionalInfo && (
                        <div>
                          <p className="text-xs text-gray-500">附加信息</p>
                          <p className="font-medium">{task.subOrders.find(sub => sub.id === selectedSubTask)?.accountDetails?.additionalInfo}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg text-sm">
                      <p className="text-yellow-700">⚠️ 完成任务后，请确保退出账号登录，保护账号安全。</p>
                    </div>
                  </>
                )}
                
                <Button className="w-full" onClick={() => setShowAccountDetails(false)}>
                  关闭
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
        
        {/* 提交结果模态框 */}
        <Dialog open={showSubmitModal} onOpenChange={setShowSubmitModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>提交任务结果</DialogTitle>
              <DialogDescription>
                请上传完成任务的截图
              </DialogDescription>
            </DialogHeader>
            
            <div className="mt-4 space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">截图链接</label>
                <input
                  type="text"
                  value={screenshotUrl}
                  onChange={(e) => setScreenshotUrl(e.target.value)}
                  placeholder="请输入截图的URL地址"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="flex space-x-2">
                <Button className="w-full" onClick={handleSubmitResult}>
                  提交
                </Button>
                <Button variant="secondary" className="w-full" onClick={() => setShowSubmitModal(false)}>
                  取消
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        
        {/* 成功提示模态框 */}
        <AlertModal
          isOpen={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
          title="操作成功"
          message="您的操作已成功完成！"
          buttonText="确定"
        />
      </div>
    </div>
  );
}