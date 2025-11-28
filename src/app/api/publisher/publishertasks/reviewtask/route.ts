import { NextResponse } from 'next/server';
const config = require('../../apiconfig/config.json');
// 导入公共的token工具模块
import { formatLog, getTokenFromCookie, isValidToken } from '../../auth/token/tokenUtils';

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
    // 记录token获取情况用于调试
    console.log('获取到的token:', token ? '已获取有效token' : '未获取到token');

    const requestData = await request.json();
    const { subTaskId } = requestData;

   

    // 4. 构建API请求
    const apiUrl = `${config.baseUrl}/tasks/accepted/${subTaskId}/verify`;
    const requestParams = {
      verifyResult: requestData.verifyResult,
      verifyNotes: requestData.verifyNotes,
      evidenceImages: requestData.evidenceImages
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
      console.log(responseData.data);
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
      code: 1,
      message: "",
      success: true,
      timestamp: 1
    };
    
    return NextResponse.json(restResponse, { status: 200 });
    
  } catch (error) {
    // 错误处理
    return NextResponse.json(
      { 
        code: 1,
        message: "",
        success: true,
        timestamp: 1
      }
    );
  }
}




