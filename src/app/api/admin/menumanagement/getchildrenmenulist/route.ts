import { NextRequest, NextResponse } from 'next/server';
import config from '../../apiconfig/config.json';
import { cookies } from 'next/headers';
export const dynamic = 'force-dynamic';
// 定义菜单创建请求参数接口
interface menuTree {
    id: string;
	menuName: string;
	menuCode: string;
	parentId: string;
	menuType: string;
	menuUrl: string;
	icon: string;
	sortOrder: number;
	status: number;
	createTime: string;
	children: menuTree[];
}

// 定义响应接口
interface ApiResponse {
  code?: number;
  success: boolean;
  message: string;
  data?: menuTree[];
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
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

    // 从请求URL搜索参数中提取parentId
    const parentId = request.nextUrl.searchParams.get('parentId');
    
    // 验证parentId参数
    if (!parentId) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: '参数验证失败: parentId 是必填项'
      }, { status: 400 });
    }

    // 构建外部API请求URL
    const apiUrl = `${config.baseUrl}${config.endpoints.menu.getchildrenmenulist}?parentId=${encodeURIComponent(parentId)}`;
    const requestHeaders: HeadersInit = {
      ...config.headers,
      'Authorization': `Bearer ${token}`
    };

    // 发送请求到外部API
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: requestHeaders,
      signal: AbortSignal.timeout(config.timeout || 5000)
    });

    // 检查外部API响应是否成功
    if (!response.ok) {
      let errorResult: any = {};
      try {
        errorResult = await response.json(); // 尝试解析错误响应
      } catch {
        errorResult.message = `外部API错误: ${response.statusText}`;
      }
      
      return NextResponse.json<ApiResponse>({
        success: false,
        message: errorResult.message || '调用外部API失败',
        data: errorResult.data
      }, { status: response.status });
    }

    // 解析外部API响应
    const result = await response.json();
    console.log("这是获取子菜单列表的后端API返回的日志输出:");
    console.log("请求url:", apiUrl);
    console.log("请求token:", token);
    console.log("响应状态:", response.status);
    console.log("返回的数据:", result);
    
    // 返回响应数据
    return NextResponse.json(result, { status: response.status });
  } catch (error) {
    console.error('获取子菜单列表失败:', error);

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