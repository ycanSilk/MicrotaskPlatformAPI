import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { validateTokenByRole } from '@/auth/common';


// 读取评论订单数据文件
const getCommentOrders = () => {
  const filePath = path.join(process.cwd(), 'src/data/commentOrder/commentOrder.json');
  const fileContents = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(fileContents);
};

// 获取统计数据
const getStatsData = (orders: any[], timeRange: string) => {
  // 根据时间范围过滤订单
  const filteredOrders = filterOrdersByTimeRange(orders, timeRange);
  
  // 计算统计数据
  const totalTasks = filteredOrders.length;
  const activeTasks = filteredOrders.filter(order => order.status === 'main_progress').length;
  const completedTasks = filteredOrders.filter(order => order.status === 'main_completed').length;
  const totalSpent = filteredOrders.reduce((sum, order) => sum + (order.unitPrice * order.quantity), 0);
  
  // 计算子订单统计数据
  let totalInProgressSubOrders = 0;
  let totalCompletedSubOrders = 0;
  let totalPendingReviewSubOrders = 0;
  let totalPendingSubOrders = 0;
  
  filteredOrders.forEach(order => {
    if (order.subOrders && Array.isArray(order.subOrders)) {
      totalInProgressSubOrders += order.subOrders.filter((subOrder: any) => subOrder.status === 'sub_progress').length;
      totalCompletedSubOrders += order.subOrders.filter((subOrder: any) => subOrder.status === 'sub_completed').length;
      totalPendingReviewSubOrders += order.subOrders.filter((subOrder: any) => subOrder.status === 'sub_pending_review').length;
      totalPendingSubOrders += order.subOrders.filter((subOrder: any) => subOrder.status === 'waiting_collect').length;
    }
  });
  
  // 计算平均客单价
  const averageOrderValue = totalTasks > 0 ? totalSpent / totalTasks : 0;
  
  return {
    totalTasks,
    activeTasks,
    completedTasks,
    totalSpent,
    totalInProgressSubOrders,
    totalCompletedSubOrders,
    totalPendingReviewSubOrders,
    totalPendingSubOrders,
    averageOrderValue
  };
};

// 根据时间范围过滤订单
const filterOrdersByTimeRange = (orders: any[], timeRange: string) => {
  // 如果时间范围是'all'，则不过滤
  if (timeRange === 'all') {
    return orders;
  }
  
  // 使用本地时间而不是UTC时间
  const now = new Date();
  
  // 设置时间范围的开始时间和结束时间（使用本地时间）
  let startTime: Date;
  let endTime: Date = now; // 默认为当前时间
  
  switch (timeRange) {
    case 'today':
      // 今天的开始时间（本地时间）
      startTime = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    case 'yesterday':
      // 昨天的开始时间和结束时间（本地时间）
      startTime = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
      endTime = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      endTime.setMilliseconds(-1); // 设为昨天的最后一毫秒
      break;
    case 'dayBeforeYesterday':
      // 前天的开始时间和结束时间（本地时间）
      startTime = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 2);
      endTime = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
      endTime.setMilliseconds(-1); // 设为前天的最后一毫秒
      break;
    default:
      return orders; // 返回所有订单
  }
  

  
  // 过滤在时间范围内的订单（检查发布时间，转换为本地时间进行比较）
  const filteredOrders = orders.filter(order => {
    try {
      // 确保order.publishTime存在且是有效的日期字符串
      if (!order.publishTime) {
        return false;
      }
      
      const publishTime = new Date(order.publishTime);
      
      // 检查publishTime是否是有效日期
      if (isNaN(publishTime.getTime())) {
        return false;
      }
      
      const isInRange = publishTime >= startTime && publishTime <= endTime;
      return isInRange;
    } catch (error) {
      return false;
    }
  });
  
  return filteredOrders;
};

// 转换订单数据为任务列表格式
const transformOrdersToTasks = (orders: any[]) => {
  return orders.map(order => {
    // 确定任务状态（使用原始状态值）
    let status, statusText, statusColor;
    switch (order.status) {
      case 'main_progress':
        status = 'main_progress';  // 保持原始状态值
        statusText = '进行中';
        statusColor = 'bg-green-100 text-green-600';
        break;
      case 'main_completed':
        status = 'main_completed';  // 保持原始状态值
        statusText = '已完成';
        statusColor = 'bg-green-100 text-green-600';
        break;
      default:
        // 根据规范，主任务只有进行中和已完成两种状态
        // 如果状态不是这两个之一，默认设为进行中
        status = 'main_progress';  // 保持原始状态值
        statusText = '进行中';
        statusColor = 'bg-green-100 text-green-600';
    }
    
    // 计算进行中、待抢单和已完成的数量
    let inProgress = 0;
    let pending = 0;
    let completed = 0;
    let pendingReview = 0; // 添加待审核的数量
    
    if (order.subOrders && Array.isArray(order.subOrders)) {
      inProgress = order.subOrders.filter((subOrder: any) => subOrder.status === 'sub_progress').length;
      pending = order.subOrders.filter((subOrder: any) => subOrder.status === 'waiting_collect').length;
      completed = order.subOrders.filter((subOrder: any) => subOrder.status === 'sub_completed').length;
      pendingReview = order.subOrders.filter((subOrder: any) => subOrder.status === 'sub_pending_review').length; // 计算待审核的数量
    }
    
    return {
      id: order.id,
      title: order.taskRequirements.substring(0, 20) + (order.taskRequirements.length > 20 ? '...' : ''),
      category: '评论任务',
      price: order.unitPrice,
      status,
      statusText,
      statusColor,
      participants: order.completedQuantity,
      maxParticipants: order.quantity,
      completed: completed,
      inProgress: inProgress, // 进行中的数量
      pending: pending, // 待抢单的数量
      pendingReview: pendingReview, // 待审核的数量
      publishTime: new Date(order.publishTime).toLocaleString('zh-CN'),
      deadline: new Date(order.deadline).toLocaleString('zh-CN'),
      description: order.taskRequirements,
      orderNumber: order.orderNumber, // 添加订单号字段
      taskType: order.taskType // 添加任务类型字段
    };
  });
};

// 获取待审核的订单
const getPendingOrders = (orders: any[], currentUserId: string) => {
  // 查找所有状态为"审核中"的子订单，并且主任务属于当前用户
  const pendingSubOrders: any[] = [];
  
  orders.forEach(order => {
    // 只处理当前用户的订单（确保订单属于当前用户）
    if (order.userId === currentUserId) {
      // 确保subOrders存在且为数组
      if (order.subOrders && Array.isArray(order.subOrders)) {
        const pendingSubs = order.subOrders.filter((subOrder: any) => {
          const isPendingReview = subOrder.status === 'sub_pending_review';
          return isPendingReview;
        });
        
        pendingSubs.forEach((subOrder: any) => {
          const pendingOrder = {
            id: subOrder.id,
            taskTitle: order.taskRequirements.substring(0, 20) + (order.taskRequirements.length > 20 ? '...' : ''),
            orderNumber: subOrder.orderNumber || '未知子订单号',
            commenterName: subOrder.commenterName || '未知评论员',
            submitTime: subOrder.commentTime ? new Date(subOrder.commentTime).toLocaleString('zh-CN') : '未知时间',
            content: subOrder.commentContent || '无内容',
            images: subOrder.screenshotUrl ? [subOrder.screenshotUrl] : []
          };
          pendingSubOrders.push(pendingOrder);
        });
      }
    }
  });
  
  return pendingSubOrders;
};

// 过滤订单以匹配当前用户
const filterOrdersByUser = (orders: any[], userId: string) => {
  return orders.filter(order => order.userId === userId);
};

export async function GET(request: Request) {
  try {
    // 添加no-cache头来避免缓存
    const headers = {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    };
    
    // 从请求头中获取认证token并解析用户ID
    const authHeader = request.headers.get('authorization');
    let currentUserId = null;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7); // 移除 'Bearer ' 前缀
      // 使用新认证系统的验证函数来解析token
      const user = await validateTokenByRole(token, 'publisher');
      if (user && user.role === 'publisher') {
        currentUserId = user.id;
      }
    }
    
    // 如果没有有效的用户ID，返回错误
    if (!currentUserId) {
      return NextResponse.json(
        { success: false, message: '未授权访问' },
        { status: 401, headers }
      );
    }
    
    

    const url = new URL(request.url);
    const timeRange = url.searchParams.get('timeRange') || 'all'; // 默认使用'all'而不是'today'
    
    // 读取订单数据
    const orderData = getCommentOrders();
    const allOrders = orderData.commentOrders;
    
    // 过滤当前用户的订单
    const userOrders = filterOrdersByUser(allOrders, currentUserId);
    
    // 获取统计数据
    const stats = getStatsData(userOrders, timeRange);
    
    // 获取仪表板数据
    const allTasks = transformOrdersToTasks(userOrders);
  
    // 分类任务（使用原始状态值）
    const activeTasks = allTasks.filter(task => task.status === 'main_progress');
    const completedTasks = allTasks.filter(task => task.status === 'main_completed');
    
    // 获取待审核订单（只获取当前用户的）
    const pendingOrders = getPendingOrders(allOrders, currentUserId); // 修复：使用allOrders以确保能查找到所有用户的订单
    
    // 获取派发的任务列表（最近10个）
    const dispatchedTasks = allTasks.slice(0, 10).map(task => ({
      id: task.id,
      title: task.title,
      status: task.status,
      statusText: task.statusText,
      participants: task.participants,
      maxParticipants: task.maxParticipants,
      time: task.publishTime, // 直接使用发布时间而不是计算时间差
      completed: task.completed,
      inProgress: task.inProgress, // 添加进行中的数量
      pending: task.pending, // 添加待抢单的数量
      pendingReview: task.pendingReview, // 添加待审核的数量
      price: task.price, // 添加单价字段
      orderNumber: task.orderNumber, // 传递订单号字段
      taskType: task.taskType, // 传递任务类型字段
      taskRequirements: task.description // 传递任务需求字段
    }));
    

    
    return NextResponse.json({
      success: true,
      data: {
        stats,
        activeTasks,
        completedTasks,
        pendingOrders,
        dispatchedTasks
      }
    }, { headers });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: '获取数据失败' },
      { status: 500 }
    );
  }
}

// 计算时间差（用于显示"几小时前"等）
const getTimeAgo = (publishTime: string) => {
  const publishDate = new Date(publishTime);
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - publishDate.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 1) {
    return '刚刚';
  } else if (diffInHours < 24) {
    return `${diffInHours}小时前`;
  } else {
    return `${Math.floor(diffInHours / 24)}天前`;
  }
};