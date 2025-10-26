import { NextRequest, NextResponse } from 'next/server';

// 定义用户信息接口
export interface UserInfo {
  id: number;
  username: string;
  password: string;
  email: string;
  phone: string;
  avatarUrl: string;
  status: number;
  createTime: string;
  updateTime: string;
}

// 定义API响应接口
export interface ApiResponse {
  code: number;
  message: string;
  data: UserInfo;
  timestamp: number;
}

/**
 * @description 获取用户信息API
 * @method GET
 * @route http://localhost:8888/api/users/me
 * @returns 用户详细信息
 */
export async function GET(request: NextRequest) {
  try {
    // 模拟生成用户数据
    const mockUserInfo: UserInfo = {
      id: Math.floor(Math.random() * 1000),
      username: 'test_user',
      password: 'encrypted_password_123',
      email: 'test_user@example.com',
      phone: '13812345678',
      avatarUrl: 'https://example.com/avatars/user123.jpg',
      status: 1,
      createTime: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30天前
      updateTime: new Date().toISOString()
    };

    // 构建响应对象
    const response: ApiResponse = {
      code: 0,
      message: '获取用户信息成功',
      data: mockUserInfo,
      timestamp: Date.now()
    };

    // 设置响应头
    const headers = new Headers();
    headers.set('Content-Type', 'application/json');
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // 返回响应
    return NextResponse.json(response, {
      status: 200,
      headers
    });
  } catch (error) {
    // 错误处理
    console.error('获取用户信息失败:', error);
    const errorResponse: ApiResponse = {
      code: 500,
      message: '服务器内部错误',
      data: {
        id: 0,
        username: '',
        password: '',
        email: '',
        phone: '',
        avatarUrl: '',
        status: 0,
        createTime: '',
        updateTime: ''
      },
      timestamp: Date.now()
    };

    return NextResponse.json(errorResponse, {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}

// 处理OPTIONS请求（用于CORS预检）
export async function OPTIONS() {
  const headers = new Headers();
  headers.set('Access-Control-Allow-Origin', '*');
  headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  return NextResponse.json({}, {
    status: 200,
    headers
  });
}