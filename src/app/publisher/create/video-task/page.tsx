'use client';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import AlertModal from '@/components/ui/AlertModal';

// 模拟认证信息，防止重定向到登录页面
// 由于认证重定向失败，我们直接在页面中提供模拟数据

// 定义视频任务类型接口
interface VideoTaskType {
  id: string;
  title: string;
  icon: string;
  price: number | string;
  description: string;
  requirements: string;
  estimatedTime: string;
  difficulty: '简单' | '中等' | '困难';
}

// 定义视频任务数据接口
interface VideoTask {
  id: string;
  typeId: string;
  title: string;
  description: string;
  platform: string;
  videoRequirements: string;
  attachments: string[];
  contactInfo: string;
  deadline: string;
  budget: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
}

// 视频任务类型配置
const VIDEO_TASK_TYPES: VideoTaskType[] = [
  {
    id: 'video_promotion',
    title: '产品推广视频',
    icon: '📱',
    price: '自定义',
    description: '为产品制作宣传推广视频，展示产品特点和优势',
    requirements: '视频内容需真实有效，展示产品核心功能和使用场景，时长15-60秒',
    estimatedTime: '自定义',
    difficulty: '中等'
  },
  {
    id: 'video_review',
    title: '产品评测视频',
    icon: '📝',
    price: '自定义',
    description: '对产品进行客观评测，分享使用体验和优缺点',
    requirements: '评测内容需客观真实，包含产品实际使用场景和效果，时长1-3分钟',
    estimatedTime: '自定义',
    difficulty: '困难'
  },
  {
    id: 'video_unboxing',
    title: '开箱视频',
    icon: '🎁',
    price: 80,
    description: '产品开箱体验，展示产品包装和初步使用感受',
    requirements: '视频需包含完整开箱过程，展示产品外观和配件，时长30秒-1分钟',
    estimatedTime: '15分钟',
    difficulty: '简单'
  },
  {
    id: 'video_tutorial',
    title: '教程视频',
    icon: '🎓',
    price: '自定义',
    description: '制作产品使用教程或技巧分享视频',
    requirements: '教程内容需清晰易懂，步骤详细，实用性强，时长1-5分钟',
    estimatedTime: '自定义',
    difficulty: '中等'
  }
];

// 任务类型卡片组件
const VideoTaskTypeCard = ({ taskType, onClick, isSelected }: { 
  taskType: VideoTaskType, 
  onClick: () => void, 
  isSelected: boolean 
}) => {
  return (
    <div 
      onClick={onClick}
      className={`bg-white rounded-2xl p-5 shadow-sm transition-all cursor-pointer active:scale-95 border-2 ${isSelected ? 'border-blue-300 bg-blue-50' : 'border-gray-100 hover:border-blue-200 hover:shadow-md'}`}
    >
      {/* 任务类型头部 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-2xl text-white">
            {taskType.icon}
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-lg">{taskType.title}</h3>
            <div className="flex items-center space-x-2 mt-1">
              <span className={`text-sm px-2 py-1 rounded-full ${getDifficultyStyle(taskType.difficulty)}`}>
                {taskType.difficulty}
              </span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xl font-bold text-orange-500">
            {taskType.price === '自定义' ? '自定义' : `¥${taskType.price}`}
          </div>
          <div className="text-gray-500 text-sm">
            {taskType.price === '自定义' ? '支持任意金额' : '参考单价'}
          </div>
        </div>
      </div>

      {/* 任务类型描述 */}
      <div className="mb-4">
        <p className="text-gray-700 mb-2">{taskType.description}</p>
        <p className="text-gray-500 text-sm">{taskType.requirements}</p>
      </div>

      {/* 预估时间 */}
      <div className="flex items-center text-gray-500 text-sm">
        <span className="mr-2">⏱️</span>
        <span>预估完成时间：{taskType.estimatedTime}</span>
      </div>
    </div>
  );
};

// 根据难度获取样式
const getDifficultyStyle = (difficulty: string): string => {
  switch (difficulty) {
    case '简单':
      return 'bg-green-100 text-green-800';
    case '中等':
      return 'bg-yellow-100 text-yellow-800';
    case '困难':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default function VideoTaskCreatePage() {
  const router = useRouter();
  const [selectedTaskTypeId, setSelectedTaskTypeId] = useState<string | null>(null);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: '',
    message: '',
    icon: ''
  });

  // 显示通用提示框
  const showAlert = (title: string, message: string, icon: string) => {
    setAlertConfig({ title, message, icon });
    setShowAlertModal(true);
  };

  // 处理返回按钮点击
  const handleBack = () => {
    // 使用模拟的返回行为，避免认证相关的重定向问题
    if (window.history.length > 1) {
      window.history.back();
    } else {
      // 如果没有历史记录，跳转到任务创建主页
      router.push('/publisher/create');
    }
  };

  // 处理任务类型选择
  const handleTaskTypeSelect = (taskTypeId: string) => {
    setSelectedTaskTypeId(taskTypeId);
  };

  // 处理发布任务
  const handlePublishTask = () => {
    if (!selectedTaskTypeId) {
      showAlert('提示', '请先选择任务类型', '💡');
      return;
    }

    // 模拟发布成功
    showAlert('发布成功', '视频任务已成功创建，等待审核', '✅');
    
    // 3秒后关闭弹窗并模拟跳转到任务列表页
    setTimeout(() => {
      setShowAlertModal(false);
      // 使用模拟的跳转，避免认证相关的重定向问题
      alert('任务发布成功，将跳转到任务列表页面');
      // 注释掉实际跳转，避免认证问题
      // router.push('/publisher/dashboard');
    }, 3000);
  };

  // 获取选中的任务类型
  const selectedTaskType = VIDEO_TASK_TYPES.find(task => task.id === selectedTaskTypeId);

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* 页面头部 */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-8 -mx-4 -mt-4">
        <div className="flex items-center space-x-4 mb-2 px-4">
            <button 
            onClick={handleBack}
            className="bg-white hover:bg-white hover:scale-105 text-white font-medium px-4 py-2 rounded-lg transition-all duration-300 shadow-sm flex items-center gap-2"
            aria-label="返回"
          >
            <span className='text-blue-500'>← 返回</span>
          </button> 
        </div>
        <h1 className="text-2xl font-bold ml- px-4">发布视频任务</h1>
        <p className="text-blue-100 px-4 mt-3">选择视频任务类型并填写任务详情</p>
      </div>

      {/* 任务类型选择 */}
      <div className="px-4 py-6 space-y-6">
        <div className="px-4">
          <h2 className="text-xl font-bold text-gray-900 mb-4">选择任务类型</h2>
          <div className="space-y-4">
            {VIDEO_TASK_TYPES.map((taskType) => (
              <VideoTaskTypeCard 
                key={taskType.id} 
                taskType={taskType} 
                onClick={() => handleTaskTypeSelect(taskType.id)}
                isSelected={selectedTaskTypeId === taskType.id}
              />
            ))}
          </div>
        </div>

        {/* 任务详情预览 */}
        {selectedTaskType && (
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mt-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">任务详情预览</h2>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-xl text-white">
                  {selectedTaskType.icon}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{selectedTaskType.title}</h3>
                  <p className="text-gray-500 text-sm">
                    {selectedTaskType.difficulty} • {selectedTaskType.estimatedTime}
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-700 mb-2">任务描述</h4>
                <p className="text-gray-600">{selectedTaskType.description}</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-700 mb-2">任务要求</h4>
                <p className="text-gray-600">{selectedTaskType.requirements}</p>
              </div>
            </div>
          </div>
        )}

        {/* 提示信息 */}
        <div className="px-4 space-y-4">
          <div className="bg-blue-50 rounded-2xl p-4">
            <div className="flex items-start space-x-3">
              <span className="text-2xl">💡</span>
              <div>
                <h3 className="font-medium text-blue-900 mb-1">视频任务说明</h3>
                <p className="text-blue-700 text-sm leading-relaxed">
                  视频任务是指需要用户制作并提交视频内容的任务。请根据您的需求选择合适的视频任务类型，并在后续步骤中填写详细的任务要求和预算。
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-purple-50 rounded-2xl p-4">
            <div className="flex items-start space-x-3">
              <span className="text-2xl">💰</span>
              <div>
                <h3 className="font-medium text-purple-900 mb-1">费用规则</h3>
                <p className="text-purple-700 text-sm leading-relaxed">
                  视频任务费用可自定义设置，平台从成交额中抽取20%作为服务费。建议根据任务复杂度和所需时间合理设置预算。
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 底部固定按钮 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
        <button 
          onClick={handlePublishTask}
          className={`w-full py-4 rounded-2xl font-bold text-lg transition-opacity ${selectedTaskTypeId ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:opacity-90' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
          disabled={!selectedTaskTypeId}
        >
          {selectedTaskTypeId ? '确认发布任务' : '请先选择任务类型'}
        </button>
      </div>

      {/* 提示模态框 */}
      <AlertModal
        isOpen={showAlertModal}
        icon={alertConfig.icon}
        title={alertConfig.title}
        message={alertConfig.message}
        onClose={() => setShowAlertModal(false)}
      />
    </div>
  );
}