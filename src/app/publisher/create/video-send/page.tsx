'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

// 定义视频发送任务类型
// 注意：为了在开发环境中正常预览，这里临时绕过了认证检查
interface VideoSendTask {
  id: string;
  title: string;
  icon: string;
  price: number;
  description: string;
  type: 'video_push' | 'video_push_custom';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string;
  deadline: string;
  recipientInfo: {
    id: string;
    name: string;
    platform: string;
  };
  videoDetails: {
    requirements: string;
    length: string;
    style: string;
  };
}

export default function VideoSendPage() {
  const router = useRouter();

  // 静态视频发送任务数据
  const videoTasks: VideoSendTask[] = [
    {
      id: 'vtask001',
      title: '产品宣传视频',
      icon: '📹',
      price: 150.00,
      description: '为新产品制作宣传视频并发送给指定用户',
      type: 'video_push_custom',
      status: 'processing',
      createdAt: '2024-04-28T10:30:00Z',
      deadline: '2024-04-30T18:00:00Z',
      recipientInfo: {
        id: 'user123',
        name: '张小明',
        platform: '抖音'
      },
      videoDetails: {
        requirements: '突出产品的创新设计和实用功能，时长30秒左右',
        length: '0:30',
        style: '现代简约'
      }
    },
    {
      id: 'vtask002',
      title: '活动推广视频',
      icon: '🎬',
      price: 120.00,
      description: '制作促销活动宣传视频并推送给目标受众',
      type: 'video_push',
      status: 'completed',
      createdAt: '2024-04-25T14:20:00Z',
      deadline: '2024-04-27T23:59:59Z',
      recipientInfo: {
        id: 'audience500',
        name: '500名目标用户',
        platform: '抖音'
      },
      videoDetails: {
        requirements: '重点展示活动优惠力度和参与方式，吸引用户关注',
        length: '0:45',
        style: '活泼动感'
      }
    },
    {
      id: 'vtask003',
      title: '品牌故事视频',
      icon: '📸',
      price: 200.00,
      description: '制作品牌故事视频并发送给重要客户',
      type: 'video_push_custom',
      status: 'pending',
      createdAt: '2024-04-29T09:15:00Z',
      deadline: '2024-05-05T18:00:00Z',
      recipientInfo: {
        id: 'vip001',
        name: '战略合作客户',
        platform: '微信视频号'
      },
      videoDetails: {
        requirements: '讲述品牌发展历程和核心价值观，时长2分钟左右',
        length: '2:00',
        style: '温暖感性'
      }
    }
  ];

  // 获取状态样式和文本
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return { text: '待处理', style: 'bg-yellow-100 text-yellow-800' };
      case 'processing':
        return { text: '处理中', style: 'bg-blue-100 text-blue-800' };
      case 'completed':
        return { text: '已完成', style: 'bg-green-100 text-green-800' };
      case 'failed':
        return { text: '失败', style: 'bg-red-100 text-red-800' };
      default:
        return { text: status, style: 'bg-gray-100 text-gray-800' };
    }
  };

  // 格式化日期时间
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 处理返回按钮点击
  const handleBack = () => {
    // 优先使用浏览器历史记录返回
    if (window.history && window.history.length > 1) {
      window.history.back();
    } else {
      // 如果没有历史记录，则导航到默认页面
      router.push('/publisher/dashboard');
    }
  };

  // 在组件加载时检查认证状态
  useEffect(() => {
    // 实际项目中应该有真实的认证检查逻辑
    // 这里为了演示，使用模拟的认证状态
    const isAuthenticated = true;
    
    if (!isAuthenticated) {
      // 在实际应用中，这里应该跳转到登录页面
      // 但为了演示，我们保持在当前页面
      console.log('未认证，需要跳转到登录页面');
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">


      {/* 任务列表 */}
      <div className="px-4 py-6 space-y-4">
        {videoTasks.map((task) => {
          const statusInfo = getStatusInfo(task.status);
          
          return (
            <div 
              key={task.id} 
              className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all"
            >
              {/* 任务头部信息 */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-3">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-xl text-white">
                    {task.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{task.title}</h3>
                    <p className="text-gray-500 text-sm">
                      {task.type === 'video_push_custom' ? '定制视频' : '标准推送'} • {task.videoDetails.length}
                    </p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm ${statusInfo.style}`}>
                  {statusInfo.text}
                </span>
              </div>

              {/* 任务基本信息 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">接收方信息</p>
                  <p className="font-medium text-gray-900">
                    {task.recipientInfo.name} ({task.recipientInfo.platform})
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">任务费用</p>
                  <p className="font-medium text-orange-500">¥{task.price.toFixed(2)}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">创建时间</p>
                  <p className="font-medium text-gray-900">{formatDate(task.createdAt)}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">截止时间</p>
                  <p className="font-medium text-gray-900">{formatDate(task.deadline)}</p>
                </div>
              </div>

              {/* 视频需求 */}
              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-1">视频需求</p>
                <p className="font-medium text-gray-900 bg-gray-50 p-3 rounded-lg">
                  {task.videoDetails.requirements}
                </p>
              </div>

              {/* 操作按钮 */}
              <div className="flex space-x-2">
                <button 
                  className="flex-1 py-2 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium"
                  onClick={() => router.push('/publisher/orders')}
                >
                  查看详情
                </button>
                <button 
                  className="flex-1 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:opacity-90 transition-opacity text-sm font-medium"
                >
                  {task.status === 'completed' ? '查看结果' : '跟踪进度'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 底部固定按钮 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
        <button 
          onClick={() => router.push('/publisher/create/video-task')}
          className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl font-bold text-lg hover:opacity-90 transition-opacity"
        >
          发布视频推送任务
        </button>
      </div>
    </div>
  );
}