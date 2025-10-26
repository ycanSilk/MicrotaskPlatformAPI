'use client';

import React, { useState, useEffect, useRef } from 'react';
import CoolingTimer from '@/components/timer/CoolingTimer';
import { useRouter } from 'next/navigation';
import { ClockCircleOutlined, WarningOutlined, CloseCircleOutlined, BulbOutlined, CheckCircleOutlined, DollarOutlined, MailOutlined, ReloadOutlined } from '@ant-design/icons';
import { CommenterAuthStorage } from '@/auth/commenter/auth';
import AlertModal from '../../../components/ui/AlertModal';

export default function CommenterHallContentPage() {
  const [sortBy, setSortBy] = useState('time'); // 'time' | 'price'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' | 'desc'
  const [isRefreshing, setIsRefreshing] = useState(false);
  const router = useRouter();
  // 任务接口定义
  interface Task {
    id: string;
    title: string;
    price: number;
    taskLevel: string; // 任务等级
    fixedPrice: number; // 固定单价
    requirements: string;
    publishTime: string;
    progress: number;
  }

  const [tasks, setTasks] = useState<Task[]>([]);
  const [grabbingTasks, setGrabbingTasks] = useState(new Set()); // 正在抢单的任务ID
  const [lastUpdated, setLastUpdated] = useState(new Date());
  
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

  // 排序功能
  const sortTasks = (tasks: any[], sortBy: string, sortOrder: string) => {
    const sorted = [...tasks].sort((a, b) => {
      if (sortBy === 'time') {
        const timeA = new Date(a.publishTime).getTime();
        const timeB = new Date(b.publishTime).getTime();
        return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
      } else if (sortBy === 'price') {
        const priceA = typeof a.price === 'number' ? a.price : 0;
        const priceB = typeof b.price === 'number' ? b.price : 0;
        return sortOrder === 'desc' ? priceB - priceA : priceA - priceB;
      }
      return 0;
    });
    return sorted;
  };
  
  // 静态任务数据
  const staticTasks = [
    {
      id: '1',
      title: '上评评论任务',
      taskLevel: '上评评论',
      fixedPrice: 3,
      price: 3 * 0.57, // 按公式计算显示单价
      requirements: '按照要求进行评论',
      publishTime: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      progress: 25
    },
    {
      id: '2',
      title: '中评评论任务',
      taskLevel: '中评评论',
      fixedPrice: 2,
      price: 2 * 0.57, // 按公式计算显示单价
      requirements: '按照要求进行评论',
      publishTime: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      progress: 40
    },
    {
      id: '3',
      title: '上中评评论任务',
      taskLevel: '上中评评论',
      fixedPrice: 9,
      price: 9 * 0.57, // 按公式计算显示单价
      requirements: '按照要求进行评论',
      publishTime: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
      progress: 10
    },
    {
      id: '4',
      title: '中下评评论任务',
      taskLevel: '中下评评论',
      fixedPrice: 6,
      price: 6 * 0.57, // 按公式计算显示单价
      requirements: '按照要求进行评论',
      publishTime: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      progress: 60
    },
    {
      id: '5',
      title: '中评评论任务',
      taskLevel: '中评评论',
      fixedPrice: 2,
      price: 2 * 0.57, // 按公式计算显示单价
      requirements: '按照要求进行评论',
      publishTime: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
      progress: 35
    }
  ];

  // 从API获取待领取订单 - 暂停登录验证，直接使用静态数据
  const fetchAvailableTasks = async () => {
    try {
      console.log('使用静态数据展示任务列表');
      
      // 模拟网络延迟
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // 为每个静态任务添加显示信息
      const formattedTasks = staticTasks.map((task: any) => ({
        ...task
      }));
      
      setTasks(formattedTasks);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('展示静态数据时出错:', error);
      showAlert('错误', '加载任务列表时发生错误', 'error');
    }
  };

  // 刷新任务
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchAvailableTasks();
    setIsRefreshing(false);
  };

  // 冷却计时器回调函数
  const handleCoolingStart = (endTime: number) => {
    console.log('页面组件: 冷却开始', { endTime });
  };
  
  const handleCoolingEnd = () => {
    console.log('页面组件: 冷却结束');
  };
  
  // 抢单功能 - 暂停API调用，仅显示模拟成功消息
  const handleGrabTask = async (taskId: string) => {
    console.log('=== 抢单功能开始 ===', { taskId });
    // 检查是否处于冷却状态 - 注释掉冷却时间检查
    // if (isCoolingDown()) {
    //   console.log('当前处于冷却状态，显示冷却模态框');
    //   setShowCoolingModal(true);
    //   return;
    // }

    if (grabbingTasks.has(taskId)) {
      console.log('该任务正在抢单中，忽略重复点击');
      return;
    }



    try {
      // 移除登录验证和角色验证限制
      // const user = CommenterAuthStorage.getCurrentUser();
      // if (!user) {
      //   console.log('用户未登录');
      //   showAlert('提示', '请先登录', 'info');
      //   return;
      // }

      // // 检查用户角色是否为评论员
      // if (user.role !== 'commenter') {
      //   console.log('用户角色不是评论员');
      //   showAlert('权限不足', '您不是评论员角色，无法抢单', 'warning');
      //   return;
      // }

      setGrabbingTasks(prev => new Set(prev).add(taskId));
      console.log('设置任务为正在抢单状态');

      // 模拟网络延迟
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log('模拟抢单成功');
      
      // 模拟成功响应
      showAlert('抢单成功', '您已成功抢到该任务。单个抖音账号每天评论任务次数5次以内。超过5次可能会影响抖音账号权重导致无法正常显示评论影响个人账号的完成率。如个人有多个抖音账号，可以注册多个平台账号', 'success');
      
      // 移除冷却计时器的调用
      // console.log('调用冷却计时器开始5分钟冷却');
      // coolingTimerRef.current?.startCooling(5);
      
      // 抢单成功后延迟3秒跳转到任务页面
      setTimeout(() => {
        console.log('跳转到任务页面');
        router.push('/commenter/tasks');
      }, 4000);
      
      // 抢单成功后立即刷新列表
      await fetchAvailableTasks();
      
    } catch (error) {
      console.error('模拟抢单错误:', error);
      showAlert('错误', '模拟抢单时发生错误', 'error');
    } finally {
      setGrabbingTasks(prev => {
        const newSet = new Set(prev);
        newSet.delete(taskId);
        return newSet;
      });
      console.log('=== 抢单功能结束 ===');
    }
  };

  // 移除定期检查超时订单的功能
  useEffect(() => {
    // 初始加载订单
    fetchAvailableTasks();
  }, []);
  
  // 初始化冷却时间检查已移至CoolingTimer组件中
  
  // 冷却时间倒计时逻辑已移至CoolingTimer组件中
  
  // 冷却时间结束处理已移至CoolingTimer组件中
  
  // storage事件监听已移至CoolingTimer组件中
  
  // 获取排序后的任务
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
          <span className="font-bold text-gray-800">全部任务 ({sortedTasks.length})</span>
          <div className="text-xs text-gray-500">
            最后更新: {new Date().toLocaleTimeString()}
          </div>
        </div>

        {sortedTasks.length === 0 ? (
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
          sortedTasks.map((task) => (
            <div key={task.id} className="bg-white rounded-lg p-4 mb-4 shadow-sm">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-bold text-gray-800">{task.title}</h3>
                <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded mt-1 inline-block">
                  {task.taskLevel}
                </span>
              </div>
            </div>
            
            <div className="flex justify-between items-center mb-3">
              <div className="text-lg font-bold text-orange-500">¥{typeof task.price === 'number' ? task.price.toFixed(2) : '0.00'}</div>
              <div className="text-xs text-gray-500">
                <ClockCircleOutlined className="inline-block mr-1" /> {new Date(task.publishTime).toLocaleString()}
              </div>
            </div>
            
      
            <div className="text-sm text-gray-600 mb-4">
              要求：{task.requirements}
            </div>
            
            <button 
              className={`w-full py-3 rounded-lg font-medium transition-colors ${grabbingTasks.has(task.id) ? 'bg-gray-400 text-gray-200 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
              onClick={() => handleGrabTask(task.id)}
              disabled={grabbingTasks.has(task.id)}
            >
              {grabbingTasks.has(task.id) ? '抢单中...' : '抢单'}
            </button>
            </div>
          ))
        )}
      </div>
      
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
      
      {/* 固定在底部的刷新按钮 */}
      <div className="fixed bottom-12 left-0 right-0 px-4 py-3 bg-white">
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className={`w-full py-3 rounded-lg font-medium transition-all ${isRefreshing ? ' text-gray-200 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
        >
          <div className="flex items-center justify-center space-x-2">
            <span className={isRefreshing ? 'animate-spin' : ''}>
              <ReloadOutlined />
            </span>
            <span>{isRefreshing ? '刷新中...' : '刷新订单'}</span>
          </div>
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
  );
}