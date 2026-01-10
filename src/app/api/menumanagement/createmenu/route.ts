import { NextRequest, NextResponse } from 'next/server';
import config from '../../apiconfig/config.json';
import { cookies } from 'next/headers';
export const dynamic = 'force-dynamic';
// 定义菜单创建请求参数接口
interface CreateMenuRequest {
  menuName: string;
  menuCode: string;
  parentId: string;
  menuType: string;
  menuUrl: string;
  icon: string;
  sortOrder: number;
}

// 定义响应接口
interface ApiResponse {
  code?: number;
  success: boolean;
  message: string;
  data?: any;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // 解析请求体
    const requestData: CreateMenuRequest = await request.json();

    // 验证请求参数
    if (typeof requestData.sortOrder !== 'number') {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: '参数验证失败: sortOrder必须是数字类型'
      }, { status: 400 });
    }

    // 从Cookie获取admin_token
    let token = '';
    try {
      const cookieStore = await cookies();
      const cookieToken = cookieStore.get('admin_token');
      token = cookieToken?.value || '';
    } catch (cookieError) {
      console.error('无法从Cookie获取token:', cookieError);
      return NextResponse.json<ApiResponse>({
        success: false,
        message: '获取认证信息失败'
      }, { status: 401 });
    }

    // 验证token有效性
    if (!token || token.trim() === '') {
      return NextResponse.json<ApiResponse>({
        code: 401,
        message: '未登录，请先登录',
        success: false
      }, { status: 401 });
    }

    // 构建外部API请求
    const apiUrl = `${config.baseUrl}${config.endpoints.menu.createmenu}`;
    const requestHeaders: HeadersInit = {
      ...config.headers,
      'Authorization': `Bearer ${token}`
    };

    // 发送请求到外部API
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: requestHeaders,
      body: JSON.stringify(requestData),
      signal: AbortSignal.timeout(config.timeout || 5000)
    });

    // 解析外部API响应
    const result = await response.json();
    console.log("这是创建菜单的后端API返回的日志输出:");
    console.log("请求url:", apiUrl);
    console.log("请求token:", token);
    console.log("请求参数:", requestData);
    console.log("响应状态:", response.status);
    console.log("响应头:", response.headers);
    console.log("返回的数据:", result);
    
    // 返回响应数据
    return NextResponse.json(result, { status: response.status });
  } catch (error) {
    console.error('充值API调用失败:', error);

    // 处理不同类型的错误
    let errorMessage = '服务器内部错误';
    let statusCode = 500;

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        errorMessage = '请求超时，请检查网络连接';
        statusCode = 408;
      } else if (error.message.includes('Failed to fetch')) {
        errorMessage = '无法连接到服务器';
        statusCode = 503;
      } else if (error.message.includes('Invalid JSON')) {
        errorMessage = '请求数据格式错误';
        statusCode = 400;
      }
    }

    return NextResponse.json<ApiResponse>({
      success: false,
      message: errorMessage
    }, { status: statusCode });
  }
}