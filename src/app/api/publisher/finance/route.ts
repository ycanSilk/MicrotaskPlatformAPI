import { NextRequest, NextResponse } from 'next/server';
import { validateTokenByRole } from '@/auth/common';
import publisherUser from '../../../../data/publisheruser/publisheruser.json';
import fs from 'fs';
import path from 'path';


// 文件路径常量
const PUBLISHER_USER_PATH = path.join(process.cwd(), 'src/data/publisheruser/publisheruser.json');
const ACCOUNT_BALANCE_PATH = path.join(process.cwd(), 'src/data/accountBalance/accountBalance.json');
const TRANSACTION_RECORDS_PATH = path.join(process.cwd(), 'src/data/financialRecords/transactionRecords.json');

// 获取用户余额信息
export async function GET(req: NextRequest) {
  try {
    // 验证用户认证token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ success: false, message: '未提供认证信息' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const userInfo = await validateTokenByRole(token, 'publisher');
    
    if (!userInfo) {
      return NextResponse.json({ success: false, message: '无效的认证信息' }, { status: 401 });
    }

    const userId = userInfo.id;

    // 读取用户数据
    const publisherData = publisherUser.users.find(user => user.id === userId);
    
    // 读取账户余额数据
    let balanceData = null;
    try {
      const balanceContent = fs.readFileSync(ACCOUNT_BALANCE_PATH, 'utf8');
      const balanceJson = JSON.parse(balanceContent);
      balanceData = balanceJson;
    } catch (error) {
      console.error('读取账户余额数据失败:', error);
    }

    // 首先使用publisherUser中的balance作为默认值
    let balance = {
      total: publisherData?.balance || 0,
      frozen: 0,
      available: publisherData?.balance || 0
    };

    // 如果存在账户余额数据，并且是当前用户的，则更新余额信息
    if (balanceData && balanceData.userId === userId) {
      // 记录原始余额数据以便调试
      console.log('读取到的账户余额数据:', balanceData);
      
      // 使用accountBalance.json中的balance字段更新total值
      const accountBalanceValue = balanceData.balance || 0;
      balance = {
        total: accountBalanceValue,
        frozen: balanceData.frozenAmount || 0,
        available: accountBalanceValue
      };
      
      console.log('处理后的余额数据:', balance);
    }

    // 获取用户的交易记录
    const userTransactions: any[] = [];
    
    try {
      const transactionContent = fs.readFileSync(TRANSACTION_RECORDS_PATH, 'utf8');
      const transactionData = JSON.parse(transactionContent);
      
      // 从交易记录中筛选当前用户的数据
      if (transactionData.transactions && Array.isArray(transactionData.transactions)) {
        transactionData.transactions
          .filter((transaction: any) => transaction.userId === userId)
          .forEach((transaction: any) => {
            // 确定交易类型和金额
            let type = transaction.transactionType;
            let amount = transaction.amount;
            
            // 对于支出类型，金额应为负数
            if (type === 'expense') {
              amount = -amount;
            }
            
            // 确定支付方式文本
            let methodText = '';
            if (type === 'recharge') {
              methodText = transaction.paymentMethod === 'alipay' ? '支付宝' : 
                          transaction.paymentMethod === 'wechat_pay' ? '微信支付' : 
                          transaction.paymentMethod;
            } else if (type === 'expense') {
              methodText = transaction.expenseType === 'task_publish' ? '任务支付' : transaction.expenseType;
            }
            
            userTransactions.push({
              id: transaction.orderId,
              type: type,
              amount: amount,
              status: transaction.status === 'completed' ? 'success' : transaction.status,
              method: methodText,
              time: transaction.completedTime ? new Date(transaction.completedTime).toLocaleString('zh-CN') : '',
              orderId: transaction.orderId
            });
          });
      }
    } catch (error) {
      console.error('读取交易记录数据失败:', error);
    }

    // 按时间排序
    userTransactions.sort((a, b) => {
      return new Date(b.time).getTime() - new Date(a.time).getTime();
    });

    return NextResponse.json({
      success: true,
      data: {
        balance,
        transactions: userTransactions.slice(0, 5) // 返回最近5条记录
      }
    }, { status: 200 });

  } catch (error) {
    console.error('获取财务数据失败:', error);
    return NextResponse.json({ success: false, message: '获取数据失败' }, { status: 500 });
  }
}

// 处理充值请求
export async function POST(req: NextRequest) {
  try {
    // 验证用户认证token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ success: false, message: '未提供认证信息' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const userInfo = await validateTokenByRole(token, 'publisher');
    
    if (!userInfo) {
      return NextResponse.json({ success: false, message: '无效的认证信息' }, { status: 401 });
    }

    const userId = userInfo.id;
    const { amount, paymentMethod } = await req.json();

    // 验证金额
    if (!amount || isNaN(amount) || amount <= 0) {
      return NextResponse.json({ success: false, message: '请输入有效的充值金额' }, { status: 400 });
    }

    // 生成订单ID
    const orderId = `recharge${new Date().getTime()}`;
    const now = new Date().toISOString();

    // 更新publisher用户余额
    const publisherData = JSON.parse(fs.readFileSync(PUBLISHER_USER_PATH, 'utf8'));
    const userIndex = publisherData.users.findIndex((user: any) => user.id === userId);
    
    if (userIndex !== -1) {
      publisherData.users[userIndex].balance += amount;
      publisherData.users[userIndex].updatedAt = now;
      fs.writeFileSync(PUBLISHER_USER_PATH, JSON.stringify(publisherData, null, 2));
    }

    // 更新账户余额数据
    try {
      let balanceData = JSON.parse(fs.readFileSync(ACCOUNT_BALANCE_PATH, 'utf8'));
      
      // 确保是当前用户的余额数据
      if (balanceData.userId === userId) {
        // 更新主要余额字段
        balanceData.balance = (balanceData.balance || 0) + amount;
        balanceData.lastUpdateTime = now;
        balanceData.updatedAt = now;
        
        // 更新最近充值信息
        if (balanceData.rechargeInfo) {
          balanceData.rechargeInfo.lastRechargeTime = now;
          balanceData.rechargeInfo.lastRechargeAmount = amount;
        }
        
        fs.writeFileSync(ACCOUNT_BALANCE_PATH, JSON.stringify(balanceData, null, 2));
      }
    } catch (error) {
      console.error('更新账户余额数据失败:', error);
      // 即使余额数据更新失败，也继续处理其他部分
    }

    // 添加充值记录到transactionRecords
    try {
      let transactionData = JSON.parse(fs.readFileSync(TRANSACTION_RECORDS_PATH, 'utf8'));
      const newTransaction = {
        orderId,
        userId,
        transactionType: 'recharge',
        amount,
        currency: 'CNY',
        paymentMethod,
        transactionId: `trans${new Date().getTime()}`,
        status: 'completed',
        orderTime: now,
        paymentTime: now,
        completedTime: now,
        ipAddress: req.headers.get('x-forwarded-for') || req.ip || '',
        description: 'account_recharge'
      };

      if (!transactionData.transactions) {
        transactionData.transactions = [];
      }
      transactionData.transactions.unshift(newTransaction);
      fs.writeFileSync(TRANSACTION_RECORDS_PATH, JSON.stringify(transactionData, null, 2));
    } catch (error) {
      console.error('更新交易记录失败:', error);
      // 即使交易记录更新失败，也继续完成充值处理
    }

    return NextResponse.json({
      success: true,
      message: `充值 ¥${amount} 成功！`,
      orderId
    }, { status: 200 });

  } catch (error) {
    console.error('充值失败:', error);
    return NextResponse.json({ success: false, message: '充值失败，请稍后重试' }, { status: 500 });
  }
}