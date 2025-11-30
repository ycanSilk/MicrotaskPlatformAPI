import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { formatLog } from '../../token/tokenUtils';
// 导入配置文件
const config = require('../../apiconfig/config.json');
export const dynamic = 'force-dynamic';
// 主函数：处理POST请求
export async function POST(request: Request) {
  // 定义操作类型
  const operation = 'BIND_ALIPAY';
  
  // 从Cookie获取token
  const cookieStore = await cookies();
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
  let requestData;
  try {
    requestData = await request.json();
    console.log(formatLog(operation, '成功解析请求体'));
  } catch (parseError) {
    console.error(formatLog(operation, `解析请求体失败: ${(parseError as Error).message}`));
    return NextResponse.json({ success: false, message: '无效的请求数据格式' }, { status: 400 });
  }
  
  // 参数验证
  if (!requestData.alipayAccount || !requestData.realName) {
    console.warn(formatLog(operation, '缺少必要参数：支付宝账号或真实姓名'));
    return NextResponse.json({ success: false, message: '支付宝账号和真实姓名不能为空' }, { status: 400 });
  }
  
  // 简化API URL构建，直接拼接baseUrl和endpoint
  const apiUrl = `${config.baseUrl}${config.endpoints.wallet.bindAlipay}`;
  console.log(formatLog(operation, `准备调用API: ${apiUrl}`));
  
  // 直接调用外部API并返回原始响应
  try {
    const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      ...(config.headers || {}),
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(requestData)
  });
    
    console.log(formatLog(operation, `API调用成功，状态码: ${response.status}`));
    
    // 获取原始响应数据
    const responseData = await response.json();
    
    // 直接返回API的原始响应
    return NextResponse.json(responseData, { status: response.status });
  } catch (apiError) {
    console.error(formatLog(operation, `API调用失败: ${(apiError as Error).message}`));
    return NextResponse.json({ 
      success: false, 
      message: '绑定支付宝账号失败，请稍后重试' 
    }, { status: 500 });
  }
}

