
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const credentials = await request.json();



  } catch (error) {
    console.error('登录过程中发生错误:', error);
    return NextResponse.json(
      { success: false, message: '服务器内部错误' },
      { status: 500 }
    );
  }
}