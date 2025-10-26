import { NextRequest, NextResponse } from 'next/server';
// 导入API配置
import config from '../../apiconfig/config.json';

// 定义登录请求参数接口
interface LoginRequest {
  username: string;
  password: string;
}

// 定义响应接口
interface ApiResponse {
  success: boolean;
  message: string;
  data?: any;
}

// 基础验证函数
function validateLoginData(data: LoginRequest): { isValid: boolean; error?: string } {
  // 检查必填字段
  if (!data.username || !data.password) {
    return { isValid: false, error: '用户名和密码为必填项' };
  }

  // 验证用户名格式（3-10位字母数字下划线组合）
  const usernameRegex = /^[a-zA-Z0-9_]{3,10}$/;
  if (!usernameRegex.test(data.username)) {
    return { isValid: false, error: '用户名必须包含3-10个字符，且只能包含字母、数字和下划线' };
  }

  // 验证密码长度
  if (data.password.length < 6 || data.password.length > 20) {
    return { isValid: false, error: '密码长度必须在6-20个字符之间' };
  }

  return { isValid: true };
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // 解析请求体
    const requestData: LoginRequest = await req.json();

    // 执行数据验证
    const validation = validateLoginData(requestData);
    if (!validation.isValid) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: validation.error || '请求数据验证失败'
      }, { status: 400 });
    }

    // 构建后端API请求数据
    const backendRequestData = {
      username: requestData.username.trim(),
      password: requestData.password
    };

    // 构建完整的API URL
    const apiUrl = `${config.baseUrl}${config.endpoints.auth.login}`;
    console.log('登录API请求URL:', apiUrl);
    console.log('登录API请求数据:', backendRequestData);

    // 调用实际的后端API
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: config.headers,
      body: JSON.stringify(backendRequestData),
      // 设置请求超时
      signal: AbortSignal.timeout(config.timeout || 5000)
    });

    // 检查响应状态
    if (!response.ok) {
      console.error(`登录API返回错误状态码: ${response.status}`);
      try {
        const errorData = await response.json();
        return NextResponse.json<ApiResponse>({
          success: false,
          message: errorData.message || `登录失败，状态码: ${response.status}`
        }, { status: response.status });
      } catch (jsonError) {
        return NextResponse.json<ApiResponse>({
          success: false,
          message: `登录失败，状态码: ${response.status}`
        }, { status: response.status });
      }
    }

    // 解析后端响应
    const result = await response.json();
    console.log('登录API响应结果:', result);

    // 验证返回的数据结构
    if (!result || !result.data) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: '登录失败，无效的响应数据'
      }, { status: 500 });
    }

    // 构建返回给前端的响应数据
    const responseData: ApiResponse = {
      success: true,
      message: result.message || '登录成功！',
      data: {
        token: result.data.token || '',
        userId: result.data.userId || '',
        username: requestData.username,
        userInfo: result.data.userInfo || {},
        expiresIn: result.data.expiresIn || 86400 // 默认24小时
      }
    };

    return NextResponse.json(responseData, { status: 200 });
  } catch (error) {
    console.error('登录过程中发生错误:', error);
    
    // 处理不同类型的错误
    let errorMessage = '登录失败，请稍后重试';
    let statusCode = 500;

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        errorMessage = '请求超时，请检查网络连接后重试';
        statusCode = 408; // Request Timeout
      } else if (error.message.includes('Failed to fetch')) {
        errorMessage = '无法连接到登录服务器，请稍后重试';
        statusCode = 503; // Service Unavailable
      }
    }

    return NextResponse.json<ApiResponse>({
      success: false,
      message: errorMessage
    }, { status: statusCode });
  }
}

// 处理GET请求（如果需要）
export async function GET(): Promise<NextResponse> {
  return NextResponse.json<ApiResponse>({
    success: false,
    message: '请使用POST方法进行登录'
  }, { status: 405 });
}