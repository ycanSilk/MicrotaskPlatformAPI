import fs from 'fs';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';
import { validateTokenByRole } from '@/auth/common';

// 文件路径常量
const TRANSACTION_RECORDS_PATH = path.join(process.cwd(), 'src/data/financialRecords/transactionRecords.json');

// 获取交易详情
export async function GET(req: NextRequest) {
  try {
    console.log('接收到交易详情请求:', req.url);
    
    // 验证用户认证token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.log('未提供认证信息');
      return NextResponse.json({ success: false, message: '未提供认证信息' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const userInfo = await validateTokenByRole(token, 'publisher');
    
    if (!userInfo) {
      console.log('无效的认证信息');
      return NextResponse.json({ success: false, message: '无效的认证信息' }, { status: 401 });
    }

    const userId = userInfo.id;
    console.log('用户ID:', userId);

    // 从查询参数中获取交易ID
    const searchParams = req.nextUrl.searchParams;
    const transactionId = searchParams.get('id');
    
    if (!transactionId) {
      console.log('未提供交易ID');
      return NextResponse.json({ success: false, message: '未提供交易ID' }, { status: 400 });
    }
    
    console.log('请求的交易ID:', transactionId);

    // 读取交易记录文件
    try {
      const transactionContent = fs.readFileSync(TRANSACTION_RECORDS_PATH, 'utf8');
      const transactionData = JSON.parse(transactionContent);
      
      if (transactionData.transactions && Array.isArray(transactionData.transactions)) {
        // 查找指定ID的交易记录
        // 注意：需要同时检查transactionId和orderId，因为前端可能传递的是orderId
        const transaction = transactionData.transactions.find((t: any) => 
          t.transactionId === transactionId || t.orderId === transactionId
        );
        
        if (transaction) {
          console.log('找到交易记录:', transaction);
          
          // 检查交易记录是否属于当前用户
          if (transaction.userId !== userId) {
            console.log('交易记录不属于当前用户');
            return NextResponse.json({ success: false, message: '交易记录不存在' }, { status: 404 });
          }
          
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
                        transaction.paymentMethod === 'usdt' ? 'USDT' : 
                        transaction.paymentMethod;
          } else if (type === 'expense') {
            methodText = transaction.expenseType === 'task_publish' ? '任务支付' : transaction.expenseType;
          }
          
          // 格式化返回的交易详情
          const transactionDetail = {
            id: transaction.transactionId || transaction.orderId,
            type: type,
            amount: amount,
            status: transaction.status === 'completed' ? 'success' : transaction.status,
            method: methodText,
            time: transaction.completedTime ? new Date(transaction.completedTime).toLocaleString('zh-CN') : 
                 transaction.orderTime ? new Date(transaction.orderTime).toLocaleString('zh-CN') : '',
            orderId: transaction.orderId,
            description: transaction.description || '',
            // 额外的详情字段
            transactionId: transaction.transactionId,
            paymentMethod: transaction.paymentMethod,
            currency: transaction.currency,
            ipAddress: transaction.ipAddress,
            orderTime: transaction.orderTime,
            completedTime: transaction.completedTime,
            relatedId: transaction.relatedId,
            expenseType: transaction.expenseType
          };
          
          console.log('返回交易详情:', transactionDetail);
          return NextResponse.json({
            success: true,
            data: transactionDetail
          }, { status: 200 });
        } else {
          console.log('未找到交易记录');
          return NextResponse.json({ success: false, message: '交易记录不存在' }, { status: 404 });
        }
      }
    } catch (error) {
      console.error('读取交易记录数据失败:', error);
      return NextResponse.json({ success: false, message: '读取数据失败' }, { status: 500 });
    }

  } catch (error) {
    console.error('获取交易详情失败:', error);
    return NextResponse.json({ success: false, message: '获取数据失败' }, { status: 500 });
  }
}