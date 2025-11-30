import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
// 导入配置文件
import config from '../../apiconfig/config.json';
export const dynamic = 'force-dynamic';
// 格式化日志
const formatLog = (operation: string, message: string): string => {
  const timestamp = new Date().toISOString();
  return `[${timestamp}] [${operation}] ${message}`;
};

// 定义用户信息类型接口
interface UserInfo {
  id: string;
  username: string;
  phone?: string;
  email?: string | null;
  invitationCode?: string;
  createTime?: string;
  avatar?: string;
  companyName?: string;
  contactPerson?: string;
  userType?: string;
}

// 定义API响应类型接口
interface ApiResponse {
  code: number;
  message: string;
  data?: {
    userInfo?: UserInfo;
  };
  success: boolean;
  timestamp?: number;
}

export async function GET(request: Request) {
  const operation = 'GET_USER_INFO';
  
  try {
    console.log(formatLog(operation, '开始处理获取用户信息请求'));
    
    // 获取token - 只从HttpOnly Cookie获取，这是更安全的认证方式
    let token = '';
    
    // 从Cookie获取token
    try {
      const cookieStore = await cookies();
      const cookieToken = cookieStore.get('publisher_token');
      token = cookieToken?.value || '';
      console.log(formatLog(operation, `从Cookie获取token: ${token ? '已获取到token' : '未获取到token'}`));
    } catch (cookieError) {
      console.error(formatLog(operation, `无法从Cookie获取token: ${(cookieError as Error).message}`));
    }
    
    // 验证token有效性
    if (!token || token.trim() === '') {
      console.warn(formatLog(operation, 'Token验证失败：token为空或无效'));
      return NextResponse.json({
        code: 401,
        message: '未登录，请先登录',
        success: false
      }, { status: 401 });
    }
    
    // 从配置文件中获取API配置
    const baseUrl = config.baseUrl;
    const userProfileEndpoint = config.endpoints?.user?.getuserinfo;
    const timeout = config.timeout || 5000;
    const defaultHeaders = config.headers || {};
    
    // 构造完整的API URL
    const apiUrl = `${baseUrl}${userProfileEndpoint}`;
    
    // 构造请求头，合并默认头和token头
    const requestHeaders: HeadersInit = {
      ...defaultHeaders,
      'Authorization': `Bearer ${token}`
    };
    
    // 输出详细的请求参数日志
    console.log(formatLog(operation, '准备调用外部API获取用户信息'));
    console.log(formatLog(operation, `请求URL: ${apiUrl}`));
    console.log(formatLog(operation, `请求超时: ${timeout}ms`));
    console.log(formatLog(operation, `请求头: ${JSON.stringify(requestHeaders)}`));
    
    // 调用外部API获取用户信息
    console.log(formatLog(operation, '开始调用外部API'));
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: requestHeaders,
      signal: AbortSignal.timeout(timeout)
    });
    
    // 输出响应状态码和响应头日志
    console.log(formatLog(operation, `外部API响应状态码: ${response.status} ${response.statusText}`));
    
    // 转换响应头为对象以便记录
    const responseHeaders: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });
    console.log(formatLog(operation, `外部API响应头: ${JSON.stringify(responseHeaders)}`));
    
    // 获取响应数据
    const responseData = await response.json();
    console.log(formatLog(operation, `外部API返回的完整JSON响应: ${JSON.stringify(responseData)}`));
    
    // 处理非成功响应
    if (!response.ok) {
      const errorMessage = responseData.message || responseData.error || `外部服务错误: ${response.status}`;
      const errorCode = responseData.code || response.status;
      
      console.warn(formatLog(operation, `外部API调用失败: ${errorMessage} (状态码: ${errorCode})`));
      return NextResponse.json({
        code: errorCode,
        message: errorMessage,
        success: false
      }, { status: response.status });
    }
    
    console.log(formatLog(operation, '外部API调用成功'));
    
    // 从responseData.data中获取用户信息
    const apiUserData = responseData.data || responseData;
    
    // 构造用户信息
    const userInfo: UserInfo = {
      id: apiUserData.id,
      username: apiUserData.username,
      phone: apiUserData.phone,
      email: apiUserData.email,
      invitationCode: apiUserData.invitationCode,
      createTime: apiUserData.createTime,
      avatar: apiUserData.avatar || '/images/0e92a4599d02a7.jpg',
      companyName: apiUserData.companyName,
      contactPerson: apiUserData.contactPerson,
      userType: apiUserData.userType
    };
    
    // 构造最终响应
    const finalResponse = {
      code: responseData.code || 200,
      message: responseData.message || '成功',
      data: {
        userInfo
      },
      success: responseData.success ?? true,
      timestamp: Date.now()
    };
    
    console.log(formatLog(operation, `返回给客户端的响应数据: ${JSON.stringify(finalResponse)}`));
    return NextResponse.json(finalResponse);
  } catch (error) {
    // 异常处理
    let errorMessage = '服务器内部错误';
    let statusCode = 500;
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        errorMessage = '外部API请求超时';
        statusCode = 504;
      } else if (error.message.includes('Failed to fetch')) {
        errorMessage = '无法连接到外部API服务';
        statusCode = 503;
      } else if (error.message.includes('JSON')) {
        errorMessage = '无法解析API响应数据';
        statusCode = 502;
      }
      console.error(formatLog(operation, `发生异常: ${error.name}: ${error.message}`));
    } else {
      console.error(formatLog(operation, `发生未知异常: ${String(error)}`));
    }
    
    const errorResponse = {
      code: statusCode,
      message: errorMessage,
      success: false
    };
    
    console.log(formatLog(operation, `返回错误响应: ${JSON.stringify(errorResponse)}`));
    return NextResponse.json(errorResponse, { status: statusCode });
  }
}
