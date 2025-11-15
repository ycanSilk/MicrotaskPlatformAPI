import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
// 导入配置文件
const config = require('../../apiconfig/config.json');


// 主函数：处理POST请求
export async function GET(request: Request) {
  // 从Cookie获取token
  const cookieStore = await cookies();
  const tokenKeys = ['commenter_token', 'publisher_token', 'admin_token', 'user_token', 'auth_token', 'token'];
  let token: string | undefined;
  
  for (const key of tokenKeys) {
    token = cookieStore.get(key)?.value;
    if (token) break;
  }
  
  // 暂时不处理用户ID解析，后续可以从JWT中解析或移除该功能
  const userId: string | null = null;
  
  if (!token) {
    return NextResponse.json({ success: false, message: '认证失败，请先登录' }, { status: 401 });
  }
  
  // 解析请求体 - GET请求不需要请求体
  const requestData = {};
   
  // 构造请求URL，将orderId和reason参数添加到URL中
  const apiUrl = `${config.baseUrl}${config.endpoints.inviteagent.myinvitationcode}`;
  
  // 直接调用外部API并返回原始响应
  try {
    // 构造请求头，添加用户ID
    const headers: HeadersInit = {
      'Authorization': `Bearer ${token}`
    };
    // 只有当userId有值时才添加X-User-Id头
    if (userId) {
      headers['X-User-Id'] = userId;
    }

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers
    });

    // 获取原始响应数据
    const responseData = await response.json();
    console.log('这是获取我的邀请码API的日志输出:');
    console.log('请求url', apiUrl);
    console.log('token:', token);
    console.log('返回的原始数据', responseData.data);
    
    // 直接返回API的原始响应
    return NextResponse.json(responseData, { status: response.status });
  } catch (apiError) {
    return NextResponse.json({ 
      success: false, 
      message: '获取我的邀请码失败，请稍后重试' 
    }, { status: 500 });
  }
}

