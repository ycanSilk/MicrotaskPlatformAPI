'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PublisherAuthStorage } from '@/auth/publisher/auth';
import { EditOutlined, CopyOutlined, LinkOutlined } from '@ant-design/icons';
import OrderHeaderTemplate from '../components/OrderHeaderTemplate';

// 定义数据类型
interface Task {
  id: string;
  title: string;
  category: string;
  price: number;
  status: string;
  statusText: string;
  statusColor: string;
  participants: number;
  maxParticipants: number;
  completed: number;
  inProgress: number;
  pending: number;
  publishTime: string;
  deadline: string;
  description: string;
}

export default function ActiveTabPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('time');
  const [loading, setLoading] = useState(true);
  const [activeTasks, setActiveTasks] = useState<Task[]>([]);
  const [showCopyTooltip, setShowCopyTooltip] = useState(false);
  const [tooltipMessage, setTooltipMessage] = useState('');

  // 静态模拟数据
  const mockActiveTasks: Task[] = [
    {
      id: "ACTIVE001",
      title: "抖音短视频评论任务",
      category: "评论任务",
      price: 2.5,
      status: "processing",
      statusText: "进行中",
      statusColor: "blue",
      participants: 15,
      maxParticipants: 20,
      completed: 5,
      inProgress: 10,
      pending: 5,
      publishTime: "2025-10-21 14:30:00",
      deadline: "2025-10-28 14:30:00",
      description: "对指定抖音视频进行真实、自然的评论，评论内容需与视频主题相关，不少于10个字。"
    },
    {
      id: "ACTIVE002",
      title: "小红书笔记点赞分享",
      category: "分享任务",
      price: 3.0,
      status: "processing",
      statusText: "进行中",
      statusColor: "blue",
      participants: 10,
      maxParticipants: 15,
      completed: 3,
      inProgress: 7,
      pending: 5,
      publishTime: "2025-10-20 09:15:00",
      deadline: "2025-10-27 09:15:00",
      description: "点赞指定小红书笔记并分享到个人动态，确保真实互动，提高笔记曝光度。"
    },
    {
      id: "ACTIVE003",
      title: "快手直播观看与互动",
      category: "其他任务",
      price: 5.0,
      status: "processing",
      statusText: "进行中",
      statusColor: "blue",
      participants: 8,
      maxParticipants: 10,
      completed: 2,
      inProgress: 6,
      pending: 2,
      publishTime: "2025-10-21 16:45:00",
      deadline: "2025-10-25 16:45:00",
      description: "观看指定快手直播不少于5分钟，发送至少3条与直播内容相关的互动弹幕。"
    }
  ];

  // 获取仪表板数据
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // 直接使用静态数据，模拟API延迟
        setTimeout(() => {
          setActiveTasks(mockActiveTasks);
          setLoading(false);
        }, 500);
      } catch (error) {
        console.error("获取数据失败:", error);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // 处理搜索
  const handleSearch = () => {
    // 搜索逻辑将在TasksTab组件中处理
  };

  // 处理任务操作
  const handleTaskAction = (taskId: string, action: string) => {
    // 这里可以添加具体的操作逻辑
  };

  // 过滤最近订单
  const filterRecentOrders = (tasks: any[]) => {
    return tasks.filter(task => {
      const taskTime = new Date(task.publishTime).getTime();
      const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      return taskTime >= sevenDaysAgo;
    });
  };

  // 搜索订单
  const searchOrders = (tasks: any[]) => {
    if (!searchTerm.trim()) return tasks;
    
    return tasks.filter(task => 
      task.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // 排序任务
  const sortTasks = (tasks: Task[]) => {
    return [...tasks].sort((a, b) => {
      switch (sortBy) {
        case 'time':
          return new Date(b.publishTime).getTime() - new Date(a.publishTime).getTime();
        case 'price':
          return b.price - a.price;
        case 'status':
          return a.statusText.localeCompare(b.statusText);
        default:
          return 0;
      }
    });
  };

  // 显示加载状态
  if (loading) {
    return (
      <div className="pb-20 flex items-center justify-center h-64">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  // 定义订单类型接口
  interface SubOrder {
    id: string;
    orderId: string;
    userId: string;
    userName: string;
    status: 'pending' | 'processing' | 'reviewing' | 'completed' | 'rejected' | 'cancelled';
    submitTime?: string;
    reviewTime?: string;
    reward: number;
    content?: string;
    screenshots?: string[];
  }

  interface Order {
    id: string;
    orderNumber: string;
    title: string;
    description: string;
    status: 'pending' | 'processing' | 'reviewing' | 'completed' | 'rejected' | 'cancelled';
    createdAt: string;
    updatedAt: string;
    budget: number;
    assignedTo?: string;
    completionTime?: string;
    type: 'comment' | 'like' | 'share' | 'other';
    subOrders: SubOrder[];
    videoUrl?: string;
  }
  

  // MainOrderCard组件定义
  const MainOrderCard: React.FC<{
    order: Order;
    onCopyOrderNumber?: (orderNumber: string) => void;
    onCopyComment?: (comment: string) => void;
    onViewDetails?: (orderId: string) => void;
    onReorder?: (orderId: string) => void;
    copiedOrderNumber?: string | null;
  }> = ({ order, onCopyOrderNumber, onCopyComment, onViewDetails, onReorder }) => {
    const router = useRouter();

    // 获取子订单各状态的统计数据
    const getSubOrderStats = (subOrders: SubOrder[]) => {
      const stats = {
        total: subOrders.length,
        pending: subOrders.filter(sub => sub.status === 'pending').length,
        processing: subOrders.filter(sub => sub.status === 'processing').length,
        reviewing: subOrders.filter(sub => sub.status === 'reviewing').length,
        completed: subOrders.filter(sub => sub.status === 'completed').length,
        rejected: subOrders.filter(sub => sub.status === 'rejected').length
      };
      return stats;
    };

    // 计算完成进度
    const subOrderStats = getSubOrderStats(order.subOrders);
    const completionRate = subOrderStats.total > 0 
      ? Math.round((subOrderStats.completed / subOrderStats.total) * 100) 
      : 0;

    // 处理复制订单号 - 仅调用父组件传入的方法
    const handleCopyOrderNumber = () => {
      if (onCopyOrderNumber) {
        onCopyOrderNumber(order.orderNumber);
      }
    };

    // 处理查看详情
    const handleViewDetails = () => {
      if (onViewDetails) {
        onViewDetails(order.id);
      } else {
        router.push(`/publisher/orders/task-detail/${order.id}`);
      }
    };

    // 处理补单
    const handleReorder = () => {
      if (onReorder) {
        onReorder(order.id);
      } else {
        // 跳转到新的补单页面
        router.push(`/publisher/create/supplementaryorder?reorder=true&orderId=${order.id}&title=${encodeURIComponent(order.title)}&description=${encodeURIComponent(order.description)}&type=${order.type}&budget=${order.budget.toString()}&subOrderCount=${order.subOrders.length}`);
      }
    };

    return (
      <div className="p-3 rounded-lg shadow-sm hover:shadow-md transition-shadow mb-1 bg-white">
        <div className="flex items-center mb-1 overflow-hidden">
          <div className="flex-1 mr-2 whitespace-nowrap overflow-hidden text-truncate text-black text-sm">
            订单号：{order.orderNumber}
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
            进行中
          </span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm  bg-blue-100 text-blue-700">
            中下评评论
          </span>
        </div>
        <div className="mb-1 text-sm text-black text-sm">
          发布时间：{order.createdAt}
        </div>
        <div className="mb-1 text-sm text-black text-sm ">
          截止时间：{new Date(new Date(order.createdAt).getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleString('zh-CN')}
        </div>
        <div className="text-black text-sm mb-1 w-full rounded-lg">
            要求：组合任务，中下评评论
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
            <span className="mr-1">⦿</span> 打开视频
          </a>
          
        </div>
        


        
       
       <div className="flex gap-2 mb-1">
          <div className="flex-1 bg-green-600 rounded-lg p-1 text-center">
            <span className="text-white text-sm mb-1">总价</span>
            <span className="text-white text-sm block">¥{order.budget.toFixed(2)}</span>
          </div>
          <div className="flex-1 bg-green-600 rounded-lg p-1 text-center">
            <span className="text-white text-sm mb-1">订单数</span>
            <span className="text-white text-sm block">{subOrderStats.total}</span>
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

  // 整合ActiveTasksTab功能到当前页面

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

  // 获取过滤和搜索后的订单
  const filteredTasks = sortTasks(searchOrders(filterRecentOrders(activeTasks)));

  // 获取排序选项
  const sortOptions = [
    { value: 'time', label: '按时间排序' },
    { value: 'price', label: '按价格排序' },
    { value: 'status', label: '按状态排序' }
  ];

  // 数据格式转换
  const convertToOrderFormat = (task: Task): Order => ({
    id: task.id,
    orderNumber: task.id,
    title: task.title,
    description: task.description,
    status: task.status.toLowerCase() as any,
    createdAt: task.publishTime,
    updatedAt: task.publishTime,
    budget: task.price * task.maxParticipants,
    type: task.category === '账号租赁' ? ('other' as const) : ('comment' as const),
    subOrders: [
      { id: '1', orderId: task.id, userId: '', userName: '', status: 'completed' as const, reward: task.price },
      ...Array.from({ length: task.completed - 1 }, (_, i) => ({
        id: `${i + 2}`, orderId: task.id, userId: '', userName: '', status: 'completed' as const, reward: task.price
      })),
      ...Array.from({ length: task.inProgress }, (_, i) => ({
        id: `${task.completed + i + 1}`, orderId: task.id, userId: '', userName: '', status: 'processing' as const, reward: task.price
      })),
      ...Array.from({ length: (task.pending || 0) }, (_, i) => ({
        id: `${task.completed + task.inProgress + i + 1}`, orderId: task.id, userId: '', userName: '', status: 'pending' as const, reward: task.price
      }))
    ],
    videoUrl: ''
  });

  return (
    <div className="mx-4 mt-6 space-y-4">
      {/* 复制成功提示 */}
      {showCopyTooltip && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50">
          {tooltipMessage}
        </div>
      )}
      
      {/* 使用标准模板组件 */}
      <OrderHeaderTemplate
        title="进行中任务"
        totalCount={filteredTasks.length}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        handleSearch={handleSearch}
        sortBy={sortBy}
        setSortBy={setSortBy}
        sortOptions={sortOptions}
        viewAllUrl="/publisher/orders/active"
        onViewAllClick={() => router.push('/publisher/orders' as any)}
      />
      
      {/* 任务列表 */}
      <div>
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task) => (
            <MainOrderCard
              key={task.id}
              order={convertToOrderFormat(task)}
              onCopyOrderNumber={handleCopyOrderNumber}
              onCopyComment={handleCopyComment}
              onViewDetails={(orderId) => {
                const orderType = task.category === '账号租赁' ? 'other' : 'comment';
                if (orderType === 'comment') {
                  router.push(`/publisher/orders/task-detail/${orderId}`);
                } else {
                  router.push(`/publisher/orders/account-rental/${orderId}`);
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