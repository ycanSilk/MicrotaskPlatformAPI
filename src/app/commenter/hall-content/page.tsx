'use client';

import React, { useState, useEffect, useRef } from 'react';
import CoolingTimer from '@/components/timer/CoolingTimer';
import { useRouter } from 'next/navigation';
import { ClockCircleOutlined, WarningOutlined, CloseCircleOutlined, BulbOutlined, CheckCircleOutlined, DollarOutlined, MailOutlined, ReloadOutlined, LoadingOutlined } from '@ant-design/icons';
import AlertModal from '../../../components/ui/AlertModal';

export default function CommenterHallContentPage() {
  const [sortBy, setSortBy] = useState('time'); // 'time' | 'price'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' | 'desc'
  const [isRefreshing, setIsRefreshing] = useState(false);
  const router = useRouter();
  // API响应数据接口定义
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

  // 任务接口定义 - 与后端返回的数据格式完全匹配
  interface Task {
    id: string;
    publisherId: string;
    publisherName: string | null;
    publisherAvatar: string | null;
    title: string;
    description: string;
    platform: string;
    taskType: string;
    status: string;
    totalQuantity: number;
    completedQuantity: number;
    availableCount: number;
    unitPrice: number; // 使用后端返回的unitPrice字段
    totalAmount: number;
    deadline: string;
    requirements: string;
    publishedTime: string; // 使用后端返回的publishedTime字段
    remainingHours: number | null;
    remainingDays: number | null;
    isUrgent: boolean | null;
    isRecommended: boolean | null;
    difficultyLevel: string | null;
    estimatedTime: string | null;
    publisherTaskCount: number | null;
    publisherSuccessRate: number | null;
    publisherRating: number | null;
    publisherCompletedTasks: number | null;
    todayCompletedCount: number | null;
    totalAcceptedCount: number | null;
    averageCompletionTime: number | null;
    canAccept: boolean | null;
    cannotAcceptReason: string | null;
    dailyAcceptLimit: number | null;
    todayAcceptedCount: number | null;
    tags: string[] | null;
    isNew: boolean | null;
    isHot: boolean | null;
    popularity: number | null;
    hasBonus: boolean | null;
    bonusAmount: number | null;
    bonusCondition: string | null;
    location: string | null;
    distance: number | null;
    category: string | null;
    subCategory: string | null;
    timeStatus: string | null;
    isExpired: boolean | null;
    isFull: boolean | null;
    verifyRequirements: string | null;
    verifyTimeLimit: number | null;
    autoVerify: boolean | null;
  }

  // API请求参数接口
  interface ApiRequestParams {
    page: number;
    size: number;
    sortField: string;
    sortOrder: string;
    platform?: string;
    taskType?: string;
    minPrice?: number;
    maxPrice?: number;
    keyword?: string;
  }

  const [tasks, setTasks] = useState<Task[]>([]);
  const [grabbingTasks, setGrabbingTasks] = useState(new Set<string>()); // 正在抢单的任务ID
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true); // 加载状态
  const [error, setError] = useState<string | null>(null); // 错误状态
  const [currentPage, setCurrentPage] = useState(0); // 当前页码
  const [totalItems, setTotalItems] = useState(0); // 总任务数
  const [totalPages, setTotalPages] = useState(0); // 总页数
  
  // 冷却计时器引用
  const coolingTimerRef = useRef<any>(null);
  
  // 从冷却计时器获取冷却状态
  const isCoolingDown = () => coolingTimerRef.current?.isCoolingDown || false;
  const getRemainingTime = () => coolingTimerRef.current?.remainingTime || { minutes: 0, seconds: 0 };
  const [showCoolingModal, setShowCoolingModal] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: '',
    message: '',
    icon: <WarningOutlined className="text-yellow-500" />
  });
  
  // 显示通用提示框
  const showAlert = (title: string, message: string, iconType: 'warning' | 'error' | 'success' | 'info' = 'warning') => {
    let icon;
    switch (iconType) {
      case 'warning':
        icon = <WarningOutlined className="text-yellow-500" />;
        break;
      case 'error':
        icon = <CloseCircleOutlined className="text-red-500" />;
        break;
      case 'success':
        icon = <CheckCircleOutlined className="text-green-500" />;
        break;
      case 'info':
        icon = <BulbOutlined className="text-blue-500" />;
        break;
      default:
        icon = <WarningOutlined className="text-yellow-500" />;
    }
    setAlertConfig({ title, message, icon });
    setShowAlertModal(true);
  };

  // 排序功能 - 使用正确的字段名
  const sortTasks = (tasks: Task[], sortBy: string, sortOrder: string) => {
    const sorted = [...tasks].sort((a, b) => {
      if (sortBy === 'time') {
        const timeA = new Date(a.publishedTime).getTime();
        const timeB = new Date(b.publishedTime).getTime();
        return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
      } else if (sortBy === 'price') {
        const priceA = typeof a.unitPrice === 'number' ? a.unitPrice : 0;
        const priceB = typeof b.unitPrice === 'number' ? b.unitPrice : 0;
        return sortOrder === 'desc' ? priceB - priceA : priceA - priceB;
      }
      return 0;
    });
    return sorted;
  };
  
  // 移除静态数据，使用动态API获取数据

  // 从API获取待领取订单
  const fetchAvailableTasks = async (page: number = 0) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // 构建请求参数
      const requestParams: ApiRequestParams = {
        page: page,
        size: 10,
        sortField: sortBy === 'time' ? 'createTime' : 'unitPrice', // 默认使用createTime作为排序字段
        sortOrder: sortOrder.toUpperCase(),
        platform: 'DOUYIN',
        taskType: 'COMMENT',
        minPrice: 1,
        maxPrice: 999,
        keyword: ''
      };

      console.log('请求任务列表参数:', requestParams);
      
      // 调用后端API
      const response = await fetch('/api/public/taskmodule/missionhall', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestParams),
        credentials: 'include'
      });

      // 检查响应状态
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // 解析响应数据
      const responseData: ApiResponse = await response.json();
      
      console.log('任务列表响应数据:', responseData);
      
      // 检查API调用是否成功
      if (responseData.success) {
        // 处理返回的任务数据
        const formattedTasks = responseData.data.list || [];
        setTasks(formattedTasks);
        setTotalItems(responseData.data.total || 0);
        setTotalPages(responseData.data.pages || 0);
        setCurrentPage(page);
        setLastUpdated(new Date());
      } else {
        throw new Error(responseData.message || '获取任务列表失败');
      }
    } catch (error) {
      console.error('获取任务列表失败:', error);
      const errorMessage = error instanceof Error ? error.message : '加载任务列表时发生未知错误';
      setError(errorMessage);
      showAlert('错误', errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };
  
  // 分页导航功能
  const goToPage = (page: number) => {
    if (page >= 0 && page < totalPages && page !== currentPage) {
      fetchAvailableTasks(page);
    }
  };
  
  // 上一页
  const goToPrevPage = () => {
    if (currentPage > 0) {
      goToPage(currentPage - 1);
    }
  };
  
  // 下一页
  const goToNextPage = () => {
    if (currentPage < totalPages - 1) {
      goToPage(currentPage + 1);
    }
  };
  
  // 生成页码数组
  const generatePageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(0, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 1);
    
    // 调整起始页，确保显示足够的页码
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(0, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    
    return pageNumbers;
  };

  // 刷新任务
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchAvailableTasks(0); // 刷新时回到第一页
    setIsRefreshing(false);
  };

  // 冷却计时器回调函数
  const handleCoolingStart = (endTime: number) => {
    console.log('页面组件: 冷却开始', { endTime });
  };
  
  const handleCoolingEnd = () => {
    console.log('页面组件: 冷却结束');
  };
  
  // 抢单功能
  const handleGrabTask = async (taskId: string) => {
    console.log('=== 抢单功能开始 ===', { taskId });
    
    // 检查是否处于冷却状态
    if (isCoolingDown()) {
      console.log('当前处于冷却状态，显示冷却模态框');
      setShowCoolingModal(true);
      return;
    }

    if (grabbingTasks.has(taskId)) {
      console.log('该任务正在抢单中，忽略重复点击');
      return;
    }

    try {
      setGrabbingTasks(prev => new Set(prev).add(taskId));
      console.log('设置任务为正在抢单状态');

      // 调用后端抢单API
      console.log('发送抢单请求到后端API');
      const response = await fetch('/api/commenter/task/accepttask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ taskId }),
        credentials: 'include'
      });

      // 检查响应状态
      if (!response.ok) {
        console.error('抢单API返回非成功状态:', response.status);
        // 尝试解析错误响应
        try {
          const errorData = await response.json();
          throw new Error(errorData.message || `抢单失败，状态码: ${response.status}`);
        } catch (parseError) {
          throw new Error(`抢单失败，状态码: ${response.status}`);
        }
      }

      // 解析响应数据
      const responseData = await response.json();
      console.log('抢单API响应数据:', responseData);
      
      // 检查API调用是否成功
      if (!responseData.success) {
        console.error('抢单API返回失败标志:', responseData.message);
        throw new Error(responseData.message || '抢单失败');
      }
      
      console.log('抢单成功');
      
      // 显示成功消息
      showAlert('抢单成功', '您已成功抢到该任务。单个抖音账号每天评论任务次数8次以内。超过8次可能会影响抖音账号权重导致无法正常显示评论影响个人账号的完成率。可通过升级账号开通快速评论结算通道', 'success');
      
      // 开始冷却计时
      console.log('调用冷却计时器开始5分钟冷却');
      coolingTimerRef.current?.startCooling(3);
      
      // 抢单成功后延迟3秒跳转到任务页面
      setTimeout(() => {
        console.log('跳转到任务页面');
        router.push('/commenter/tasks?tab=ACCEPTED');
      }, 2000);
      
      // 抢单成功后立即刷新列表
      await fetchAvailableTasks(0);
      
    } catch (error) {
      console.error('抢单错误:', error);
      const errorMessage = error instanceof Error ? error.message : '抢单时发生错误';
      showAlert('错误', errorMessage, 'error');
    } finally {
      setGrabbingTasks(prev => {
        const newSet = new Set<string>(prev);
        newSet.delete(taskId);
        return newSet;
      });
      console.log('=== 抢单功能结束 ===');
    }
  };

  // 初始加载订单和排序变化时重新获取数据
  useEffect(() => {
    fetchAvailableTasks(0);
  }, [sortBy, sortOrder]); // 当排序方式改变时重新获取数据
 
  const sortedTasks = sortTasks(tasks, sortBy, sortOrder);
  
  return (
    <div className="pb-32">
      {/* 冷却计时器组件 */}
      <CoolingTimer 
        ref={coolingTimerRef}
        onCoolingStart={handleCoolingStart}
        onCoolingEnd={handleCoolingEnd}
      />

      {/* 排序功能按钮 */}
      <div className="bg-white mx-4 mt-4 rounded-lg shadow-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-gray-800">任务排序</h3>
          {/* 删除自动接单按钮 */}
        </div>
        
        <div className="flex space-x-2">
          {/* 按时间排序 */}
          <button
            onClick={() => {
              if (sortBy === 'time') {
                setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
              } else {
                setSortBy('time');
                setSortOrder('desc');
              }
            }}
            className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm ${sortBy === 'time' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'}`}
          >
            <span>
                <ClockCircleOutlined className="" />
              </span>
            <span>发布时间</span>
            {sortBy === 'time' && (
              <span>{sortOrder === 'desc' ? '↓' : '↑'}</span>
            )}
          </button>
          
          {/* 按价格排序 */}
          <button
            onClick={() => {
              if (sortBy === 'price') {
                setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
              } else {
                setSortBy('price');
                setSortOrder('desc');
              }
            }}
            className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm ${sortBy === 'price' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'}`}
          >
            <span>
                <DollarOutlined className="" />
              </span>
            <span>单价</span>
            {sortBy === 'price' && (
              <span>{sortOrder === 'desc' ? '↓' : '↑'}</span>
            )}
          </button>
        </div>
      </div>

      {/* 任务列表 */}
      <div className="mx-4 mt-6">
        <div className="flex items-center justify-between mb-4">
          <span className="font-bold text-gray-800">全部任务 ({error ? '加载失败' : isLoading ? '加载中...' : totalItems})</span>
          <div className="text-xs text-gray-500">
            最后更新: {lastUpdated.toLocaleTimeString()}
          </div>
        </div>

        {/* 错误状态显示 */}
        {error && !isLoading && (
          <div className="bg-white rounded-lg p-6 text-center">
            <div className="text-5xl mb-3">
              <CloseCircleOutlined className="text-red-500" />
            </div>
            <h3 className="font-medium text-red-600 mb-2">加载失败</h3>
            <p className="text-gray-500 text-sm mb-4">{error}</p>
            <button 
              onClick={handleRefresh}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              重试
            </button>
          </div>
        )}

        {/* 加载状态显示 */}
        {isLoading && !error && (
          <div className="bg-white rounded-lg p-6 text-center">
            <div className="animate-spin text-5xl mb-3">
              <LoadingOutlined className="text-blue-500" />
            </div>
            <h3 className="font-medium text-gray-800 mb-2">加载中</h3>
            <p className="text-gray-500 text-sm">正在获取任务列表，请稍候...</p>
          </div>
        )}

        {/* 无任务状态显示 */}
        {!isLoading && !error && sortedTasks.length === 0 ? (
          <div className="bg-white rounded-lg p-6 text-center">
            <div className="text-5xl mb-3">
              <MailOutlined className="text-gray-400" />
            </div>
            <h3 className="font-medium text-gray-800 mb-2">暂无待领取订单</h3>
            <p className="text-gray-500 text-sm mb-4">请稍后刷新或关注新发布的任务</p>
            <button 
              onClick={handleRefresh}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              立即刷新
            </button>
          </div>
        ) : (
          !isLoading && !error && sortedTasks.map((task) => (
            <div key={task.id} className="bg-white rounded-lg p-4 mb-4 shadow-sm">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-bold text-gray-800">{task.title}</h3>
                  <div className="flex gap-2 mt-1">
                    <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded inline-block">
                      {task.taskType}
                    </span>
                    {task.isRecommended && (
                      <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded inline-block">
                        推荐
                      </span>
                    )}
                    {task.isNew && (
                      <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded inline-block">
                        最新
                      </span>
                    )}
                  </div>
                </div>
                {task.remainingHours !== null && task.remainingHours > 0 && (
                  <span className="text-xs bg-yellow-100 text-yellow-600 px-2 py-0.5 rounded">
                    剩余{task.remainingHours}小时
                  </span>
                )}
              </div>
              
              <div className="flex justify-between items-center mb-3">
                <div className="text-lg font-bold text-orange-500">¥{typeof task.unitPrice === 'number' ? task.unitPrice.toFixed(2) : '0.00'}</div>
                <div className="text-xs text-gray-500">
                  <ClockCircleOutlined className="inline-block mr-1" /> {new Date(task.publishedTime).toLocaleString()}
                </div>
              </div>
              
              {/* 任务进度显示 */}
              <div className="flex justify-between items-center mb-2">
                <div className="text-xs text-gray-500">
                  进度：{task.completedQuantity}/{task.totalQuantity}
                </div>
                <div className="text-xs text-gray-500">
                  剩余：{task.availableCount}
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5 mb-4">
                <div 
                  className="bg-blue-500 h-1.5 rounded-full transition-all duration-300" 
                  style={{ width: `${(task.completedQuantity / task.totalQuantity) * 100}%` }}
                ></div>
              </div>
              
              <div className="text-sm text-gray-600 mb-4">
                要求：{task.requirements || task.description || '暂无要求'}
              </div>
            
          
              <button 
                className={`w-full py-3 rounded-lg font-medium transition-colors ${grabbingTasks.has(task.id) ? 'bg-gray-400 text-gray-200 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
                onClick={() => handleGrabTask(task.id)}
                disabled={grabbingTasks.has(task.id)}
              >
                {grabbingTasks.has(task.id) ? '抢单中...' : '抢单'}
              </button>
            </div>
          )))}
    
      
      {/* 任务提示 */}
      <div className="mx-4 mt-6 bg-blue-50 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <span className="text-red-600 text-xl">
            <BulbOutlined />
          </span>
          <div>
            <h4 className="font-medium text-red-600 mb-1">接单小贴士</h4>
            <p className="text-sm text-red-600">
              请按照要求及时完成任务，高价值任务数量有限，建议关注抢单。如果遇到问题联系客服解决。
            </p>
          </div>
        </div>
      </div>
      
      {/* 分页导航 */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-6 mb-6">
          <button
            onClick={goToPrevPage}
            disabled={currentPage === 0}
            className={`px-4 py-2 rounded-lg transition-colors ${currentPage === 0 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
          >
            上一页
          </button>
          
          <div className="flex items-center space-x-1">
            {/* 页码按钮 */}
            {generatePageNumbers().map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => goToPage(pageNum)}
                className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${currentPage === pageNum ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                {pageNum + 1}
              </button>
            ))}
          </div>
          
          <button
            onClick={goToNextPage}
            disabled={currentPage >= totalPages - 1}
            className={`px-4 py-2 rounded-lg transition-colors ${currentPage >= totalPages - 1 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
          >
            下一页
          </button>
        </div>
      )}
      
      {/* 页码信息显示 */}
      {totalPages > 0 && (
        <div className="text-center text-sm text-gray-500 mb-6">
          第 {currentPage + 1} / {totalPages} 页，共 {totalItems} 条任务
        </div>
      )}
      
      {/* 底部固定刷新按钮 */}
      <div className="fixed bottom-14 left-0 right-0 p-2 bg-white shadow-md">
        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className={`w-full py-3 rounded-lg transition-colors ${isLoading ? 'bg-blue-300 text-gray-500 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
        >
          {isLoading ? '刷新中...' : '刷新任务列表'}
        </button>
      </div>

      {/* 通用提示模态框 */}
      <AlertModal
        isOpen={showAlertModal}
        title={alertConfig.title}
        message={alertConfig.message}
        icon={alertConfig.icon}
        onClose={() => setShowAlertModal(false)}
      />
    </div>
  </div>
  );
}