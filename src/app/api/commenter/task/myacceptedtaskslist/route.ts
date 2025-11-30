import { NextRequest, NextResponse } from 'next/server';
import config from '../../apiconfig/config.json';
import { cookies } from 'next/headers';
export const dynamic = 'force-dynamic';

/**
 * 处理已接受任务列表请求
 */
async function handleTasksListRequest(request: NextRequest) {
  try {
    // 获取token - 支持从请求头和Cookie获取，提高兼容性
    let token = '';

    if (!token) {
      try {
        const cookieStore = await cookies();
        const cookieToken = cookieStore.get('commenter_token');
        token = cookieToken?.value || '';
      } catch (cookieError) {
        console.error('无法从Cookie获取token:', cookieError);
      }
    }
    
    // 记录token获取情况用于调试
    console.log('获取到的token:', token ? '已获取有效token' : '未获取到token');
    
    // 验证token有效性
    if (!token || token.trim() === '') {
      return NextResponse.json({
        code: 401,
        message: '未登录，请先登录',
        success: false
      }, { status: 401 });
    }

    // 获取请求体参数
    let requestBody: any = {};
    try {
      // 检查请求是否有内容长度
      const contentLength = request.headers.get('content-length');
      if (contentLength && parseInt(contentLength) > 0) {
        requestBody = await request.json();
      } else {
        // 请求体为空时，不尝试解析
        console.log('请求体为空，使用默认参数');
      }
    } catch (jsonError) {
      console.warn('解析请求体失败，使用默认参数');
    }

    // 设置默认参数
    const defaultParams = {
      page: 0,
      size: 10,
      sortField: 'createTime',
      sortOrder: 'DESC',
      platform: 'DOUYIN',
      taskType: 'COMMENT',
      minPrice: 1,
      maxPrice: 99,
      keyword: ''
    };

    // 合并默认参数和请求参数
    const params = { ...defaultParams, ...requestBody };

    // 从配置文件中获取API配置
    const baseUrl = config.baseUrl;
    const taskListEndpoint = config.endpoints?.task?.myacceptedtasks;
    const timeout = config.timeout || 5000;
    const defaultHeaders = config.headers || {};
    
    // 构造完整的API URL
    const apiUrl = `${baseUrl}${taskListEndpoint}`;
    
    // 构造请求头，合并默认头和token头
    const requestHeaders: HeadersInit = {
      ...defaultHeaders,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // 调用外部API获取任务列表
    const response = await fetch(apiUrl, {
      method: 'POST', // 修改为POST方法以发送请求体
      headers: requestHeaders,
      body: JSON.stringify(params),
      signal: AbortSignal.timeout(timeout)
    });
    
    const responseData = await response.json();
    // 只输出一次外部API响应日志
    console.log('这是我接取的任务的API请求结果')
    console.log(apiUrl)
    console.log(token)
    console.log('外部API返回的完整JSON响应:', responseData.data);

   

    // 将外部API返回的数据原封不动地传递给前端
    return NextResponse.json(responseData, { status: response.status });
  } catch (error) {
    console.error('获取已接受任务列表失败:', error);
    
    return NextResponse.json(
      { 
        code: 500, 
        message: '服务器内部错误', 
        data: null, 
        success: false,
        timestamp: Date.now()
      }, 
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return handleTasksListRequest(request);
}