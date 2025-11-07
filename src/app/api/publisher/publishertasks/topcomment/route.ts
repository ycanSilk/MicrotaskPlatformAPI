import { NextResponse } from 'next/server';
const config = require('../../apiconfig/config.json');
// 导入公共的token工具模块
import { formatLog, getTokenFromCookie, isValidToken, safeLogToken } from '../../auth/token/tokenUtils';

// 日志级别枚举
enum LogLevel {
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  DEBUG = 'DEBUG'
}

// 增强的日志记录函数
const enhancedLog = (operation: string, level: LogLevel, message: string, data?: any) => {
  const formattedMessage = formatLog(`${operation} [${level}]`, message);
  switch(level) {
    case LogLevel.INFO:
      console.log(formattedMessage, data ? JSON.stringify(data, null, 2) : '');
      break;
    case LogLevel.WARN:
      console.warn(formattedMessage, data ? JSON.stringify(data, null, 2) : '');
      break;
    case LogLevel.ERROR:
      console.error(formattedMessage, data ? JSON.stringify(data, null, 2) : '');
      break;
    case LogLevel.DEBUG:
      console.debug(formattedMessage, data ? JSON.stringify(data, null, 2) : '');
      break;
  }
};

/**
 * 上评评论发布API路由
 * 功能：处理用户发布评论任务的请求
 * 路由：POST /api/tasks/publish
 */
export async function POST(request: Request) {
  const operation = 'PUBLISH_TOP_COMMENT';
  try {
    // 记录请求开始，包含完整URL信息
    const url = new URL(request.url);
    enhancedLog(operation, LogLevel.INFO, '开始处理上评评论发布请求', {
      fullUrl: request.url,
      pathname: url.pathname,
      searchParams: Object.fromEntries(url.searchParams)
    });
    
    // 记录请求头信息
    const headers = {};
    request.headers.forEach((value, key) => {
      // 不记录敏感头信息
      if (!['authorization', 'cookie'].includes(key.toLowerCase())) {
        headers[key] = value;
      }
    });
    enhancedLog(operation, LogLevel.DEBUG, '接收到的请求头信息', headers);
    
    // 使用公共token工具从Cookie获取publisher_token
    const COOKIE_NAME = 'publisher_token'; // 与publisher专用token管理器保持一致
    enhancedLog(operation, LogLevel.DEBUG, `准备从Cookie获取token: ${COOKIE_NAME}`);
    const token = getTokenFromCookie(COOKIE_NAME, operation);
    enhancedLog(operation, LogLevel.DEBUG, `从Cookie获取到token，长度: ${token?.length || 0}字符`);
    
    // 验证token有效性
    if (!isValidToken(token)) {
      enhancedLog(operation, LogLevel.WARN, 'Token验证失败：token为空或无效');
      const response = NextResponse.json({ success: false, message: '认证失败，请先登录' }, { status: 401 });
      enhancedLog(operation, LogLevel.INFO, '返回认证失败响应', { status: 401, message: '认证失败，请先登录' });
      return response;
    }
    
    enhancedLog(operation, LogLevel.INFO, `认证成功，继续处理请求`, { tokenPreview: safeLogToken(token) });
    
    // 2. 解析请求体
    let requestData;
    try {
      // 记录原始请求信息
      enhancedLog(operation, LogLevel.DEBUG, '开始解析前端请求体');
      const requestClone = request.clone();
      const rawBody = await requestClone.text();
      enhancedLog(operation, LogLevel.DEBUG, `原始请求体字符串长度: ${rawBody.length}字符`);
      
      // 解析JSON
      requestData = JSON.parse(rawBody);
      enhancedLog(operation, LogLevel.INFO, '请求体JSON解析成功');
      enhancedLog(operation, LogLevel.DEBUG, `请求体数据结构: ${Object.keys(requestData)}`);
      enhancedLog(operation, LogLevel.DEBUG, '详细请求数据', requestData);
      
      // 检查关键字段是否存在并验证数据类型
      enhancedLog(operation, LogLevel.DEBUG, '===== 请求体关键字段验证 =====');
      const requiredFields = ['title', 'description', 'platform', 'taskType', 'totalQuantity', 'unitPrice', 'deadline', 'requirements', 'commentDetail'];
      const fieldValidation = {};
      requiredFields.forEach(field => {
        const value = requestData[field];
        fieldValidation[field] = {
          value: value,
          type: typeof value,
          exists: field in requestData
        };
      });
      enhancedLog(operation, LogLevel.DEBUG, '字段验证结果', fieldValidation);
      
      // 检查commentDetail的关键字段
      if (requestData.commentDetail) {
        console.log(formatLog(operation, '===== commentDetail关键字段验证 ====='));
        const commentFields = ['commentType', 'linkUrl1', 'unitPrice1', 'quantity1', 'commentText1', 'commentImages1', 'mentionUser1', 'linkUrl2', 'unitPrice2', 'quantity2', 'commentText2', 'commentImages2', 'mentionUser2'];
        commentFields.forEach(field => {
          const value = requestData.commentDetail[field];
          console.log(formatLog(operation, `commentDetail.${field}: ${value} (类型: ${typeof value}, 存在: ${field in requestData.commentDetail})`));
        });
      }
      
    } catch (jsonError) {
      enhancedLog(operation, LogLevel.ERROR, `解析请求体JSON失败`, {
        error: jsonError instanceof Error ? jsonError.message : String(jsonError),
        stack: jsonError instanceof Error ? jsonError.stack : undefined
      });
      const response = NextResponse.json(
        { success: false, message: '无效的JSON格式' },
        { status: 400 }
      );
      enhancedLog(operation, LogLevel.INFO, '返回JSON解析错误响应', { status: 400, message: '无效的JSON格式' });
      return response;
    }
    
    // 3. 验证必填字段
    const requiredFields = [
      'title', 'description', 'platform', 'taskType', 
      'totalQuantity', 'unitPrice', 'deadline', 'requirements',
      'commentDetail'
    ];
    
    enhancedLog(operation, LogLevel.DEBUG, '开始验证必填字段', { requiredFields });
    
    for (const field of requiredFields) {
      if (!requestData[field]) {
        enhancedLog(operation, LogLevel.WARN, `必填字段验证失败`, { missingField: field });
        const response = NextResponse.json(
          { success: false, message: `${field} 是必填字段` },
          { status: 400 }
        );
        enhancedLog(operation, LogLevel.INFO, '返回必填字段缺失响应', { status: 400, field, message: `${field} 是必填字段` });
        return response;
      }
    }
    
    enhancedLog(operation, LogLevel.INFO, '所有必填字段验证通过');
    
    // 验证commentDetail中的必填字段
    const { commentDetail } = requestData;
    enhancedLog(operation, LogLevel.DEBUG, '开始验证commentDetail字段', { commentType: commentDetail.commentType });
    
    if (commentDetail.commentType === 'SINGLE') {
      const requiredCommentFields = [
        'linkUrl1', 'unitPrice1', 'quantity1', 'commentText1'
      ];
      
      for (const field of requiredCommentFields) {
        if (!commentDetail[field] && commentDetail[field] !== 0) {
          enhancedLog(operation, LogLevel.WARN, `commentDetail必填字段验证失败`, { missingField: field });
          const response = NextResponse.json(
            { success: false, message: `评论详情中的 ${field} 是必填字段` },
            { status: 400 }
          );
          enhancedLog(operation, LogLevel.INFO, '返回commentDetail字段缺失响应', { status: 400, field, message: `评论详情中的 ${field} 是必填字段` });
          return response;
        }
      }
    }
    
    enhancedLog(operation, LogLevel.INFO, 'commentDetail字段验证通过');
    
    // 4. 构建API请求
    const apiUrl = `${config.baseUrl}${config.endpoints.task.publish}`;
    enhancedLog(operation, LogLevel.INFO, '准备调用外部API', {
      apiUrl,
      baseUrl: config.baseUrl,
      endpoint: config.endpoints.task.publish
    });
    
    // 5. 调用外部API
    enhancedLog(operation, LogLevel.INFO, '开始调用外部API，准备请求参数');
    // 注意：为了调试，直接输出完整token以确认是否正确获取
    enhancedLog(operation, LogLevel.DEBUG, '使用的token信息', { fullToken: token });
    
    // 构建请求头，用于日志记录和API调用
    const requestHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`, // 使用完整的token进行认证
      ...(config.headers || {})
    };
    
    // 记录完整的请求头信息（移除敏感信息）
    const headersForLog = { ...requestHeaders };
    enhancedLog(operation, LogLevel.DEBUG, 'API请求头', headersForLog);
    enhancedLog(operation, LogLevel.DEBUG, 'API请求体', requestData);
    enhancedLog(operation, LogLevel.DEBUG, 'API请求URL', { url: apiUrl });
    
    // 记录请求发送前的时间戳
    const requestStartTime = Date.now();
    enhancedLog(operation, LogLevel.INFO, '开始发送外部API请求', { startTime: new Date().toISOString() });
    
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: requestHeaders,
        body: JSON.stringify(requestData)
      });
      
      // 记录请求耗时
      const requestDuration = Date.now() - requestStartTime;
      enhancedLog(operation, LogLevel.INFO, '外部API调用完成', {
        statusCode: response.status,
        statusText: response.statusText,
        duration: `${requestDuration}ms`
      });
    
    // 记录响应头信息
    const responseHeaders = {};
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });
    enhancedLog(operation, LogLevel.DEBUG, 'API响应头', responseHeaders);
    
    // 6. 处理API响应
    let responseData;
    try {
      enhancedLog(operation, LogLevel.DEBUG, '开始解析外部API响应');
      
      // 先获取响应内容的文本形式，然后再解析JSON
      const responseText = await response.text();
      enhancedLog(operation, LogLevel.DEBUG, `原始响应文本内容长度: ${responseText.length}字符`);
      
      // 尝试解析JSON
      responseData = JSON.parse(responseText);
      enhancedLog(operation, LogLevel.INFO, 'API响应JSON解析成功');
      enhancedLog(operation, LogLevel.DEBUG, `API响应数据结构: ${Object.keys(responseData)}`);
      enhancedLog(operation, LogLevel.DEBUG, 'API响应内容', responseData);
      
      // 添加日志，显示response.ok和apiResponse.success状态
      enhancedLog(operation, LogLevel.INFO, '响应状态检查', {
        responseOk: response.ok,
        responseDataSuccess: responseData.success,
        responseDataCode: responseData.code || '未定义'
      });
      
      // 详细检查响应中的关键字段
      enhancedLog(operation, LogLevel.DEBUG, '===== 响应关键字段检查 =====');
      const responseKeys = ['success', 'code', 'message', 'data'];
      const keyCheckResult = {};
      responseKeys.forEach(key => {
        const value = responseData[key];
        keyCheckResult[key] = {
          value: value,
          type: typeof value,
          exists: key in responseData
        };
      });
      enhancedLog(operation, LogLevel.DEBUG, '响应关键字段检查结果', keyCheckResult);
      
    } catch (jsonError) {
      enhancedLog(operation, LogLevel.ERROR, '解析API响应JSON失败', {
        error: jsonError instanceof Error ? jsonError.message : String(jsonError),
        stack: jsonError instanceof Error ? jsonError.stack : undefined,
        rawResponseText: responseText
      });
      const errorResponse = NextResponse.json(
        { success: false, message: '外部API返回无效响应' },
        { status: 500 }
      );
      enhancedLog(operation, LogLevel.INFO, '返回API响应解析错误', { status: 500, message: '外部API返回无效响应' });
      return errorResponse;
    }
    
    // 重要: 检查外部API实际返回的成功状态
    const isSuccess = responseData.success === true && (responseData.code === 200 || !responseData.code);
    
    enhancedLog(operation, LogLevel.INFO, '响应状态判断', {
      isSuccess,
      responseDataSuccess: responseData.success,
      responseDataCode: responseData.code || '未定义'
    });
    enhancedLog(operation, LogLevel.INFO, '外部API响应分析', {
      success: responseData.success,
      message: responseData.message || '无消息'
    });
    
    // 返回结果
    enhancedLog(operation, LogLevel.DEBUG, '准备返回结果给客户端', { isSuccess });
    
    // 重要：根据外部API的实际响应code和success标志设置HTTP状态码
    // 当外部API返回错误时，确保HTTP状态码也是错误状态
    const statusCode = responseData.success === true && (responseData.code === 200 || !responseData.code) ? 200 : 500;
    
    // 准备响应数据
    const responseToClient = {
      success: responseData.success,
      message: responseData.message,
      code: responseData.code,
      data: responseData.data,
    };
    
    const clientResponse = NextResponse.json(responseToClient, { status: statusCode });
    enhancedLog(operation, LogLevel.INFO, '返回响应给客户端', {
      statusCode,
      responseData: responseToClient
    });

    return clientResponse;
  } catch (fetchError) {
    // 捕获fetch请求过程中的错误
    enhancedLog(operation, LogLevel.ERROR, '外部API请求失败', {
      error: fetchError instanceof Error ? fetchError.message : String(fetchError),
      stack: fetchError instanceof Error ? fetchError.stack : undefined,
      apiUrl
    });
    
    const errorResponse = NextResponse.json(
      { success: false, message: '外部API请求失败，请稍后重试' },
      { status: 503 }
    );
    enhancedLog(operation, LogLevel.INFO, '返回API请求错误', { status: 503, message: '外部API请求失败，请稍后重试' });
    return errorResponse;
  }
    
  } catch (error) {
    // 7. 全局错误处理
    enhancedLog(operation, LogLevel.ERROR, '严重错误: 发布评论任务时发生未预期的异常', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    
    const errorResponse = NextResponse.json(
      { success: false, message: '服务器内部错误' },
      { status: 500 }
    );
    enhancedLog(operation, LogLevel.INFO, '返回服务器内部错误', { status: 500, message: '服务器内部错误' });
    return errorResponse;
  } finally {
    enhancedLog(operation, LogLevel.INFO, '上评评论发布请求处理结束', { timestamp: new Date().toISOString() });
  }
}

/**
 * 处理不支持的HTTP方法
 */
export async function GET() {
  return NextResponse.json(
    { success: false, message: '不支持GET方法，请使用POST' },
    { status: 405, headers: { 'Allow': 'POST' } }
  );
}

export async function PUT() {
  return NextResponse.json(
    { success: false, message: '不支持PUT方法，请使用POST' },
    { status: 405, headers: { 'Allow': 'POST' } }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { success: false, message: '不支持DELETE方法，请使用POST' },
    { status: 405, headers: { 'Allow': 'POST' } }
  );
}