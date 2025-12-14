import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
// 导入配置文件
import config from '../../apiconfig/config.json';
export const dynamic = 'force-dynamic';
// 主函数：处理POST请求
export async function POST(request: Request) {
  // 从Cookie获取token
  const cookieStore = await cookies();
  const tokenKeys = [ 'admin_token', 'user_token', 'auth_token', 'token'];
  let token: string | undefined;
  
  for (const key of tokenKeys) {
    token = cookieStore.get(key)?.value;
    if (token) break;
  }
  
  if (!token) {
    console.log('API Route: Unauthorized - No token found');
    return NextResponse.json({ success: false, message: '认证失败，请先登录' }, { status: 401 });
  }
  
  // 解析请求体
  let requestData;
  try {
    requestData = await request.json();
  } catch (parseError) {
    return NextResponse.json({ success: false, message: '无效的请求数据格式' }, { status: 400 });
  }

  const apiUrl = `${config.baseUrl}/sys/menu/${requestData.menuId}/disable`;
  
  // 直接调用外部API并返回原始响应
  try {
    const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      ...(config.headers || {}),
      'Authorization': `Bearer ${token}`
    }
  });
    
  // 获取原始响应数据
    const responseData = await response.json();
    console.log("这是平台禁用菜单的后端API返回的日志输出:");
    console.log("请求url:", apiUrl);
    console.log("请求token:", token);
    console.log("请求参数:", requestData.menuId);
    console.log("响应状态:", response.status);
    console.log("响应头:", response.headers);
    console.log("返回的数据:", responseData);

    // 直接返回API的原始响应
    return NextResponse.json(responseData, { status: response.status });
  } catch (apiError) {
    return NextResponse.json({ 
      success: false, 
      message: '获取交易记录失败，请稍后重试' 
    }, { status: 500 });
  }
}

