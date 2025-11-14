import { NextResponse } from 'next/server';
const config = require('../../apiconfig/config.json');
// 导入公共的token工具模块
import { formatLog, getTokenFromCookie, isValidToken } from '../../auth/token/tokenUtils';

export async function POST(request: Request) {
  const operation = 'GET_PENDING_VERIFY_TASKS';
  
  // 记录请求开始信息
  console.log('========================================');
  console.log(`[${new Date().toISOString()}] 请求开始: ${operation}`);
  
  try {
    // 1. 记录请求URL和方法信息
    const url = new URL(request.url);
    console.log('请求URL信息:', {
      fullUrl: request.url,
      pathname: url.pathname,
      query: Object.fromEntries(url.searchParams),
      method: request.method
    });
    
    // 2. 记录请求头信息
    console.log('请求头信息:', {
      'content-type': request.headers.get('content-type'),
      'accept': request.headers.get('accept'),
      'user-agent': request.headers.get('user-agent')
    });
    
    // 3. 身份验证
    const COOKIE_NAME = 'publisher_token';
    const token = await getTokenFromCookie(COOKIE_NAME, operation);
    console.log('认证信息:', { hasToken: !!token });
    
    if (!isValidToken(token)) {
      console.warn(formatLog(operation, '认证失败: token无效'));
      return NextResponse.json({ success: false, message: '认证失败，请先登录' }, { status: 401 });
    }
    // 记录token获取情况用于调试
    console.log('获取到的token:', token ? '已获取有效token' : '未获取到token');

    // 4. 解析请求体
    let requestData;
    try {
      const requestClone = request.clone();
      const rawBody = await requestClone.text();
      requestData = JSON.parse(rawBody);
      
      // 记录请求参数
      console.log('请求参数详情:', {
        page: requestData.page,
        size: requestData.size,
        sortField: requestData.sortField,
        sortOrder: requestData.sortOrder,
        platform: requestData.platform,
        taskType: requestData.taskType,
        keyword: requestData.keyword,
        minPrice: requestData.minPrice,
        maxPrice: requestData.maxPrice
      });
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
    


    
    // 4. 构建API请求
    const apiUrl = `${config.baseUrl}${config.endpoints.task.pendingverify}`;
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
    
    // 6. 调用外部API
    const requestHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...(config.headers || {})
    };
    
    // 记录外部API调用信息
    console.log('调用外部API:', {
      apiUrl: apiUrl,
      requestParams: requestParams
    });
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: requestHeaders,
      body: JSON.stringify(requestParams)
    });
    
    // 7. 处理API响应
    let responseData;
    try {
      const responseText = await response.text();
      responseData = JSON.parse(responseText);  
      
      // 记录外部API响应数据
      console.log('外部API响应数据:', {
        success: responseData.success,
        code: responseData.code,
        message: responseData.message,
        total: responseData.data?.total,
        itemCount: responseData.data?.list?.length || responseData.data?.tasks?.length || 0
      });
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
    
    // 记录返回给客户端的响应数据
    console.log('返回客户端响应:', {
      statusCode: statusCode,
      responseSummary: {
        success: restResponse.success,
        code: restResponse.code,
        message: restResponse.message,
        total: restResponse.data.total,
        pages: restResponse.data.pages
      }
    });
    console.log('请求参数:', requestParams);
    console.log('请求参数:', responseData);
    console.log('请求参数:', responseData.data.list);
    console.log(`[${new Date().toISOString()}] 请求结束: ${operation}`);
    console.log('========================================');
    
    return NextResponse.json(restResponse, { status: statusCode });
    
  } catch (error) {
    // 记录错误信息
    console.error(`[${new Date().toISOString()}] 请求错误: ${operation}`, {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    console.log(`[${new Date().toISOString()}] 请求结束: ${operation}`);
    console.log('========================================');
    // 错误处理
    return NextResponse.json(
      { 
        code: 500,
        message: '服务器内部错误',
        data: {
          list: [],
          total: 0,
          page: 0,
          size: 10,
          pages: 0
        },
        success: true,
        timestamp: 1
      }
    );
  }
}




