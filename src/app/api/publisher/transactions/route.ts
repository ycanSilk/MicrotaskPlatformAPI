import { NextRequest, NextResponse } from 'next/server';
import { validateTokenByRole } from '@/auth/common';
import fs from 'fs';
import path from 'path';

// 文件路径常量
const TRANSACTION_RECORDS_PATH = path.join(process.cwd(), 'src/data/financialRecords/transactionRecords.json');

// 获取所有交易记录
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

    // 获取用户的所有交易记录
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
              orderId: transaction.orderId,
              description: transaction.description || ''
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
      data: userTransactions
    }, { status: 200 });

  } catch (error) {
    console.error('获取交易记录失败:', error);
    return NextResponse.json({ success: false, message: '获取数据失败' }, { status: 500 });
  }
}