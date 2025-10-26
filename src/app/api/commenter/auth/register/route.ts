import { NextRequest, NextResponse } from 'next/server';
// 导入API配置
import config from '../../apiconfig/config.json';

// 定义注册请求参数接口
interface RegisterRequest {
  username: string;
  password: string;
  phone: string;
  inviteCode?: string;
  email?: string;
}

// 定义后端API请求接口
interface BackendRegisterRequest {
  username: string;
  password: string;
  phone: string;
  email?: string;
  invitationCode?: string;
}

// 定义响应接口
interface ApiResponse {
  success: boolean;
  message: string;
  data?: any;
}

// 基础验证函数
function validateRegisterData(data: RegisterRequest): { isValid: boolean; error?: string } {
  // 检查必填字段
  if (!data.username || data.username.trim() === '') {
    return { isValid: false, error: '用户名不能为空' };
  }

  // 验证用户名长度（至少4位字符）
  if (data.username.length < 4) {
    return { isValid: false, error: '用户名长度必须大于或等于4个字符' };
  }

  // 验证用户名最大长度（不超过16位字符）
  if (data.username.length > 16) {
    return { isValid: false, error: '用户名长度不能超过16个字符' };
  }

  // 检查密码是否为空
  if (!data.password || data.password.trim() === '') {
    return { isValid: false, error: '密码不能为空' };
  }

  // 验证密码长度
  if (data.password.length < 6) {
    return { isValid: false, error: '密码长度不能少于6位' };
  }

  // 如果提供了手机号，验证手机号格式
  if (data.phone) {
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(data.phone)) {
      return { isValid: false, error: '请输入正确的手机号码' };
    }
  }

  return { isValid: true };
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // 解析请求体
    const requestData: RegisterRequest = await req.json();

    // 执行数据验证
    const validation = validateRegisterData(requestData);
    if (!validation.isValid) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: validation.error || '请求数据验证失败'
      }, { status: 400 });
    }

    // 构建后端API请求数据
    const backendRequestData: BackendRegisterRequest = {
      username: requestData.username.trim(),
      password: requestData.password,
      phone: requestData.phone.trim(),
      email: requestData.email?.trim() || undefined,
      invitationCode: requestData.inviteCode?.trim() || undefined
    };

    // 构建完整的API URL
    const apiUrl = `${config.baseUrl}${config.endpoints.auth.register}`;
    console.log('注册API请求URL:', apiUrl);
    console.log('注册API请求数据:', backendRequestData);

    // 调用实际的后端API
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: config.headers,
      body: JSON.stringify(backendRequestData),
      // 设置请求超时
      signal: AbortSignal.timeout(config.timeout || 10000)
    });

    // 检查响应状态
    if (!response.ok) {
      console.error(`注册API返回错误状态码: ${response.status}`);
      try {
        const errorData = await response.json();
        return NextResponse.json<ApiResponse>({
          success: false,
          message: errorData.message || `注册失败，状态码: ${response.status}`
        }, { status: response.status });
      } catch (jsonError) {
        return NextResponse.json<ApiResponse>({
          success: false,
          message: `注册失败，状态码: ${response.status}`
        }, { status: response.status });
      }
    }

    // 解析后端响应
    const result = await response.json();
    console.log('注册API响应结果:', result);

    // 构建返回给前端的响应数据
    const responseData: ApiResponse = {
      success: true,
      message: result.message || '注册成功！您的账号已创建，现在可以登录了。',
      data: {
        userId: result.userId || `commenter_${Date.now()}`,
        username: requestData.username,
        phone: requestData.phone,
        email: requestData.email || null,
        inviteCode: requestData.inviteCode || null,
        ...(result.data || {})
      }
    };

    return NextResponse.json(responseData, { status: 200 });
  } catch (error) {
    console.error('注册过程中发生错误:', error);
    
    // 处理不同类型的错误
    let errorMessage = '注册失败，请稍后重试';
    let statusCode = 500;

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        errorMessage = '请求超时，请检查网络连接后重试';
        statusCode = 408; // Request Timeout
      } else if (error.message.includes('Failed to fetch')) {
        errorMessage = '无法连接到注册服务器，请稍后重试';
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
    message: '请使用POST方法进行注册'
  }, { status: 405 });
}