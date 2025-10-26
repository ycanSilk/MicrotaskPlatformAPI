import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { validateTokenByRole } from '@/auth/common';

// 文件路径常量
const PUBLISHER_USER_PATH = path.join(process.cwd(), 'src/data/publisheruser/publisheruser.json');
const ACCOUNT_BALANCE_PATH = path.join(process.cwd(), 'src/data/accountBalance/accountBalance.json');
const TRANSACTION_RECORDS_PATH = path.join(process.cwd(), 'src/data/financialRecords/transactionRecords.json');

// 读取评论订单数据文件
const getCommentOrders = () => {
  const filePath = path.join(process.cwd(), 'src/data/commentOrder/commentOrder.json');
  const fileContents = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(fileContents);
};

// 写入评论订单数据文件
const saveCommentOrders = (data: any) => {
  try {
    const filePath = path.join(process.cwd(), 'src/data/commentOrder/commentOrder.json');
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    console.log('Comment orders saved successfully to', filePath);
    return true;
  } catch (error) {
    console.error('Failed to save comment orders:', error);
    return false;
  }
};

// 读取发布者用户数据
const getPublisherUserData = () => {
  const filePath = PUBLISHER_USER_PATH;
  const fileContents = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(fileContents);
};

// 更新发布者用户数据
const updatePublisherUserData = (data: any) => {
  try {
    fs.writeFileSync(PUBLISHER_USER_PATH, JSON.stringify(data, null, 2), 'utf8');
    console.log('Publisher user data saved successfully');
    return true;
  } catch (error) {
    console.error('Failed to save publisher user data:', error);
    return false;
  }
};

// 更新账户余额数据
const updateAccountBalanceData = (userId: string, newBalance: number, frozenAmount: number = 0) => {
  try {
    let balanceData = null;
    try {
      const balanceContent = fs.readFileSync(ACCOUNT_BALANCE_PATH, 'utf8');
      balanceData = JSON.parse(balanceContent);
    } catch (error) {
      // 如果文件不存在或读取失败，创建新的数据结构
      balanceData = {
        userId: userId,
        balance: 0,
        frozenAmount: 0,
        lastUpdateTime: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    }
    
    // 确保是当前用户的余额数据
    if (balanceData.userId === userId) {
      balanceData.balance = newBalance;
      balanceData.frozenAmount = frozenAmount;
      balanceData.lastUpdateTime = new Date().toISOString();
      balanceData.updatedAt = new Date().toISOString();
      
      fs.writeFileSync(ACCOUNT_BALANCE_PATH, JSON.stringify(balanceData, null, 2));
      console.log('Account balance data updated successfully');
      return true;
    }
    return false;
  } catch (error) {
    console.error('Failed to update account balance data:', error);
    return false;
  }
};

// 添加交易记录
const addTransactionRecord = (userId: string, orderId: string, amount: number, type: string, description: string) => {
  try {
    let transactionData = null;
    try {
      const transactionContent = fs.readFileSync(TRANSACTION_RECORDS_PATH, 'utf8');
      transactionData = JSON.parse(transactionContent);
    } catch (error) {
      // 如果文件不存在或读取失败，创建新的数据结构
      transactionData = {
        transactions: []
      };
    }
    
    const now = new Date().toISOString();
    const newTransaction = {
      orderId: orderId,
      userId: userId,
      transactionType: type, // 'expense' for task payment
      expenseType: 'task_publish',
      amount: amount,
      currency: 'CNY',
      transactionId: `trans${new Date().getTime()}`,
      status: 'completed',
      orderTime: now,
      completedTime: now,
      relatedId: orderId,
      description: 'task_publish_fee'
    };
    
    if (!transactionData.transactions) {
      transactionData.transactions = [];
    }
    transactionData.transactions.unshift(newTransaction);
    
    fs.writeFileSync(TRANSACTION_RECORDS_PATH, JSON.stringify(transactionData, null, 2));
    console.log('Transaction record added successfully');
    return true;
  } catch (error) {
    console.error('Failed to add transaction record:', error);
    return false;
  }
};

// 事务化处理 - 发布任务并扣除余额
const processTaskWithTransaction = (userId: string, orderId: string, totalCost: number, orderData: any, newOrder: any) => {
  try {
    console.log('开始事务处理 - 发布任务并扣除余额');
    
    // 1. 读取发布者用户数据
    const publisherData = getPublisherUserData();
    const userIndex = publisherData.users.findIndex((user: any) => user.id === userId);
    
    if (userIndex === -1) {
      console.error('用户不存在');
      throw new Error('用户不存在');
    }
    
    const currentUser = publisherData.users[userIndex];
    const currentBalance = currentUser.balance || 0;
    
    console.log(`当前用户余额: ¥${currentBalance}, 需要扣除: ¥${totalCost}`);
    
    // 2. 校验余额是否充足
    if (currentBalance < totalCost) {
      console.error('账户余额不足');
      throw new Error('账户余额不足');
    }
    
    // 3. 扣除余额
    const newBalance = currentBalance - totalCost;
    publisherData.users[userIndex].balance = newBalance;
    publisherData.users[userIndex].updatedAt = new Date().toISOString();
    
    // 4. 添加新订单到订单列表
    orderData.commentOrders.push(newOrder);
    console.log('添加订单后数量:', orderData.commentOrders.length);
    
    // 5. 保存所有更改 (原子性操作)
    console.log('保存所有数据更改...');
    
    // 先保存订单数据
    const saveOrderResult = saveCommentOrders(orderData);
    if (!saveOrderResult) {
      throw new Error('保存订单数据失败');
    }
    
    // 保存用户余额数据
    const saveUserResult = updatePublisherUserData(publisherData);
    if (!saveUserResult) {
      // 如果保存用户数据失败，这里应该有回滚机制，但由于是文件操作，回滚比较复杂
      // 在实际生产环境中，应该使用数据库事务
      throw new Error('保存用户数据失败');
    }
    
    // 更新账户余额数据
    updateAccountBalanceData(userId, newBalance);
    
    // 添加交易记录
    addTransactionRecord(userId, orderId, totalCost, 'expense', `发布${newOrder.taskType || '评论'}任务`);
    
    console.log('事务处理成功 - 任务发布并成功扣除余额');
    return true;
  } catch (error) {
    console.error('事务处理失败:', error);
    throw error;
  }
};

// 生成订单ID，使用用户ID和时间戳确保唯一性
const generateOrderId = (userId: string) => {
  const timestamp = Date.now();
  return `${userId}_${timestamp}`;
};

// 生成订单号
const generateOrderNumber = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `DY${year}${month}${day}${random}`;
};

// 生成子订单
const generateSubOrders = (parentId: string, quantity: number) => {
  const subOrders = [];
  // 从现有数据中获取最大的子订单ID号
  const baseId = parentId.includes('_') ? parentId.split('_')[1] : parentId;
  
  for (let i = 1; i <= quantity; i++) {
    subOrders.push({
      id: `sub${baseId}${i.toString().padStart(3, '0')}`,
      orderNumber: `SUB${baseId}${i.toString().padStart(3, '0')}`, // 子订单唯一订单号
      parentId: parentId,
      status: "pending", // 使用英文状态值
      commenterId: "",
      commenterName: "",
      commentContent: "",
      commentTime: "",
      screenshotUrl: ""
    });
  }
  return subOrders;
};

// 处理截止时间参数
const processDeadline = (deadline: string | null) => {
  if (!deadline) {
    // 默认7天后截止
    return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  }
  
  // 如果是数字，表示从现在开始的小时数
  if (!isNaN(Number(deadline))) {
    const hours = parseInt(deadline);
    return new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
  }
  
  // 尝试解析为日期字符串
  const date = new Date(deadline);
  if (!isNaN(date.getTime())) {
    return date.toISOString();
  }
  
  // 默认7天后截止
  return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
};

export async function POST(request: Request) {
  // 在函数顶部声明变量，确保在catch块中也能访问
  let currentUserId: string | null = null;
  let taskId: string | null = null;
  

  try {
    console.log('=== Comment Order API Called ===');
    console.log('Request URL:', request.url);
    console.log('Request method:', request.method);
    console.log('Request headers:', Object.fromEntries(request.headers.entries()));
    
    // 从请求头中获取认证token并解析用户ID
    const authHeader = request.headers.get('authorization');
    
    console.log('Auth header:', authHeader);
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7); // 移除 'Bearer ' 前缀
      // 使用新认证系统的验证函数来解析token
      const user = await validateTokenByRole(token, 'publisher');
      console.log('解析token结果:', user);
      if (user && user.role === 'publisher') {
        currentUserId = user.id;
      }
    }
    
    // 如果没有有效的用户ID，返回错误
    if (!currentUserId) {
      console.log('未找到有效的用户ID');
      return NextResponse.json(
        { success: false, message: '未授权访问' },
        { status: 401 }
      );
    }
    
    console.log(`当前用户ID: ${currentUserId}`);
    
    // 从请求体中获取任务信息
    const requestBody = await request.json();
    console.log('Request body:', requestBody);
    
    // 支持两种参数格式
    const taskId = requestBody.taskId || requestBody.taskType;
    const title = requestBody.title || requestBody.taskTitle;
    const icon = requestBody.icon;
    const price = requestBody.price || requestBody.taskPrice;
    const description = requestBody.description || requestBody.requirements;
    const videoUrl = requestBody.videoUrl;
    // 处理mention参数，支持单个mention
    let mention = '';
    if (requestBody.mention) {
      mention = requestBody.mention;
    } else if (Array.isArray(requestBody.mentions) && requestBody.mentions.length > 0) {
      mention = requestBody.mentions[0];
    }
    const quantity = requestBody.quantity;
    const deadline = requestBody.deadline;
    // 新增：是否需要图片评论参数
    const needImageComment = requestBody.needImageComment || false;

    // 验证必需参数（不验证videoUrl格式）
    console.log('验证参数:', { taskId, title, price, description, quantity });
    if (!taskId || !title || !price || !description || !quantity) {
      console.log('缺少必要参数:', { taskId, title, price, description, quantity });
      return NextResponse.json(
        { success: false, message: '缺少必要的参数' },
        { status: 400 }
      );
    }

    // 移除评论内容相关字数限制 - 根据需求修改

    // 验证数量参数
    const quantityNum = parseInt(quantity);
    console.log('数量参数:', { quantity, quantityNum, isNaN: isNaN(quantityNum) });
    if (isNaN(quantityNum) || quantityNum <= 0) {
      return NextResponse.json(
        { success: false, message: '数量必须是正整数' },
        { status: 400 }
      );
    }

    // 验证价格参数
    const priceNum = parseFloat(price);
    console.log('价格参数:', { price, priceNum, isNaN: isNaN(priceNum) });
    if (isNaN(priceNum) || priceNum <= 0) {
      return NextResponse.json(
        { success: false, message: '价格必须是正数' },
        { status: 400 }
      );
    }

    // 事务开始 - 读取现有订单数据
    console.log('读取现有订单数据...');
    const orderData = getCommentOrders();
    console.log('当前订单数据结构:', orderData && typeof orderData === 'object' ? '有效' : '无效');
    
    // 确保orderData和commentOrders数组存在
    if (!orderData || typeof orderData !== 'object') {
      console.error('订单数据格式错误');
      return NextResponse.json(
        { success: false, message: '系统数据错误，请稍后重试' },
        { status: 500 }
      );
    }
    
    if (!Array.isArray(orderData.commentOrders)) {
      orderData.commentOrders = [];
    }
    
    console.log('当前订单数量:', orderData.commentOrders.length);
    
    // 生成新的订单ID和订单号
    const newOrderId = generateOrderId(currentUserId);
    const newOrderNumber = generateOrderNumber();
    console.log('生成新订单ID:', newOrderId, '订单号:', newOrderNumber);
    
    // 处理截止时间
    const processedDeadline = processDeadline(deadline);
    console.log('处理截止时间:', { deadline, processedDeadline });
    
    // 创建新的订单
    const newOrder = {
      id: newOrderId,
      // 使用从token中解析的用户ID
      userId: currentUserId,
      orderNumber: newOrderNumber,
      videoUrl: videoUrl,
      mention: mention,
      status: "in_progress", // 使用英文状态值
      quantity: quantityNum,
      completedQuantity: 0,
      unitPrice: priceNum,
      taskRequirements: description,
      publishTime: new Date().toISOString(),
      deadline: processedDeadline,
      needImageComment: needImageComment, // 新增：是否需要图片评论
      taskType: taskId, // 添加任务类型
      title: title, // 添加任务标题
      subOrders: generateSubOrders(newOrderId, quantityNum)
    };
    
    console.log('创建新订单:', newOrder);

    // 计算总费用
    const totalCost = priceNum * quantityNum;
    console.log(`计算总费用: ¥${priceNum} × ${quantityNum} = ¥${totalCost}`);
    
    // 执行事务化处理 - 发布任务并扣除余额
    try {
      // 注意：新订单会在processTaskWithTransaction函数内部添加到orderData，这里不再重复添加
      const transactionResult = processTaskWithTransaction(currentUserId, newOrderId, totalCost, orderData, newOrder);
      
      if (transactionResult) {
        console.log('事务完成: 任务发布成功并成功扣除余额');
        // 返回成功响应
        return NextResponse.json({
          success: true,
          message: '评论任务发布成功！',
          order: {
            id: newOrder.id,
            orderNumber: newOrder.orderNumber
          },
          totalCost: totalCost,
          remainingBalance: (getPublisherUserData().users.find((user: any) => user.id === currentUserId)?.balance || 0)
        });
      } else {
        throw new Error('事务处理失败');
      }
    } catch (error) {
      console.error('事务处理失败:', error);
      // 特定错误处理
      if (error instanceof Error) {
        if (error.message === '账户余额不足') {
          return NextResponse.json(
            { 
              success: false, 
              message: '账户余额不足',
              errorType: 'InsufficientBalance'
            },
            { status: 400 }
          );
        }
      }
      // 返回错误响应
      return NextResponse.json(
        { success: false, message: '任务发布失败，请稍后重试' },
        { status: 500 }
      );
    }
  } catch (error) {
    // 修复错误处理中的变量作用域问题
    console.error('Comment order creation error:', error);
    
    // 获取具体的错误信息
    let errorMessage = '服务器内部错误';
    if (error instanceof Error) {
      errorMessage = `错误: ${error.message}`;
      console.error('Error stack:', error.stack);
    }
    
    // 安全地记录请求信息，避免引用可能未定义的变量
    console.error('Failed request details:');
    try {
      if (typeof currentUserId !== 'undefined') {
        console.error('- User ID:', currentUserId);
      }
      if (typeof taskId !== 'undefined') {
        console.error('- Task ID:', taskId);
      }
    } catch (e) {
      console.error('无法获取请求详情:', e);
    }
    
    return NextResponse.json(
      { 
        success: false, 
        message: errorMessage,
        errorType: error instanceof Error ? error.name : 'UnknownError',
        requestId: generateOrderNumber() // 生成一个临时请求ID，便于追踪
      },
      { status: 500 }
    );
  }
}
