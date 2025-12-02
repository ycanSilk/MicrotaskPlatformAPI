import { NextResponse } from 'next/server';
const config = require('../../apiconfig/config.json');
// 导入公共的token工具模块
import { formatLog, getTokenFromCookie, isValidToken } from '../../auth/token/tokenUtils';

// 强制使用动态渲染，因为该路由需要访问cookies
export const dynamic = 'force-dynamic';

/**
 * 获取我发布的任务列表API路由
 * 功能：处理发布者获取已发布任务列表的请求，支持分页、排序和筛选
 * 路由：POST /api/tasks/my-published
 */
/**
 * 获取任务统计信息API路由
 * 功能：处理发布者获取任务统计信息的请求
 * 路由：GET /api/tasks/stats
 */
export async function GET(request: Request) {
  const operation = 'GET_TASK_STATS';
  try {
    // 1. 身份验证
    const COOKIE_NAME = 'publisher_token';
    const token = await getTokenFromCookie(COOKIE_NAME, operation);
    
    if (!isValidToken(token)) {
      console.warn(formatLog(operation, '认证失败: token无效'));
      return NextResponse.json({ success: false, message: '认证失败，请先登录' }, { status: 401 });
    }
    
    // 2. 构建API请求
    const apiUrl = `${config.baseUrl}${config.endpoints.task.taskcount}`;
    
    // 3. 调用外部API
    const requestHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...(config.headers || {})
    };
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: requestHeaders
    });

    // 4. 处理API响应
    let responseData;
    try {
      const responseText = await response.text();
      responseData = JSON.parse(responseText);
      console.log("这是获取任务统计数据的API返回的日志输出:", apiUrl);
      console.log("这是获取任务统计数据的API返回的日志输出:", token);
      console.log('这是获取任务统计数据的API返回的日志输出:', response);
      console.log('任务统计数据:', responseData.data);
    } catch (jsonError) {
      console.error(formatLog(operation, `错误: API响应解析失败 - ${jsonError instanceof Error ? jsonError.message : String(jsonError)}`));
      return NextResponse.json(
        { success: false, message: '外部API返回无效响应' },
        { status: 500 }
      );
    }
    
    // 5. 判断请求是否成功
    const isSuccess = responseData.success === true && (responseData.code === 200 || !responseData.code);
    const statusCode = isSuccess ? 200 : 500;
    
    // 6. 构建响应
    const restResponse = {
      success: responseData.success,
      message: responseData.message || (isSuccess ? '获取任务统计信息成功' : '获取任务统计信息失败'),
      code: responseData.code || (isSuccess ? 200 : 500),
      data: responseData.data || {
      publishedCount: 0,
      acceptedCount: 0,
      submittedCount: 0,
      completedCount: 0,
      totalEarnings: 0,
      pendingEarnings: 0,
      todayEarnings: 0,
      monthEarnings: 0,
      passedCount: 0,
      rejectedCount: 0,
      passRate: 0,
      avgCompletionTime: 0,
      ranking: 0,
      agentTasksCount: 0,
      agentEarnings: 0,
      invitedUsersCount: 0
      },
      timestamp: Date.now()
    };
    
    return NextResponse.json(restResponse, { status: statusCode });
    
  } catch (error) {
    // 错误处理
    return NextResponse.json(
      { 
        success: false, 
        message: '服务器内部错误',
        code: 500,
        data: {
          totalTasks: 0,
          inProgressTasks: 0,
          completedTasks: 0,
          pendingTasks: 0,
          cancelledTasks: 0,
          totalAmount: 0,
          taskTypeDistribution: {}
        },
        timestamp: Date.now()
      },
      { status: 500 }
    );
  }
}

