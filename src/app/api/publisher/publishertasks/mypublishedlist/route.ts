import { NextResponse } from 'next/server';
const config = require('../../apiconfig/config.json');
// 导入公共的token工具模块
import { formatLog, getTokenFromCookie, isValidToken } from '../../auth/token/tokenUtils';

/**
 * 获取我发布的任务列表API路由
 * 功能：处理发布者获取已发布任务列表的请求，支持分页、排序和筛选
 * 路由：POST /api/tasks/my-published
 */
export async function POST(request: Request) {
  const operation = 'GET_MY_PUBLISHED_TASKS';
  try {
    // 1. 身份验证
    const COOKIE_NAME = 'publisher_token';
    const token = await getTokenFromCookie(COOKIE_NAME, operation);
    
    if (!isValidToken(token)) {
      console.warn(formatLog(operation, '认证失败: token无效'));
      return NextResponse.json({ success: false, message: '认证失败，请先登录' }, { status: 401 });
    }
    
    // 2. 解析请求体
    let requestData;
    try {
      const requestClone = request.clone();
      const rawBody = await requestClone.text();
      requestData = JSON.parse(rawBody);
    } catch (jsonError) {
     return NextResponse.json(
        { success: false, message: '无效的JSON格式' },
        { status: 400 }
      );
    }
    
    // 3. 验证必填参数
    if (requestData.page === undefined || typeof requestData.page !== 'number' || requestData.page < 0) {
      return NextResponse.json(
        { success: false, message: '页码必须是非负整数' },
        { status: 400 }
      );
    }
    
    if (!requestData.size || typeof requestData.size !== 'number' || requestData.size < 1 || requestData.size > 100) {
      return NextResponse.json(
        { success: false, message: '每页条数必须是1-100之间的整数' },
        { status: 400 }
      );
    }
    
    // 验证排序参数
    if (requestData.sortOrder && !['ASC', 'DESC'].includes(requestData.sortOrder.toUpperCase())) {
      return NextResponse.json(
        { success: false, message: '排序方向必须是ASC或DESC' },
        { status: 400 }
      );
    }
    
    // 验证价格范围参数
    if ((requestData.minPrice !== undefined && (typeof requestData.minPrice !== 'number' || requestData.minPrice < 0)) ||
        (requestData.maxPrice !== undefined && (typeof requestData.maxPrice !== 'number' || requestData.maxPrice < 0))) {
      return NextResponse.json(
        { success: false, message: '价格必须是非负数' },
        { status: 400 }
      );
    }
    
    if (requestData.minPrice !== undefined && requestData.maxPrice !== undefined && requestData.minPrice > requestData.maxPrice) {
      return NextResponse.json(
        { success: false, message: '最低价格不能大于最高价格' },
        { status: 400 }
      );
    }
    
    // 4. 构建API请求
    const apiUrl = `${config.baseUrl}${config.endpoints.task.mypublished || '/api/tasks/my-published'}`;
    const requestParams = {
      page: requestData.page === undefined ? 0 : requestData.page,
      size: requestData.size === undefined ? 10 : requestData.size,
      sortField: requestData.sortField === undefined ? 'createTime' : requestData.sortField,
      sortOrder: requestData.sortOrder === undefined ? 'DESC' : requestData.sortOrder,
      platform: requestData.platform === undefined ? 'DOUYIN' : requestData.platform,
      taskType: requestData.taskType === undefined ? 'COMMENT' : requestData.taskType,
      minPrice: requestData.minPrice === undefined ? 1 : requestData.minPrice,
      maxPrice: requestData.maxPrice === undefined ? 999 : requestData.maxPrice,
      keyword: requestData.keyword === undefined ? '' : requestData.keyword
    };
    
    // 5. 调用外部API
    const requestHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...(config.headers || {})
    };
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: requestHeaders,
      body: JSON.stringify(requestParams)
    });
    
    
    // 6. 处理API响应
    let responseData;
    try {
      const responseText = await response.text();
      responseData = JSON.parse(responseText);  
      console.log('apiUrl', apiUrl);
    console.log('requestParams', requestParams);
    console.log('请求成功')
    console.log('返回数据：', responseData);
    } catch (jsonError) {
      console.error(formatLog(operation, `错误: API响应解析失败 - ${jsonError instanceof Error ? jsonError.message : String(jsonError)}`));
      return NextResponse.json(
        { success: false, message: '外部API返回无效响应' },
        { status: 500 }
      );
    }
    
    // 7. 判断请求是否成功
    const isSuccess = responseData.success === true && (responseData.code === 200 || !responseData.code);
    const statusCode = isSuccess ? 200 : 500;

   

    // 8. 构建响应
    const restResponse = {
      success: responseData.success,
      message: responseData.message || (isSuccess ? '获取已发布任务列表成功' : '获取已发布任务列表失败'),
      code: responseData.code || (isSuccess ? 200 : 500),
      data: {
        list: responseData.data?.list || responseData.data?.tasks || [],
        total: responseData.data?.total || 0,
        page: requestData.page,
        size: requestData.size,
        pages: Math.ceil((responseData.data?.total || 0) / requestData.size)
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
          list: [],
          total: 0,
          page: 0,
          size: 10,
          pages: 0
        },
        timestamp: Date.now()
      },
      { status: 500 }
    );
  }
}


/**
 * 处理不支持的HTTP方法
 */
export async function GET() {
  return NextResponse.json(
    { 
      success: false, 
      message: '不支持GET方法，请使用POST',
      code: 405,
      data: {
        list: [],
        total: 0,
        page: 0,
        size: 10,
        pages: 0
      },
      timestamp: Date.now()
    },
    { status: 405, headers: { 'Allow': 'POST' } }
  );
}

export async function PUT() {
  return NextResponse.json(
    { 
      success: false, 
      message: '不支持PUT方法，请使用POST',
      code: 405,
      data: {
        list: [],
        total: 0,
        page: 0,
        size: 10,
        pages: 0
      },
      timestamp: Date.now()
    },
    { status: 405, headers: { 'Allow': 'POST' } }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { 
      success: false, 
      message: '不支持DELETE方法，请使用POST',
      code: 405,
      data: {
        list: [],
        total: 0,
        page: 0,
        size: 10,
        pages: 0
      },
      timestamp: Date.now()
    },
    { status: 405, headers: { 'Allow': 'POST' } }
  );
}