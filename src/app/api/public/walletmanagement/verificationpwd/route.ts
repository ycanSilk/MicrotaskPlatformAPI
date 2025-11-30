import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
const config = require('../../apiconfig/config.json');
export const dynamic = 'force-dynamic';
/**
 * 验证支付密码的API路由
 * 功能：验证用户提供的支付密码是否与账户中存储的密码匹配
 * 路由：POST /api/wallet/validate-security-password
 */
export async function POST(request: Request) {
  try {
    // 1. 从请求头中获取Authorization字段，验证Bearer令牌
    const authorizationHeader = request.headers.get('Authorization');
    
    // 从Cookie中获取token作为备选
    const cookieStore = await cookies();
    const tokenKeys = ['commenter_token', 'publisher_token', 'admin_token', 'user_token', 'auth_token', 'token'];
    let token: string | undefined;
    
    // 优先从Authorization头获取token
    if (authorizationHeader && authorizationHeader.startsWith('Bearer ')) {
      token = authorizationHeader.split(' ')[1];
    } 
    // 如果Authorization头中没有token，则尝试从Cookie中获取
    else {
      for (const key of tokenKeys) {
        token = cookieStore.get(key)?.value;
        if (token) break;
      }
    }
    
    // 验证token是否存在
    if (!token) {
      return NextResponse.json(
        { success: false, message: '认证失败，请先登录' },
        { status: 401 }
      );
    }
    
    // 2. 从URL查询参数中获取password参数
    const url = new URL(request.url);
    const password = url.searchParams.get('password');
    
    // 验证password参数是否存在
    if (!password) {
      return NextResponse.json(
        { success: false, message: '支付密码不能为空' },
        { status: 400 }
      );
    }
    
    // 3. 调用外部API验证支付密码
    const apiUrl = `${config.baseUrl}${config.endpoints.wallet.validatepwd}`;
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...(config.headers || {})
      },
      body: JSON.stringify({ securityPassword: password })
    });
    
    // 4. 处理API响应
    const responseData = await response.json();
    console.log('支付密码验证API响应:', responseData);
    
    // 根据API响应返回相应的结果
    return NextResponse.json(responseData, { status: response.status });
    
  } catch (error) {
    // 5. 错误处理
    console.error('验证支付密码时发生错误:', error);
    return NextResponse.json(
      { success: false, message: '服务器内部错误' },
      { status: 500 }
    );
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