import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';
import { validateTokenByRole } from '@/auth/common';

// 定义子订单接口
interface SubOrder {
  id: string;
  status: string;
  commenterId?: string;
  commenterName?: string;
  commentContent?: string;
  commentTime?: string;
  screenshotUrl?: string;
  orderNumber?: string;
  unitPrice?: number;
}

// 定义类型接口
interface Order {
  id: string;
  userId: string;
  status: string;
  subOrders?: SubOrder[];
  taskRequirements: string;
  unitPrice: number;
  completedQuantity: number;
  quantity: number;
  publishTime: string;
  deadline: string;
  taskType?: string;
  orderNumber?: string;
}

interface OrderData {
  commentOrders: Order[];
}

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
  pendingReview: number;
  publishTime: string;
  deadline: string;
  description: string;
  taskRequirements: string;
  taskType?: string;
  subOrders?: SubOrder[];
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

/**
 * 读取评论订单数据文件
 * @returns {OrderData} 订单数据
 * @throws {Error} 读取或解析失败时抛出错误
 */
const getCommentOrders = (): OrderData => {
  try {
    console.log('======= 开始读取订单数据 =======');
    const filePath = path.join(process.cwd(), 'src/data/commentOrder/commentOrder.json');
    console.log('订单数据文件路径:', filePath);
    
    // 检查文件是否存在
    if (!fs.existsSync(filePath)) {
      console.error('错误: 订单数据文件不存在');
      throw new Error('订单数据文件不存在');
    }
    
    const fileContents = fs.readFileSync(filePath, 'utf8');
    console.log('文件内容长度:', fileContents.length);
    
    // 尝试解析JSON
    const parsedData = JSON.parse(fileContents);
    console.log('JSON解析成功，数据结构:', Object.keys(parsedData));
    console.log('是否包含commentOrders属性:', 'commentOrders' in parsedData);
    
    return parsedData as OrderData;
  } catch (error) {
    console.error('读取或解析订单数据失败:', error);
    throw new Error(`读取订单数据失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }
};

/**
 * 转换订单数据为任务列表格式
 * @param {Order} order - 订单数据
 * @returns {Task} 任务数据
 */
const transformOrderToTask = (order: Order): Task => {
  // 确定任务状态和样式
  const statusInfo = getStatusInfo(order.status);
  
  // 计算子任务各种状态的数量
  const { inProgress, pending, completed, pendingReview } = countSubOrderStatuses(order.subOrders || []);
  
  // 根据任务类型确定分类
  let category = '评论任务';
  if (order.taskType === 'video_send') {
    category = '视频推送任务';
  } else if (order.taskType === 'account_rental') {
    category = '租号任务';
  }
  
  return {
    id: order.id,
    title: truncateTitle(order.taskRequirements),
    category,
    price: order.unitPrice,
    status: statusInfo.status,
    statusText: statusInfo.statusText,
    statusColor: statusInfo.statusColor,
    participants: order.completedQuantity,
    maxParticipants: order.quantity,
    completed,
    inProgress,
    pending,
    pendingReview,
    publishTime: formatDate(order.publishTime),
    deadline: formatDate(order.deadline),
    description: order.taskRequirements,
    taskRequirements: order.taskRequirements,
    taskType: order.taskType,
    subOrders: order.subOrders
  };
};

/**
 * 获取状态信息
 * @param {string} status - 状态值
 * @returns {Object} 包含状态信息的对象
 */
const getStatusInfo = (status: string): { status: string; statusText: string; statusColor: string } => {
  switch (status) {
    case 'main_progress':
      return {
        status: 'main_progress',
        statusText: '进行中',
        statusColor: 'bg-green-100 text-green-600'
      };
    case 'main_completed':
      return {
        status: 'main_completed',
        statusText: '已完成',
        statusColor: 'bg-green-100 text-green-600'
      };
    default:
      // 默认设为进行中
      return {
        status: 'main_progress',
        statusText: '进行中',
        statusColor: 'bg-green-100 text-green-600'
      };
  }
};

/**
 * 计算子订单状态数量
 * @param {Array} subOrders - 子订单数组
 * @returns {Object} 各状态数量
 */
const countSubOrderStatuses = (subOrders: SubOrder[]): {
  inProgress: number;
  pending: number;
  completed: number;
  pendingReview: number;
} => {
  if (!Array.isArray(subOrders)) {
    return { inProgress: 0, pending: 0, completed: 0, pendingReview: 0 };
  }
  
  return {
    inProgress: subOrders.filter(subOrder => 
      subOrder.status === 'sub_progress' || subOrder.status === 'in_progress'
    ).length,
    pending: subOrders.filter(subOrder => 
      subOrder.status === 'waiting_collect' || subOrder.status === 'pending'
    ).length,
    completed: subOrders.filter(subOrder => 
      subOrder.status === 'sub_completed' || subOrder.status === 'completed'
    ).length,
    pendingReview: subOrders.filter(subOrder => 
      subOrder.status === 'sub_pending_review'
    ).length
  };
};

/**
 * 截断标题
 * @param {string} text - 原始文本
 * @param {number} maxLength - 最大长度
 * @returns {string} 截断后的文本
 */
const truncateTitle = (text: string, maxLength: number = 20): string => {
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
};

/**
 * 格式化日期
 * @param {string} dateString - 日期字符串
 * @returns {string} 格式化后的日期
 */
const formatDate = (dateString: string): string => {
  try {
    return new Date(dateString).toLocaleString('zh-CN');
  } catch {
    return dateString; // 如果解析失败，返回原始字符串
  }
};

/**
 * 过滤订单以匹配当前用户
 * @param {Order[]} orders - 订单数组
 * @param {string} userId - 用户ID
 * @returns {Order[]} 过滤后的订单数组
 */
const filterOrdersByUser = (orders: Order[], userId: string): Order[] => {
  return orders.filter(order => order.userId === userId);
};

/**
 * 根据状态过滤订单
 * @param {Order[]} orders - 订单数组
 * @param {string} status - 状态值
 * @returns {Order[]} 过滤后的订单数组
 */
const filterOrdersByStatus = (orders: Order[], status: string): Order[] => {
  // 如果没有提供状态，返回所有订单
  if (!status) {
    return orders;
  }
  
  return orders.filter(order => order.status === status);
};

/**
 * 处理获取历史任务请求
 * @param {Request} request - HTTP请求对象
 * @returns {NextResponse} HTTP响应
 */
export async function GET(request: Request): Promise<NextResponse> {
  try {
    console.log('======= 开始处理历史任务请求 =======');
    
    // 1. 验证用户身份
    console.log('1. 开始验证用户身份');
    const currentUserId = await authenticateUser(request);
    console.log('验证成功，用户ID:', currentUserId);
    
    // 2. 获取查询参数
    console.log('2. 获取查询参数');
    const url = new URL(request.url);
    const statusFilter = url.searchParams.get('status') || '';
    console.log('状态过滤参数:', statusFilter);
    
    // 3. 读取和处理订单数据
    console.log('3. 读取和处理订单数据');
    const orderData = getCommentOrders();
    
    // 4. 验证数据格式
    console.log('4. 验证数据格式');
    if (!orderData.commentOrders || !Array.isArray(orderData.commentOrders)) {
      console.error('数据格式错误: commentOrders属性不存在或不是数组');
      console.log('orderData对象结构:', Object.keys(orderData));
      if (orderData.commentOrders) {
        console.log('commentOrders类型:', typeof orderData.commentOrders);
      }
      throw new Error('数据格式错误: 缺少有效的订单数据');
    }
    console.log('数据格式验证通过，订单总数:', orderData.commentOrders.length);
    
    // 5. 过滤用户订单
    console.log('5. 过滤用户订单');
    let userOrders = filterOrdersByUser(orderData.commentOrders, currentUserId);
    console.log(`用户订单数量: ${userOrders.length}/${orderData.commentOrders.length}`);
    
    // 6. 按状态过滤（如果提供了状态参数）
    if (statusFilter) {
      console.log(`6. 按状态过滤: ${statusFilter}`);
      userOrders = filterOrdersByStatus(userOrders, statusFilter);
      console.log(`按状态过滤后订单数量: ${userOrders.length}`);
    }
    
    // 7. 转换为任务格式
    console.log('7. 转换为任务格式');
    const tasks = userOrders.map(order => transformOrderToTask(order));
    console.log('转换完成，任务数量:', tasks.length);
    
    // 8. 返回成功响应
    console.log('8. 返回成功响应');
    return NextResponse.json<ApiResponse<Task[]>>({
      success: true,
      data: tasks
    });
  } catch (error) {
    // 错误处理
    console.error('处理请求时发生错误:', error);
    if (error instanceof Error) {
      // 根据错误类型返回不同状态码
      if (error.message.includes('未授权') || error.message.includes('无效的token')) {
        return NextResponse.json<ApiResponse<null>>({
          success: false,
          message: '未授权访问'
        }, { status: 401 });
      }
      
      if (error.message.includes('数据格式错误')) {
        console.error('数据格式错误详情:', error);
        return NextResponse.json<ApiResponse<null>>({
          success: false,
          message: '数据格式错误'
        }, { status: 500 });
      }
      
      // 其他错误
      console.error('其他错误详情:', error);
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        message: error.message || '获取数据失败'
      }, { status: 500 });
    }
    
    // 未知错误
    console.error('未知错误');
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      message: '获取数据失败'
    }, { status: 500 });
  }
}

/**
 * 验证用户身份
 * @param {Request} request - HTTP请求对象
 * @returns {string} 用户ID
 * @throws {Error} 验证失败时抛出错误
 */
async function authenticateUser(request: Request): Promise<string> {
  console.log('验证用户身份 - 开始');
  const authHeader = request.headers.get('authorization');
  console.log('认证头是否存在:', !!authHeader);
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.error('无效的认证头格式:', authHeader ? `长度: ${authHeader.length}` : '无认证头');
    throw new Error('无效的认证头格式');
  }
  
  const token = authHeader.substring(7); // 移除 'Bearer ' 前缀
  console.log('提取的token长度:', token.length);
  
  try {
    console.log('开始验证token');
    const user = await validateTokenByRole(token, 'publisher');
    console.log('token验证成功，获取用户数据:', user ? `用户ID: ${user.id}, 角色: ${user.role}` : '无用户数据');
    
    if (!user || user.role !== 'publisher') {
      console.error('无效的用户数据或角色不匹配:', user);
      throw new Error('无效的用户数据或角色不匹配');
    }
    
    return user.id;
  } catch (error) {
    console.error('token验证失败:', error);
    throw new Error(`token验证失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }
}