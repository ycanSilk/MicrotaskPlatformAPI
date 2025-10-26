import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { validateTokenByRole } from '@/auth/common';

// 文件路径常量
const PUBLISHER_USER_PATH = path.join(process.cwd(), 'src/data/publisheruser/publisheruser.json');
const ACCOUNT_BALANCE_PATH = path.join(process.cwd(), 'src/data/accountBalance/accountBalance.json');
const TRANSACTION_RECORDS_PATH = path.join(process.cwd(), 'src/data/financialRecords/transactionRecords.json');
const COMMENT_ORDERS_PATH = path.join(process.cwd(), 'src/data/commentOrder/commentOrder.json');

// 读取评论订单数据文件
const getCommentOrders = () => {
  const fileContents = fs.readFileSync(COMMENT_ORDERS_PATH, 'utf8');
  return JSON.parse(fileContents);
};

// 写入评论订单数据文件
const saveCommentOrders = (data: any) => {
  try {
    fs.writeFileSync(COMMENT_ORDERS_PATH, JSON.stringify(data, null, 2), 'utf8');
    console.log('Comment orders saved successfully to', COMMENT_ORDERS_PATH);
    return true;
  } catch (error) {
    console.error('Failed to save comment orders:', error);
    return false;
  }
};

// 读取发布者用户数据
const getPublisherUserData = () => {
  const fileContents = fs.readFileSync(PUBLISHER_USER_PATH, 'utf8');
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
  return `AC${year}${month}${day}${random}`;
};

// 生成子订单
const generateSubOrders = (parentId: string, quantity: number, accountInfo: any) => {
  const subOrders = [];
  // 从现有数据中获取最大的子订单ID号
  const baseId = parentId.includes('_') ? parentId.split('_')[1] : parentId;
  
  for (let i = 1; i <= quantity; i++) {
    subOrders.push({
      id: `sub${baseId}${i.toString().padStart(3, '0')}`,
      orderNumber: `SUB${baseId}${i.toString().padStart(3, '0')}`,
      parentId: parentId,
      status: "waiting_collect",
      commenterId: "",
      commenterName: "",
      commentContent: "",
      commentTime: "",
      screenshotUrl: "",
      accountDetails: {
        username: `tech_account_${i.toString().padStart(3, '0')}`,
        password: "encrypted_password_placeholder",
        loginMethod: "phone_verification"
      }
    });
  }
  return subOrders;
};

// 处理截止时间参数
const processDeadline = (rentalDays: number) => {
  return new Date(Date.now() + rentalDays * 24 * 60 * 60 * 1000).toISOString();
};

export async function POST(request: Request) {
  let currentUserId: string | null = null;
  let taskId: string | null = null;
  
  try {
    console.log('=== Account Rental API Called ===');
    
    // 从请求头中获取认证token并解析用户ID
    const authHeader = request.headers.get('authorization');
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
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
    
    // 提取参数
    const taskId = requestBody.taskId || 'account_rental';
    const taskTitle = requestBody.taskTitle || '真人账号出租';
    const basePrice = requestBody.basePrice;
    const rentalDays = requestBody.rentalDays;
    const selectedAccount = requestBody.selectedAccount;
    const usagePurpose = requestBody.usagePurpose;
    const specificRequirements = requestBody.specificRequirements || '';
    const contactInfo = requestBody.contactInfo || '';
    const totalCost = requestBody.totalCost;
    
    // 验证必需参数
    if (!taskId || !taskTitle || !basePrice || !rentalDays || !selectedAccount || !usagePurpose) {
      console.log('缺少必要参数:', { taskId, taskTitle, basePrice, rentalDays, selectedAccount, usagePurpose });
      return NextResponse.json(
        { success: false, message: '缺少必要的参数' },
        { status: 400 }
      );
    }
    
    // 验证数量参数
    const rentalDaysNum = parseInt(rentalDays);
    if (isNaN(rentalDaysNum) || rentalDaysNum <= 0) {
      return NextResponse.json(
        { success: false, message: '租赁天数必须是正整数' },
        { status: 400 }
      );
    }
    
    // 验证价格参数
    const basePriceNum = parseFloat(basePrice);
    if (isNaN(basePriceNum) || basePriceNum <= 0) {
      return NextResponse.json(
        { success: false, message: '价格必须是正数' },
        { status: 400 }
      );
    }
    
    // 移除字数限制验证
    // 保留基本的非空验证
    if (!usagePurpose.trim()) {
      return NextResponse.json(
        { success: false, message: '请输入使用目的' },
        { status: 400 }
      );
    }
    
    // 事务开始 - 读取现有订单数据
    console.log('读取现有订单数据...');
    const orderData = getCommentOrders();
    
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
    
    // 生成新的订单ID和订单号
    const newOrderId = generateOrderId(currentUserId);
    const newOrderNumber = generateOrderNumber();
    
    // 处理截止时间
    const processedDeadline = processDeadline(rentalDaysNum);
    
    // 账号信息
    const accountInfo = {
      platform: "douyin",
      accountLevel: "level_3",
      followerCount: "5000+",
      requiresVerification: true,
      rentalDuration: `${rentalDaysNum}days`
    };
    
    // 创建新的订单
    const newOrder = {
      id: newOrderId,
      userId: currentUserId,
      orderNumber: newOrderNumber,
      videoUrl: "", // 账号出租业务不需要视频URL
      mention: contactInfo, // 使用联系方式作为备注
      status: "main_progress",
      quantity: 1, // 账号出租任务默认1个主任务
      completedQuantity: 0,
      unitPrice: totalCost, // 使用总费用作为单价
      taskRequirements: usagePurpose + (specificRequirements ? `\n\n特定要求：${specificRequirements}` : ''),
      publishTime: new Date().toISOString(),
      deadline: processedDeadline,
      needImageComment: false, // 账号出租不需要图片评论
      taskType: "account_rental",
      title: taskTitle,
      accountInfo: accountInfo,
      subOrders: generateSubOrders(newOrderId, 1, accountInfo) // 生成一个子订单
    };
    
    console.log('创建新订单:', newOrder);
    
    // 读取发布者用户数据
    const publisherData = getPublisherUserData();
    const userIndex = publisherData.users.findIndex((user: any) => user.id === currentUserId);
    
    if (userIndex === -1) {
      console.error('用户不存在');
      return NextResponse.json(
        { success: false, message: '用户不存在' },
        { status: 404 }
      );
    }
    
    const currentUser = publisherData.users[userIndex];
    const currentBalance = currentUser.balance || 0;
    
    // 校验余额是否充足
    if (currentBalance < totalCost) {
      console.error('账户余额不足');
      return NextResponse.json(
        { 
          success: false, 
          message: '账户余额不足',
          errorType: 'InsufficientBalance'
        },
        { status: 400 }
      );
    }
    
    // 扣除余额
    const newBalance = currentBalance - totalCost;
    publisherData.users[userIndex].balance = newBalance;
    publisherData.users[userIndex].updatedAt = new Date().toISOString();
    
    // 添加新订单到订单列表
    orderData.commentOrders.push(newOrder);
    
    // 保存所有更改
    const saveOrderResult = saveCommentOrders(orderData);
    if (!saveOrderResult) {
      throw new Error('保存订单数据失败');
    }
    
    const saveUserResult = updatePublisherUserData(publisherData);
    if (!saveUserResult) {
      throw new Error('保存用户数据失败');
    }
    
    // 更新账户余额数据
    updateAccountBalanceData(currentUserId, newBalance);
    
    // 添加交易记录
    addTransactionRecord(currentUserId, newOrderId, totalCost, 'expense', '发布账号出租任务');
    
    // 返回成功响应
    return NextResponse.json({
      success: true,
      message: '账号租赁订单发布成功！',
      order: {
        id: newOrder.id,
        orderNumber: newOrder.orderNumber
      },
      totalCost: totalCost,
      remainingBalance: newBalance
    });
    
  } catch (error) {
    console.error('Account rental creation error:', error);
    
    let errorMessage = '服务器内部错误';
    if (error instanceof Error) {
      errorMessage = `错误: ${error.message}`;
    }
    
    return NextResponse.json(
      { 
        success: false, 
        message: errorMessage,
        errorType: error instanceof Error ? error.name : 'UnknownError'
      },
      { status: 500 }
    );
  }
}