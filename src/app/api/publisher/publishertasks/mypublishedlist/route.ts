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
    console.log(formatLog(operation, '开始处理获取已发布任务列表请求'));
    
    // 1. 身份验证
    // 使用公共token工具从Cookie获取publisher_token
    const COOKIE_NAME = 'publisher_token'; // 与publisher专用token管理器保持一致
    const token = getTokenFromCookie(COOKIE_NAME, operation);
    
    // 验证token有效性
    if (!isValidToken(token)) {
      console.warn(formatLog(operation, 'Token验证失败：token为空或无效'));
      return NextResponse.json({ success: false, message: '认证失败，请先登录' }, { status: 401 });
    }
    
    console.log(formatLog(operation, `认证成功，继续处理请求`));
    
    // 2. 解析请求体
    let requestData;
    try {
      console.log(formatLog(operation, '开始解析前端请求体'));
      const requestClone = request.clone();
      const rawBody = await requestClone.text();
      console.log(formatLog(operation, `原始请求体字符串: ${rawBody}`));
      
      // 解析JSON
      requestData = JSON.parse(rawBody);
      console.log(formatLog(operation, '请求体JSON解析成功'));
      
    } catch (jsonError) {
      console.error(formatLog(operation, `错误: 解析请求体JSON失败: ${jsonError instanceof Error ? jsonError.message : String(jsonError)}`));
      return NextResponse.json(
        { success: false, message: '无效的JSON格式' },
        { status: 400 }
      );
    }
    
    // 3. 验证必填参数
    console.log(formatLog(operation, '开始验证请求参数'));
    
    // 验证分页参数
    if (requestData.page === undefined || typeof requestData.page !== 'number' || requestData.page < 0) {
      console.warn(formatLog(operation, '页码参数验证失败'));
      return NextResponse.json(
        { success: false, message: '页码必须是非负整数' },
        { status: 400 }
      );
    }
    
    if (!requestData.size || typeof requestData.size !== 'number' || requestData.size < 1 || requestData.size > 100) {
      console.warn(formatLog(operation, '每页条数参数验证失败'));
      return NextResponse.json(
        { success: false, message: '每页条数必须是1-100之间的整数' },
        { status: 400 }
      );
    }
    
    // 验证排序参数
    if (requestData.sortOrder && !['ASC', 'DESC'].includes(requestData.sortOrder.toUpperCase())) {
      console.warn(formatLog(operation, '排序方向参数验证失败'));
      return NextResponse.json(
        { success: false, message: '排序方向必须是ASC或DESC' },
        { status: 400 }
      );
    }
    
    // 验证价格范围参数
    if ((requestData.minPrice !== undefined && (typeof requestData.minPrice !== 'number' || requestData.minPrice < 0)) ||
        (requestData.maxPrice !== undefined && (typeof requestData.maxPrice !== 'number' || requestData.maxPrice < 0))) {
      console.warn(formatLog(operation, '价格范围参数验证失败'));
      return NextResponse.json(
        { success: false, message: '价格必须是非负数' },
        { status: 400 }
      );
    }
    
    if (requestData.minPrice !== undefined && requestData.maxPrice !== undefined && requestData.minPrice > requestData.maxPrice) {
      console.warn(formatLog(operation, '价格范围逻辑验证失败'));
      return NextResponse.json(
        { success: false, message: '最低价格不能大于最高价格' },
        { status: 400 }
      );
    }
    
    console.log(formatLog(operation, '请求参数验证通过'));
    console.log(formatLog(operation, `请求参数: page=${requestData.page}, size=${requestData.size}, sortField=${requestData.sortField || '默认'}, sortOrder=${requestData.sortOrder || '默认'}`));
    
    // 4. 构建API请求
    const apiUrl = `${config.baseUrl}${config.endpoints.task.mypublished || '/api/tasks/my-published'}`;
    console.log(formatLog(operation, `准备调用外部API: ${apiUrl}`));
    
    // 构建请求参数，确保与正确的格式一致
    const requestParams = {
      page: requestData.page === undefined ? 1 : requestData.page,
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
    console.log(formatLog(operation, '开始调用外部API，传递token和请求参数'));
    
    const requestHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...(config.headers || {})
    };
    
    console.log(formatLog(operation, `API请求头: ${JSON.stringify(requestHeaders, null, 2)}`));
    console.log(formatLog(operation, `API请求参数: ${JSON.stringify(requestParams, null, 2)}`));
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: requestHeaders,
      body: JSON.stringify(requestParams)
    });
    
    console.log(formatLog(operation, `外部API调用完成，响应状态码: ${response.status}, 响应状态: ${response.statusText}`));
    
    // 6. 处理API响应
    let responseData;
    try {
      console.log(formatLog(operation, '开始解析外部API响应'));
      
      // 先获取响应内容的文本形式，然后再解析JSON
      const responseText = await response.text();
      console.log(formatLog(operation, `原始响应文本内容: ${responseText}`));
      
      // 尝试解析JSON
      responseData = JSON.parse(responseText);
      console.log(formatLog(operation, 'API响应JSON解析成功'));
      
      // 添加日志，显示response.ok和apiResponse.success状态
      console.log(formatLog(operation, `响应状态检查: response.ok=${response.ok}, responseData.success=${responseData.success}, responseData.code=${responseData.code || '未定义'}`));
      
    } catch (jsonError) {
      console.error(formatLog(operation, `错误: 解析API响应JSON失败: ${jsonError instanceof Error ? jsonError.message : String(jsonError)}`));
      return NextResponse.json(
        { success: false, message: '外部API返回无效响应' },
        { status: 500 }
      );
    }
    
    // 7. 判断请求是否成功
    const isSuccess = responseData.success === true && (responseData.code === 200 || !responseData.code);
    
    console.log(formatLog(operation, `响应状态判断: isSuccess=${isSuccess}, success=${responseData.success}, code=${responseData.code || '未定义'}`));
    
    // 根据外部API的实际响应code和success标志设置HTTP状态码
    const statusCode = isSuccess ? 200 : 500;
    
    // 8. 构建符合RESTful规范的响应
    const restResponse = {
      success: responseData.success,
      message: responseData.message || (isSuccess ? '获取已发布任务列表成功' : '获取已发布任务列表失败'),
      code: responseData.code || (isSuccess ? 200 : 500),
      data: {
        tasks: responseData.data?.tasks || [],
        total: responseData.data?.total || 0,
        page: requestData.page,
        size: requestData.size,
        totalPages: Math.ceil((responseData.data?.total || 0) / requestData.size)
      }
    };
    
    console.log(formatLog(operation, `返回结果给客户端: success=${isSuccess}, total=${responseData.data?.total || 0}`));
    
    return NextResponse.json(restResponse, { status: statusCode });
    
  } catch (error) {
    // 9. 错误处理
    console.error(formatLog(operation, `严重错误: 获取已发布任务列表时发生未预期的异常: ${error instanceof Error ? error.message : String(error)}`));
    return NextResponse.json(
      { 
        success: false, 
        message: '服务器内部错误',
        code: 500,
        data: {
          tasks: [],
          total: 0,
          page: 1,
          size: 10,
          totalPages: 0
        }
      },
      { status: 500 }
    );
  } finally {
    console.log(formatLog(operation, '获取已发布任务列表请求处理结束'));
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
        tasks: [],
        total: 0,
        page: 1,
        size: 10,
        totalPages: 0
      }
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
        tasks: [],
        total: 0,
        page: 1,
        size: 10,
        totalPages: 0
      }
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
        tasks: [],
        total: 0,
        page: 1,
        size: 10,
        totalPages: 0
      }
    },
    { status: 405, headers: { 'Allow': 'POST' } }
  );
}