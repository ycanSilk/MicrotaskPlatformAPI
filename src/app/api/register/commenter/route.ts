import { NextResponse } from 'next/server';

/**
 * 评论员注册API
 * 调用外部API完成真实数据库注册
 */
export async function POST(request: Request) {
  try {
    const { username, password, phone, email, inviteCode } = await request.json();

    // 验证输入
    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: '用户名和密码不能为空' },
        { status: 400 }
      );
    }

    // 验证用户名长度
    if (username.length < 6 || username.length > 20) {
      return NextResponse.json(
        { success: false, message: '用户名长度必须在6-20位之间' },
        { status: 400 }
      );
    }

    // 验证密码长度
    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: '密码长度不能少于6位' },
        { status: 400 }
      );
    }

    // 如果提供了手机号，则验证手机号格式
    if (phone) {
      const phoneRegex = /^1[3-9]\d{9}$/;
      if (!phoneRegex.test(phone)) {
        return NextResponse.json(
          { success: false, message: '请输入正确的手机号码' },
          { status: 400 }
        );
      }
    }

    // 如果提供了邮箱，则验证邮箱格式
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return NextResponse.json(
          { success: false, message: '请输入正确的邮箱地址' },
          { status: 400 }
        );
      }
    }

    // 准备请求数据
    const requestData = {
      username,
      password,
      phone: phone || undefined,
      email: email || undefined,
      inviteCode: inviteCode || undefined,
      role: 'commenter'
    };

    // 过滤空字段
    const filteredRequestData = Object.fromEntries(
      Object.entries(requestData).filter(([_, value]) => value !== undefined)
    );

    // 调用外部注册API
    const apiUrl = 'http://localhost:8888/api/users/register';
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(filteredRequestData)
    });

    // 解析API响应
    const apiResponse = await response.json();
    
    if (!response.ok) {
      // API返回错误
      return NextResponse.json(
        {
          success: false,
          message: apiResponse.message || '注册失败',
          error: apiResponse.error,
          timestamp: Date.now()
        },
        { status: response.status }
      );
    }

    // 注册成功，构造返回数据
    return NextResponse.json({
      success: true,
      message: apiResponse.message || '评论员账号注册成功！欢迎加入抖音派单系统。',
      data: {
        id: apiResponse.userId || apiResponse.data?.id,
        username: apiResponse.username || username,
        role: 'commenter',
        email: apiResponse.data?.email || email || null,
        phone: apiResponse.data?.phone || phone
      },
      timestamp: Date.now()
    });

  } catch (error) {
    console.error('Commenter registration error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : '服务器内部错误',
        error: error instanceof Error ? error.message : '未知错误',
        timestamp: Date.now()
      },
      { status: 500 }
    );
  }
}