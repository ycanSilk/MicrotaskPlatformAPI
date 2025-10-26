import { NextRequest, NextResponse } from 'next/server';

// 定义添加银行卡请求参数接口
interface AddBankCardRequest {
  cardHolderName: string;
  cardNumber: string;
  bankCode: string;
  bankName: string;
  phoneNumber?: string;
  bankBranch?: string;
}

// 处理POST请求
export async function POST(request: NextRequest) {
  try {
    // 从请求头获取用户ID
    const userId = request.headers.get('X-User-Id');
    
    // 验证用户ID
    if (!userId) {
      return NextResponse.json(
        { success: false, message: '用户未登录，请重新登录', code: 401 },
        { status: 401 }
      );
    }

    // 解析请求体
    let requestBody: AddBankCardRequest;
    try {
      requestBody = await request.json();
    } catch (error) {
      return NextResponse.json(
        { success: false, message: '请求参数格式错误', code: 400 },
        { status: 400 }
      );
    }

    // 验证必填字段
    const { cardHolderName, cardNumber, bankCode, bankName } = requestBody;
    if (!cardHolderName || !cardNumber || !bankCode || !bankName) {
      return NextResponse.json(
        { success: false, message: '请填写所有必填字段', code: 400 },
        { status: 400 }
      );
    }

    // 验证银行卡号格式
    const cleanedCardNumber = cardNumber.replace(/\s/g, '');
    if (!/^\d{16,19}$/.test(cleanedCardNumber)) {
      return NextResponse.json(
        { success: false, message: '银行卡号格式不正确', code: 400 },
        { status: 400 }
      );
    }

    // 验证手机号格式（如果提供）
    if (requestBody.phoneNumber && !/^1[3-9]\d{9}$/.test(requestBody.phoneNumber)) {
      return NextResponse.json(
        { success: false, message: '手机号格式不正确', code: 400 },
        { status: 400 }
      );
    }

    // 构建外部API请求
    const externalApiUrl = 'http://localhost:8080/api/bank-cards'; // 根据示例中的URL
    const headers = new Headers();
    headers.append('accept', '*/*');
    headers.append('X-User-Id', userId);
    headers.append('Content-Type', 'application/json');

    // 发送请求到外部API
    const response = await fetch(externalApiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody)
    });

    // 处理外部API响应
    const data = await response.json();
    
    if (!response.ok) {
      // 如果外部API返回错误
      return NextResponse.json(
        {
          success: false,
          message: data.message || '添加银行卡失败',
          code: data.code || response.status
        },
        { status: response.status }
      );
    }

    // 返回成功响应
    return NextResponse.json({
      success: true,
      message: '添加银行卡成功',
      data,
      code: 200
    });

  } catch (error) {
    console.error('添加银行卡时发生错误:', error);
    // 处理服务器内部错误
    return NextResponse.json(
      {
        success: false,
        message: '服务器内部错误，请稍后重试',
        code: 500
      },
      { status: 500 }
    );
  }
}