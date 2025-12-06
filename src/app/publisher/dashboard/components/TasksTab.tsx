import React from 'react';

import OrderHeaderTemplate from './OrderHeaderTemplate';

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
  updatedTime?: string;
}

interface TasksTabProps {
  tasks: Task[];
  tabType: 'active' | 'completed';
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  handleSearch: () => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  handleTaskAction: (taskId: string, action: string) => void;
  filterRecentOrders: (tasks: any[]) => any[];
  searchOrders: (tasks: any[]) => any[];
  sortTasks: (tasks: Task[]) => Task[];
  onViewAllClick: () => void;
}

const TasksTab: React.FC<TasksTabProps> = ({
  tasks,
  tabType,
  searchTerm,
  setSearchTerm,
  handleSearch,
  sortBy,
  setSortBy,
  handleTaskAction,
  filterRecentOrders,
  searchOrders,
  sortTasks,
  onViewAllClick
}) => {
  // 复制订单号功能
  const handleCopyOrderNumber = (orderNumber: string) => {
    navigator.clipboard.writeText(orderNumber).then(() => {
      // 创建临时提示元素
      const tooltip = document.createElement('div');
      tooltip.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50';
      tooltip.innerText = '订单号已复制';
      document.body.appendChild(tooltip);
      // 2秒后移除提示
      setTimeout(() => {
        document.body.removeChild(tooltip);
      }, 2000);
    }).catch(() => {
      // 静默处理复制失败
    });
  };

  // 获取过滤和搜索后的订单
  const filteredTasks = sortTasks(searchOrders(filterRecentOrders(tasks)));

  // 获取排序选项
  const sortOptions = [
    { value: 'time', label: '按时间排序' },
    { value: 'price', label: '按价格排序' },
    { value: 'status', label: '按状态排序' }
  ];

  return (
    <div className="mx-4 mt-6 space-y-4">
      {/* 使用标准模板组件 */}
      <OrderHeaderTemplate
        title={tabType === 'active' ? '进行中的任务' : '已完成的任务'}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        handleSearch={handleSearch}
        sortBy={sortBy}
        setSortBy={setSortBy}
        viewAllUrl="/publisher/orders"
        onViewAllClick={onViewAllClick}
        sortOptions={sortOptions}
      />
      
      {/* 订单列表 */}
      {filteredTasks.map((task, index) => (
        <div key={`task-${task.id}-${index}`} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="flex items-start justify-between overflow-hidden">
            <div className="flex-1">
              {/* 订单号和订单状态 - 调整为同一行显示 */}
              <div className="flex justify-between items-center mb-1">
                <div className="text-xs text-gray-500 flex items-center">
                  订单号: {task.id}
                  <button 
                    className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors text-xs"
                    onClick={() => handleCopyOrderNumber(task.id)}
                  >
                    复制
                  </button>
                </div>
                <span className={`px-2 py-1 rounded text-xs ${task.statusColor}`}>
                  {task.statusText}
                </span>
              </div>
              
              {/* 时间信息 - 显示订单创建时间和最新更新时间 */}
              <div className="text-xs flex w-full justify-between">
                <div className="text-left w-1/2">
                  发布时间：
                  {task.publishTime && !isNaN(new Date(task.publishTime).getTime()) 
                    ? new Date(task.publishTime).toLocaleString('zh-CN') 
                    : '时间无效'}
                </div>
                <div className="text-left w-1/2">
                  更新时间：
                  {task.updatedTime && !isNaN(new Date(task.updatedTime).getTime()) 
                    ? new Date(task.updatedTime).toLocaleString('zh-CN') 
                    : task.publishTime && !isNaN(new Date(task.publishTime).getTime())
                      ? new Date(task.publishTime).toLocaleString('zh-CN')
                      : '时间无效'}
                </div>
              </div>
              
              {/* 任务需求 - 限制为单行显示，超出部分隐藏 */}
              <div className="text-sm font-medium text-black mb-1 whitespace-nowrap overflow-hidden text-ellipsis max-w-full">
                任务需求：{task.description}
              </div>
              
              {/* 任务类型信息展示 */}
              <div className="text-xs text-black mb-1">
                任务类型: {task.category || '评论任务'}
              </div>
              <div className="flex justify-between items-center mb-1">
                <div className="text-xs text-black">
                  完成: {task.completed} | 进行中: {task.inProgress} | 待领取: {task.pending || 0} | 总计: {task.maxParticipants} 条
                </div>
              </div>
              <div className="flex justify-between items-center mb-2">
                <div className="text-sm">
                  <span className="text-black">订单单价:</span>
                  <span className="font-medium text-black"> ¥{task.price.toFixed(2)}</span>
                </div>
                <div className="text-sm">
                  <span className="text-black">总金额:</span>
                  <span className="font-medium text-black"> 
                    ¥{(task.price * task.maxParticipants).toFixed(2)}
                  </span>
                </div>
              </div>
              {/* 在进度条上添加百分比数值显示 */}
              <div className="relative bg-green-200 h-5 rounded">
                <div 
                  className="bg-green-500 h-5 rounded" 
                  style={{width: `${task.maxParticipants > 0 ? (task.participants / task.maxParticipants) * 100 : 0}%`}}
                ></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xs font-medium text-black">
                  {task.maxParticipants > 0 ? Math.round((task.participants / task.maxParticipants) * 100) : 0}%
                </div>
              </div>
            </div>
          </div>
          
          {/* 操作按钮 - 宽度设置为100% */}
          <div className="mt-3 space-y-2">
            <button
              onClick={() => handleTaskAction(task.id, '查看详情')}
              className="w-full py-2 bg-blue-500 text-white rounded font-medium hover:bg-blue-600 transition-colors text-sm"
            >
              查看详情
            </button>
            

          </div>
        </div>
      ))}
    </div>
  );
};

export default TasksTab;