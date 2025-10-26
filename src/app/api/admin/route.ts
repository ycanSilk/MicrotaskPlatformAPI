import { authenticateAdmin } from '@/auth';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const credentials = await request.json();

    // 使用新的认证系统处理登录请求
    const result = await authenticateAdmin(credentials);

    if (result.success) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json(result, { status: 401 });
    }

  } catch (error) {
    console.error('登录过程中发生错误:', error);
    return NextResponse.json(
      { success: false, message: '服务器内部错误' },
      { status: 500 }
    );
  }
}