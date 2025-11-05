import { NextResponse } from 'next/server';
const config = require('../../apiconfig/config.json');
// 导入公共的token工具模块
import { formatLog, getTokenFromCookie, isValidToken, safeLogToken } from '../../auth/token/tokenUtils';

/**
 * 上评评论发布API路由
 * 功能：处理用户发布评论任务的请求
 * 路由：POST /api/tasks/publish
 */
export async function POST(request: Request) {
  const operation = 'PUBLISH_TOP_COMMENT';
  try {
    console.log(formatLog(operation, '开始处理上评评论发布请求'));
    
    // 使用公共token工具从Cookie获取publisher_token
    const COOKIE_NAME = 'publisher_token'; // 与publisher专用token管理器保持一致
    const token = getTokenFromCookie(COOKIE_NAME, operation);
    
    // 验证token有效性
    if (!isValidToken(token)) {
      console.warn(formatLog(operation, 'Token验证失败：token为空或无效'));
      return NextResponse.json({ success: false, message: '认证失败，请先登录' }, { status: 401 });
    }
    
    console.log(formatLog(operation, `认证成功，继续处理请求，token前8位: ${safeLogToken(token)}`));
    
    // 2. 解析请求体
    let requestData;
    try {
      // 记录原始请求信息
      console.log(formatLog(operation, '开始解析前端请求体'));
      const requestClone = request.clone();
      const rawBody = await requestClone.text();
      console.log(formatLog(operation, `原始请求体字符串: ${rawBody}`));
      
      // 解析JSON
      requestData = JSON.parse(rawBody);
      console.log(formatLog(operation, '请求体JSON解析成功'));
      console.log(formatLog(operation, `请求体数据结构: ${Object.keys(requestData)}`));
      console.log(formatLog(operation, `详细请求数据: ${JSON.stringify(requestData, null, 2)}`));
      
      // 检查关键字段是否存在并验证数据类型
      console.log(formatLog(operation, '===== 请求体关键字段验证 ====='));
      const requiredFields = ['title', 'description', 'platform', 'taskType', 'totalQuantity', 'unitPrice', 'deadline', 'requirements', 'commentDetail'];
      requiredFields.forEach(field => {
        const value = requestData[field];
        console.log(formatLog(operation, `${field}: ${value} (类型: ${typeof value}, 存在: ${field in requestData})`));
      });
      
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
      console.error(formatLog(operation, `错误: 解析请求体JSON失败: ${jsonError instanceof Error ? jsonError.message : String(jsonError)}`));
      return NextResponse.json(
        { success: false, message: '无效的JSON格式' },
        { status: 400 }
      );
    }
    
    // 3. 验证必填字段
    const requiredFields = [
      'title', 'description', 'platform', 'taskType', 
      'totalQuantity', 'unitPrice', 'deadline', 'requirements',
      'commentDetail'
    ];
    
    console.log(formatLog(operation, '开始验证必填字段:'), requiredFields);
    
    for (const field of requiredFields) {
      if (!requestData[field]) {
        console.log(`错误: 必填字段 ${field} 缺失或为空`);
        return NextResponse.json(
          { success: false, message: `${field} 是必填字段` },
          { status: 400 }
        );
      }
    }
    
    console.log('所有必填字段验证通过');
    
    // 验证commentDetail中的必填字段
    const { commentDetail } = requestData;
    console.log('开始验证commentDetail字段，commentType:', commentDetail.commentType);
    
    if (commentDetail.commentType === 'SINGLE') {
      const requiredCommentFields = [
        'linkUrl1', 'unitPrice1', 'quantity1', 'commentText1'
      ];
      
      for (const field of requiredCommentFields) {
        if (!commentDetail[field] && commentDetail[field] !== 0) {
          console.log(`错误: commentDetail中的必填字段 ${field} 缺失或为空`);
          return NextResponse.json(
            { success: false, message: `评论详情中的 ${field} 是必填字段` },
            { status: 400 }
          );
        }
      }
    }
    
    console.log('commentDetail字段验证通过');
    
    // 4. 构建API请求
    const apiUrl = `${config.baseUrl}${config.endpoints.task.publish}`;
    console.log(`准备调用外部API: ${apiUrl}`);
    console.log(`API配置: baseUrl=${config.baseUrl}, endpoint=${config.endpoints.task.publish}`);
    
    // 5. 调用外部API
    console.log(formatLog(operation, '开始调用外部API，传递token和请求数据'));
    // 注意：为了调试，直接输出完整token以确认是否正确获取
    console.log(formatLog(operation, `使用完整token: ${token}`));
    
    // 构建请求头，用于日志记录和API调用
    const requestHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`, // 使用完整的token进行认证
      ...(config.headers || {})
    };
    
    // 记录完整的请求头信息（移除敏感信息）
    const headersForLog = { ...requestHeaders };
    console.log(formatLog(operation, `API请求头: ${JSON.stringify(headersForLog, null, 2)}`));
    console.log(formatLog(operation, `API请求体: ${JSON.stringify(requestData, null, 2)}`));
    console.log(formatLog(operation, `API请求URL: ${apiUrl}`));
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: requestHeaders,
      body: JSON.stringify(requestData)
    });
    
    console.log(formatLog(operation, `外部API调用完成，响应状态码: ${response.status}, 响应状态: ${response.statusText}`));
    
    // 记录响应头信息
    const responseHeaders = {};
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });
    console.log(formatLog(operation, `API响应头: ${JSON.stringify(responseHeaders, null, 2)}`));
    
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
      console.log(formatLog(operation, `API响应数据结构: ${Object.keys(responseData)}`));
      console.log(formatLog(operation, 'API响应内容:'), JSON.stringify(responseData, null, 2));
      
      // 添加日志，显示response.ok和apiResponse.success状态
      console.log(formatLog(operation, `响应状态检查: response.ok=${response.ok}, responseData.success=${responseData.success}, responseData.code=${responseData.code || '未定义'}`));
      
      // 详细检查响应中的关键字段
      console.log(formatLog(operation, '===== 响应关键字段检查 ====='));
      const responseKeys = ['success', 'code', 'message', 'data'];
      responseKeys.forEach(key => {
        const value = responseData[key];
        console.log(formatLog(operation, `响应.${key}: ${value} (类型: ${typeof value}, 存在: ${key in responseData})`));
      });
      
    } catch (jsonError) {
      console.error(formatLog(operation, `错误: 解析API响应JSON失败: ${jsonError instanceof Error ? jsonError.message : String(jsonError)}`));
      return NextResponse.json(
        { success: false, message: '外部API返回无效响应' },
        { status: 500 }
      );
    }
    
    // 重要: 检查外部API实际返回的成功状态
    const isSuccess = responseData.success === true && (responseData.code === 200 || !responseData.code);
    
    console.log(formatLog(operation, `响应状态判断: isSuccess=${isSuccess}, success=${responseData.success}, code=${responseData.code || '未定义'}`));
    console.log(formatLog(operation, `外部API响应分析: success=${responseData.success}, message=${responseData.message || '无消息'}`));
    
    // 返回结果
    console.log(formatLog(operation, `返回结果给客户端: success=${isSuccess}`));
    
    // 重要：根据外部API的实际响应code和success标志设置HTTP状态码
    // 当外部API返回错误时，确保HTTP状态码也是错误状态
    const statusCode = responseData.success === true && (responseData.code === 200 || !responseData.code) ? 200 : 500;
    
    return NextResponse.json({
      success: responseData.success,
      message: responseData.message,
      code: responseData.code,
      data: responseData.data,
    }, { status: statusCode });
    
  } catch (error) {
    // 7. 错误处理
    console.error(formatLog(operation, `严重错误: 发布评论任务时发生未预期的异常: ${error instanceof Error ? error.message : String(error)}`));
    return NextResponse.json(
      { success: false, message: '服务器内部错误' },
      { status: 500 }
    );
  } finally {
    console.log(formatLog(operation, '上评评论发布请求处理结束'));
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