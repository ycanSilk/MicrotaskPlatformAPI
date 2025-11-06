'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { EditOutlined, CopyOutlined, LinkOutlined } from '@ant-design/icons';
import OrderHeaderTemplate from '../components/OrderHeaderTemplate';

// 任务类型定义，根据API返回数据结构
interface Task {
  id: string;
  publisherId: string;
  publisherName: string | null;
  title: string;
  description: string;
  platform: string;
  taskType: string;
  status: string;
  totalQuantity: number;
  completedQuantity: number;
  availableCount: number;
  unitPrice: number;
  totalAmount: number;
  deadline: string;
  requirements: string;
  publishedTime: string;
  completedTime: string | null;
  createTime: string;
  updateTime: string;
  pendingSubTaskCount: number | null;
  acceptedSubTaskCount: number | null;
  submittedSubTaskCount: number | null;
  completedSubTaskCount: number | null;
  completionRate: number | null;
  remainingDays: number | null;
  isExpired: boolean | null;
  publisherAvatar: string | null;
  publisherTaskCount: number | null;
  publisherSuccessRate: number | null;
  commentDetail: any | null;
  canAccept: boolean | null;
  cannotAcceptReason: string | null;
}

// API响应类型
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

// 格式化时间函数
const formatTime = (timeString: string): string => {
  if (!timeString) return '未知时间';
  return new Date(timeString).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// 获取平台中文名称
const getPlatformName = (platform: string): string => {
  const platformMap: Record<string, string> = {
    'DOUYIN': '抖音'
  };
  return platformMap[platform] || platform;
};

// 获取任务状态中文名称
const getStatusName = (status: string): string => {
  const statusMap: Record<string, string> = {
    'IN_PROGRESS': '进行中',
    'IN_PENDING': '待审核',
    'COMPLETED': '已完成',
    'CANCELLED': '已取消'
  };
  return statusMap[status] || status;
};

export default function ActiveTabPage() {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCopyTooltip, setShowCopyTooltip] = useState(false);
  const [tooltipMessage, setTooltipMessage] = useState('');

  useEffect(() => {
    console.log('组件挂载，开始初始化...');
    
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log('开始获取任务数据...');
        
        // 构建请求参数
        const requestParams = {
          page: 0,
          size: 10,
          sortField: 'createTime',
          sortOrder: 'DESC',
          platform: 'DOUYIN',
          taskType: 'COMMENT',
          minPrice: 1,
          maxPrice: 999999,
          keyword: ''
        };
        
        console.log('请求参数:', requestParams);
        
        // 调用后端API
        const response = await fetch('/api/publisher/publishertasks/mypublishedlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestParams)
        });
        
        console.log('API响应状态:', response.status, response.statusText);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result: ApiResponse = await response.json();
        setApiResponse(result);
        if (result.success && result.data) {
          // 注意：检查后端实际返回的是tasks还是list
          const taskList = result.data.list || [];
          console.log('实际任务列表:', taskList);
          
          // 筛选进行中的任务
          const filteredTasks = taskList.filter((task: Task) => task.status === 'IN_PROGRESS');
          console.log('筛选后任务列表:', filteredTasks);
          
          setTasks(filteredTasks);
        } else {
          throw new Error(result.message || '获取任务失败');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : '获取数据失败';
        console.error('获取数据时发生错误:', errorMessage, err);
        setError(errorMessage);
      } finally {
        setLoading(false);
        console.log('数据获取完成，loading状态:', false);
        console.log('最终tasks状态:', tasks);
      }
    };
    
    fetchData();
  }, []);

  // 处理搜索
  const handleSearch = () => {
    // 搜索逻辑将在UI中处理
  };

  // 处理任务操作
  const handleTaskAction = (taskId: string, action: string) => {
    // 这里可以添加具体的操作逻辑
  };

  // 过滤最近订单
  const filterRecentOrders = (tasks: Task[]) => {
    return tasks.filter(task => {
      const taskTime = new Date(task.createTime).getTime();
      const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      return taskTime >= sevenDaysAgo;
    });
  };

  // 搜索订单
  const searchOrders = (tasks: Task[]) => {
    if (!searchTerm.trim()) return tasks;
    return tasks.filter(task => 
      task.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };



  // 显示复制成功提示
  const showCopySuccess = (message: string) => {
    setTooltipMessage(message);
    setShowCopyTooltip(true);
    setTimeout(() => {
      setShowCopyTooltip(false);
    }, 2000);
  };

  // 复制订单号功能
  const handleCopyOrderNumber = (orderNumber: string) => {
    navigator.clipboard.writeText(orderNumber).then(() => {
      showCopySuccess('订单号已复制');
    }).catch(() => {
      // 静默处理复制失败
    });
  };

  // 复制评论功能
  const handleCopyComment = (comment: string) => {
    navigator.clipboard.writeText(comment).then(() => {
      showCopySuccess('评论已复制');
    }).catch(() => {
      // 静默处理复制失败
    });
  };



  // 移除数据格式转换逻辑，直接使用API返回的原始数据

  // MainOrderCard组件定义，直接使用Task类型
  const MainOrderCard: React.FC<{
    task: Task;
    onCopyOrderNumber?: (orderNumber: string) => void;
    onCopyComment?: (comment: string) => void;
    onViewDetails?: (orderId: string) => void;
    onReorder?: (orderId: string) => void;
  }> = ({ task, onCopyOrderNumber, onCopyComment, onViewDetails, onReorder }) => {
    const router = useRouter();

    // 直接使用API返回的原始统计数据

    // 处理复制订单号 - 仅调用父组件传入的方法
    const handleCopyOrderNumber = () => {
      if (onCopyOrderNumber) {
        onCopyOrderNumber(task.id);
      }
    };

    // 处理查看详情
    const handleViewDetails = () => {
      if (onViewDetails) {
        onViewDetails(task.id);
      } else {
        router.push(`/publisher/orders/task-detail/${task.id}`);
      }
    };

    // 处理补单
    const handleReorder = () => {
      if (onReorder) {
        onReorder(task.id);
      } else {
        // 跳转到新的补单页面
        router.push(`/publisher/create/supplementaryorder?reorder=true&orderId=${task.id}&title=${encodeURIComponent(task.title)}&description=${encodeURIComponent(task.description)}&budget=${task.totalAmount.toString()}&subOrderCount=${task.totalQuantity}`);
      }
    };

    return (
      <div className="p-3 rounded-lg shadow-sm hover:shadow-md transition-shadow mb-1 bg-white">
        <div className="flex items-center mb-1 overflow-hidden">
          <div className="flex-1 mr-2 whitespace-nowrap overflow-hidden text-truncate text-black text-sm">
            任务ID：{task.id}
          </div>
          <div className="relative">
            <button 
              className="text-blue-600 hover:text-blue-700 whitespace-nowrap text-sm"
              onClick={handleCopyOrderNumber}
            >
              <span>⧉ 复制</span>
            </button>
          </div>
        </div>
        <div className="flex items-center space-x-3 mb-1 pb-1">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-sm  bg-blue-100 text-blue-700`}>
            任务状态：{task.status}
          </span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm  bg-blue-100 text-blue-700">
            任务类型：{task.taskType}
          </span>
        </div>
        <div className="mb-1 text-sm text-black text-sm">
          发布时间：{task.createTime}
        </div>
        <div className="mb-1 text-sm text-black text-sm ">
          截止时间：{task.deadline}
        </div>
        <div className="text-black text-sm mb-1 w-full rounded-lg">
           任务要求：{task.requirements}
        </div>
        <div className="mb-1 text-sm text-black text-sm">
          任务描速：{task.description}
        </div>
        <div className="mb-1 bg-blue-50 border border-blue-500 py-2 px-3 rounded-lg">
          <p className='mb-1  text-sm text-blue-600'>任务视频点击进入：</p>
          <a 
            href="http://localhost:3000/publisher/dashboard?tab=active" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="bg-blue-600 text-white px-3 py-1.5 rounded-md text-sm  inline-flex items-center"
            onClick={(e) => {
              e.preventDefault();
              // 在实际应用中，这里应该跳转到抖音视频页面
              window.open('https://www.douyin.com', '_blank');
            }}
          >
             打开视频
          </a>
        </div>
        
        <div className="flex gap-2 mb-1">
          <div className="flex-1 bg-green-600 rounded-lg p-1 text-center">
            <span className="text-white text-sm mb-1">总价</span>
            <span className="text-white text-sm block">¥{task.totalAmount.toFixed(2)}</span>
          </div>
          <div className="flex-1 bg-green-600 rounded-lg p-1 text-center">
            <span className="text-white text-sm mb-1">总数量</span>
            <span className="text-white text-sm block">{task.totalQuantity}</span>
          </div>
        </div>

        <div className="flex justify-end">
          <button 
            className="bg-blue-600 hover:bg-blue-700 text-white  py-2 px-4 rounded-md transition-colors"
            onClick={handleViewDetails}
          >
            查看详情
          </button>
        </div>
      </div>
    );
  };

  // 渲染加载状态
  if (loading) {
    return (
      <div className="pb-20 flex items-center justify-center h-64">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  // 渲染错误状态
  if (error) {
    return (
      <div className="py-8 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded"
          onClick={() => window.location.reload()}
        >
          重试
        </button>
      </div>
    );
  }

  // 获取过滤和搜索后的订单 - 默认按时间排序
  const filteredTasks = searchOrders(filterRecentOrders(tasks)).sort((a, b) => 
    new Date(b.createTime).getTime() - new Date(a.createTime).getTime()
  );

  // 渲染任务列表
  return (
    <div className="mx-4 mt-6 space-y-4">
      {/* 复制成功提示 */}
      {showCopyTooltip && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50">
          {tooltipMessage}
        </div>
      )}
      
      {/* 使用标准模板组件 - 移除排序功能 */}
      <OrderHeaderTemplate
        title="进行中任务"
        totalCount={filteredTasks.length}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        handleSearch={handleSearch}
        viewAllUrl="/publisher/orders/active"
        onViewAllClick={() => router.push('/publisher/orders' as any)}
      />
      
      {/* 任务列表 */}
      <div>
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task) => (
            <MainOrderCard
              key={task.id}
              task={task}
              onCopyOrderNumber={handleCopyOrderNumber}
              onCopyComment={handleCopyComment}
              onViewDetails={(orderId) => {
                if (task.taskType === 'ACCOUNT_RENTAL') {
                  router.push(`/publisher/orders/account-rental/${orderId}`);
                } else {
                  router.push(`/publisher/orders/task-detail/${orderId}`);
                }
              }}
              onReorder={(orderId) => handleTaskAction(orderId, 'reorder')}
            />
          ))
        ) : (
          <div className="text-center py-8 bg-white rounded-lg shadow-sm">
            <p className="text-gray-500">暂无相关任务</p>
          </div>
        )}
      </div>
    </div>
  );
}