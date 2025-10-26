import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';


// 读取评论订单数据文件
const getCommentOrders = () => {
  const filePath = path.join(process.cwd(), 'src/data/commentOrder/commentOrder.json');
  const fileContents = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(fileContents);
};

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const taskId = url.searchParams.get('taskId');
    
    console.log('API route called with URL:', request.url);
    console.log('Extracted taskId from query params:', taskId);

    // 读取订单数据
    const orderData = getCommentOrders();
    
    // 如果提供了taskId，则返回特定任务的详情
    if (taskId) {
      // 确保orderData.commentOrders存在
      if (!orderData.commentOrders || !Array.isArray(orderData.commentOrders)) {
        console.error('commentOrders is not an array in data');
        return NextResponse.json(
          { success: false, message: '数据格式错误' },
          { status: 500 }
        );
      }
      
      const task = orderData.commentOrders.find((order: any) => order.id === taskId);
      console.log('Found task:', task ? 'Yes' : 'No');
      if (task) {
        return NextResponse.json({
          success: true,
          data: task
        });
      } else {
        console.log(`Task with ID ${taskId} not found in commentOrders`);
        return NextResponse.json(
          { success: false, message: '未找到指定任务' },
          { status: 404 }
        );
      }
    }
    
    // 如果没有提供taskId，则返回所有订单数据
    return NextResponse.json({
      success: true,
      data: orderData
    });
  } catch (error) {
    console.error('Task detail fetch error:', error);
    return NextResponse.json(
      { success: false, message: '获取任务详情失败' },
      { status: 500 }
    );
  }
}