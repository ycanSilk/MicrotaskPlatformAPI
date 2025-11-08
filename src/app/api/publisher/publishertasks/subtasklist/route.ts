import { NextResponse } from 'next/server';
const config = require('../../apiconfig/config.json');
import { formatLog, getTokenFromCookie, isValidToken } from '../../auth/token/tokenUtils';

// 定义请求参数接口
interface SubtaskListRequest {
  page: number;
  size: number;
  sortField: string;
  sortOrder: string;
  platform: string;
  taskType: string;
  minPrice: number;
  maxPrice: number;
  keyword: string;
}

// 定义默认参数
const defaultParams: SubtaskListRequest = {
  page: 0,
  size: 10,
  sortField: 'createTime',
  sortOrder: 'DESC',
  platform: 'DOUYIN',
  taskType: 'COMMENT',
  minPrice: 0,
  maxPrice: 9999,
  keyword: ''
};

export async function POST(request: Request) {
  const operation = 'GET_SUBTASK_LIST';
  try {
    // 1. 身份验证
    const COOKIE_NAME = 'publisher_token';
    const token = getTokenFromCookie(COOKIE_NAME, operation);
    
    if (!isValidToken(token)) {
      console.warn(formatLog(operation, '认证失败: token无效'));
      return NextResponse.json({ success: false, message: '认证失败，请先登录' }, { status: 401 });
    }

    // 2. 从请求URL中获取任务ID
    const url = new URL(request.url);
    const taskId = url.searchParams.get('taskId');
    
    if (!taskId || typeof taskId !== 'string' || taskId.trim() === '') {
      console.warn(formatLog(operation, '错误: 缺少有效的taskId参数'));
      return NextResponse.json({ success: false, message: '缺少有效的任务ID' }, { status: 400 });
    }
    
    // 3. 处理请求体参数
    let requestBody: Partial<SubtaskListRequest> = {};
    try {
      requestBody = await request.json();
    } catch (parseError) {
      console.warn(formatLog(operation, `错误: 请求体解析失败 - ${parseError instanceof Error ? parseError.message : String(parseError)}`));
      // 如果解析失败，使用默认参数
      requestBody = {};
    }
    
    // 4. 合并默认参数和请求参数，进行类型验证
    const params: SubtaskListRequest = {
      page: typeof requestBody.page === 'number' && requestBody.page >= 0 ? requestBody.page : defaultParams.page,
      size: typeof requestBody.size === 'number' && requestBody.size > 0 && requestBody.size <= 100 ? requestBody.size : defaultParams.size,
      sortField: typeof requestBody.sortField === 'string' ? requestBody.sortField : defaultParams.sortField,
      sortOrder: typeof requestBody.sortOrder === 'string' && ['ASC', 'DESC'].includes(requestBody.sortOrder.toUpperCase()) ? requestBody.sortOrder.toUpperCase() : defaultParams.sortOrder,
      platform: typeof requestBody.platform === 'string' ? requestBody.platform : defaultParams.platform,
      taskType: typeof requestBody.taskType === 'string' ? requestBody.taskType : defaultParams.taskType,
      minPrice: typeof requestBody.minPrice === 'number' && requestBody.minPrice >= 0 ? requestBody.minPrice : defaultParams.minPrice,
      maxPrice: typeof requestBody.maxPrice === 'number' && requestBody.maxPrice > 0 ? requestBody.maxPrice : defaultParams.maxPrice,
      keyword: typeof requestBody.keyword === 'string' ? requestBody.keyword : defaultParams.keyword
    };
    
    // 确保价格范围有效
    if (params.minPrice > params.maxPrice) {
      console.warn(formatLog(operation, '错误: 最低价格不能大于最高价格'));
      return NextResponse.json({ success: false, message: '最低价格不能大于最高价格' }, { status: 400 });
    }
    
    // 5. 构建API请求
    const apiUrl = `${config.baseUrl}/tasks/${taskId}/subtasks`;
    
    // 6. 调用外部API
    const requestHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...(config.headers || {})
    };
    console.log(formatLog(operation, `请求子任务列表: taskId=${taskId}, 参数=${JSON.stringify(params)}`));
    console.log(formatLog(operation, `请求URL: ${apiUrl}`));
    console.log(formatLog(operation, `请求头: 已包含Authorization和Content-Type`));
    console.log(formatLog(operation, `请求体: ${JSON.stringify(params)}`));
    
    // 添加对fetch操作的错误处理
    let response;
    try {
      response = await fetch(apiUrl, {
        method: 'POST',
        headers: requestHeaders,
        body: JSON.stringify(params)
      });
      
      // 记录完整响应状态
      console.log(formatLog(operation, `外部API返回状态码: ${response.status} ${response.statusText}`));
      
    } catch (fetchError) {
      console.error(formatLog(operation, `错误: 外部API调用失败 - ${fetchError instanceof Error ? fetchError.message : String(fetchError)}`));
      return NextResponse.json(
        { 
          success: false, 
          message: '外部服务暂时不可用，请稍后重试',
          code: 503,
          data: {
            subtasks: [],
            total: 0,
            page: params.page,
            size: params.size
          },
          timestamp: Date.now(),
          debug: {
            errorType: 'NETWORK_ERROR',
            externalApiUrl: apiUrl
          }
        },
        { status: 503 }
      );
    }

    // 7. 处理API响应
    let responseData;
    let responseText = '';
    try {
      // 先获取响应文本
      responseText = await response.text();
      console.log(formatLog(operation, `外部API响应内容长度: ${responseText.length} 字符`));
      
      // 尝试解析JSON
      if (responseText.trim()) {
        responseData = JSON.parse(responseText);
        console.log(formatLog(operation, `API响应解析成功: ${JSON.stringify(responseData)}`));
      } else {
        // 处理空响应
        console.warn(formatLog(operation, '警告: 外部API返回空响应'));
        return NextResponse.json(
          {
            success: false,
            message: '外部API返回空响应',
            code: 500,
            data: {
              subtasks: [],
              total: 0,
              page: params.page,
              size: params.size
            },
            timestamp: Date.now(),
            debug: {
              errorType: 'EMPTY_RESPONSE',
              externalApiUrl: apiUrl,
              externalApiStatusCode: response.status
            }
          },
          { status: 500 }
        );
      }
    } catch (jsonError) {
      // 记录详细的解析错误和原始响应内容
      console.error(formatLog(operation, `错误: API响应解析失败 - ${jsonError instanceof Error ? jsonError.message : String(jsonError)}`));
      console.error(formatLog(operation, `原始响应内容前100字符: ${responseText.substring(0, 100)}${responseText.length > 100 ? '...' : ''}`));
      
      return NextResponse.json(
        {
          success: false,
          message: `外部API返回无效的JSON响应: ${jsonError instanceof Error ? jsonError.message : '未知错误'}`,
          code: 500,
          data: {
            subtasks: [],
            total: 0,
            page: params.page,
            size: params.size
          },
          timestamp: Date.now(),
          debug: {
            errorType: 'JSON_PARSE_ERROR',
            externalApiUrl: apiUrl,
            externalApiStatusCode: response.status,
            responsePreview: responseText.substring(0, 200) // 只返回前200个字符作为预览
          }
        },
        { status: 500 }
      );
    }
    
    // 8. 记录原始API响应状态码
    console.log(formatLog(operation, `外部API响应状态码: ${response.status}`));
    
    // 9. 优化错误处理，保留原始错误信息
    // 使用外部API返回的success和code字段来确定响应状态
    const isSuccess = responseData.success === true;
    const statusCode = responseData.code || 200;
    
    // 10. 构建响应，确保保留原始错误信息
    const restResponse = {
      success: responseData.success,
      message: responseData.message || (isSuccess ? '获取子任务列表成功' : '获取子任务列表失败'),
      code: statusCode,
      // 保留原始数据结构，同时提供默认值
      data: responseData.data || {
        subtasks: [],
        total: 0,
        page: params.page,
        size: params.size
      },
      timestamp: Date.now(),
      // 添加调试信息，帮助排查问题
      debug: {
        externalApiUrl: apiUrl,
        externalApiStatusCode: response.status
      }
    };
    
    return NextResponse.json(restResponse, { status: statusCode });
    
  } catch (error) {
    // 错误处理
    console.error(formatLog(operation, `错误: ${error instanceof Error ? error.message : String(error)}`));
    return NextResponse.json(
      { 
        success: false, 
        message: '服务器内部错误',
        code: 500,
        data: {
          subtasks: [],
          total: 0,
          page: 0,
          size: 10
        },
        timestamp: Date.now()
      },
      { status: 500 }
    );
  }
}
