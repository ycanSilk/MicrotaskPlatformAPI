import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
// 导入配置文件
const config = require('../../apiconfig/config.json');

// 主函数：处理POST请求
export async function POST(request: Request) {
  // 从Cookie获取token
  const cookieStore = cookies();
  const tokenKeys = ['commenter_token', 'publisher_token', 'admin_token', 'user_token', 'auth_token', 'token'];
  let token: string | undefined;
  
  for (const key of tokenKeys) {
    token = cookieStore.get(key)?.value;
    if (token) break;
  }
  
  if (!token) {
    return NextResponse.json({ success: false, message: '认证失败，请先登录' }, { status: 401 });
  }
  
  // 解析请求体
  const requestData = await request.json();
  
  // 参数验证
  if (!requestData.alipayAccount || !requestData.realName) {
    return NextResponse.json({ success: false, message: '支付宝账号和真实姓名不能为空' }, { status: 400 });
  }
  
  // 简化API URL构建，直接拼接baseUrl和endpoint
  const apiUrl = `${config.baseUrl}${config.endpoints.wallet.bindAlipay}`;
  
  // 直接调用外部API并返回原始响应
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      ...(config.headers || {}),
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(requestData)
  });
  
  // 获取原始响应数据
  const responseData = await response.json();
  
  // 直接返回API的原始响应
  return NextResponse.json(responseData, { status: response.status });
}

